"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Video,
  Copy,
  ExternalLink,
  ArrowLeft,
  Edit,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ResponseData } from "@/app/actions/auth-actions";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ShareDropdown } from "@/components/share-dropdown";

export default function MyBookingPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<ResponseData | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      const res = await fetch("/api/mybooking", {
        method: "POST",
      });
      if (!res.ok) {
        router.push("/");
        return;
      }
      const data = await res.json();
      setBookingData(data);
    };

    fetchBooking();
  }, [router]);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] to-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f46e5] mx-auto mb-4"></div>
          <p className="text-[#71717a]">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Destructure booking and user data from the fetched bookingData
  if (!bookingData.booking || !bookingData.user) {
    return null;
  }
  // Destructure booking and user from bookingData
  // This ensures that we have the booking and user data available for rendering
  const { booking, user } = bookingData;

  // Format the booking time
  const bookingDate = booking ? new Date(booking.meetingDate) : null;
  const formattedDate = bookingDate
    ? bookingDate.toLocaleDateString("th-TH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Utility function to check booking status
  // This function checks if the booking date is expired, today, or upcoming
  const getBookingStatus = (bookingDate: Date | null) => {
    if (!bookingDate) {
      return { isExpired: false, isToday: false, isUpcoming: false };
    }

    const now = new Date();

    return {
      isExpired: now > bookingDate,
      isToday: now.toDateString() === bookingDate.toDateString(),
      isUpcoming: bookingDate > now,
    };
  };

  // Check if booking is in the past
  const { isExpired, isToday, isUpcoming } = getBookingStatus(bookingDate);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] to-[#f5f5f5] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ecfdf5] mb-4"
                >
                  <CheckCircle2 className="h-8 w-8 text-[#10b981]" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl font-bold text-[#27272a] mb-2"
                >
                  การจองของคุณ
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-[#71717a] max-w-lg mx-auto"
                >
                  รายละเอียดการจองคิวสัมภาษณ์ออนไลน์ของคุณ
                </motion.p>

                {/* Status Badge */}
                <div className="mt-4">
                  {isExpired ? (
                    <Badge
                      variant="outline"
                      className="border-red-200 text-red-700 bg-red-50"
                    >
                      หมดอายุแล้ว
                    </Badge>
                  ) : isToday ? (
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                      วันนี้
                    </Badge>
                  ) : isUpcoming ? (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      กำลังจะมาถึง
                    </Badge>
                  ) : null}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="shadow-lg border-[#e4e4e7]">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xl text-[#27272a]">
                        <div className="w-6 h-6 rounded-full bg-[#ecfdf5] flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                        </div>
                        รายละเอียดการจอง
                      </CardTitle>
                      <div className="text-right">
                        <p className="text-sm text-[#71717a]">หมายเลขคิว</p>
                        <p className="text-2xl font-bold text-[#4f46e5]">
                          {booking?.queueNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-medium text-[#27272a] mb-4 flex items-center gap-2">
                          <Info className="h-5 w-5 text-[#4f46e5]" />
                          ข้อมูลผู้จอง
                        </h3>
                        <div className="space-y-4">
                          {user?.name && (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[#4f46e5]">
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm text-[#71717a]">ชื่อ</p>
                                <p className="font-medium text-[#27272a]">
                                  {user.name}
                                </p>
                              </div>
                            </div>
                          )}

                          {user?.email && (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[#4f46e5]">
                                <Mail className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm text-[#71717a]">อีเมล</p>
                                <p className="font-medium text-[#27272a]">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          )}

                          {user?.phone && (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[#4f46e5]">
                                <Phone className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm text-[#71717a]">
                                  เบอร์โทรศัพท์
                                </p>
                                <p className="font-medium text-[#27272a]">
                                  {user.phone}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator className="my-6" />

                        <h3 className="text-lg font-medium text-[#27272a] mb-4 flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-[#4f46e5]" />
                          วันและเวลา
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[#4f46e5]">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm text-[#71717a]">วันที่</p>
                              <p className="font-medium text-[#27272a]">
                                {formattedDate}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[#4f46e5]">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm text-[#71717a]">เวลา</p>
                              <p className="font-medium text-[#27272a]">
                                {booking?.meetingTimeSlot}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="md:border-l md:border-[#e4e4e7] md:pl-8">
                        <h3 className="text-lg font-medium text-[#27272a] mb-4 flex items-center gap-2">
                          <Video className="h-5 w-5 text-[#4f46e5]" />
                          ข้อมูล Zoom Meeting
                        </h3>

                        <div className="space-y-4">
                          <div className="p-4 bg-[#f4f4f5] rounded-lg border border-[#e4e4e7]">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-sm text-[#71717a]">
                                Meeting ID
                              </p>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-[#4f46e5] hover:bg-[#f5f3ff] transition-colors"
                                      onClick={() =>
                                        copyToClipboard(
                                          booking?.meetingId ?? "",
                                          "คัดลอก Meeting ID แล้ว"
                                        )
                                      }
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>คัดลอก</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="font-medium text-[#27272a] text-lg">
                              {booking?.meetingId}
                            </p>
                          </div>

                          <div className="p-4 bg-[#f4f4f5] rounded-lg border border-[#e4e4e7]">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-sm text-[#71717a]">Passcode</p>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-[#4f46e5] hover:bg-[#f5f3ff] transition-colors"
                                      onClick={() =>
                                        copyToClipboard(
                                          booking?.meetingPassword ?? "",
                                          "คัดลอก Passcode แล้ว"
                                        )
                                      }
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>คัดลอก</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="font-medium text-[#27272a] text-lg">
                              {booking?.meetingPassword}
                            </p>
                          </div>

                          <div className="text-center mt-6">
                            {isExpired ? (
                              <Button
                                className="w-full bg-[#4f46e5] text-white h-11 flex items-center justify-center gap-2 mb-3 opacity-50 pointer-events-none"
                                disabled
                              >
                                <Video className="h-4 w-4" /> เข้าร่วม Zoom
                                Meeting
                                <ExternalLink className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            ) : (
                              <Button
                                className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white h-11 flex items-center justify-center gap-2 mb-3"
                                asChild
                              >
                                <Link
                                  href={booking?.meetingLink ?? ""}
                                  target="_blank"
                                >
                                  <Video className="h-4 w-4" /> เข้าร่วม Zoom
                                  Meeting
                                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                                </Link>
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              className="w-full border-[#e4e4e7] hover:border-[#4f46e5] h-10 text-[#71717a] transition-all duration-200 bg-transparent"
                              onClick={() =>
                                copyToClipboard(
                                  booking?.meetingLink ?? "",
                                  "คัดลอกลิงก์ Zoom แล้ว"
                                )
                              }
                            >
                              <Copy className="h-4 w-4 mr-2" /> คัดลอกลิงก์
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#e4e4e7]">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-[#e4e4e7] hover:border-[#4f46e5] flex items-center gap-2 transition-all duration-200 bg-transparent"
                      asChild
                    >
                      {/* a tag to fix turnstile reset */}
                      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                      <a href="/">
                        <ArrowLeft className="h-4 w-4" /> กลับหน้าแรก
                      </a>
                    </Button>
                    <div className="flex-1 flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-[#e4e4e7] hover:border-[#4f46e5] flex items-center gap-2 transition-all duration-200 bg-transparent disabled:opacity-50"
                        asChild
                      >
                        <Link
                          href={`/timeselection?date=${
                            bookingDate?.toISOString().split("T")[0]
                          }`}
                        >
                          <Edit className="h-4 w-4" /> แก้ไขเวลา
                        </Link>
                      </Button>
                      <ShareDropdown
                        bookingData={{
                          queueNumber: booking?.queueNumber,
                          meetingDate: formattedDate,
                          meetingTimeSlot: booking?.meetingTimeSlot,
                          meetingId: booking?.meetingId,
                          meetingPassword: booking?.meetingPassword,
                          meetingUrl: booking?.meetingLink,
                        }}
                        className="flex-1 cursor-pointer"
                      />
                    </div>

                    <Button
                      className="w-full sm:w-auto bg-[#4f46e5] hover:bg-[#4338ca] text-white transition-all duration-200"
                      asChild
                    >
                      {/* a tag to fix turnstile reset */}
                      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                      <a href="/">จองคิวใหม่</a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
