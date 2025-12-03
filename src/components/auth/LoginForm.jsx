import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await loginUser({ email, password });
      login(user);
    } catch (err) {
      setError(err.message || "Login failed, please try again.");
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
        fontFamily: "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
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
              "linear-gradient(90deg, #6ee7b7, #4ade80, #38bdf8, #a855f7)",
          }}
        />

        <div style={{ padding: "2.25rem 2.5rem 2rem" }}>
          {/* Brand / app name */}
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
                background: "radial-gradient(circle at 30% 30%, #4ade80, #16a34a)",
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
            Welcome back
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
            Sign in to view your budgets, spending insights, and trends.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "0.9rem" }}>
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
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#38bdf8";
                  e.target.style.boxShadow = "0 0 0 2px rgba(56,189,248,0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#cbd5f5";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: error ? "0.5rem" : "1.1rem" }}>
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
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5f5",
                  backgroundColor: "#f8fafc",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#38bdf8";
                  e.target.style.boxShadow = "0 0 0 2px rgba(56,189,248,0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#cbd5f5";
                  e.target.style.boxShadow = "none";
                }}
              />
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
                  "linear-gradient(135deg, #4ade80, #22c55e, #16a34a)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(22,163,74,0.35)",
                transition: "transform 0.08s ease, box-shadow 0.08s ease",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 15px rgba(22,163,74,0.28)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px rgba(22,163,74,0.35)";
              }}
            >
              Log in to your account
            </button>

            <p
              style={{
                marginTop: "0.9rem",
                fontSize: "0.9rem",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "#2563eb",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Register here
              </Link>
            </p>
          </form>
        </div>

        <div
          style={{
            padding: "0 2.5rem 1.9rem",
            borderTop: "1px solid #f1f5f9",
            fontSize: "0.78rem",
            color: "#94a3b8",
            lineHeight: 1.5,
          }}
        >
          Your credentials are encrypted and used only to access your personal
          dashboard.
        </div>
      </div>
    </div>
  );
}
