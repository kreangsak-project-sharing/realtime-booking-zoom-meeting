"use client";

import { useTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, Video, Search } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { checkUserBooking } from "@/app/actions/auth-actions";
import { type ReservationFormData, reservationSchema } from "@/lib/zod";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    javascriptCallback?: (token: string) => void;
    turnstile?: {
      reset: () => void;
      // add other methods if needed
    };
  }
}

function resetTurnstile() {
  if (window.turnstile && typeof window.turnstile.reset === "function") {
    window.turnstile.reset();
  }
}

export default function ReservationForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
    mode: "onChange",
  });

  // Watch both fields to clear the "at least one required" error
  const email = form.watch("email");
  const phone = form.watch("phone");

  useEffect(() => {
    const emailFilled = Boolean(email && email.trim().length > 0);
    const phoneFilled = Boolean(phone && phone.trim().length > 0);

    // Clear the "at least one required" error when either field is filled
    if (
      (emailFilled || phoneFilled) &&
      form.formState.errors.email?.message ===
        "กรุณากรอกอีเมลหรือเบอร์โทรศัพท์อย่างน้อย 1 อย่าง"
    ) {
      form.clearErrors("email");
      form.clearErrors("phone");
    }
  }, [email, phone, form]);

  const handleSubmit = async (data: ReservationFormData) => {
    startTransition(async () => {
      try {
        const result = await checkUserBooking(data, turnstileToken);
        if (!result.success) {
          toast.error("เกิดข้อผิดพลาด", {
            description: result.message,
          });

          // Reset Turnstile widget if it exists
          resetTurnstile();
          // Clear the Turnstile token
          setTurnstileToken("");

          return;
        }

        if (result.hasbooking) {
          toast.success("พบการจองของคุณ", {
            description: "คุณมีการจองอยู่แล้ว กำลังแสดงรายละเอียด",
          });
          router.push("/my-booking");
        } else {
          if (result.user) {
            router.push("/timeselection");
          } else {
            toast.error("เกิดข้อผิดพลาด", {
              description: "ไม่พบข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง",
            });
          }
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("เกิดข้อผิดพลาด", {
          description: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง",
        });
      }
    });
  };

  // Callback for Turnstile validation
  useEffect(() => {
    window.javascriptCallback = (token) => {
      setTurnstileToken(token);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full grid md:grid-cols-2 gap-8"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden md:flex flex-col justify-center"
      >
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-indigo-200 blur-lg opacity-70"></div>
                <div className="relative bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] p-3 rounded-2xl">
                  <Video className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#27272a] mb-2">
              เริ่มต้นการจองคิวสัมภาษณ์
            </h2>
            <p className="text-[#71717a]">
              กรอกอีเมลหรือเบอร์โทรศัพท์เพื่อเริ่มต้นการจองคิวสัมภาษณ์ออนไลน์ผ่าน
              Zoom
            </p>
          </div>

          <div className="bg-[#f4f4f5] rounded-xl p-5 border border-[#e4e4e7]">
            <h3 className="font-medium text-[#27272a] mb-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-[#4f46e5]"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              ข้อมูลสำคัญ
            </h3>
            <ul className="space-y-3 text-sm text-[#52525b]">
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[#4f46e5] mt-0.5 shrink-0"
                >
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                หากเคยจองแล้ว ระบบจะแสดงการจองเดิม
              </li>
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[#4f46e5] mt-0.5 shrink-0"
                >
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                การสัมภาษณ์ใช้เวลา 10 นาทีต่อคิว
              </li>
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[#4f46e5] mt-0.5 shrink-0"
                >
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                ลิงก์ Zoom จะถูกส่งไปยังช่องทางที่คุณระบุ
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-[#27272a] mb-1">
                  ตรวจสอบการจองเดิม
                </h3>
                <p className="text-sm text-[#52525b]">
                  ระบบจะตรวจสอบว่าคุณเคยจองไว้แล้วหรือไม่ หากเคยจอง
                  จะแสดงรายละเอียดการจองเดิมของคุณ
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg border-[#e4e4e7]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-[#27272a]">
              ข้อมูลติดต่อ
            </CardTitle>
            <CardDescription>
              กรุณากรอกอีเมลหรือเบอร์โทรศัพท์เพื่อตรวจสอบการจองหรือจองใหม่
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#27272a] text-sm font-medium">
                        อีเมล
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="h-4 w-4 text-[#a1a1aa]" />
                          </div>
                          <Input
                            {...field}
                            type="email"
                            placeholder="example@email.com"
                            disabled={isPending}
                            className="h-11 pl-10 bg-[#f4f4f5] border-[#e4e4e7] focus-visible:ring-[#4f46e5] focus-visible:ring-offset-0 disabled:opacity-50"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-[#e4e4e7]"></div>
                  <span className="text-sm text-[#71717a] bg-white px-3">
                    หรือ
                  </span>
                  <div className="flex-1 h-px bg-[#e4e4e7]"></div>
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#27272a] text-sm font-medium">
                        เบอร์โทรศัพท์
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone className="h-4 w-4 text-[#a1a1aa]" />
                          </div>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="081-234-5678"
                            disabled={isPending}
                            className="h-11 pl-10 bg-[#f4f4f5] border-[#e4e4e7] focus-visible:ring-[#4f46e5] focus-visible:ring-offset-0 disabled:opacity-50"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-blue-600"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        ข้อมูลการติดต่อ
                      </p>
                      <p className="text-xs text-blue-700">
                        • หากเคยจองแล้ว: ระบบจะแสดงการจองเดิม
                        <br />• หากยังไม่เคยจอง: จะเข้าสู่ขั้นตอนการจองใหม่
                        <br />• สามารถกรอกทั้งสองอย่างเพื่อความมั่นใจ
                      </p>
                    </div>
                  </div>
                </div> */}

                {/* Turnstile Widget */}
                <Script
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                  async
                  defer
                  strategy="afterInteractive"
                />

                <div
                  className="cf-turnstile mt-10"
                  data-theme="light"
                  data-size="flexible"
                  data-sitekey={
                    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
                    "1x00000000000000000000AA"
                  }
                  data-callback="javascriptCallback"
                />

                <Button
                  type="submit"
                  disabled={isPending || !turnstileToken}
                  className="w-full h-11 bg-[#4f46e5] hover:bg-[#4338ca] text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      ตรวจสอบ / จองใหม่
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
