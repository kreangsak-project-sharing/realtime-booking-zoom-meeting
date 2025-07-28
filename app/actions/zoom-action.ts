"use server";

import { prisma } from "@/lib/prisma";
import { ZoomAPI, ZoomMeetingResponse } from "@/lib/zoom";
import { revalidatePath } from "next/cache";

export interface CreateMeetingData {
  userId: string;
  meetingDate: string;
  meetingTimeSlot: string;
  durationMinutes: number;
  queueNumber: number;
}

// createMeeting function to schedule a new meeting
export async function createMeeting(data: CreateMeetingData): Promise<{
  success: boolean;
  error?: string;
  data?: {
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    meetingDate: Date;
    meetingTimeSlot: string;
    durationMinutes: number;
    zoomMeetingId: string | null;
    zoomJoinUrl: string | null;
    zoomPassword: string | null;
    interviewerNotes: string | null;
  };
  message?: string;
}> {
  try {
    // Get user information
    const user = await prisma.registerUser.findUnique({
      where: { id: data.userId },
      select: { name: true, phone: true, email: true },
    });

    if (!user) {
      return { success: false, error: "ไม่พบข้อมูลผู้สมัคร" };
    }

    // // Check if candidate already has a scheduled meeting
    // const existingMeeting = await prisma.meeting.findFirst({
    //   where: {
    //     userId: data.userId,
    //     status: "scheduled",
    //   },
    // });

    // if (existingMeeting) {
    //   return { success: false, error: "ผู้สมัครคนนี้มีการนัดหมายอยู่แล้ว" };
    // }

    // Combine date and time into a single DateTime
    const meetingDateTime = new Date(
      `${data.meetingDate}T${data.meetingTimeSlot.split(" - ")[0]}:00.000Z`
    );

    // console.log("Meeting DateTime:", meetingDateTime);

    // Validate meeting date (not in the past)
    const now = new Date();
    if (meetingDateTime < now) {
      return { success: false, error: "ไม่สามารถกำหนดการนัดหมายในอดีตได้" };
    }

    let zoomMeeting: ZoomMeetingResponse;

    try {
      // Create real Zoom meeting with OAuth
      const zoomAPI = new ZoomAPI();

      // Test connection first
      const connectionTest = await zoomAPI.testConnection();
      if (!connectionTest.success) {
        console.warn("Zoom connection failed", connectionTest.message);
        return {
          success: false,
          error: "Zoom connection failed",
        };
      } else {
        zoomMeeting = await zoomAPI.createMeeting({
          topic: `คุณ ${user.name} Tel: ${user.phone}`,
          start_time: meetingDateTime.toISOString(),
          duration: data.durationMinutes,
          timezone: "Asia/Bangkok",
        });
      }
    } catch (zoomError) {
      console.error("Failed to create Zoom meeting", zoomError);
      // Fallback to mock meeting if Zoom API fails
      return {
        success: false,
        error: "Failed to create Zoom meeting",
      };
    }

    // Create the meeting in database
    const meeting = await prisma.meeting.upsert({
      where: { userId: data.userId },
      update: {
        meetingDate: new Date(data.meetingDate),
        meetingTimeSlot: data.meetingTimeSlot,
        durationMinutes: data.durationMinutes,
        zoomMeetingId: String(zoomMeeting.id), // Convert to string to ensure compatibility
        zoomJoinUrl: zoomMeeting.join_url,
        zoomPassword: zoomMeeting.password,
        status: "scheduled",
        queueNumber: data.queueNumber,
      },
      create: {
        userId: data.userId,
        meetingDate: new Date(data.meetingDate),
        meetingTimeSlot: data.meetingTimeSlot,
        durationMinutes: data.durationMinutes,
        zoomMeetingId: String(zoomMeeting.id), // Convert to string to ensure compatibility
        zoomJoinUrl: zoomMeeting.join_url,
        zoomPassword: zoomMeeting.password,
        status: "scheduled",
        queueNumber: data.queueNumber,
      },
    });

    revalidatePath("/");
    return {
      success: true,
      data: meeting,
      message: "สร้างการนัดหมาย Zoom สำเร็จ",
    };
  } catch (error) {
    console.error("Error in createMeeting:", error);
    return { success: false, error: "ไม่สามารถสร้างการนัดหมายได้" };
  }
}

// getUpcomingMeetings function to fetch meetings scheduled for today or later
export async function getUpcomingMeetings() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meetings = await prisma.meeting.findMany({
      where: {
        status: "scheduled",
        meetingDate: {
          gte: today,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: [{ meetingDate: "asc" }, { meetingTimeSlot: "asc" }],
    });

    return meetings;
  } catch (error) {
    console.error("Error in getUpcomingMeetings:", error);
    throw error;
  }
}

