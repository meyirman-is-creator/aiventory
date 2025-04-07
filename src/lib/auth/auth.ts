import { getServerSession } from "next-auth/next";
import { nextAuthOptions } from "../api/auth/[...nextauth]/route";

export async function getServerAuthSession() {
  return await getServerSession(nextAuthOptions);
}
