import express from "express";
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Environment Validation
const envSchema = z.object({
  DATABASE_URL: z.string().url("Must be a valid Postgres URL"),
  JWT_SECRET: z.string().min(10, "JWT secret must be at least 10 chars"),
  PORT: z.string().optional().default("8080"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  REDIS_URL: z.string().url().optional(),
  FRONTEND_URL: z.string().url().optional().default("http://localhost:5173"),
  LOG_LEVEL: z.string().optional().default("info")
});

const envParsed = envSchema.safeParse(process.env);
if (!envParsed.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(envParsed.error.format(), null, 2));
  process.exit(1);
}
const env = envParsed.data;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

if (env.REDIS_URL) {
  const pubClient = createClient({ url: env.REDIS_URL });
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Redis adapter attached to Socket.io");
  }).catch(err => {
    console.error("Redis connection failed:", err);
  });
}

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
  level: env.LOG_LEVEL,
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

// Serve frontend static files in production
import path from "path";
if (env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../web/dist");
  app.use(express.static(frontendPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}


io.on("connection", (socket) => {
  console.log("Client connected", socket.id);
  
  socket.on("joinListing", (listingId) => {
    socket.join(`listing:${listingId}`);
  });

  socket.on("message", async (data) => {
    try {
      const senderId = data.message.senderId; 
      const savedMessage = await prisma.message.create({
        data: {
          content: data.message.text,
          senderId: senderId === 'me' ? 'MOCK_SENDER_ID' : senderId,
          listingId: data.listingId
        }
      });
      socket.to(`listing:${data.listingId}`).emit("message", data.message);
    } catch (err) {
      console.error("Failed to save message", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

const PORT = env.PORT;

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
