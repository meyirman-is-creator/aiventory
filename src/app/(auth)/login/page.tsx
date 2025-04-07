"use client";

import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert, Divider } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.scss";

const { Title } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl,
      });

      if (result?.error) {
        setErrorMessage("Invalid email or password");
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      setErrorMessage("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <Title level={2} className={styles.title}>
            Smart Inventory
          </Title>
        </div>

        <Title level={3} className={styles.subtitle}>
          Login to your account
        </Title>

        {errorMessage && (
          <Alert
            message="Login Error"
            description={errorMessage}
            type="error"
            showIcon
            className={styles.errorAlert}
          />
        )}

        <Form
          name="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          className={styles.loginForm}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
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
              Login
            </Button>
          </Form.Item>
        </Form>

        <Divider className={styles.divider}>
          Don&apos;t have an account?
        </Divider>

        <Link href="/register">
          <Button block size="large" className={styles.registerButton}>
            Register
          </Button>
        </Link>
      </Card>
    </div>
  );
}
