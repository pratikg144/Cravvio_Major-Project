import React, { useState, useEffect } from "react";
import "./App.css"; // keeps gradient + glow animations

export default function ForgotPassword() {
  const [step, setStep] = useState("request"); // request | verify
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 🟢 Spotlight follows cursor
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

  // Timer countdown
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 🧩 Mock OTP API (simulates sending OTP)
  const sendOtp = async () => {
    if (!emailOrPhone.trim()) {
      setMessage({ type: "error", text: "Please enter email or mobile number" });
      return;
    }

    // Simulate API delay
    const generated = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(generated);
    console.log("🔢 OTP Sent:", generated); // for testing
    setTimer(120); // 2 minutes
    setStep("verify");
    setMessage({
      type: "success",
      text: `OTP sent to ${emailOrPhone}. Please check your inbox or SMS.`,
    });
  };

  // 🧩 Verify OTP
  const verifyOtp = () => {
    if (!otp) {
      setMessage({ type: "error", text: "Please enter the 6-digit OTP" });
      return;
    }
    if (parseInt(otp) === generatedOtp) {
      setMessage({
        type: "success",
        text: "OTP verified successfully! Redirecting...",
      });
      setTimeout(() => {
        window.location.href = "/reset-password";
      }, 1500);
    } else {
      setMessage({ type: "error", text: "Invalid OTP. Please try again." });
    }
  };

  // 🧩 Resend OTP
  const resendOtp = () => {
    sendOtp();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-lime-100 via-lime-200 to-lime-400 animate-gradientShift">
      {/* ✨ Background effects */}
      <div className="ambient-glow"></div>
      <div className="spotlight"></div>

      {/* 🟢 Main Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-transform duration-500 hover:-translate-y-1 hover:shadow-lime-400/40">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-lime-700 to-lime-900 px-8 py-10 text-center text-white">
          <h1 className="text-3xl font-semibold mb-2">Forgot Password</h1>
          <p className="text-sm opacity-90">
            {step === "request"
              ? "Enter your email or mobile number"
              : "Enter the OTP sent to your destination"}
          </p>
          <div className="shine"></div>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mx-8 mt-5 rounded-md p-3 text-sm font-medium ${
              message.type === "error"
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Step: Request Email/Phone */}
        {step === "request" && (
          <div className="p-8">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email or Mobile Number
            </label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="example@gmail.com / +91XXXXXXXXXX"
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-lime-600 focus:shadow-[0_0_10px_rgba(132,204,22,0.4)]"
              required
            />

            <button
              onClick={sendOtp}
              className="mt-6 w-full rounded-lg bg-gradient-to-br from-lime-700 to-lime-900 py-3 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(132,204,22,0.5)]"
            >
              Send OTP
            </button>
          </div>
        )}

        {/* Step: Verify OTP */}
        {step === "verify" && (
          <div className="p-8">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Enter 6-digit OTP
            </label>
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm text-center tracking-widest outline-none transition-all focus:border-lime-600 focus:shadow-[0_0_10px_rgba(132,204,22,0.4)]"
              required
            />

            <button
              onClick={verifyOtp}
              className="mt-6 w-full rounded-lg bg-gradient-to-br from-lime-700 to-lime-900 py-3 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(132,204,22,0.5)]"
            >
              Verify OTP
            </button>

            {/* Resend Option */}
            <div className="mt-4 text-center text-sm text-gray-600">
              {timer > 0 ? (
                <p>Resend OTP in {timer}s</p>
              ) : (
                <button
                  onClick={resendOtp}
                  className="text-lime-700 font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
