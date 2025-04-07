"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Upload,
  message,
  Tabs,
  Modal,
  InputNumber,
  Form,
  Drawer,
  Tag,
  Space,
  Tooltip,
  Badge,
} from "antd";
import {
  UploadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  ShopOutlined,
  QrcodeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useWarehouseStore } from "@/lib/store/useWarehouseStore";
import {
  uploadFile,
  getFiles,
  getItems,
  moveToStore,
} from "@/lib/api/warehouse";
import QRCodeScanner from "@/components/scanner/QRCodeScanner";
import PageHeader from "@/components/ui/PageHeader";
import MainLayout from "@/components/layout/MainLayout";
import type { RcFile } from "antd/lib/upload/interface";
import dayjs from "dayjs";
import styles from "./warehouse.module.scss";

const { TabPane } = Tabs;

export default function WarehousePage() {
  const {
    files,
    items,
    selectedFileId,
    loading,
    error,
    setFiles,
    setItems,
    setSelectedFileId,
    setLoading,
    setError,
    addFile,
    removeItem,
    updateItemQuantity,
  } = useWarehouseStore();

  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [moveToStoreModal, setMoveToStoreModal] = useState<{
    visible: boolean;
    itemId: number | null;
    maxQuantity: number;
  }>({
    visible: false,
    itemId: null,
    maxQuantity: 0,
  });
  const [moveQuantity, setMoveQuantity] = useState<number>(1);
  const [scannerDrawerVisible, setScannerDrawerVisible] = useState(false);
  const [itemToScan, setItemToScan] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (selectedFileId) {
      fetchItems(selectedFileId);
    }
  }, [selectedFileId]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await getFiles();
      setFiles(response.data);
      if (response.data.length > 0 && !selectedFileId) {
        setSelectedFileId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to fetch files");
      message.error("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (fileId: number) => {
    setLoading(true);
    try {
      const response = await getItems(fileId);
      setItems(response.data);
    } catch (error) {
      console.error(`Error fetching items for file ${fileId}:`, error);
      setError(`Failed to fetch items for file ${fileId}`);
      message.error(`Failed to fetch items for file ${fileId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (activeKey: string) => {
    setSelectedFileId(Number(activeKey));
  };

  const beforeUpload = (file: RcFile) => {
    const isValidFormat =
      file.type === "application/vnd.ms-excel" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "text/csv" ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls");

    if (!isValidFormat) {
      message.error("You can only upload CSV or Excel files!");
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("File must be smaller than 10MB!");
    }

    return isValidFormat && isLt10M;
  };

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;

    try {
      const response = await uploadFile(file);
      message.success(`${file.name} uploaded successfully`);
      onSuccess(response, file);

      // Update files list
      await fetchFiles();
      setIsUploadModalVisible(false);
    } catch (error) {
      console.error("Upload failed:", error);
      message.error(`${file.name} upload failed`);
      onError(error);
    }
  };

  const openMoveToStoreModal = (item: any) => {
    setMoveToStoreModal({
      visible: true,
      itemId: item.itemId,
      maxQuantity: item.quantity,
    });
    setMoveQuantity(1);
  };

  const handleMoveToStore = async () => {
    if (!moveToStoreModal.itemId || moveQuantity <= 0) {
      return;
    }

    setLoading(true);
    try {
      await moveToStore(moveToStoreModal.itemId, moveQuantity);
      message.success("Item moved to store successfully");

      // Update the quantity in the local state
      updateItemQuantity(
        moveToStoreModal.itemId,
        moveToStoreModal.maxQuantity - moveQuantity
      );

      setMoveToStoreModal({ visible: false, itemId: null, maxQuantity: 0 });
    } catch (error) {
      console.error("Error moving item to store:", error);
      message.error("Failed to move item to store");
    } finally {
      setLoading(false);
    }
  };

  const openQRScannerDrawer = (item: any) => {
    setItemToScan(item);
    setScannerDrawerVisible(true);
  };

  const handleScanSuccess = (decodedText: string) => {
    message.success(`QR Code scanned: ${decodedText}`);
    setScannerDrawerVisible(false);

    // Here you would typically verify the QR code against the backend
    // Then move the item to the store
    if (itemToScan) {
      openMoveToStoreModal(itemToScan);
    }
  };

  const handleScanError = (errorMessage: string) => {
    console.error("QR code scan error:", errorMessage);
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

  const columns = [
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
            icon={<ShopOutlined />}
            onClick={() => openMoveToStoreModal(record)}
            disabled={record.quantity <= 0}
          >
            Move to Store
          </Button>
          <Button
            type="default"
            size="small"
            icon={<QrcodeOutlined />}
            onClick={() => openQRScannerDrawer(record)}
            disabled={record.quantity <= 0}
          >
            Scan QR
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className={styles.warehousePage}>
        <PageHeader
          title="Warehouse Management"
          subtitle="Upload and manage your inventory"
          action={{
            text: "Upload File",
            onClick: () => setIsUploadModalVisible(true),
            type: "primary",
          }}
        />

        {files.length === 0 ? (
          <div className={styles.emptyState}>
            <ExclamationCircleOutlined className={styles.emptyIcon} />
            <h3>No inventory files uploaded yet</h3>
            <p>Upload a CSV or Excel file to get started</p>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setIsUploadModalVisible(true)}
            >
              Upload File
            </Button>
          </div>
        ) : (
          <Tabs
            activeKey={selectedFileId?.toString()}
            onChange={handleTabChange}
            className={styles.fileTabs}
            type="card"
          >
            {files.map((file) => (
              <TabPane
                tab={
                  <span>
                    {file.fileName.endsWith(".csv") ? (
                      <FileTextOutlined />
                    ) : (
                      <FileExcelOutlined />
                    )}{" "}
                    {file.fileName}
                  </span>
                }
                key={file.id.toString()}
              >
                <Table
                  columns={columns}
                  dataSource={items}
                  rowKey="itemId"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  className={styles.itemsTable}
                />
              </TabPane>
            ))}
          </Tabs>
        )}

        {/* Upload Modal */}
        <Modal
          title="Upload Inventory File"
          open={isUploadModalVisible}
          onCancel={() => setIsUploadModalVisible(false)}
          footer={null}
        >
          <Upload.Dragger
            name="file"
            customRequest={handleUpload}
            beforeUpload={beforeUpload}
            maxCount={1}
            showUploadList={{ showRemoveIcon: true }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for CSV or Excel files. Make sure your file includes
              product name, category, quantity, and expiry date.
            </p>
          </Upload.Dragger>
        </Modal>

        {/* Move to Store Modal */}
        <Modal
          title="Move to Store"
          open={moveToStoreModal.visible}
          onOk={handleMoveToStore}
          onCancel={() =>
            setMoveToStoreModal({
              visible: false,
              itemId: null,
              maxQuantity: 0,
            })
          }
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Quantity to Move"
              required
              help={`Available: ${moveToStoreModal.maxQuantity}`}
            >
              <InputNumber
                min={1}
                max={moveToStoreModal.maxQuantity}
                value={moveQuantity}
                onChange={(value) => setMoveQuantity(value || 1)}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* QR Scanner Drawer */}
        <Drawer
          title="Scan QR Code or Barcode"
          placement="right"
          closable={true}
          onClose={() => setScannerDrawerVisible(false)}
          open={scannerDrawerVisible}
          width={400}
        >
          {itemToScan && (
            <div className={styles.scanItemInfo}>
              <h3>{itemToScan.name}</h3>
              <p>Category: {itemToScan.category}</p>
              <p>Quantity: {itemToScan.quantity}</p>
              <p>
                Expires: {dayjs(itemToScan.expireDate).format("YYYY-MM-DD")}
              </p>
            </div>
          )}
          <QRCodeScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
        </Drawer>
      </div>
    </MainLayout>
  );
}
