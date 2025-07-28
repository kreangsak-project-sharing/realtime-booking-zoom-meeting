"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronRight,
  Video,
  Users,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGlobalSocket } from "@/hooks/use-socket";
import { toast } from "sonner";
import {
  createBooking,
  getAvailableSlots,
  getMyBooking,
} from "@/app/actions/auth-actions";
import Link from "next/link";

import { useSearchParams } from "next/navigation";

type UserData = {
  email?: string;
  phone?: string;
  name?: string;
};

export default function TimeTable({ userData }: { userData: UserData }) {
  const router = useRouter();

  const paramsDate = useSearchParams().get("date") || "2025-08-23";
  const dateOnly = paramsDate.split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(dateOnly);
  const [dates, setDates] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const { socket, isConnected } = useGlobalSocket();

  const [myBookedSlot, setMyBookedSlot] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyBooking = async () => {
      const result = await getMyBooking(selectedDate);
      if (result.success) {
        setMyBookedSlot(result.meetingTimeSlot ?? null);
      } else {
        setMyBookedSlot(null);
      }
    };

    fetchMyBooking();
  }, [selectedDate]);

  useEffect(() => {
    const generateDates = () => {
      const result = [];
      const start = new Date("2025-08-23");

      for (let i = 0; i < 6; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        result.push(date.toISOString().split("T")[0]);
      }

      return result;
    };

    setDates(generateDates());
  }, []);

  useEffect(() => {
    // Load initial slots using Server Action
    const loadSlots = async () => {
      setLoading(true);
      const result = await getAvailableSlots(selectedDate);
      if (result.success) {
        setBookedSlots(result.bookedSlots);
      }
      setLoading(false);
    };

    loadSlots();

    // Join socket room for real-time updates
    if (socket && isConnected) {
      socket.emit("join-date-room", selectedDate);
      socket.emit("get-available-slots", selectedDate);

      // Listen for real-time slot updates
      socket.on("slot-booked", (data: { date: string; timeSlot: string }) => {
        if (data.date === selectedDate) {
          setBookedSlots((prev) => [...prev, data.timeSlot]);
          toast.info("มีการจองใหม่", {
            description: `เวลา ${data.timeSlot} ถูกจองแล้ว`,
          });
        }
      });

      socket.on(
        "available-slots-updated",
        (data: { date: string; bookedSlots: string[] }) => {
          if (data.date === selectedDate) {
            setBookedSlots(data.bookedSlots);
          }
        }
      );

      socket.on("slot-unbooked", (data: { date: string; timeSlot: string }) => {
        if (data.date === selectedDate) {
          setBookedSlots((prev) =>
            prev.filter((slot) => slot !== data.timeSlot)
          );
          toast.info("มีการยกเลิกการจอง", {
            description: `ช่วงเวลา ${data.timeSlot} ว่างแล้ว`,
          });
        }
      });

      return () => {
        socket.emit("leave-date-room", selectedDate);
        socket.off("slot-booked");
        socket.off("available-slots-updated");
        socket.off("slot-unbooked");
      };
    }
  }, [selectedDate, socket, isConnected]);

  // Generate time slots from 9:00 to 24:00 (15 hours = 90 slots of 10 minutes)
  // const generateTimeSlots = () => {
  //   const slots = [];
  //   const startHour = 8;
  //   const totalSlots = 90;

  //   for (let i = 0; i < totalSlots; i++) {
  //     const slotMinutes = i * 10;
  //     const hours = Math.floor(slotMinutes / 60) + startHour;
  //     const minutes = slotMinutes % 60;

  //     const startTime = `${hours.toString().padStart(2, "0")}:${minutes
  //       .toString()
  //       .padStart(2, "0")}`;
  //     const endMinutes = (slotMinutes + 10) % 60;
  //     const endHours = endMinutes < minutes ? hours + 1 : hours;
  //     const endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes
  //       .toString()
  //       .padStart(2, "0")}`;

  //     const timeSlot = `${startTime} - ${endTime}`;
  //     const isBooked = bookedSlots.includes(timeSlot);

  //     slots.push({
  //       time: timeSlot,
  //       available: !isBooked,
  //     });
  //   }

  //   return slots;
  // };

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // เวลาเริ่มต้น
    const endHour = 22; // เวลาสิ้นสุด เช่น 22:00
    const slotLength = 10; // slot ละ 10 นาที
    const breakLength = 5; // break 5 นาที

    let currentMinutes = startHour * 60; // นาทีตั้งต้น เช่น 8*60 = 480

    // วนจนกว่าเวลาเริ่มจะ >= endHour:00
    while (currentMinutes + slotLength <= endHour * 60) {
      const startH = Math.floor(currentMinutes / 60);
      const startM = currentMinutes % 60;
      const endMinutes = currentMinutes + slotLength;
      const endH = Math.floor(endMinutes / 60);
      const endM = endMinutes % 60;

      const startTime = `${startH.toString().padStart(2, "0")}:${startM
        .toString()
        .padStart(2, "0")}`;
      const endTime = `${endH.toString().padStart(2, "0")}:${endM
        .toString()
        .padStart(2, "0")}`;
      const timeSlot = `${startTime} - ${endTime}`;
      const isBooked = bookedSlots.includes(timeSlot);

      slots.push({
        time: timeSlot,
        available: !isBooked,
      });

      // ขยับเวลา = slot + break
      currentMinutes += slotLength + breakLength;
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Group time slots by hour for better UI
  const groupedSlots: Record<
    string,
    Array<{ time: string; available: boolean }>
  > = {};
  timeSlots.forEach((slot) => {
    const hour = slot.time.split(":")[0];
    if (!groupedSlots[hour]) {
      groupedSlots[hour] = [];
    }
    groupedSlots[hour].push(slot);
  });

  // Sort hours numerically
  const sortedHourKeys = Object.keys(groupedSlots).sort(
    (a, b) => Number(a) - Number(b)
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Format date for header
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSlotSelect = async (timeSlot: string) => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("email", userData.email || "");
        formData.append("phone", userData.phone || "");
        formData.append("date", selectedDate);
        formData.append("timeSlot", timeSlot);

        const result = await createBooking(formData);

        if (!result.success) {
          toast.error("ไม่สามารถจองได้", {
            description: result.message,
          });
          return;
        }

        // ✅ ถ้ามีเวลาที่เคยจองไว้ -> ปลดล็อก
        if (result.previousMeetingTimeSlot && socket && isConnected) {
          socket.emit("notify-slot-unbooked", {
            date: result.previousMeetingDate?.split("T")[0] || selectedDate,
            timeSlot: result.previousMeetingTimeSlot,
          });
        }

        // ✅ แจ้งว่า slot ใหม่ถูกจอง
        if (socket && isConnected) {
          socket.emit("notify-slot-booked", {
            date: selectedDate,
            timeSlot,
          });
        }

        if (result.booking?.id) {
          toast.success("จองสำเร็จ!", {
            description: `คุณได้จองเวลา ${timeSlot} เรียบร้อยแล้ว`,
          });

          if (result.previousMeetingTimeSlot) {
            router.push("/my-booking");
          } else {
            router.push("/confirmation/");
          }
        } else {
          toast.error("เกิดข้อผิดพลาด", {
            description: "ไม่พบข้อมูลการจอง กรุณาลองใหม่อีกครั้ง",
          });
        }
      } catch (error) {
        console.error("Booking error:", error);
        toast.error("เกิดข้อผิดพลาด", {
          description: "ไม่สามารถจองเวลานี้ได้ กรุณาลองใหม่อีกครั้ง",
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f46e5] mx-auto mb-4"></div>
          <p className="text-[#71717a]">กำลังโหลดตารางเวลา...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full grid md:grid-cols-3 gap-6"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="md:col-span-1"
      >
        <Card className="shadow-lg border-[#e4e4e7] h-full flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-[#27272a]">
              <Calendar className="h-5 w-5 text-[#4f46e5]" />
              เลือกวันที่
            </CardTitle>
            <CardDescription>เลือกวันที่ต้องการสัมภาษณ์</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {/* User Contact Info */}
            <div className="bg-[#f4f4f5] rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-[#27272a] mb-2">
                ข้อมูลติดต่อ
              </h4>
              {userData.name && (
                <div className="flex items-center gap-2 text-sm text-[#71717a] mb-1">
                  <User className="h-3 w-3" />
                  <span>{userData.name}</span>
                </div>
              )}
              {userData.email && (
                <div className="flex items-center gap-2 text-sm text-[#71717a] mb-1">
                  <Mail className="h-3 w-3" />
                  <span>{userData.email}</span>
                </div>
              )}
              {userData.phone && (
                <div className="flex items-center gap-2 text-sm text-[#71717a]">
                  <Phone className="h-3 w-3" />
                  <span>{userData.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {dates.map((date, index) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Button
                    variant={selectedDate === date ? "default" : "outline"}
                    className={`w-full justify-start text-left h-auto py-3 px-4 transition-all duration-200 ${
                      selectedDate === date
                        ? "bg-[#4f46e5] hover:bg-[#4338ca] text-white"
                        : "border-[#e4e4e7] hover:border-[#4f46e5]"
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedDate === date
                            ? "bg-white/20 text-white"
                            : "bg-[#f4f4f5] text-[#4f46e5]"
                        }`}
                      >
                        {new Date(date).getDate()}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{formatDate(date)}</p>
                        <p className="text-xs opacity-80">
                          {selectedDate === date
                            ? "วันที่เลือก"
                            : "คลิกเพื่อเลือก"}
                        </p>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-[#e4e4e7]">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#4f46e5] hover:bg-[#4338ca]">
                    <Video className="h-3 w-3 mr-1" />
                    Zoom
                  </Badge>
                  <span className="text-sm text-[#71717a]">
                    สัมภาษณ์ออนไลน์
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-[#e4e4e7] text-[#71717a]"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    10 นาที
                  </Badge>
                  <span className="text-sm text-[#71717a]">ต่อการสัมภาษณ์</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-[#e4e4e7] text-[#71717a]"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {bookedSlots.length}
                  </Badge>
                  <span className="text-sm text-[#71717a]">
                    ช่วงเวลาที่จองแล้ว
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full border-[#e4e4e7] hover:border-[#4f46e5] flex items-center justify-center gap-2 transition-all duration-200 bg-transparent"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="md:col-span-2"
      >
        <Card className="shadow-lg border-[#e4e4e7] h-full flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-[#27272a]">
                เลือกเวลา
              </CardTitle>
              <Badge
                variant="outline"
                className="border-[#e4e4e7] bg-[#f4f4f5] text-[#27272a]"
              >
                {formatFullDate(selectedDate)}
              </Badge>
            </div>
            <CardDescription>เลือกช่วงเวลาที่ต้องการสัมภาษณ์</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6 max-h-full pr-2 custom-scrollbar">
              {sortedHourKeys.map((hour, hourIndex) => (
                <motion.div
                  key={hour}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * hourIndex }}
                  className="pb-4 last:pb-0"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[#4f46e5] font-medium">
                      {hour}
                    </div>
                    <span className="text-[#27272a] font-medium">
                      {hour}:00 น.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {groupedSlots[hour].map((slot, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.05 * index }}
                      >
                        <Button
                          variant={slot.available ? "outline" : "ghost"}
                          disabled={!slot.available || isPending}
                          onClick={() =>
                            slot.available && handleSlotSelect(slot.time)
                          }
                          className={`w-full h-auto py-2.5 justify-between transition-all duration-200 relative flex-wrap ${
                            slot.time === myBookedSlot
                              ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                              : slot.available
                              ? "border-[#e4e4e7] hover:border-[#4f46e5] hover:bg-[#f5f3ff]"
                              : "opacity-40 bg-red-50 border-red-200"
                          } ${isPending ? "cursor-wait" : ""}`}
                        >
                          <span
                            className={slot.available ? "" : "line-through"}
                          >
                            {slot.time}
                          </span>
                          {slot.available ? (
                            <ChevronRight
                              className={`h-4 w-4 ${
                                slot.time === myBookedSlot
                                  ? "text-white"
                                  : "text-[#4f46e5]"
                              }`}
                            />
                          ) : slot.time === myBookedSlot ? (
                            <span className="text-xs text-white font-medium">
                              จองโดยคุณ
                            </span>
                          ) : (
                            <span className="text-xs text-red-500 font-medium">
                              จองแล้ว
                            </span>
                          )}
                          {isPending && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4f46e5]"></div>
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
