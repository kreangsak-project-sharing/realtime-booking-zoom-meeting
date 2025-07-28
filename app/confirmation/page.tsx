import Confirmation from "@/components/confirmation";
import StepIndicator from "@/components/step-indicator";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getBookingById } from "@/app/actions/auth-actions";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default async function ConfirmationPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const bookingData = await getBookingById(user.id);
  if (!bookingData) {
    notFound();
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] to-[#f5f5f5] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <StepIndicator
              steps={[
                {
                  label: "ข้อมูลติดต่อ",
                  description: "อีเมลหรือเบอร์โทร",
                  href: "/",
                },
                {
                  label: "เลือกเวลา",
                  description: "วันและเวลาสัมภาษณ์",
                  href: "/timeselection",
                },
                {
                  label: "ยืนยัน",
                  description: "รายละเอียด Zoom",
                  href: "/confirmation",
                },
              ]}
              currentStep={3}
            />
          </div>

          <div className="flex-1 flex items-center justify-center py-6 px-4">
            <div className="w-full max-w-5xl">
              <Confirmation
                userData={
                  bookingData.user
                    ? bookingData.user
                    : { email: "", phone: "", name: "" }
                }
                selectedTime={bookingData.booking?.meetingDate ?? ""}
                selectedSlot={bookingData.booking?.meetingTimeSlot ?? ""}
                zoomData={{
                  meetingId: bookingData.booking?.meetingId ?? "",
                  password: bookingData.booking?.meetingPassword ?? "",
                  link: bookingData.booking?.meetingLink ?? "",
                }}
                queueNumber={bookingData.booking?.queueNumber ?? 0}
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
