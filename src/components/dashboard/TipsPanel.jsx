import React from "react";

const cardStyle = {
  border: "1px solid #e2e8f0",
  padding: "1.25rem 1.4rem",
  borderRadius: 12,
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
  minWidth: 320,
  flex: "1 1 0",
};

export default function TipsPanel({ userType, budget, monthTotal }) {
  const hasBudget = budget !== null && budget > 0;
  const spent = Math.abs(monthTotal || 0);
  const hasSpending = monthTotal !== null && spent > 0.01;

  // no data yet → show friendly instruction instead of tips
  if (!hasBudget && !hasSpending) {
    return (
      <div style={cardStyle}>
        <h3
          style={{
            marginTop: 0,
            marginBottom: "0.6rem",
            fontSize: "1.1rem",
            color: "#0f172a",
          }}
        >
          Saving Tips
        </h3>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          Once you’ve set a budget and uploaded a bank statement, we’ll show
          personalized saving tips based on your spending.
        </p>
      </div>
    );
  }

  const tips = [];

  if (userType === "Student") {
    tips.push("Try cutting your entertainment expenses by 10% next month.");
    tips.push("Plan your weekly food budget and track it separately.");
  } else if (userType === "Free_Spender") {
    tips.push("Set a simple monthly spending limit and stick to it.");
    tips.push("Turn on alerts when you get close to your budget.");
  } else if (userType === "Business_Owner") {
    tips.push("Separate personal and business expenses to avoid confusion.");
    tips.push(
      "Review high-variance categories weekly (e.g., travel, supplies)."
    );
  } else if (userType === "Financially_Inclined") {
    tips.push("Look for categories with growing month-over-month trends.");
    tips.push("Consider setting target savings rates by category.");
  }

  // generic tip if they overspent
  if (hasBudget && spent > budget) {
    tips.push(
      "You exceeded your budget – consider lowering one or two categories next month."
    );
  }

  return (
    <div style={cardStyle}>
      <h3
        style={{
          marginTop: 0,
          marginBottom: "0.6rem",
          fontSize: "1.1rem",
          color: "#0f172a",
        }}
      >
        Saving Tips
      </h3>
      <ul
        style={{
          paddingLeft: "1.1rem",
          margin: 0,
          fontSize: "0.9rem",
          color: "#475569",
          lineHeight: 1.6,
        }}
      >
        {tips.map((t, idx) => (
          <li key={idx} style={{ marginBottom: "0.3rem" }}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}