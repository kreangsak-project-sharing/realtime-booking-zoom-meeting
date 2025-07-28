import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import StepIndicator from "@/components/step-indicator";
import TimeTable from "@/components/time-table";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TimeSelectPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
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
                  href: "/time-selection",
                },
                {
                  label: "ยืนยัน",
                  description: "รายละเอียด Zoom",
                  href: "/confirmation",
                },
              ]}
              currentStep={1}
            />
          </div>

          <div className="flex-1 flex items-center justify-center py-6 px-4">
            <div className="w-full max-w-5xl">
              <TimeTable userData={user} />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
