"use client";
import { useState } from "react";
import api from "@/lib/api";
import { apiErrorToMessage } from "@/lib/apiError";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ added
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ✅ added

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match ❌");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", formData);

      alert("Registration Successful ✅");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert(apiErrorToMessage(err, "Registration failed"));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <form
        onSubmit={handleRegister}
        className="relative w-[420px] bg-neutral-900 border border-yellow-800/30 px-12 py-12 shadow-2xl"
      >
        <p className="text-[10px] tracking-[0.25em] uppercase text-yellow-600 mb-2">
          Get Started
        </p>

        <h2 className="text-3xl font-serif font-bold text-stone-100 mb-8">
          Create Account
        </h2>

        {/* Full Name */}
        <div className="mb-5 group">
          <label className="block text-[10px] tracking-[0.18em] uppercase text-stone-500 mb-2 group-focus-within:text-yellow-600 transition-colors">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Jane Doe"
            className="w-full bg-neutral-950 border border-stone-700/50 text-stone-100 text-sm font-light placeholder-stone-700 px-4 py-3 outline-none focus:border-yellow-700/60 focus:ring-1 focus:ring-yellow-700/20 transition-all"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-5 group">
          <label className="block text-[10px] tracking-[0.18em] uppercase text-stone-500 mb-2 group-focus-within:text-yellow-600 transition-colors">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="jane@example.com"
            className="w-full bg-neutral-950 border border-stone-700/50 text-stone-100 text-sm font-light placeholder-stone-700 px-4 py-3 outline-none focus:border-yellow-700/60 focus:ring-1 focus:ring-yellow-700/20 transition-all"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password with eye */}
        <div className="mb-5 group relative">
          <label className="block text-[10px] tracking-[0.18em] uppercase text-stone-500 mb-2 group-focus-within:text-yellow-600 transition-colors">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            className="w-full bg-neutral-950 border border-stone-700/50 text-stone-100 text-sm font-light placeholder-stone-700 px-4 py-3 pr-10 outline-none focus:border-yellow-700/60 focus:ring-1 focus:ring-yellow-700/20 transition-all"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-stone-500 hover:text-yellow-600 transition-colors"
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        {/* Confirm Password with eye */}
        <div className="mb-5 group relative">
          <label className="block text-[10px] tracking-[0.18em] uppercase text-stone-500 mb-2 group-focus-within:text-yellow-600 transition-colors">
            Confirm Password
          </label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirm_password"
            placeholder="••••••••"
            className="w-full bg-neutral-950 border border-stone-700/50 text-stone-100 text-sm font-light placeholder-stone-700 px-4 py-3 pr-10 outline-none focus:border-yellow-700/60 focus:ring-1 focus:ring-yellow-700/20 transition-all"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-4 top-[38px] text-stone-500 hover:text-yellow-600 transition-colors"
          >
            {showConfirmPassword ? "🙈" : "👁"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700 text-neutral-950 text-[11px] font-medium tracking-[0.22em] uppercase py-3.5 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="mt-6 text-center text-xs text-stone-600">
          Already have an account?{" "}
          <a href="/login" className="text-yellow-600 hover:opacity-70 transition-opacity font-medium">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
