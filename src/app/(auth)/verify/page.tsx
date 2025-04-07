"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, Alert, Divider } from "antd";
import { KeyOutlined, ReloadOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/src/lib/api/auth";
import styles from "./verify.module.scss";

const { Title, Text } = Typography;

interface VerifyFormValues {
  code: string;
}

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  useEffect(() => {
    if (!email) {
      router.push("/register");
      return;
    }

    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, email, router]);

  const onFinish = async (values: VerifyFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await verifyEmail(email, values.code);
      router.push("/login");
    } catch (error: any) {
      setError(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setCountdown(60);

    try {
      // Implement the actual resend code API call here
      // For now, we're just simulating it
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Display success message or handle accordingly
    } catch (error) {
      setError("Failed to resend verification code");
    }
  };

  return (
    <div className={styles.verifyContainer}>
      <Card className={styles.verifyCard}>
        <div className={styles.logoContainer}>
          <Title level={2} className={styles.title}>
            Smart Inventory
          </Title>
        </div>

        <Title level={3} className={styles.subtitle}>
          Verify your email
        </Title>

        <Text className={styles.emailText}>
          We've sent a verification code to <strong>{email}</strong>
        </Text>

        {error && (
          <Alert
            message="Verification Error"
            description={error}
            type="error"
            showIcon
            className={styles.errorAlert}
          />
        )}

        <Form
          name="verify-form"
          onFinish={onFinish}
          layout="vertical"
          className={styles.verifyForm}
        >
          <Form.Item
            name="code"
            label="Verification Code"
            rules={[
              {
                required: true,
                message: "Please input the verification code!",
              },
              { len: 6, message: "Verification code must be 6 digits!" },
            ]}
          >
            <Input
              prefix={<KeyOutlined />}
              placeholder="6-digit code"
              size="large"
              maxLength={6}
            />
          </Form.Item>

          <Form.Item className={styles.buttonItem}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              className={styles.submitButton}
            >
              Verify Email
            </Button>
          </Form.Item>
        </Form>

        <Divider className={styles.divider}>Didn't receive the code?</Divider>

        <Button
          icon={<ReloadOutlined />}
          block
          size="large"
          disabled={resendDisabled}
          onClick={handleResendCode}
          className={styles.resendButton}
        >
          {resendDisabled ? `Resend Code (${countdown}s)` : "Resend Code"}
        </Button>
      </Card>
    </div>
  );
}
