"use client";

import { useEffect, useState } from "react";
import { getHealth } from "../frontend/lib/api";
import Button from "../components/Button";
import Card from "../components/Card";

export default function Home() {
  const [status, setStatus] = useState("loading...");

  useEffect(() => {
    getHealth()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>هدیه‌ای خاص برای آدم‌های خاص</h1>

      <p>Backend: {status}</p>

      <Button onClick={() => alert("شروع سفارش")}>
        شروع سفارش
      </Button>

      <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
        <Card>چاپ روی ماگ</Card>
        <Card>چاپ روی تیشرت</Card>
        <Card>هدایای اختصاصی</Card>
      </div>
    </main>
  );
}