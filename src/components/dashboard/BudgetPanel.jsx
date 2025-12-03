import React, { useEffect, useState } from "react";
import { setBudget as apiSetBudget } from "../../api/userApi";

const cardStyle = {
  border: "1px solid #e2e8f0",
  padding: "1.4rem 1.6rem",
  borderRadius: 12,
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
  minWidth: 360,
  flex: "1 1 420px",
};

export default function BudgetPanel({ user, budget, onBudgetUpdated }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");

  // keep local input in sync when budget from API changes
  useEffect(() => {
    if (budget && budget > 0) {
      setValue(String(budget));
      setStatus("Budget saved.");
    } else {
      setValue("");
      setStatus("");
    }
  }, [budget]);

  const handleChange = (e) => {
    const v = e.target.value;

    // allow empty (so user can clear field), otherwise numeric only
    if (v === "") {
      setValue("");
      return;
    }
    if (!/^\d*\.?\d*$/.test(v)) {
      // ignore non-numeric characters
      return;
    }
    setValue(v);
  };

  const handleSave = async () => {
    const amount = parseFloat(value || "0") || 0;

    if (amount < 0) {
      setStatus("Budget cannot be negative.");
      return;
    }

    try {
      setStatus("Saving…");
      await apiSetBudget(user.userId, amount);
      setStatus("Budget saved.");
      onBudgetUpdated && onBudgetUpdated();
    } catch (err) {
      setStatus(err.message || "Failed to save budget.");
    }
  };

  return (
    <div style={cardStyle}>
      <h3
        style={{
          marginTop: 0,
          marginBottom: "0.75rem",
          fontSize: "1.15rem",
          color: "#0f172a",
        }}
      >
        Monthly Budget
      </h3>

      <p
        style={{
          margin: 0,
          marginBottom: "1.1rem",
          fontSize: "0.92rem",
          color: "#64748b",
        }}
      >
        Set your total monthly budget.
      </p>

      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          style={{
            flex: "0 0 160px",
            padding: "0.55rem 0.65rem",
            borderRadius: 10,
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
        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(135deg, #4ade80, #22c55e, #16a34a)",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(22,163,74,0.32)",
          }}
        >
          Save
        </button>
      </div>

      {status && (
        <p
          style={{
            marginTop: "0.7rem",
            fontSize: "0.86rem",
            color: status.toLowerCase().includes("fail")
              ? "#dc2626"
              : "#64748b",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}
