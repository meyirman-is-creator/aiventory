"use client";

import { SessionProvider } from "next-auth/react";
import { ConfigProvider } from "antd";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

const theme = {
  token: {
    colorPrimary: "#000000",
    colorSecondary: "#FFCC00",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1677ff",
    borderRadius: 4,
  },
  components: {
    Button: {
      colorPrimary: "#000000",
      algorithm: true,
    },
    Card: {
      algorithm: true,
    },
  },
};

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <ConfigProvider theme={theme}>{children}</ConfigProvider>
    </SessionProvider>
  );
}

