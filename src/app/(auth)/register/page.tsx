"use client";

import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert, Divider } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/src/lib/api/auth";
import styles from "./register.module.scss";

const { Title } = Typography;

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const response = await register(values.email, values.password);
      router.push(`/verify?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <Card className={styles.registerCard}>
        <div className={styles.logoContainer}>
          <Title level={2} className={styles.title}>
            Smart Inventory
          </Title>
        </div>

        <Title level={3} className={styles.subtitle}>
          Create an account
        </Title>

        {error && (
          <Alert
            message="Registration Error"
            description={error}
            type="error"
            showIcon
            className={styles.errorAlert}
          />
        )}

        <Form
          name="register-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          className={styles.registerForm}
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
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 8, message: "Password must be at least 8 characters!" },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
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
              Register
            </Button>
          </Form.Item>
        </Form>

        <Divider className={styles.divider}>Already have an account?</Divider>

        <Link href="/login">
          <Button block size="large" className={styles.loginButton}>
            Login
          </Button>
        </Link>
      </Card>
    </div>
  );
}
