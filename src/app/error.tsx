"use client";

import { Button, Result } from "antd";
import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Result
        status="error"
        title="An error occurred"
        subTitle="Sorry, something went wrong."
        extra={[
          <Button type="primary" key="reset" onClick={reset}>
            Try Again
          </Button>,
          <Link href="/" key="home">
            <Button>Back Home</Button>
          </Link>,
        ]}
      />
    </div>
  );
}
