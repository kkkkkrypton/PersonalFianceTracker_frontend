import React, { useEffect, useState } from "react";
import { setBudget } from "../../api/userApi";

const DEFAULT_CATEGORIES = ["Food", "Rent", "Entertainment", "Transport", "Other"];

export default function CategoryBudgetPanel({ user, onBudgetUpdated }) {
  const [values, setValues] = useState(() =>
    DEFAULT_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = ""; // start empty
      return acc;
    }, {})
  );
  const [message, setMessage] = useState("");

  // load previously saved category budget on mount
  useEffect(() => {
    const stored = localStorage.getItem(`categoryBudget_${user.userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setValues((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore parse errors
      }
    }
  }, [user.userId]);

  const totalBudget = Object.values(values).reduce((sum, v) => {
    const num = Number(v);
    return sum + (Number.isFinite(num) && num > 0 ? num : 0);
  }, 0);

  const handleChange = (cat, raw) => {
    // allow empty string so user can clear
    if (raw === "") {
      setValues((prev) => ({ ...prev, [cat]: "" }));
      return;
    }

    const num = Number(raw);
    // block negatives & NaN
    if (!Number.isFinite(num) || num < 0) return;

    setValues((prev) => ({ ...prev, [cat]: raw }));
  };

  const handleSave = async () => {
    if (totalBudget <= 0) {
      setMessage("Please enter a positive budget.");
      return;
    }

    // persist per-category budget locally
    localStorage.setItem(`categoryBudget_${user.userId}`, JSON.stringify(values));

    setMessage("Saving budget...");
    try {
      await setBudget(user.userId, totalBudget);
      setMessage(`Budget saved: $${totalBudget.toFixed(2)} (all categories).`);
      onBudgetUpdated && onBudgetUpdated();
    } catch (err) {
      setMessage("Failed to save budget.");
    }
  };

  return (
    <div
      style={{
        borderRadius: "14px",
        backgroundColor: "#ffffff",
        boxShadow:
          "0 12px 30px rgba(15,23,42,0.06), 0 0 0 1px rgba(226,232,240,0.9)",
        padding: "1.3rem 1.4rem",
        minWidth: 320,
        flex: "1 1 320px",
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: "0.4rem",
          fontSize: "1.1rem",
          color: "#0f172a",
        }}
      >
        Monthly Budget by Category
      </h3>
      <p
        style={{
          margin: 0,
          marginBottom: "0.9rem",
          fontSize: "0.86rem",
          color: "#64748b",
        }}
      >
        Set a monthly amount for each category so we can compare it with what you actually spend.
      </p>

      {DEFAULT_CATEGORIES.map((cat) => (
        <div
          key={cat}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.45rem",
            gap: "0.6rem",
          }}
        >
          <label
            style={{
              flex: "0 0 34%",
              fontSize: "0.88rem",
              color: "#334155",
            }}
          >
            {cat}:
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={values[cat]}
            placeholder="0"
            onChange={(e) => handleChange(cat, e.target.value)}
            style={{
              flex: "1 1 auto",
              padding: "0.45rem 0.55rem",
              borderRadius: "10px",
              border: "1px solid #cbd5f5",
              backgroundColor: "#f8fafc",
              fontSize: "0.9rem",
              outline: "none",
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
      ))}

      <p
        style={{
          marginTop: "0.7rem",
          marginBottom: "0.5rem",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#111827",
        }}
      >
        Total budget: ${totalBudget.toFixed(2)}
      </p>

      <button
        type="button"
        onClick={handleSave}
        style={{
          padding: "0.55rem 0.9rem",
          borderRadius: "999px",
          border: "none",
          background:
            "linear-gradient(135deg, #4ade80, #22c55e, #16a34a)",
          color: "#ffffff",
          fontWeight: 600,
          fontSize: "0.9rem",
          cursor: "pointer",
          boxShadow: "0 8px 18px rgba(22,163,74,0.3)",
        }}
      >
        Save Budget
      </button>

      {message && (
        <p
          style={{
            marginTop: "0.6rem",
            fontSize: "0.85rem",
            color: message.startsWith("Failed") ? "#dc2626" : "#64748b",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
