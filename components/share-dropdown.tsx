"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, MessageCircle, Facebook, Twitter, Link } from "lucide-react";
import { useShare } from "@/hooks/use-share";

interface ShareDropdownProps {
  bookingData: {
    queueNumber?: number;
    meetingDate?: string;
    meetingTimeSlot?: string;
    meetingId?: string;
    meetingPassword?: string;
    meetingUrl?: string;
  };
  className?: string;
}

export function ShareDropdown({ bookingData, className }: ShareDropdownProps) {
  const { shareBooking, shareToSocial, isSharing } = useShare();
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    await shareBooking(bookingData);
    setIsOpen(false);
  };

  const handleSocialShare = (platform: "line" | "facebook" | "twitter") => {
    shareToSocial(platform, bookingData);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`border-[#e4e4e7] hover:border-[#4f46e5] flex items-center gap-2 transition-all duration-200 bg-transparent ${className}`}
          disabled={isSharing}
        >
          <Share2 className="h-4 w-4" />
          {isSharing ? "กำลังแชร์..." : "แชร์"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
          <Share2 className="h-4 w-4 mr-2" />
          แชร์ข้อมูลการจอง
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            navigator.clipboard.writeText(bookingData.meetingUrl || "")
          }
          className="cursor-pointer"
        >
          <Link className="h-4 w-4 mr-2" />
          คัดลอกลิงก์
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleSocialShare("line")}
          className="cursor-pointer"
        >
          <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
          แชร์ไปยัง LINE
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSocialShare("facebook")}
          className="cursor-pointer"
        >
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          แชร์ไปยัง Facebook
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSocialShare("twitter")}
          className="cursor-pointer"
        >
          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
          แชร์ไปยัง Twitter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
