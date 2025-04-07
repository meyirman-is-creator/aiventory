import { Spin } from "antd";

export default function Loading() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <Spin size="large" />
      <p>Loading...</p>
    </div>
  );
}


