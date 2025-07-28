"use client";

import { useState } from "react";
import { toast } from "sonner";

interface ShareData {
  title: string;
  text: string;
  url: string;
}

interface bookingData {
  queueNumber?: number;
  meetingDate?: string;
  meetingTimeSlot?: string;
  meetingId?: string;
  meetingPassword?: string;
  meetingUrl?: string;
}

export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  const shareBooking = async (bookingData: bookingData) => {
    setIsSharing(true);

    const shareData: ShareData = {
      title: `การจองคิว #${bookingData.queueNumber || "N/A"}`,
      text: `ข้อมูลการจองสัมภาษณ์ออนไลน์\nคิวที่: ${
        bookingData.queueNumber || "N/A"
      }\nวันที่: ${bookingData.meetingDate || "N/A"}\nเวลา: ${
        bookingData.meetingTimeSlot || "N/A"
      }\nMeeting ID: ${bookingData.meetingId || "N/A"}\nMeeting Password: ${
        bookingData.meetingPassword || "N/A"
      }\nMeeting URL: ${bookingData.meetingUrl || "N/A"}`,

      url: bookingData.meetingUrl
        ? bookingData.meetingUrl
        : window.location.href,
    };

    try {
      // ลองใช้ Web Share API ก่อน (สำหรับ mobile/modern browsers)
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        toast.success("แชร์สำเร็จ!");
      } else {
        // Fallback: Copy to clipboard
        await copyToClipboard(shareData);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        // Fallback: Copy to clipboard
        await copyToClipboard(shareData);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async (shareData: ShareData) => {
    const textToCopy = shareData.text;

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("คัดลอกข้อมูลการจองแล้ว!");
    } catch (error) {
      // Fallback สำหรับ browser เก่า
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("คัดลอกข้อมูลการจองแล้ว!");
    }
  };

  const shareToSocial = (
    platform: "line" | "facebook" | "twitter",
    bookingData: bookingData
  ) => {
    const text = `ข้อมูลการจองสัมภาษณ์ออนไลน์\nคิวที่: ${
      bookingData.queueNumber || "N/A"
    }\nวันที่: ${bookingData.meetingDate || "N/A"}\nเวลา: ${
      bookingData.meetingTimeSlot || "N/A"
    }\nMeeting ID: ${bookingData.meetingId || "N/A"}\nMeeting Password: ${
      bookingData.meetingPassword || "N/A"
    }\nMeeting URL: ${bookingData.meetingUrl || "N/A"}`;
    const url = bookingData.meetingUrl
      ? bookingData.meetingUrl
      : window.location.href;

    const shareUrls = {
      line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
    };

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
    toast.success(`แชร์ไปยัง ${platform.toUpperCase()} แล้ว!`);
  };

  return {
    shareBooking,
    shareToSocial,
    isSharing,
  };
}
