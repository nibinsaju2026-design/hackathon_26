# Pondicherry University Marketplace

A student-to-student resale marketplace for Pondicherry University. Browse searchable campus listings, check availability, make structured offers, and keep a record of transactions.

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and a private `JWT_SECRET`. For local development, the current Prisma schema uses SQLite.
3. Apply the Prisma schema, including the hostel and offer-message fields:

   ```sh
   npm run db:push
   ```

4. Optionally seed a sample seller, buyer, and listing with `npm run seed`. The sample password is `password123`.
5. Start the API and Vite frontend together with `npm run dev`. The web app runs at `http://localhost:5173`, and Vite proxies `/api` requests to the API on port 8080.

The signup and login screens accept addresses ending in `@pondiuni.ac.in`. The API defaults to the same origin in production; set `VITE_API_URL` in the web build environment only when the API is hosted separately.

## Build and deploy

Run `npm run build` to type-check and build both workspaces. The API serves the generated web app from `apps/web/dist` in production, so the single-container deployment exposes the full application on port 8080.

1. Build the container: `docker build -t pondicherry-marketplace .`
2. Push to Google Artifact Registry or another container registry.
3. Deploy to Cloud Run with `DATABASE_URL`, `JWT_SECRET`, and `NODE_ENV=production` configured.

The frontend accepts an uploaded item photo, resizes/compresses it in the browser, and stores the resulting image data URL in the listing's `imageUrl` field. A production deployment with many large photos should replace this database-backed image storage with object storage.
