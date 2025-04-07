"use client";

import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  List,
  Tag,
  Divider,
  Progress,
  Typography,
  Alert,
  Space,
} from "antd";
import {
  ShopOutlined,
  BankOutlined,
  LineChartOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Line } from "@nivo/line";
import { Bar } from "@nivo/bar";
import { Pie } from "@nivo/pie";
import MainLayout from "@/src/components/layout/MainLayout";
import apiClient from "@/src/lib/api/apiClient";
import styles from "./dashboard.module.scss";

const { Title, Text } = Typography;

interface DashboardData {
  stats: {
    totalItems: number;
    totalItemsInStore: number;
    lowStockItems: number;
    expiringItems: number;
    wasteRate: number;
    salesPerformance: number;
  };
  expiringProducts: any[];
  lowStockProducts: any[];
  performanceMetrics: {
    revenue: { date: string; value: number }[];
    waste: { date: string; value: number }[];
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mocking dashboard data - in a real app, this would be fetched from backend
      // const response = await apiClient.get('/dashboard');
      // setDashboardData(response.data);

      // Simulated data for demonstration
      const mockData: DashboardData = {
        stats: {
          totalItems: 345,
          totalItemsInStore: 124,
          lowStockItems: 18,
          expiringItems: 12,
          wasteRate: 3.2,
          salesPerformance: 8.5,
        },
        expiringProducts: [
          {
            id: 1,
            name: "Fresh Milk",
            category: "Dairy",
            expireDate: "2025-04-15",
            daysLeft: 5,
          },
          {
            id: 2,
            name: "Yogurt",
            category: "Dairy",
            expireDate: "2025-04-14",
            daysLeft: 4,
          },
          {
            id: 3,
            name: "Bread",
            category: "Bakery",
            expireDate: "2025-04-12",
            daysLeft: 2,
          },
          {
            id: 4,
            name: "Chicken",
            category: "Meat",
            expireDate: "2025-04-11",
            daysLeft: 1,
          },
        ],
        lowStockProducts: [
          {
            id: 5,
            name: "Apple Juice",
            category: "Beverages",
            quantity: 3,
            minStock: 10,
          },
          {
            id: 6,
            name: "Rice",
            category: "Grains",
            quantity: 5,
            minStock: 15,
          },
          {
            id: 7,
            name: "Pasta",
            category: "Grains",
            quantity: 2,
            minStock: 8,
          },
        ],
        performanceMetrics: {
          revenue: [
            { date: "2025-03-01", value: 2400 },
            { date: "2025-03-08", value: 2100 },
            { date: "2025-03-15", value: 2600 },
            { date: "2025-03-22", value: 2900 },
            { date: "2025-03-29", value: 3100 },
            { date: "2025-04-05", value: 3000 },
          ],
          waste: [
            { date: "2025-03-01", value: 300 },
            { date: "2025-03-08", value: 250 },
            { date: "2025-03-15", value: 200 },
            { date: "2025-03-22", value: 220 },
            { date: "2025-03-29", value: 180 },
            { date: "2025-04-05", value: 150 },
          ],
        },
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard data...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !dashboardData) {
    return (
      <MainLayout>
        <Alert
          message="Error"
          description={error || "Could not load dashboard data"}
          type="error"
          showIcon
        />
      </MainLayout>
    );
  }

  const { stats, expiringProducts, lowStockProducts, performanceMetrics } =
    dashboardData;

  // Prepare chart data
  const revenueChartData = [
    {
      id: "revenue",
      color: "#000",
      data: performanceMetrics.revenue.map((item) => ({
        x: dayjs(item.date).format("MMM DD"),
        y: item.value,
      })),
    },
  ];

  const wasteData = performanceMetrics.waste.map((w) => w.value);
  const wasteReduction =
    ((wasteData[0] - wasteData[wasteData.length - 1]) / wasteData[0]) * 100;

  return (
    <MainLayout>
      <div className={styles.dashboardPage}>
        <div className={styles.welcome}>
          <div>
            <Title level={2}>Dashboard</Title>
            <Text>Welcome to your Smart Inventory Management System</Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/warehouse")}
            >
              Upload Inventory
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} className={styles.statsCards}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="Total Products"
                value={stats.totalItems}
                prefix={<BankOutlined />}
                valueStyle={{ color: "#000" }}
              />
              <div className={styles.cardFooter}>
                <Button type="link" onClick={() => router.push("/warehouse")}>
                  View Warehouse
                </Button>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="Products in Store"
                value={stats.totalItemsInStore}
                prefix={<ShopOutlined />}
                valueStyle={{ color: "#000" }}
              />
              <div className={styles.cardFooter}>
                <Button type="link" onClick={() => router.push("/store")}>
                  View Store
                </Button>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="Waste Rate"
                value={stats.wasteRate}
                precision={1}
                valueStyle={{
                  color: stats.wasteRate > 5 ? "#cf1322" : "#3f8600",
                }}
                suffix="%"
              />
              <div className={styles.cardFooter}>
                <Tag color={wasteReduction > 0 ? "green" : "red"}>
                  {wasteReduction > 0 ? (
                    <ArrowDownOutlined />
                  ) : (
                    <ArrowUpOutlined />
                  )}
                  {Math.abs(wasteReduction).toFixed(1)}% vs last month
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="Sales Performance"
                value={stats.salesPerformance}
                precision={1}
                valueStyle={{ color: "#3f8600" }}
                prefix={<ArrowUpOutlined />}
                suffix="%"
              />
              <div className={styles.cardFooter}>
                <Button type="link" onClick={() => router.push("/prediction")}>
                  View Predictions
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Alerts Section */}
          <Col xs={24} lg={12}>
            <Card title="Alerts" className={styles.alertsCard}>
              {expiringProducts.length === 0 &&
              lowStockProducts.length === 0 ? (
                <div className={styles.noAlerts}>
                  <WarningOutlined className={styles.noAlertsIcon} />
                  <p>No alerts at this time</p>
                </div>
              ) : (
                <>
                  {expiringProducts.length > 0 && (
                    <>
                      <Alert
                        message={`${expiringProducts.length} Products Expiring Soon`}
                        type="warning"
                        showIcon
                        className={styles.alertBanner}
                      />
                      <List
                        size="small"
                        dataSource={expiringProducts}
                        renderItem={(item) => (
                          <List.Item
                            actions={[
                              <Button
                                key="discount"
                                type="link"
                                size="small"
                                onClick={() => router.push("/store")}
                              >
                                Apply Discount
                              </Button>,
                            ]}
                          >
                            <List.Item.Meta
                              title={item.name}
                              description={
                                <Space>
                                  <Tag color="blue">{item.category}</Tag>
                                  <span>Expires in {item.daysLeft} days</span>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </>
                  )}

                  {lowStockProducts.length > 0 && (
                    <>
                      <Divider className={styles.divider} />
                      <Alert
                        message={`${lowStockProducts.length} Products Low in Stock`}
                        type="error"
                        showIcon
                        className={styles.alertBanner}
                      />
                      <List
                        size="small"
                        dataSource={lowStockProducts}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              title={item.name}
                              description={
                                <Space
                                  direction="vertical"
                                  style={{ width: "100%" }}
                                >
                                  <Space>
                                    <Tag color="blue">{item.category}</Tag>
                                    <span>
                                      Current: {item.quantity} / Min:{" "}
                                      {item.minStock}
                                    </span>
                                  </Space>
                                  <Progress
                                    percent={
                                      (item.quantity / item.minStock) * 100
                                    }
                                    showInfo={false}
                                    strokeColor={
                                      item.quantity < item.minStock / 2
                                        ? "#f5222d"
                                        : "#faad14"
                                    }
                                    size="small"
                                  />
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </>
                  )}
                </>
              )}
            </Card>
          </Col>

          {/* Performance Chart */}
          <Col xs={24} lg={12}>
            <Card title="Revenue Trend" className={styles.chartCard}>
              <div className={styles.chartContainer}>
                <Line
                  data={revenueChartData}
                  width={500}  // Add explicit width
                  height={300} // Add explicit height
                  margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
                  xScale={{ type: "point" }}
                  yScale={{
                    type: "linear",
                    min: "auto",
                    max: "auto",
                  }}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Week",
                    legendOffset: 36,
                    legendPosition: "middle",
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Revenue ($)",
                    legendOffset: -40,
                    legendPosition: "middle",
                  }}
                  pointSize={10}
                  pointColor={{ theme: "background" }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: "serieColor" }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  enableArea={true}
                  areaBaselineValue={Math.min(
                    ...performanceMetrics.revenue.map((r) => r.value)
                  )}
                  areaOpacity={0.15}
                />
              </div>
              <div className={styles.chartInfo}>
                <Tag color="green" icon={<ArrowUpOutlined />}>
                  {(
                    ((performanceMetrics.revenue[
                      performanceMetrics.revenue.length - 1
                    ].value -
                      performanceMetrics.revenue[0].value) /
                      performanceMetrics.revenue[0].value) *
                    100
                  ).toFixed(1)}
                  % increase in revenue
                </Tag>
                <Tag color="green" icon={<ArrowDownOutlined />}>
                  {wasteReduction.toFixed(1)}% reduction in waste
                </Tag>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card title="Quick Actions" className={styles.actionsCard}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Button
                block
                icon={<BankOutlined />}
                size="large"
                onClick={() => router.push("/warehouse")}
                className={styles.actionButton}
              >
                Manage Warehouse
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button
                block
                icon={<ShopOutlined />}
                size="large"
                onClick={() => router.push("/store")}
                className={styles.actionButton}
              >
                Store Management
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button
                block
                icon={<LineChartOutlined />}
                size="large"
                onClick={() => router.push("/prediction")}
                className={styles.actionButton}
              >
                View Predictions
              </Button>
            </Col>
          </Row>
        </Card>
      </div>
    </MainLayout>
  );
}
