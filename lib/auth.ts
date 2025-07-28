import { cookies } from "next/headers";
import { verifyJWT } from "./jwt"; // ของคุณเอง

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const payload = verifyJWT(token); // decode JWT (เช่น user.id, email)
    return payload; // return user info ที่เก็บไว้ใน token
  } catch {
    return null;
  }
}
