"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    username: "",
    phone_number: "",
    password: "",
  });

  const submit = async () => {
    try {
      const res = await api.post("/auth/register/", form);

      setTokens(res.data.access, res.data.refresh);

      router.push("/profile");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1>Register</h1>

      <input placeholder="email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input placeholder="username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      <input placeholder="phone"
        onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
      />

      <input type="password" placeholder="password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={submit}>Register</button>
    </div>
  );
}