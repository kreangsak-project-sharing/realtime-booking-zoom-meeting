// Add user types for better type safety
export interface UserData {
  email?: string;
  phone?: string;
  name?: string; // Added name field for user data
}

export interface BookingUserData {
  email: string;
  phone: string | null;
  name: string | null;
}
