import React, { useEffect, useState } from "react";
import { getTransactionsBetweenDates } from "../../api/txnApi";

const CATEGORIES = ["Food", "Rent", "Entertainment", "Transport", "Other"];

function formatDate(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// keyword-based categorization
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

// shared card styling so it matches Budget vs Actual and other panels
const cardStyle = {
  border: "1px solid #e2e8f0",
  padding: "1.25rem 1.4rem",
  borderRadius: 12,
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
  minWidth: 320,
  flex: "1 1 0",
};

export default function StudentTipsPanel({ user, refreshKey }) {
  const [categoryBudget, setCategoryBudget] = useState({});
  const [categorySpend, setCategorySpend] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // load the student's per-category budget from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`categoryBudget_${user.userId}`);
    if (stored) {
      try {
        setCategoryBudget(JSON.parse(stored));
      } catch {
        setCategoryBudget({});
      }
    } else {
      setCategoryBudget({});
    }
  }, [user.userId, refreshKey]);

  // load this month's transactions and sum spending per category
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");

      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1); // 1st
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day

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

  const hasAnyBudget = CATEGORIES.some((c) => Number(categoryBudget[c]) > 0);
  const hasAnySpending = CATEGORIES.some((c) => (categorySpend[c] || 0) > 0.01);

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
          Loading tips based on your latest spending…
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

  if (!hasAnyBudget || !hasAnySpending) {
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
          Set your category budget and upload a bank statement. Once we have
          both, we&apos;ll show tips for the areas where you overspend.
        </p>
      </div>
    );
  }

  // build tips based on overspent categories
  const tips = [];
  const overspent = [];
  let totalBudget = 0;
  let totalSpent = 0;

  CATEGORIES.forEach((c) => {
    const b = Number(categoryBudget[c]) || 0;
    const s = Number(categorySpend[c]) || 0;

    totalBudget += b;
    totalSpent += s;

    if (b > 0 && s > b + 0.01) {
      const diff = s - b;
      overspent.push({ category: c, overBy: diff });
    }
  });

  const overallUnderBudget = totalBudget > 0 && totalSpent <= totalBudget;
  const overallDiff = totalBudget - totalSpent;

  if (overspent.length === 0) {
    // under budget in every category
    tips.push(
      "Nice job! You stayed within all of your category budgets this month."
    );
    if (overallUnderBudget) {
      tips.push(
        `Overall you are under your total budget by $${overallDiff.toFixed(
          2
        )}. Keep up the good habits!`
      );
    } else {
      tips.push(
        "Keep tracking your spending regularly so you maintain this habit."
      );
    }
  } else {
    // first, talk about the overall picture
    if (overallUnderBudget) {
      tips.push(
        `Good work — overall you are under your total budget by $${overallDiff.toFixed(
          2
        )}.`
      );
      tips.push(
        "You can improve even more by adjusting the categories where you overspent:"
      );
    } else {
      tips.push(
        "You went over your total budget this month. Focus on these categories first:"
      );
    }

    // then per-category overspending tips
    overspent.forEach(({ category, overBy }) => {
      let suggestion;
      switch (category) {
        case "Food":
          suggestion =
            "Try planning meals and reducing take-out or coffee purchases.";
          break;
        case "Rent":
          suggestion =
            "Consider splitting rent, negotiating your lease, or reducing other fixed costs.";
          break;
        case "Entertainment":
          suggestion =
            "Limit outings or subscriptions and set a weekly entertainment cap.";
          break;
        case "Transport":
          suggestion =
            "Look into transit passes, biking, or combining trips to save on rides.";
          break;
        default:
          suggestion =
            "Review this category and see which items could be reduced or delayed.";
          break;
      }

      tips.push(
        `You overspent in ${category} by $${overBy.toFixed(2)}. ${suggestion}`
      );
    });
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
