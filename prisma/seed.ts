import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.registerUser.create({
    data: {
      id: "cmbxa749jq000m2ebyfok0eau",
      title: "นาย",
      name: "ทดสอบ คนที่ 1",
      age: 36,
      phone: "0812345678",
      email: "test01@gmail.com",
      size: "XL",
      job: "พนักงาน",
      activities: "เคยร่วมกิจกรรม",
      traveldate: "เส้นทางกรุงเทพ",
      activitiesworkshop: "",
      activitiesreason:
        "สนใจเข้าร่วมกิจกรรมอาสาเพื่อพัฒนาทักษะและประสบการณ์ใหม่",
      status: "approved",
      terms: true,
      createdAt: new Date("2025-06-15 04:59:15.927"),
      updatedAt: new Date("2025-06-15 04:59:15.927"),
    },
  });

  await prisma.registerUser.create({
    data: {
      id: "cmbxa78f1p000p2ebypzranvi",
      title: "นางสาว",
      name: "ทดสอบ คนที่ 2",
      age: 43,
      phone: "0923456789",
      email: "test02@gmail.com",
      size: "M",
      job: "พนักงานมหาวิทยาลัย",
      activities: "ไม่เคยร่วมกิจกรรม",
      traveldate: "เส้นทางกรุงเทพ",
      activitiesworkshop: "",
      activitiesreason:
        "สนใจเข้าร่วมกิจกรรมอาสาเพื่อพัฒนาทักษะและประสบการณ์ใหม่",
      status: "approved",
      terms: true,
      createdAt: new Date("2025-06-15 05:02:29.678"),
      updatedAt: new Date("2025-06-15 05:02:29.678"),
    },
  });

  await prisma.registerUser.create({
    data: {
      id: "cmbxa7ki7i00002e5swzkohtk",
      title: "นางสาว",
      name: "ทดสอบ คนที่ 3",
      age: 39,
      phone: "0712345678",
      email: "test03@gmail.com",
      size: "L",
      job: "นักศึกษา",
      activities: "ไม่เคยร่วมกิจกรรม",
      traveldate: "เส้นทางชลบุรี",
      activitiesworkshop: "No",
      activitiesreason:
        "สนใจเข้าร่วมกิจกรรมอาสาเพื่อพัฒนาทักษะและประสบการณ์ใหม่",
      status: "pending",
      terms: true,
      createdAt: new Date("2025-06-15 05:11:53.647"),
      updatedAt: new Date("2025-06-15 05:11:53.647"),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
