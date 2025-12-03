import React, { useState, useEffect } from "react";
import { setBudget } from "../../api/userApi";

const cardStyle = {
  border: "1px solid #e2e8f0",
  padding: "1.4rem 1.6rem",
  borderRadius: 12,
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
  minWidth: 360,
  flex: "1 1 420px",
};

function makeInitialRows(userId) {
  if (typeof window === "undefined") {
    return [{ id: 1, source: "", amount: "" }];
  }

  try {
    const raw = localStorage.getItem(`incomeSources_${userId}`);
    if (!raw) return [{ id: 1, source: "", amount: "" }];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // ignore parse errors and fall back to default
  }
  return [{ id: 1, source: "", amount: "" }];
}

export default function IncomePanel({ user, onBudgetUpdated, resetKey }) {
  const [rows, setRows] = useState(() => makeInitialRows(user.userId));
  const [message, setMessage] = useState("");

  // when user or resetKey changes (Clear / Start Over), reload from storage
  useEffect(() => {
    setRows(makeInitialRows(user.userId));
    setMessage("");
  }, [user.userId, resetKey]);

  // persist rows to localStorage whenever they change
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(
        `incomeSources_${user.userId}`,
        JSON.stringify(rows)
      );
    } catch {
      // storage might be full / blocked – fail silently
    }
  }, [rows, user]);

  const totalIncome = rows.reduce(
    (sum, r) => sum + (Number(r.amount) || 0),
    0
  );

  const BUDGET_PERCENT = 0.7;
  const suggestedBudget = totalIncome * BUDGET_PERCENT;

  const handleRowChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]:
                field === "amount"
                  ? value === ""
                    ? ""
                    : Math.max(0, Number(value) || 0) // never negative
                  : value,
            }
          : r
      )
    );
    setMessage("");
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), source: "", amount: "" },
    ]);
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const applyBudget = async () => {
    if (totalIncome <= 0) {
      setMessage("Please enter at least one positive income amount.");
      return;
    }
    setMessage("Saving budget...");
    try {
      await setBudget(user.userId, suggestedBudget);
      setMessage(
        `Budget set to $${suggestedBudget.toFixed(
          2
        )} (${BUDGET_PERCENT * 100}% of total income).`
      );
      onBudgetUpdated && onBudgetUpdated();
    } catch (err) {
      console.error(err);
      setMessage("Failed to update budget.");
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
        Income &amp; Adaptive Budget
      </h3>
      <p
        style={{
          margin: 0,
          marginBottom: "1rem",
          fontSize: "0.92rem",
          color: "#64748b",
        }}
      >
        Enter your income sources. We&apos;ll suggest a monthly budget.
      </p>

      {rows.map((row) => (
        <div
          key={row.id}
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "0.4rem",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Client / Source"
            value={row.source}
            onChange={(e) =>
              handleRowChange(row.id, "source", e.target.value)
            }
            style={{
              width: 200,
              padding: "0.5rem 0.65rem",
              borderRadius: 10,
              border: "1px solid #cbd5f5",
              backgroundColor: "#f8fafc",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            value={row.amount}
            onChange={(e) =>
              handleRowChange(row.id, "amount", e.target.value)
            }
            style={{
              width: 120,
              padding: "0.5rem 0.65rem",
              borderRadius: 10,
              border: "1px solid #cbd5f5",
              backgroundColor: "#f8fafc",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
          {rows.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              style={{
                border: "none",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: 999,
                padding: "0.25rem 0.55rem",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        style={{
          marginTop: "0.4rem",
          padding: "0.4rem 0.8rem",
          borderRadius: 999,
          border: "1px solid #cbd5f5",
          backgroundColor: "#f8fafc",
          fontSize: "0.85rem",
          cursor: "pointer",
        }}
      >
        + Add Income
      </button>

      <div
        style={{
          marginTop: "0.9rem",
          fontSize: "0.9rem",
          color: "#0f172a",
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>Total income:</strong> ${totalIncome.toFixed(2)}
        </p>
        <p style={{ margin: 0, marginTop: "0.2rem" }}>
          <strong>Suggested budget (70%):</strong> $
          {suggestedBudget.toFixed(2)}
        </p>
      </div>

      <button
        type="button"
        onClick={applyBudget}
        style={{
          marginTop: "0.85rem",
          padding: "0.5rem 1.1rem",
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
        Apply Suggested Budget
      </button>

      {message && (
        <p
          style={{
            marginTop: "0.6rem",
            fontSize: "0.86rem",
            color: message.toLowerCase().includes("fail")
              ? "#dc2626"
              : "#64748b",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
