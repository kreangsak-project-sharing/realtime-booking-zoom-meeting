-- CreateTable
CREATE TABLE "RegisterUser" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "size" TEXT,
    "job" TEXT,
    "activities" TEXT,
    "traveldate" TEXT,
    "activitiesworkshop" VARCHAR(1600),
    "activitiesreason" VARCHAR(1600),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "terms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegisterUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageProfile" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ImageProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageActivity" (
    "id" TEXT NOT NULL,
    "url" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ImageActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT DEFAULT 'USER',
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "meetingTimeSlot" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 10,
    "zoomMeetingId" TEXT,
    "zoomJoinUrl" TEXT,
    "zoomPassword" TEXT,
    "queueNumber" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "interviewerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegisterUser_phone_key" ON "RegisterUser"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RegisterUser_email_key" ON "RegisterUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ImageProfile_userId_key" ON "ImageProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_key" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_userId_key" ON "Meeting"("userId");

-- CreateIndex
CREATE INDEX "Meeting_meetingDate_idx" ON "Meeting"("meetingDate");

-- CreateIndex
CREATE INDEX "Meeting_queueNumber_idx" ON "Meeting"("queueNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_meetingDate_meetingTimeSlot_key" ON "Meeting"("meetingDate", "meetingTimeSlot");

-- AddForeignKey
ALTER TABLE "ImageProfile" ADD CONSTRAINT "ImageProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "RegisterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageActivity" ADD CONSTRAINT "ImageActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "RegisterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "RegisterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "RegisterUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
