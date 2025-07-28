"use client";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Mail,
  Phone,
  Download,
  Video,
  Copy,
  ExternalLink,
  ArrowLeft,
  User,
  Info,
  CalendarPlus,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ShareDropdown } from "./share-dropdown";
import { addToCalendar, saveBookingDetails } from "@/lib/saveboo";

interface ConfirmationProps {
  userData: { email: string; phone: string; name: string };
  selectedTime: string;
  selectedSlot: string;
  zoomData: {
    meetingId: string;
    password: string;
    link: string;
  };
  queueNumber: number;
}

export default function Confirmation({
  userData,
  selectedTime,
  selectedSlot,
  zoomData,
  queueNumber,
}: ConfirmationProps) {
  const formattedDate = new Date(selectedTime).toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
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
          จองคิวสำเร็จ
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-[#71717a] max-w-lg mx-auto"
        >
          คุณได้จองคิวสัมภาษณ์ออนไลน์ผ่าน Zoom เรียบร้อยแล้ว
          โปรดเข้าร่วมการประชุมตามเวลาที่กำหนด
        </motion.p>
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
                  {queueNumber || "N/A"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-[#27272a] mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-[#4f46e5]" />
                  ข้อมูลติดต่อ
                </h3>
                <div className="space-y-4">
                  {userData.name && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[#4f46e5]">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-[#71717a]">ชื่อ</p>
                        <p className="font-medium text-[#27272a]">
                          {userData.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {userData.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[#4f46e5]">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-[#71717a]">อีเมล</p>
                        <p className="font-medium text-[#27272a]">
                          {userData.email}
                        </p>
                      </div>
                    </div>
                  )}
                  {userData.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[#4f46e5]">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-[#71717a]">เบอร์โทรศัพท์</p>
                        <p className="font-medium text-[#27272a]">
                          {userData.phone}
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
                        {selectedSlot}
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
                      <p className="text-sm text-[#71717a]">Meeting ID</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-[#4f46e5] hover:bg-[#f5f3ff] transition-colors"
                              onClick={() =>
                                copyToClipboard(
                                  zoomData.meetingId,
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
                      {zoomData.meetingId}
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
                                  zoomData.password,
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
                      {zoomData.password}
                    </p>
                  </div>
                  <div className="text-center mt-6">
                    <p className="text-sm text-[#71717a] mb-3">
                      ลิงก์เข้าร่วมการประชุมได้ถูกส่งไปยัง
                      {userData.email && userData.phone
                        ? "อีเมลและเบอร์โทรของคุณแล้ว"
                        : userData.email
                        ? "อีเมลของคุณแล้ว"
                        : "เบอร์โทรของคุณแล้ว"}
                    </p>
                    <Button
                      className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white h-11 flex items-center justify-center gap-2 transition-all duration-200"
                      onClick={() => window.open(zoomData.link, "_blank")}
                    >
                      <Video className="h-4 w-4" /> เข้าร่วม Zoom Meeting
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </Button>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        className="w-full border-[#e4e4e7] hover:border-[#4f46e5] h-10 text-[#71717a] transition-all duration-200 bg-transparent"
                        onClick={() =>
                          copyToClipboard(
                            zoomData.link,
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
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#e4e4e7]">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-[#e4e4e7] hover:border-[#4f46e5] flex items-center gap-2 transition-all duration-200 bg-transparent"
              asChild
            >
              <Link href={`/timeselection?date=${selectedTime}`}>
                <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
              </Link>
            </Button>
            <div className="flex-1 flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#e4e4e7] hover:border-[#4f46e5] flex items-center gap-2 transition-all duration-200 bg-transparent"
                  >
                    <Download className="h-4 w-4" /> บันทึก
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuItem
                    onClick={() =>
                      saveBookingDetails({
                        userData,
                        queueNumber,
                        meetingDate: formattedDate,
                        meetingTimeSlot: selectedSlot,
                        meetingId: zoomData.meetingId,
                        meetingPassword: zoomData.password,
                        meetingUrl: zoomData.link,
                      })
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    บันทึกเป็นไฟล์ข้อความ
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      addToCalendar({
                        queueNumber,
                        meetingDate: formattedDate,
                        meetingTimeSlot: selectedSlot,
                        meetingId: zoomData.meetingId,
                        meetingPassword: zoomData.password,
                        meetingUrl: zoomData.link,
                      })
                    }
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    เพิ่มในปฏิทิน
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ShareDropdown
                bookingData={{
                  queueNumber: queueNumber,
                  meetingDate: formattedDate,
                  meetingTimeSlot: selectedSlot,
                  meetingId: zoomData.meetingId,
                  meetingPassword: zoomData.password,
                  meetingUrl: zoomData.link,
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
  );
}
