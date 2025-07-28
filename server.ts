import express from "express";
import next from "next";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

import { verifyJWT } from "./lib/jwt";

import cookie from "cookie";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const prisma = new PrismaClient();

// Map to track user IDs to socket IDs

async function startServer() {
  try {
    const nextApp = next({ dev });
    const handle = nextApp.getRequestHandler();

    console.log("🔄 Preparing Next.js...");
    await nextApp.prepare();
    console.log("✅ Next.js prepared");

    const app = express();
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(",") || false,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // 🔌 Socket.IO Events
    io.on("connection", async (socket) => {
      console.log(`✅ Socket connected: ${socket.id}`);

      const cookies = socket.request.headers.cookie;
      let token: string | undefined = undefined;
      if (cookies) {
        const parsed = cookie.parse(cookies);
        token = parsed.token; // หรือชื่อ cookie ของคุณ
      }
      // console.log(`🔑 Token received: ${token}`);
      let decoded: { id: string } | null = null;
      try {
        if (!token) {
          console.error("❌ No JWT token found");
          socket.disconnect();
          return;
        }
        decoded = verifyJWT(token);
        if (!decoded) {
          console.error("❌ Invalid JWT token");
          socket.disconnect();
          return;
        }

        // console.log(`👤 User ID from token: ${decoded.id}`);
      } catch (error) {
        console.error("❌ JWT verification failed:", error);
        socket.disconnect();
      }

      // 🔔 แจ้งเตือนผู้ใช้ที่เชื่อมต่อใหม่
      socket.on("join-date-room", async (date: string) => {
        socket.join(`date-${date}`);
        console.log(`🏠 Joined room: date-${date}`);

        // Update or create session for user
        await prisma.session.upsert({
          where: { userId: decoded?.id },
          update: { status: "active" },
          create: {
            status: "active",
            user: {
              connect: { id: decoded?.id },
            },
          },
        });
      });

      socket.on("leave-date-room", async (date: string) => {
        socket.leave(`date-${date}`);
        console.log(`🚪 Left room: date-${date}`);

        // Release session when leaving room
        await prisma.session.update({
          where: { userId: decoded?.id },
          data: { status: "inactive" },
        });
        console.log(`User ${decoded?.id} session released`);
      });

      socket.on(
        "notify-slot-booked",
        (data: { date: string; timeSlot: string }) => {
          console.log(`📌 Slot booked: ${data.timeSlot} on ${data.date}`);
          socket.to(`date-${data.date}`).emit("slot-booked", data);
        }
      );

      socket.on(
        "notify-slot-unbooked",
        (data: { date: string; timeSlot: string }) => {
          console.log(`♻️ Slot unbooked: ${data.timeSlot} on ${data.date}`);
          socket.to(`date-${data.date}`).emit("slot-unbooked", data);
        }
      );

      socket.on("get-available-slots", async (date: string) => {
        try {
          const startOfDay = new Date(date);
          const endOfDay = new Date(startOfDay);
          endOfDay.setDate(startOfDay.getDate() + 1);

          console.log(startOfDay.toISOString(), endOfDay.toISOString());

          const bookedSlots = await prisma.meeting.findMany({
            where: {
              meetingDate: {
                gte: startOfDay,
                lt: endOfDay,
              },
              status: "confirmed",
            },
            select: {
              meetingTimeSlot: true,
            },
          });

          const timeSlots = bookedSlots
            .map((b) => b.meetingTimeSlot)
            .filter(Boolean);

          socket.emit("available-slots-updated", {
            date,
            bookedSlots: timeSlots,
          });
        } catch (err) {
          console.error("❌ Failed to get slots:", err);
          socket.emit("slots-error", {
            error: "Unable to fetch slots",
          });
        }
      });

      socket.on("disconnect", async (reason) => {
        console.log(`❌ Socket disconnected: ${socket.id} - ${reason}`);

        await prisma.session.update({
          where: { userId: decoded?.id },
          data: { status: "inactive" },
        });
        console.log(`User ${decoded?.id} session released`);
      });
    });

    // API health route (optional)
    app.get("/api/health", (req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        socketConnections: io.engine.clientsCount,
      });
    });

    // Handle all other requests with Next.js
    app.use((req, res) => {
      return handle(req, res);
    });

    // app.use((req, res) => nextApp.getRequestHandler()(req, res));

    // Start server
    httpServer.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log("🛑 Shutting down...");
      prisma.$disconnect().then(() => console.log("🗄️ DB disconnected"));
      io.close(() => console.log("📡 Socket closed"));
      httpServer.close(() => {
        console.log("✅ HTTP closed");
        process.exit(0);
      });

      // force shutdown if stuck
      setTimeout(() => {
        console.log("⚠️ Force shutdown");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
