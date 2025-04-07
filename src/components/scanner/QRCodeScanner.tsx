import React, { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button, Space, Typography, Alert } from "antd";
import styles from "./QRCodeScanner.module.scss";

const { Title } = Typography;

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScanSuccess,
  onScanError,
}) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [html5QrcodeScanner, setHtml5QrCodeScanner] =
    useState<Html5Qrcode | null>(null);

  const qrcodeId = "qr-code-reader";

  useEffect(() => {
    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().catch((error) => {
          console.error("Failed to stop camera:", error);
        });
      }
    };
  }, [html5QrcodeScanner]);

  const startScanner = () => {
    setScanning(true);
    setError(null);

    const html5QrCode = new Html5Qrcode(qrcodeId);
    setHtml5QrCodeScanner(html5QrCode);

    const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode
      .start(
        { facingMode: "environment" },
        qrConfig,
        (decodedText) => {
          // Stop scanning after success
          html5QrCode
            .stop()
            .then(() => {
              setScanning(false);
              onScanSuccess(decodedText);
            })
            .catch((err) => {
              console.error("Failed to stop camera after success:", err);
            });
        },
        (errorMessage) => {
          if (onScanError) {
            onScanError(errorMessage);
          }
        }
      )
      .catch((err) => {
        setScanning(false);
        setError(
          "Unable to start camera. Please ensure you have given permission to access the camera."
        );
        console.error("Failed to start scanner:", err);
      });
  };

  const stopScanner = () => {
    if (html5QrcodeScanner) {
      html5QrcodeScanner
        .stop()
        .then(() => {
          setScanning(false);
        })
        .catch((err) => {
          console.error("Failed to stop camera:", err);
        });
    }
  };

  return (
    <div className={styles.scannerContainer}>
      <Title level={4}>Scan QR Code or Barcode</Title>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className={styles.error}
        />
      )}

      <div id={qrcodeId} className={styles.qrReader}></div>

      <Space className={styles.controls}>
        {!scanning ? (
          <Button type="primary" onClick={startScanner}>
            Start Scanner
          </Button>
        ) : (
          <Button danger onClick={stopScanner}>
            Stop Scanner
          </Button>
        )}
      </Space>
    </div>
  );
};

export default QRCodeScanner;
