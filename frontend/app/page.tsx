"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/health/")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Frontend is Connected</h1>

      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}