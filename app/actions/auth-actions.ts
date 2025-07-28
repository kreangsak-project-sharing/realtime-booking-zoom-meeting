"use server";

import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/zod";
import { UserData } from "@/types/user";

import { signJWT, verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { createMeeting, deleteDirectMeeting } from "./zoom-action";
import { verifyTurnstileToken } from "@/lib/verify-turnstile";

// Response data structure for booking actions
// This interface defines the structure of the response data returned by booking actions
export interface ResponseData {
  success: boolean;
  message?: string;
  user?: { name: string; email: string; phone: string };
  booking?: {
    meetingDate: string;
    meetingTimeSlot: string;
    meetingId: string;
    meetingPassword: string;
    meetingLink: string;
    queueNumber: number;
  };
  hasbooking?: boolean;
  error?: string;
}

// getMyBooking function
// This function retrieves the user's booking for a specific date
export async function getMyBooking(date: string) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");
  if (!tokenCookie) {
    return { success: false, message: "กรุณาเข้าสู่ระบบก่อน" };
  }

  // Decode JWT to extract email
  let email: string | undefined;
  try {
    const payload = verifyJWT(tokenCookie.value); // verify signature + decode
    if (payload && payload.email) {
      email = payload.email;
    } else {
      return { success: false, message: "Token ไม่ถูกต้อง" };
    }
  } catch (err) {
    console.error("[getMyBooking error]:", err);
    return { success: false, message: "Token ไม่ถูกต้อง" };
  }

  try {
    const booking = await prisma.meeting.findFirst({
      where: {
        user: { email },
        meetingDate: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lt: new Date(`${date}T23:59:59.999Z`),
        },
      },
      select: {
        meetingTimeSlot: true,
      },
    });

    if (!booking) {
      return { success: false, message: "ไม่พบการจองของคุณ" };
    }

    return { success: true, meetingTimeSlot: booking.meetingTimeSlot };
  } catch (error) {
    console.error("[getMyBooking error]:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการโหลดข้อมูล" };
  }
}

