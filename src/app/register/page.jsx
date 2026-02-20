"use client";
import { useState } from "react";
import api from "@/lib/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);

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
      alert("Registration Failed ❌");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <form
        onSubmit={handleRegister}
        className="relative w-[420px] bg-neutral-900 border border-yellow-800/30 px-12 py-12 shadow-2xl"
      >
        {/* ADDED: eyebrow label */}
        <p className="text-[10px] tracking-[0.25em] uppercase text-yellow-600 mb-2">
          Get Started
        </p>

        {/* ADDED: serif heading — replaced original h2 styling */}
        <h2 className="text-3xl font-serif font-bold text-stone-100 mb-8">
          Create Account
        </h2>

        {/* ADDED: label + input wrappers around original inputs */}
        {[
          { label: "Full Name",        name: "name",             type: "text",     placeholder: "Jane Doe"           },
          { label: "Email Address",    name: "email",            type: "email",    placeholder: "jane@example.com"   },
          { label: "Password",         name: "password",         type: "password", placeholder: "••••••••"           },
          { label: "Confirm Password", name: "confirm_password", type: "password", placeholder: "••••••••"           },
        ].map(({ label, name, type, placeholder }) => (
          <div key={name} className="mb-5 group">
            <label className="block text-[10px] tracking-[0.18em] uppercase text-stone-500 mb-2 group-focus-within:text-yellow-600 transition-colors">
              {label}
            </label>
            <input
              type={type}
              name={name}
              placeholder={placeholder}
              className="w-full bg-neutral-950 border border-stone-700/50 text-stone-100 text-sm font-light placeholder-stone-700 px-4 py-3 outline-none focus:border-yellow-700/60 focus:ring-1 focus:ring-yellow-700/20 transition-all"
              value={formData[name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700 text-neutral-950 text-[11px] font-medium tracking-[0.22em] uppercase py-3.5 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        {/* ADDED: login redirect */}
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