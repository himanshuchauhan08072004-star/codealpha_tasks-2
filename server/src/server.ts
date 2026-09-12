import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { Server as IOServer } from "socket.io";

import { env } from "./config/env";
import { connectDB } from "./config/db";
import { notFound, errorHandler } from "./middleware/error";
import { initSocket } from "./sockets";

import authRoutes from "./routes/authRoutes";
import meetingRoutes from "./routes/meetingRoutes";
import fileRoutes from "./routes/fileRoutes";

const app = express();
const server = http.createServer(app);

const io = new IOServer(server, {
  cors: { origin: env.CLIENT_URL, credentials: true },
});

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many attempts, try again later" },
});
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/meetings", meetingRoutes);
app.use("/api/files", fileRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use(notFound);
app.use(errorHandler);

initSocket(io);

const start = async () => {
  await connectDB();
  server.listen(env.PORT, () => {
    console.log(`[server] running on port ${env.PORT}`);
  });
};

start().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
