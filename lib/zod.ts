import { z } from "zod";

// Zod schema for validation
export const reservationSchema = z
  .object({
    email: z
      .string()
      .email("กรุณากรอกอีเมลที่ถูกต้อง")
      .optional()
      .or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.email || data.phone, {
    message: "กรุณากรอกอีเมลหรือเบอร์โทรศัพท์อย่างน้อย 1 อย่าง",
    path: ["email"], // error ที่ email อย่างเดียว
  })
  .refine((data) => data.email || data.phone, {
    message: "กรุณากรอกอีเมลหรือเบอร์โทรศัพท์อย่างน้อย 1 อย่าง",
    path: ["phone"], // error ที่ phone ด้วย
  })
  .refine(
    (data) => {
      if (data.phone && data.phone.length > 0) {
        const phoneRegex = /^[0-9]{9,10}$/;
        return phoneRegex.test(data.phone.replace(/[-\s]/g, ""));
      }
      return true;
    },
    {
      message: "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (9-10 หลัก)",
      path: ["phone"],
    }
  );

export type ReservationFormData = z.infer<typeof reservationSchema>;
