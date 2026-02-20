"use client";
import { useState } from "react";
import api from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 const handleLogin = async (e) => {
  e.preventDefault();

  // ✅ Prevent empty submission
  if (!email || !password) {
    alert("Please fill all fields ❌");
    return;
  }

  setLoading(true);

  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await api.post(
      "/auth/login",
      formData.toString(), // ✅ IMPORTANT FIX
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    localStorage.setItem("token", res.data.access_token);

    alert("Login Successful ✅");
    window.location.href = "/dashboard";
  } catch (err) {
    console.error("Login error:", err.response?.data);
    alert("Invalid credentials ❌");
  }

  setLoading(false);
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <form
        onSubmit={handleLogin}
        className="relative w-[420px] bg-neutral-900 border border-yellow-800/30 px-12 py-12 shadow-2xl"
      >
        {/* ADDED: eyebrow label */}
        <p className="text-[10px] tracking-[0.25em] uppercase text-yellow-600 mb-2">
          Welcome Back
        </p>

        {/* ADDED: serif heading — replaced original h2 styling */}
        <h2 className="text-3xl font-serif font-bold text-stone-100 mb-8">
          Sign In
        </h2>

        {/* ADDED: label wrapper around original email input */}
        <div className="mb-5 group">
          <label className="block text-[10px] tracking-[0.18em] uppercase text-stone-500 mb-2 group-focus-within:text-yellow-600 transition-colors">
            Email Address
          </label>
          <input
            type="email"
            placeholder="jane@example.com"
            className="w-full bg-neutral-950 border border-stone-700/50 text-stone-100 text-sm font-light placeholder-stone-700 px-4 py-3 outline-none focus:border-yellow-700/60 focus:ring-1 focus:ring-yellow-700/20 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* ADDED: label wrapper around original password input */}
        <div className="mb-1 group">
          <label className="block text-[10px] tracking-[0.18em] uppercase text-stone-500 mb-2 group-focus-within:text-yellow-600 transition-colors">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-neutral-950 border border-stone-700/50 text-stone-100 text-sm font-light placeholder-stone-700 px-4 py-3 outline-none focus:border-yellow-700/60 focus:ring-1 focus:ring-yellow-700/20 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* ADDED: forgot password link */}
        <div className="flex justify-end mb-6">
          <a href="/forgot-password" className="text-[11px] text-yellow-700/60 hover:text-yellow-600 transition-colors">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700 text-neutral-950 text-[11px] font-medium tracking-[0.22em] uppercase py-3.5 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Signing In..." : "Login"}
        </button>

        {/* ADDED: register redirect */}
        <p className="mt-6 text-center text-xs text-stone-600">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-yellow-600 hover:opacity-70 transition-opacity font-medium">
            Create one
          </a>
        </p>
      </form>
    </div>
  );
}