// src/Login.jsx
import React, { useState, useEffect } from "react";
import "./App.css"; // includes the gradient and animations
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiClient } from './config/api';

export default function Login() {
  const navigate = useNavigate();
  const [currentUserType, setCurrentUserType] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    // Validate all fields
    if (!email || !password) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      setLoading(false);
      return;
    }

    try {
      // use configured apiClient (baseURL + withCredentials)
      const response = await apiClient.post(`/api/auth/${currentUserType.toLowerCase()}/login`, { email, password });

      console.log(response.data);
      // Persist token if backend returned one (support both cookie and token auth)
      const token = response.data?.token || response.data?.accessToken || response.data?.auth?.token;
      if (token) {
        localStorage.setItem('token', token);
        try { apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; } catch (e) { }
      }
      setMessage({ type: "success", text: "Login successful! Redirecting..." });

      // Redirect after successful login based on user type
      setTimeout(() => {
        if (currentUserType.toLowerCase() === 'user') {
          navigate('/usermenu');
        } else if (currentUserType.toLowerCase() === 'vendor') {
          navigate('/vendor');
        } else {
          navigate(`/${currentUserType.toLowerCase()}`);
        }
      }, 1000);
    } catch (error) {
      setLoading(false);
      // Distinguish network errors (no response) from API errors
      if (!error.response) {
        setMessage({ type: 'error', text: 'Network Error: unable to reach server. Check backend is running.' });
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Login failed';
        setMessage({ type: 'error', text: errorMsg });
      }
      console.error('Login error:', error);
    }
  };


  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-lime-300 via-lime-200 to-lime-400 animate-gradientShift">

      <link
        href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css"
        rel="stylesheet"
      />

      {/* ✨ Animated Background Layers */}
      <div className="ambient-glow"></div>
      <div className="spotlight"></div>

      {/* 🟢 Login Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-transform duration-500 hover:-translate-y-1 hover:shadow-lime-400/40">
        {/* Header with Shine */}
        <div className="relative overflow-hidden bg-gradient-to-br from-lime-700 to-lime-900 px-8 py-10 text-center text-white">
          <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
          <p className="text-sm opacity-90">Please login to your account</p>
          <div className="shine"></div>
        </div>

        {/* Toggle Buttons */}
        <div className="mx-8 mt-8 flex rounded-lg bg-gray-100 p-1">
          {["User", "Vendor", "Admin"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setCurrentUserType(type);
                setMessage({ type: "", text: "" });
              }}
              className={`flex-1 rounded-md px-4 py-2 font-semibold capitalize transition-all ${
                currentUserType === type
                  ? "bg-white text-lime-700 shadow-sm"
                  : "text-gray-500 hover:text-lime-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Login Form */}
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

          {/* Email Field */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              {currentUserType} Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-lime-600 focus:shadow-[0_0_10px_rgba(132,204,22,0.4)]"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-lime-600 focus:shadow-[0_0_10px_rgba(132,204,22,0.4)]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-lime-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="mb-6 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="h-4 w-4 accent-lime-600" />
              Remember me
            </label>
            <a href="/Forgot-Password" className="font-semibold text-lime-700 hover:underline">
              Forgot Password?
            </a>
          </div>


          <div className="mb-5">
            <p className="text-sm text-center text-gray-600 mb-3">Or continue with</p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="/auth/google"
                className="flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm hover:scale-105 text-gray-700 hover:text-lime-700"
                aria-label="Sign up with Google"
              >
                <i className="ri-google-fill text-2xl"></i>
              </a>
              <a
                href="/auth/x"
                className="flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm hover:scale-105 text-gray-700 hover:text-lime-700"
                aria-label="Sign up with X"
              >
                <i className="ri-twitter-x-line text-2xl"></i>
              </a>
              <a
                href="/auth/facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm hover:scale-105 text-gray-700 hover:text-lime-700"
                aria-label="Sign up with Facebook"
              >
                <i className="ri-facebook-fill text-2xl"></i>
              </a>
            </div>

            <p className="text-center text-sm mt-3 text-gray-600">
              For New Users?{' '}
              <a href="/register" className="text-lime-700 font-semibold hover:underline">Sign up</a>
            </p>
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-br from-lime-700 to-lime-900 py-3 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(132,204,22,0.5)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
