import React, { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const USER_TYPE_OPTIONS = [
  { value: "Student", label: "Student" },
  { value: "Free_Spender", label: "Free Spender" },
  { value: "Business_Owner", label: "Self-Employed / Business Owner" },
  { value: "Financially_Inclined", label: "Financially Literate" },
];

export default function RegisterForm() {
  const { login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Student");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        firstName,
        lastName,
        email,
        password,
        userType,
      };

      const user = await registerUser(payload);
      // auto-log in after registration
      login(user);
    } catch (err) {
      setError(err.message || "Registration failed, please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background:
          "linear-gradient(135deg, #fdf2ff 0%, #f1f5ff 40%, #e7fbff 100%)",
        fontFamily:
          "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          borderRadius: "18px",
          backgroundColor: "#ffffff",
          boxShadow:
            "0 18px 45px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(148, 163, 184, 0.18)",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: "6px",
            background:
              "linear-gradient(90deg, #38bdf8, #6366f1, #a855f7, #22c55e)",
          }}
        />

        <div style={{ padding: "2.25rem 2.5rem 2rem" }}>
          {/* Badge / app name */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.75rem",
              borderRadius: "999px",
              backgroundColor: "#f1f5f9",
              marginBottom: "1rem",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#0f172a",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "999px",
                background:
                  "radial-gradient(circle at 30% 30%, #38bdf8, #2563eb)",
              }}
            />
            Personal Finance Tracker
          </div>

          <h1
            style={{
              margin: "0 0 0.4rem",
              fontSize: "1.7rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Create your account
          </h1>
          <p
            style={{
              margin: 0,
              marginBottom: "1.6rem",
              fontSize: "0.92rem",
              color: "#64748b",
              lineHeight: 1.4,
            }}
          >
            Tell us a bit about yourself so we can tailor your dashboard.
          </p>

          <form onSubmit={handleSubmit}>
            {/* First name */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label
                htmlFor="firstName"
                style={{
                  display: "block",
                  marginBottom: "0.35rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                First name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5f5",
                  backgroundColor: "#f8fafc",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition:
                    "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#38bdf8";
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(56,189,248,0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#cbd5f5";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Last name */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label
                htmlFor="lastName"
                style={{
                  display: "block",
                  marginBottom: "0.35rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5f5",
                  backgroundColor: "#f8fafc",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition:
                    "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#38bdf8";
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(56,189,248,0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#cbd5f5";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "0.35rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5f5",
                  backgroundColor: "#f8fafc",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition:
                    "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#38bdf8";
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(56,189,248,0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#cbd5f5";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "0.35rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5f5",
                  backgroundColor: "#f8fafc",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition:
                    "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#38bdf8";
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(56,189,248,0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#cbd5f5";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* User type */}
            <div style={{ marginBottom: error ? "0.5rem" : "1.1rem" }}>
              <label
                htmlFor="userType"
                style={{
                  display: "block",
                  marginBottom: "0.35rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Account type
              </label>
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5f5",
                  backgroundColor: "#f8fafc",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              >
                {USER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p
                style={{
                  margin: "0 0 0.85rem",
                  fontSize: "0.9rem",
                  color: "#dc2626",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.7rem 0.75rem",
                borderRadius: "999px",
                border: "none",
                background:
                  "linear-gradient(135deg, #38bdf8, #6366f1, #a855f7)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(79,70,229,0.35)",
              }}
            >
              Create account
            </button>

            <p
              style={{
                marginTop: "0.9rem",
                fontSize: "0.9rem",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#2563eb",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
