import type { Server as NetServer, Socket } from "net";
import type { NextApiResponse } from "next";
import type { Server as SocketIOServer } from "socket.io";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface BookingData {
  booking: {
    time: string;
    timeSlot: string;
    meetingId: string;
    meetingPassword: string;
    meetingLink: string;
    queueNumber: number;
  };
  userData: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface SlotBookedEvent {
  date: string;
  timeSlot: string;
  bookedBy: string;
}
