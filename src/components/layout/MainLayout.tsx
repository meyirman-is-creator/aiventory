import React from "react";
import { Layout, Menu } from "antd";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeOutlined,
  ShopOutlined,
  BankOutlined,
  LineChartOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styles from "./MainLayout.module.scss";

const { Header, Content, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link href="/">Dashboard</Link>,
    },
    {
      key: "/warehouse",
      icon: <BankOutlined />,
      label: <Link href="/warehouse">Warehouse</Link>,
    },
    {
      key: "/store",
      icon: <ShopOutlined />,
      label: <Link href="/store">Store</Link>,
    },
    {
      key: "/prediction",
      icon: <LineChartOutlined />,
      label: <Link href="/prediction">Prediction</Link>,
    },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.logo}>Smart Inventory</div>
        <div className={styles.userInfo}>
          {session?.user && (
            <>
              <span className={styles.userName}>
                <UserOutlined /> {session.user.name || session.user.email}
              </span>
              <LogoutOutlined
                className={styles.logoutIcon}
                onClick={handleSignOut}
              />
            </>
          )}
        </div>
      </Header>
      <Layout>
        <Sider width={200} className={styles.sider}>
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            style={{ height: "100%", borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Layout className={styles.contentLayout}>
          <Content className={styles.content}>{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
