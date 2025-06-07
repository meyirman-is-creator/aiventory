import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AIventory - Авторизация",
  description: "Система управления запасами с искусственным интеллектом",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} antialiased`}>
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}