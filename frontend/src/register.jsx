import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";





export default function Register() {
  const navigate = useNavigate();
  
  // State declarations
  const [currentUserType, setCurrentUserType] = useState("user");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

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
    if (!username || !email || !phone || !address || !pincode || !password) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`https://cravvio-major-project.onrender.com/api/auth/${currentUserType.toLowerCase()}/register`, {
        username,
        email,
        phone,
        address,
        pincode,
        password
      }, {
        withCredentials: true
      });

      console.log(response.data);
      setMessage({ type: "success", text: "Registration successful! Redirecting..." });

      // Redirect after successful registration based on user type
      setTimeout(() => {
        if (currentUserType === 'User') {
          navigate('/usermenu');
        } else if (currentUserType === 'Vendor') {
          navigate('/vendor');
        } else {
          navigate(`/${currentUserType.toLowerCase()}`);
        }
      }, 1000);
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || error.message || "Registration failed";
      setMessage({ type: "error", text: errorMsg });
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-lime-300 via-lime-300 to-lime-400 animate-gradientShift">
      <div className="ambient-glow"></div>
      <div className="spotlight"></div>
      <link
        href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css"
        rel="stylesheet"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-transform duration-500 hover:-translate-y-1 hover:shadow-lime-400/40">
        <div className="relative overflow-hidden bg-gradient-to-br from-lime-700 to-lime-900 px-8 py-10 text-center text-white">
          <h1 className="text-3xl font-semibold mb-2">Create your account</h1>
          <p className="text-sm opacity-90">Sign up to get started</p>
          <div className="shine"></div>
        </div>

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
                currentUserType === type ? "bg-white text-lime-700 shadow-sm" : "text-gray-500 hover:text-lime-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {message.text && (
            <div
              className={`mb-4 rounded-md p-3 text-sm font-medium ${
                message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              }`}
            >
              {message.text}
            </div>
          )}

         

          {/* Username field */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">{currentUserType} name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-lime-600 focus:shadow-[0_0_10px_rgba(132,204,22,0.4)]"
              required
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-lime-600 focus:shadow-[0_0_10px_rgba(132,204,22,0.4)]"
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555 555 5555"
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-lime-600"
              required
            />
          </div>

          {/* Address */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address, city, state"
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-lime-600"
              required
            />
          </div>

          {/* Pincode */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Pincode / ZIP</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Postal code"
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-lime-600"
              required
            />
          </div>
          {/* Password Field */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
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

       

        {/* Social signup */}
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
              Already have an account?{' '}
              <a href="/login" className="text-lime-700 font-semibold hover:underline">Sign in</a>
            </p>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-br from-lime-700 to-lime-900 py-3 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(132,204,22,0.5)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}



