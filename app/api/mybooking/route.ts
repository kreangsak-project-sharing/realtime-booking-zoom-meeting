// /app/api/mybooking/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { getBookingById } from "@/app/actions/auth-actions";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = verifyJWT(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const booking = await getBookingById(decoded.id);
  if (!booking) {
    return NextResponse.json({ error: "No booking found" }, { status: 404 });
  }

  return NextResponse.json(booking);
}
