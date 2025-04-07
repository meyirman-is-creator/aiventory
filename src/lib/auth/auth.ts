import { getServerSession } from "next-auth"
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";

export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}