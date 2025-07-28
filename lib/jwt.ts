import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

type JWTPayload = {
  id: string;
  email?: string;
  phone?: string;
  role?: string;
  name?: string; // Optional, can be used for user name
};

export function signJWT(
  payload: JWTPayload,
  options?: jwt.SignOptions
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", // default 7 วัน
    ...options, // allow override
  });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}
