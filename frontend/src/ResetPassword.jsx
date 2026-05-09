import React, { useState, useEffect } from "react";
import "./App.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const spotlight = document.querySelector(".spotlight");
    const handleMouseMove = (e) => {
      if (spotlight) {
        spotlight.style.setProperty("--x", `${e.clientX}px`);
        spotlight.style.setProperty("--y", `${e.clientY}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      setMessage({ type: "error", text: "Please fill all fields" });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setMessage({
      type: "success",
      text: "Password reset successfully! Redirecting to login...",
    });
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-lime-100 via-lime-200 to-lime-400 animate-gradientShift">
      <div className="ambient-glow"></div>
      <div className="spotlight"></div>

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-transform duration-500 hover:-translate-y-1 hover:shadow-lime-400/40">
        <div className="relative overflow-hidden bg-gradient-to-br from-lime-700 to-lime-900 px-8 py-10 text-center text-white">
          <h1 className="text-3xl font-semibold mb-2">Reset Password</h1>
          <p className="text-sm opacity-90">Enter your new password</p>
          <div className="shine"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {message.text && (
            <div
              className={`mb-4 rounded-md p-3 text-sm font-medium ${
                message.type === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <label className="mb-2 block text-sm font-semibold text-gray-700">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="mb-4 w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-lime-600 focus:shadow-[0_0_10px_rgba(132,204,22,0.4)]"
          />

          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="mb-6 w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-lime-600 focus:shadow-[0_0_10px_rgba(132,204,22,0.4)]"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-br from-lime-700 to-lime-900 py-3 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(132,204,22,0.5)]"
          >
            Save Password
          </button>
        </form>
      </div>
    </div>
  );
}
