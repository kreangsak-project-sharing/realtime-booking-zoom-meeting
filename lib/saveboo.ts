import { toast } from "sonner";

interface PropsData {
  userData: { email: string; phone: string; name?: string };
  queueNumber: number;
  meetingDate: string;
  meetingTimeSlot: string;
  meetingId: string;
  meetingPassword: string;
  meetingUrl: string;
}

// Function to save booking details as text file
export const saveBookingDetails = ({
  userData,
  queueNumber,
  meetingDate,
  meetingTimeSlot,
  meetingId,
  meetingPassword,
  meetingUrl,
}: PropsData) => {
  const bookingDetails = `
การจองคิวสัมภาษณ์ออนไลน์
=======================

หมายเลขคิว: ${queueNumber || "N/A"}

ข้อมูลติดต่อ:
${userData.name ? `ชื่อ: ${userData.name}` : ""}
${userData.email ? `อีเมล: ${userData.email}` : ""}
${userData.phone ? `เบอร์โทรศัพท์: ${userData.phone}` : ""}

วันและเวลา:
วันที่: ${meetingDate}
เวลา: ${meetingTimeSlot}

ข้อมูล Zoom Meeting:
Meeting ID: ${meetingId}
Passcode: ${meetingPassword}
ลิงก์เข้าร่วม: ${meetingUrl}

หมายเหตุ: โปรดเข้าร่วมการประชุมตามเวลาที่กำหนด
    `.trim();

  const blob = new Blob([bookingDetails], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `booking-confirmation-${queueNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success("บันทึกข้อมูลการจองเรียบร้อยแล้ว");
};

// Function to add event to calendar (ICS format)
export const addToCalendar = ({
  queueNumber,
  meetingDate,
  meetingTimeSlot,
  meetingId,
  meetingPassword,
  meetingUrl,
}: Omit<PropsData, "userData">) => {
  const startDate = new Date(meetingDate + " " + meetingTimeSlot);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Booking System//EN
BEGIN:VEVENT
UID:${Date.now()}@booking-system.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:สัมภาษณ์ออนไลน์ - คิวที่ ${queueNumber}
DESCRIPTION:การสัมภาษณ์ออนไลน์ผ่าน Zoom\\n\\nMeeting ID: ${meetingId}\\nPasscode: ${meetingPassword}\\nลิงก์เข้าร่วม: ${meetingUrl}
LOCATION:Zoom Meeting
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: สัมภาษณ์ออนไลน์ในอีก 15 นาที
END:VALARM
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `interview-${queueNumber}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success("เพิ่มกิจกรรมในปฏิทินเรียบร้อยแล้ว");
};
