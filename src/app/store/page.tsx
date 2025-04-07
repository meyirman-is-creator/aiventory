"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tabs,
  Modal,
  InputNumber,
  Form,
  Tag,
  Space,
  Tooltip,
  Badge,
  Empty,
  Card,
  Statistic,
  Row,
  Col,
  Alert,
} from "antd";
import {
  ShopOutlined,
  WarningOutlined,
  DeleteOutlined,
  PercentageOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useStoreStore } from "@/src/lib/store/useStoreStore";
import {
  getStoreItems,
  applyDiscount,
  expireItem,
  removeItem,
} from "@/src/lib/api/store";
import PageHeader from "@/src/components/ui/PageHeader";
import MainLayout from "@/src/components/layout/MainLayout";
import dayjs from "dayjs";
import styles from "./store.module.scss";

const { TabPane } = Tabs;
const { confirm } = Modal;

export default function StorePage() {
  const {
    storeItems,
    expiredItems,
    loading,
    error,
    setStoreItems,
    setExpiredItems,
    setLoading,
    setError,
    applyDiscount: updateDiscount,
    moveToExpired,
    removeExpiredItem,
  } = useStoreStore();

  const [discountModal, setDiscountModal] = useState<{
    visible: boolean;
    itemId: number | null;
    currentDiscount: number;
  }>({
    visible: false,
    itemId: null,
    currentDiscount: 0,
  });

  const [newDiscount, setNewDiscount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    setLoading(true);
    try {
      const response = await getStoreItems();
      const items = response.data;

      // Separate active and expired items
      const active = items.filter((item: any) => !item.isExpired);
      const expired = items.filter((item: any) => item.isExpired);

      setStoreItems(active);
      setExpiredItems(expired);
    } catch (error) {
      console.error("Error fetching store items:", error);
      setError("Failed to fetch store items");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const openDiscountModal = (item: any) => {
    setDiscountModal({
      visible: true,
      itemId: item.storeItemId,
      currentDiscount: item.discount,
    });
    setNewDiscount(item.discount);
  };

  const handleApplyDiscount = async () => {
    if (!discountModal.itemId) return;

    setLoading(true);
    try {
      await applyDiscount(discountModal.itemId, newDiscount);
      updateDiscount(discountModal.itemId, newDiscount);
      setDiscountModal({ visible: false, itemId: null, currentDiscount: 0 });
    } catch (error) {
      console.error("Error applying discount:", error);
      setError("Failed to apply discount");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToExpired = (itemId: number) => {
    confirm({
      title: "Are you sure you want to mark this item as expired?",
      icon: <ExclamationCircleOutlined />,
      content: "This will move the item to the expired items list.",
      onOk: async () => {
        setLoading(true);
        try {
          await expireItem(itemId);
          moveToExpired(itemId);
        } catch (error) {
          console.error("Error moving item to expired:", error);
          setError("Failed to move item to expired");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleRemoveExpiredItem = (itemId: number) => {
    confirm({
      title: "Are you sure you want to remove this expired item?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: async () => {
        setLoading(true);
        try {
          await removeItem(itemId);
          removeExpiredItem(itemId);
        } catch (error) {
          console.error("Error removing expired item:", error);
          setError("Failed to remove expired item");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getExpirationStatus = (expireDate: string) => {
    const today = dayjs();
    const expiry = dayjs(expireDate);
    const daysUntilExpiry = expiry.diff(today, "day");

    if (daysUntilExpiry < 0) {
      return { status: "expired", color: "error", text: "Expired" };
    } else if (daysUntilExpiry <= 7) {
      return {
        status: "soon",
        color: "warning",
        text: `Expires in ${daysUntilExpiry} days`,
      };
    } else {
      return {
        status: "good",
        color: "success",
        text: `Expires in ${daysUntilExpiry} days`,
      };
    }
  };

  const activeItemsColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className={styles.itemName}>{text}</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number, record: any) => (
        <Space direction="vertical" size="small">
          <span className={styles.price}>${price.toFixed(2)}</span>
          {record.discount > 0 && (
            <Tag color="green">{record.discount}% off</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Original Price",
      dataIndex: "originalPrice",
      key: "originalPrice",
      render: (price: number) => (
        <span className={styles.originalPrice}>${price.toFixed(2)}</span>
      ),
    },
    {
      title: "Expiry Date",
      dataIndex: "expireDate",
      key: "expireDate",
      render: (text: string) => {
        const status = getExpirationStatus(text);
        return (
          <Tooltip title={status.text}>
            <Badge
              status={status.color as any}
              text={dayjs(text).format("YYYY-MM-DD")}
            />
          </Tooltip>
        );
      },
      sorter: (a: any, b: any) => {
        return dayjs(a.expireDate).unix() - dayjs(b.expireDate).unix();
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PercentageOutlined />}
            onClick={() => openDiscountModal(record)}
          >
            Discount
          </Button>
          <Button
            type="default"
            size="small"
            danger
            icon={<WarningOutlined />}
            onClick={() => handleMoveToExpired(record.storeItemId)}
          >
            Mark as Expired
          </Button>
        </Space>
      ),
    },
  ];

  const expiredItemsColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className={styles.expiredItemName}>{text}</span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Original Price",
      dataIndex: "originalPrice",
      key: "originalPrice",
      render: (price: number) => (
        <span className={styles.originalPrice}>${price.toFixed(2)}</span>
      ),
    },
    {
      title: "Expiry Date",
      dataIndex: "expireDate",
      key: "expireDate",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: any) => (
        <Button
          type="primary"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveExpiredItem(record.storeItemId)}
        >
          Remove
        </Button>
      ),
    },
  ];

  // Calculate summary statistics for dashboard
  const totalActiveItems = storeItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalExpiredItems = expiredItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalValue = storeItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const expiringItems = storeItems.filter((item) => {
    const days = dayjs(item.expireDate).diff(dayjs(), "day");
    return days >= 0 && days <= 7;
  });

  return (
    <MainLayout>
      <div className={styles.storePage}>
        <PageHeader
          title="Store Management"
          subtitle="Manage items on display and handle expired products"
        />

        {/* Dashboard Statistics */}
        <div className={styles.dashboard}>
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Items"
                  value={totalActiveItems}
                  prefix={<ShopOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Expired Items"
                  value={totalExpiredItems}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Value"
                  value={totalValue}
                  precision={2}
                  prefix="$"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Expiring Soon"
                  value={expiringItems.length}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Expiring Soon Alert */}
        {expiringItems.length > 0 && (
          <Alert
            message="Items Expiring Soon"
            description={`You have ${expiringItems.length} items that will expire within the next 7 days.`}
            type="warning"
            showIcon
            className={styles.expiryAlert}
          />
        )}

        {/* Main Content Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          className={styles.storeTabs}
        >
          <TabPane
            tab={
              <span>
                <ShopOutlined /> Active Items ({storeItems.length})
              </span>
            }
            key="active"
          >
            {storeItems.length === 0 ? (
              <Empty
                description="No items on display yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={activeItemsColumns}
                dataSource={storeItems}
                rowKey="storeItemId"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className={styles.itemsTable}
              />
            )}
          </TabPane>
          <TabPane
            tab={
              <span>
                <WarningOutlined /> Expired Items ({expiredItems.length})
              </span>
            }
            key="expired"
          >
            {expiredItems.length === 0 ? (
              <Empty
                description="No expired items"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={expiredItemsColumns}
                dataSource={expiredItems}
                rowKey="storeItemId"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className={styles.itemsTable}
              />
            )}
          </TabPane>
        </Tabs>

        {/* Discount Modal */}
        <Modal
          title="Apply Discount"
          open={discountModal.visible}
          onOk={handleApplyDiscount}
          onCancel={() =>
            setDiscountModal({
              visible: false,
              itemId: null,
              currentDiscount: 0,
            })
          }
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Discount Percentage (%)"
              required
              help="Enter a percentage between 0-100"
            >
              <InputNumber
                min={0}
                max={100}
                value={newDiscount}
                onChange={(value) => setNewDiscount(value || 0)}
                style={{ width: "100%" }}
                formatter={(value) => `${value}%`}
                parser={(value) => (value ? value.replace("%", "") : "0")}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}
