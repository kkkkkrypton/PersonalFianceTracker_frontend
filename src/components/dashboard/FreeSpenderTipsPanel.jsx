import React, { useEffect, useState } from "react";
import { getTransactionsBetweenDates } from "../../api/txnApi";

const CATEGORIES = ["Food", "Rent", "Entertainment", "Transport", "Other"];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function categorizeTxn(txn) {
  const text = `${txn.description || ""} ${txn.subDescription || ""}`.toLowerCase();

  if (
    text.includes("rent") ||
    text.includes("apartment") ||
    text.includes("lease") ||
    text.includes("condo") ||
    text.includes("utility") ||
    text.includes("hydro") ||
    text.includes("electric") ||
    text.includes("water")
  ) {
    return "Rent";
  }
  if (
    text.includes("grocery") ||
    text.includes("groceries") ||
    text.includes("walmart") ||
    text.includes("costco") ||
    text.includes("superstore") ||
    text.includes("loblaws") ||
    text.includes("no frills") ||
    text.includes("restaurant") ||
    text.includes("coffee") ||
    text.includes("cafe") ||
    text.includes("starbucks") ||
    text.includes("tim hortons") ||
    text.includes("breakfast") ||
    text.includes("lunch") ||
    text.includes("dinner")
  ) {
    return "Food";
  }
  if (
    text.includes("netflix") ||
    text.includes("spotify") ||
    text.includes("disney") ||
    text.includes("prime video") ||
    text.includes("cinema") ||
    text.includes("movie") ||
    text.includes("game") ||
    text.includes("streaming") ||
    text.includes("subscription") ||
    text.includes("clothing") ||
    text.includes("shopping")
  ) {
    return "Entertainment";
  }
  if (
    text.includes("bus") ||
    text.includes("transit") ||
    text.includes("subway") ||
    text.includes("metro") ||
    text.includes("presto") ||
    text.includes("uber") ||
    text.includes("lyft") ||
    text.includes("taxi") ||
    text.includes("gas") ||
    text.includes("petrol") ||
    text.includes("carpool")
  ) {
    return "Transport";
  }
  return "Other";
}

const cardStyle = {
  border: "1px solid #e2e8f0",
  padding: "1.4rem 1.6rem",
  borderRadius: 12,
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
  minWidth: 320,
  flex: "1 1 340px",
};

export default function FreeSpenderTipsPanel({ user, budget, refreshKey }) {
  const [categorySpend, setCategorySpend] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");

      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      try {
        const txns = await getTransactionsBetweenDates(
          user.userId,
          formatDate(start),
          formatDate(end)
        );

        const spend = CATEGORIES.reduce((acc, c) => {
          acc[c] = 0;
          return acc;
        }, {});

        txns.forEach((t) => {
          const amount = Number(t.txnAmount) || 0;
          if (amount < 0) {
            const cat = categorizeTxn(t);
            spend[cat] = (spend[cat] || 0) + Math.abs(amount);
          }
        });

        setCategorySpend(spend);
      } catch (err) {
        setError(err.message || "Failed to load spending data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user.userId, refreshKey]);

  const totalBudget = Number(budget) || 0;
  const hasBudget = totalBudget > 0;

  const totalSpent = CATEGORIES.reduce(
    (sum, c) => sum + (Number(categorySpend[c]) || 0),
    0
  );
  const hasSpending = totalSpent > 0.01;

  // If no budget yet, hide tips and show reminder (even if CSV uploaded)
  if (!hasBudget) {
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
          Set your monthly budget on the left to unlock personalized tips based
          on how you&apos;re actually spending.
        </p>
      </div>
    );
  }

  if (loading) {
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
        <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
          Crunching the numbers on your latest spending…
        </p>
      </div>
    );
  }

  if (error) {
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
        <p style={{ fontSize: "0.9rem", color: "#dc2626" }}>{error}</p>
      </div>
    );
  }

  if (!hasSpending) {
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
          Upload a CSV bank statement to see which categories you&apos;re
          spending the most in and get tailored ideas to cut back.
        </p>
      </div>
    );
  }

  // build personalised tips
  const tips = [];

  const diff = totalSpent - totalBudget;
  if (diff > 5) {
    tips.push(
      `You exceeded your monthly budget by $${diff.toFixed(
        2
      )}. Try a short "no-spend" period over the next few days to reset your habits.`
    );
  } else if (totalBudget - totalSpent > 5) {
    tips.push(
      `Nice work — you are under budget by $${(totalBudget - totalSpent).toFixed(
        2
      )}. Consider moving that extra money into savings.`
    );
  }

  // top category
  const entries = CATEGORIES.map((c) => ({
    name: c,
    spent: Number(categorySpend[c]) || 0,
  })).sort((a, b) => b.spent - a.spent);

  const top = entries[0];
  if (top && top.spent > 0) {
    const pct = (top.spent / totalSpent) * 100;
    tips.push(
      `Most of your spending is in ${top.name} ($${top.spent.toFixed(
        2
      )}, ${pct.toFixed(
        1
      )}% of your total). Set a weekly limit for this category and track it closely.`
    );
  }

  tips.push(
    "Try paying with debit only for a week so you see money leaving your account in real time."
  );
  tips.push(
    "Before each purchase, pause and ask: “Do I really need this, or can it wait until next month?”"
  );

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
