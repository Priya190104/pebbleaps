import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLocaleLowerCase("en-US"))
    .filter(Boolean);
  return admins.includes(email.trim().toLocaleLowerCase("en-US"));
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !isAdminEmail(session.user.email)) redirect("/");
  return session.user.id;
}
