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
  minWidth: 360,
  flex: "1 1 420px",
};

export default function SelfEmployedTipsPanel({ user, budget, refreshKey }) {
  const [categorySpend, setCategorySpend] = useState({});
  const [totalSpent, setTotalSpent] = useState(0);
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
        let total = 0;

        txns.forEach((t) => {
          const amount = Number(t.txnAmount) || 0;
          if (amount < 0) {
            const cat = categorizeTxn(t);
            const pos = Math.abs(amount);
            spend[cat] = (spend[cat] || 0) + pos;
            total += pos;
          }
        });

        setCategorySpend(spend);
        setTotalSpent(total);
      } catch (err) {
        setError(err.message || "Failed to load spending data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user.userId, refreshKey]);

  const hasBudget = budget !== null && budget > 0;
  const hasSpending = totalSpent > 0.01;

  if (loading) {
    return (
      <div style={cardStyle}>
        <h3>Saving Tips</h3>
        <p>Analyzing your income-based budget...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={cardStyle}>
        <h3>Saving Tips</h3>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  // if no budget or no spending yet, hide spending table and tip section
  if (!hasBudget || !hasSpending) {
    return (
      <div style={cardStyle}>
        <h3>Saving Tips</h3>
        <p
          style={{
            marginTop: "0.3rem",
            fontSize: "0.93rem",
            color: "#64748b",
          }}
        >
          Enter your income sources and apply the suggested budget, then upload
          a bank statement. Once we have both your income-based budget and your
          spending, we&apos;ll show personalized tips here.
        </p>
      </div>
    );
  }

  const tips = [];
  const remaining = budget - totalSpent;
  const overBudget = remaining < 0;

  // biggest variable category
  let biggestCat = null;
  let biggestAmount = 0;
  Object.entries(categorySpend).forEach(([cat, amt]) => {
    if (amt > biggestAmount) {
      biggestAmount = amt;
      biggestCat = cat;
    }
  });

  if (overBudget) {
    tips.push(
      `Your expenses are above this month's income-based budget by $${Math.abs(
        remaining
      ).toFixed(
        2
      )}. Try reducing variable costs first so you can keep paying fixed bills (like rent and subscriptions).`
    );
  } else {
    tips.push(
      `Good job – you're within your income-based budget this month. This gives you room to build a buffer for slower months.`
    );
    tips.push(
      "Consider moving part of your remaining money into a separate 'taxes & savings' account right away."
    );
  }

  if (biggestCat) {
    tips.push(
      `Most of your spending is in ${biggestCat} ($${biggestAmount.toFixed(
        2
      )}). Set a hard cap for this category next month and track it weekly.`
    );
  }

  tips.push(
    "Try planning for a 'low-income' month: decide what you would cut first if your income dropped, and start making small cuts now."
  );

  return (
    <div style={cardStyle}>
      <h3>Saving Tips</h3>
      <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
        {tips.map((t, i) => (
          <li key={i} style={{ marginBottom: "0.35rem", fontSize: "0.9rem" }}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