// deleteDirectMeeting function to delete a Zoom meeting directly
export async function deleteDirectMeeting(meetingId: string) {
  try {
    const zoomAPI = new ZoomAPI();
    const connectionTest = await zoomAPI.testConnection();
    if (connectionTest.success) {
      await zoomAPI.deleteMeeting(meetingId);
    } else {
      console.warn(
        "Zoom connection failed, skipping Zoom deletion:",
        connectionTest.message
      );
    }
  } catch (error) {
    console.error("Error in deleteDirectMeeting:", error);
  }
}

// deleteMeeting function to remove a meeting
export async function deleteMeeting(meetingId: string) {
  try {
    // Get the meeting details before deleting
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: {
        userId: true,
        zoomMeetingId: true,
        zoomJoinUrl: true,
      },
    });

    if (!meeting) {
      return { success: false, error: "ไม่พบการนัดหมาย" };
    }

    // Delete from Zoom if it's a real meeting (not mock)
    if (meeting.zoomMeetingId) {
      try {
        const zoomAPI = new ZoomAPI();

        // Test connection first
        const connectionTest = await zoomAPI.testConnection();
        if (connectionTest.success) {
          await zoomAPI.deleteMeeting(meeting.zoomMeetingId);
          console.log(
            "Successfully deleted Zoom meeting:",
            meeting.zoomMeetingId
          );
        } else {
          console.warn(
            "Zoom connection failed, skipping Zoom deletion:",
            connectionTest.message
          );
        }
      } catch (zoomError) {
        console.error("Failed to delete Zoom meeting:", zoomError);
        // Continue with database deletion even if Zoom deletion fails
      }
    }

    // // Delete the meeting from database
    // await prisma.meeting.delete({
    //   where: { id: meetingId },
    // });

    // // Update user status back to pending
    // await prisma.meeting.update({
    //   where: { id: meetingId },
    //   data: { status: "pending" },
    // });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteMeeting:", error);
    return { success: false, error: "ไม่สามารถยกเลิกการนัดหมายได้" };
  }
}

// completeMeeting function to mark a meeting as completed
export async function completeMeeting(meetingId: string, notes?: string) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { userId: true, status: true },
    });

    if (!meeting) {
      return { success: false, error: "ไม่พบการนัดหมาย" };
    }

    if (meeting.status === "completed") {
      return { success: false, error: "การนัดหมายนี้เสร็จสิ้นแล้ว" };
    }

    // Update meeting status to completed
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: "completed",
        interviewerNotes: notes,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error in completeMeeting:", error);
    return { success: false, error: "ไม่สามารถบันทึกผลการสัมภาษณ์ได้" };
  }
}

// updateMeeting function to modify meeting details
export async function updateMeeting(
  meetingId: string,
  data: Partial<CreateMeetingData>
) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        user: {
          select: { name: true, phone: true },
        },
      },
    });

    if (!meeting) {
      return { success: false, error: "ไม่พบการนัดหมาย" };
    }

    if (meeting.status !== "scheduled") {
      return {
        success: false,
        error: "ไม่สามารถแก้ไขการนัดหมายที่ไม่ใช่สถานะ 'กำหนดแล้ว' ได้",
      };
    }

    const updateData: Partial<{
      meetingDate: Date;
      meetingTime: Date;
      durationMinutes: number;
    }> = {};

    // Update date/time if provided
    if (data.meetingDate || data.meetingTimeSlot) {
      const currentDate =
        data.meetingDate || meeting.meetingDate.toISOString().split("T")[0];
      const currentTime = data.meetingTimeSlot;
      const newDateTime = new Date(`${currentDate}T${currentTime}:00.000Z`);

      // Validate new meeting date (not in the past)
      const now = new Date();
      if (newDateTime < now) {
        return { success: false, error: "ไม่สามารถกำหนดการนัดหมายในอดีตได้" };
      }

      updateData.meetingDate = new Date(currentDate);
      updateData.meetingTime = newDateTime;

      // Update Zoom meeting if it's a real meeting
      if (meeting.zoomMeetingId) {
        try {
          const zoomAPI = new ZoomAPI();
          const connectionTest = await zoomAPI.testConnection();

          if (connectionTest.success) {
            await zoomAPI.updateMeeting(meeting.zoomMeetingId, {
              start_time: newDateTime.toISOString(),
              duration: data.durationMinutes || meeting.durationMinutes,
            });
          }
        } catch (zoomError) {
          console.error("Failed to update Zoom meeting:", zoomError);
          // Continue with database update even if Zoom update fails
        }
      }
    }

    // Update duration if provided
    if (data.durationMinutes) {
      updateData.durationMinutes = data.durationMinutes;
    }

    // Update the meeting in database
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: updateData,
    });

    revalidatePath("/");
    return { success: true, data: updatedMeeting };
  } catch (error) {
    console.error("Error in updateMeeting:", error);
    return { success: false, error: "ไม่สามารถอัปเดตการนัดหมายได้" };
  }
}
