import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useGlobalSocket() {
  const [isConnected, setIsConnected] = useState(socket?.connected || false);

  useEffect(() => {
    if (!socket) {
      socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
        {
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        }
      );

      socket.on("connect", () => {
        console.log("✅ Global socket connected");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("❌ Global socket disconnected");
        setIsConnected(false);
      });
    } else {
      setIsConnected(socket.connected);
    }

    return () => {
      // ไม่ต้อง disconnect ที่นี่ เพื่อคง socket ไว้
      // จะ disconnect เองเมื่อ browser ปิดหรือ user ปิดแท็บ
    };
  }, []);

  return { socket, isConnected };
}
