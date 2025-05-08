import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Авторизация - Система управления инвентаризацией",
  description: "Войдите или зарегистрируйтесь в системе управления инвентаризацией.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <div 
          className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 bg-[#f9fafb]"
        >
          <div className="w-full max-w-md">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}