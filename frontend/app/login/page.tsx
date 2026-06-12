"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const submit = async () => {
    try {
      const res = await api.post("/auth/login/", form);

      setTokens(res.data.access, res.data.refresh);

      router.push("/profile");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <input
        placeholder="email or phone"
        onChange={(e) =>
          setForm({ ...form, identifier: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="password"
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <button onClick={submit}>Login</button>
    </div>
  );
}