import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Authentication - Inventory Management System",
  description: "Log in or register for the Inventory Management System.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-brand-purple to-violet-900 p-4">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
