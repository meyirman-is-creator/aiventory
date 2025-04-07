import React from "react";
import { Typography, Button } from "antd";
import styles from "./PageHeader.module.scss";

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    text: string;
    onClick: () => void;
    type?: "primary" | "default" | "dashed" | "text" | "link";
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleSection}>
        <Title level={2} className={styles.title}>
          {title}
        </Title>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && (
        <Button
          type={action.type || "primary"}
          onClick={action.onClick}
          className={styles.actionButton}
        >
          {action.text}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
