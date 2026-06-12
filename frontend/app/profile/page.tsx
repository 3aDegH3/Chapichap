"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get("/auth/me/").then((res) => {
      setUser(res.data.user);
    });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Profile</h1>
      <p>{user.email}</p>
      <p>{user.username}</p>
      <p>{user.phone_number}</p>
    </div>
  );
}