// Get booking by ID
// This function retrieves a booking by its ID
// It returns the booking details if found, or throws an error if not found
export async function getBookingById(id: string): Promise<ResponseData | null> {
  const result = await prisma.meeting.findUnique({
    where: { userId: id },
    select: {
      meetingDate: true,
      meetingTimeSlot: true,
      durationMinutes: true,
      zoomMeetingId: true,
      zoomPassword: true,
      zoomJoinUrl: true,
      queueNumber: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!result) return null;

  return {
    success: true,
    message: "Booking found",
    user: {
      name: result.user?.name || "",
      email: result.user?.email || "",
      phone: result.user?.phone || "",
    },
    booking: {
      meetingDate: result.meetingDate?.toISOString() || "",
      meetingTimeSlot: result.meetingTimeSlot || "",
      meetingId: result.zoomMeetingId || "",
      meetingPassword: result.zoomPassword || "",
      meetingLink: result.zoomJoinUrl || "",
      queueNumber: result.queueNumber || 0,
    },
  };
}

// Get available slots for a specific date
// This function returns all booked slots for a given date
// It does not return available slots, but rather the booked ones
// so that the frontend can filter them out
export async function getAvailableSlots(date: string) {
  try {
    const startOfDay = new Date(date);
    const endOfDay = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000);

    const bookedSlots = await prisma.meeting.findMany({
      where: {
        meetingDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: "scheduled",
      },
      select: {
        meetingTimeSlot: true,
      },
    });

    const bookedTimeSlots = bookedSlots
      .map((slot) => slot.meetingTimeSlot)
      .filter(Boolean);

    return {
      success: true,
      bookedSlots: bookedTimeSlots,
    };
  } catch (error) {
    console.error("Error fetching slots:", error);
    return {
      success: false,
      error: "ไม่สามารถโหลดข้อมูลเวลาได้",
      bookedSlots: [],
    };
  }
}

// Check if user has a booking
// This function checks if a user has an existing booking based on their email or phone number
// It returns user details and booking information if found, or an error message if not found
// It also sets a JWT token in cookies for authenticated access
export async function checkUserBooking(
  formData: UserData,
  turnstileToken: string
): Promise<ResponseData> {
  try {
    // Verify Turnstile token
    const turnstileValid = await verifyTurnstileToken(turnstileToken);
    if (!turnstileValid) {
      return {
        success: false,
        message: "การยืนยันตัวตนล้มเหลว กรุณาลองใหม่อีกครั้ง",
      };
    }

    const validatedData = reservationSchema.parse(formData);

    const user = await prisma.registerUser.findFirst({
      where: {
        OR: [{ email: validatedData.email }, { phone: validatedData.phone }],
        AND: {
          status: "approved",
        },
      },
      include: {
        meetings: {
          where: {
            status: "scheduled",
          },
        },
      },
    });

    // console.log("User found:", user);

    if (!user) {
      return { success: false, message: "Email or phone number not found" };
    }

    // Check if user has an active session
    // If the user has an active session, we throw an error to prevent multiple logins
    const session = await prisma.session.findUnique({
      where: { userId: user.id },
    });
    if (session && session.status === "active") {
      // throw new Error("บัญชีนี้กำลังใช้งานอยู่");
      return { success: false, message: "บัญชีนี้กำลังใช้งานอยู่" };
    }

    // JWT Token Generation
    // สร้าง JWT token สำหรับ user
    // ใช้ signJWT จาก lib/jwt.ts
    const token = signJWT({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return {
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      booking: user.meetings
        ? {
            meetingDate: user.meetings.meetingDate
              ? user.meetings.meetingDate.toISOString?.() ??
                String(user.meetings.meetingDate)
              : "",
            meetingTimeSlot: user.meetings.meetingTimeSlot,
            meetingId: user.meetings.zoomMeetingId ?? "",
            meetingPassword: user.meetings.zoomPassword ?? "",
            meetingLink: user.meetings.zoomJoinUrl ?? "",
            queueNumber: user.meetings.queueNumber ?? 0,
          }
        : undefined,
      hasbooking: !!user.meetings,
    };
  } catch (error) {
    console.error("Error checking user booking:", error);
    return {
      success: false,
      message: "ไม่สามารถตรวจสอบการจองได้ กรุณาลองใหม่อีกครั้ง",
    };
  }
}

// Create a booking
// This function creates a booking for the user based on the provided form data
// It checks if the slot is available, generates a Zoom meeting, and saves the booking
// Returns success or error message
export async function createBooking(formData: FormData) {
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const date = formData.get("date") as string;
  const timeSlot = formData.get("timeSlot") as string;

  try {
    if (!email && !phone) {
      return {
        success: false,
        message: "กรุณากรอกอีเมลหรือเบอร์โทรศัพท์",
      };
    }

    // 🧑‍💼 Find user
    const user = await prisma.registerUser.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (!user) {
      return {
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้งานในระบบ",
      };
    }

    // 🔍 Check if user has existing booking
    const existing = await prisma.meeting.findUnique({
      where: {
        userId: user.id,
      },
    });

    let previousMeetingDate: Date | null = null;
    let previousMeetingTimeSlot: string | null = null;
    let queueNumber: number;

    if (existing) {
      previousMeetingDate = existing.meetingDate;
      previousMeetingTimeSlot = existing.meetingTimeSlot;
      queueNumber = existing.queueNumber ?? 1; // ใช้ queue เดิมถ้ามี
    } else {
      // 📅 Generate queue number for new booking
      const lastBooking = await prisma.meeting.findFirst({
        where: {
          meetingDate: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
          queueNumber: {
            not: null,
          },
        },
        orderBy: { queueNumber: "desc" },
      });

      queueNumber = (lastBooking?.queueNumber || 0) + 1;
    }

    // 🔒 Check if slot is already taken
    const conflict = await prisma.meeting.findFirst({
      where: {
        userId: {
          not: user.id, // ไม่ใช่ตัวเอง
        },
        meetingDate: new Date(date),
        // meetingTimeSlot: new Date(`${date}T${timeSlot}:00.000Z`),
        status: "confirmed",
      },
    });

    if (conflict) {
      return {
        success: false,
        message: "ช่วงเวลานี้ถูกจองแล้ว กรุณาเลือกเวลาอื่น",
      };
    }

    const zoomMeeting = await createMeeting({
      userId: user.id,
      meetingDate: date,
      meetingTimeSlot: timeSlot,
      durationMinutes: 10, // Default duration, can be adjusted
      queueNumber,
    });

    // Delete previous Zoom meeting if exists
    if (existing && zoomMeeting.success) {
      await deleteDirectMeeting(existing?.zoomMeetingId || "");
    }

    return {
      success: true,
      booking: {
        id: zoomMeeting.data?.id || "",
      },
      previousMeetingDate: previousMeetingDate?.toISOString(),
      previousMeetingTimeSlot: previousMeetingTimeSlot,
    };
  } catch (error) {
    console.error("Booking error:", error);
    return {
      success: false,
      error: "ไม่สามารถจองได้ กรุณาลองใหม่อีกครั้ง",
    };
  }
}
