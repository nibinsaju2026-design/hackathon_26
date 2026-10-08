import express from "express";
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

import authRoutes from "./routes/auth";
import listingRoutes from "./routes/listings";
import offerRoutes from "./routes/offers";
import orderRoutes from "./routes/orders";
import wishlistRoutes from "./routes/wishlist";
import dashboardRoutes from "./routes/dashboard";
import sellerRoutes from "./routes/sellers";
import notificationRoutes from "./routes/notifications";
import reportRoutes from "./routes/reports";
import { PrismaClient } from "@prisma/client";
import pino from "pino";
import pinoHttp from "pino-http";

const prisma = new PrismaClient();
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label: string) => {
      return { level: label.toUpperCase() };
    },
  },
});

app.use(pinoHttp({ logger }));

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api", offerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);
  
  socket.on("joinListing", (listingId) => {
    socket.join(`listing:${listingId}`);
  });

  socket.on("message", async (data) => {
    try {
      // Mocked user authentication for socket context (in prod use socket middleware)
      const senderId = data.message.senderId; 
      
      const savedMessage = await prisma.message.create({
        data: {
          content: data.message.text,
          senderId: senderId === 'me' ? 'MOCK_SENDER_ID' : senderId, // Hack since we can't test properly
          listingId: data.listingId
        }
      });
      
      // Broadcast to others in the room
      socket.to(`listing:${data.listingId}`).emit("message", data.message);
    } catch (err) {
      console.error("Failed to save message", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 8080;

const server = httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = () => {
  console.log('Received kill signal, shutting down gracefully');
  server.close(async () => {
    console.log('Closed out remaining connections');
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
