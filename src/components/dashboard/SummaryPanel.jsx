import React from "react";

export default function SummaryPanel({ user, budget, monthTotal }) {
  const hasBudget = budget !== null && budget > 0;
  const spent = Math.abs(monthTotal || 0);
  const hasSpending = monthTotal !== null && spent > 0.01;

  // if no budget and no spending yet, show friendly placeholder
  if (!hasBudget && !hasSpending) {
    return (
      <div style={{ border: "1px solid #ccc", padding: "1rem", minWidth: 280 }}>
        <h3>Budget vs Actual</h3>
        <p>No data yet.</p>
        <p>Set a monthly budget and upload a bank statement to see your spending summary.</p>
      </div>
    );
  }

  const effectiveBudget = hasBudget ? budget : 0;
  const remaining = effectiveBudget - spent;
  const overBudget = remaining < 0;

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", minWidth: 280 }}>
      <h3>Budget vs Actual</h3>
      <p>Budget: ${effectiveBudget.toFixed(2)}</p>
      <p>Spent this month: ${spent.toFixed(2)}</p>
      <p>
        Remaining:{" "}
        <span style={{ color: overBudget ? "red" : "green" }}>
          ${remaining.toFixed(2)}
        </span>
      </p>
      {overBudget && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          Alert: You exceeded your budget this month!
        </p>
      )}
    </div>
  );
}