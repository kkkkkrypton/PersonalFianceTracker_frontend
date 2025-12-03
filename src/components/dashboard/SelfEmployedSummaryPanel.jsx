import React, { useEffect, useState } from "react";
import { getTransactionsBetweenDates } from "../../api/txnApi";

const CATEGORIES = ["Food", "Rent", "Entertainment", "Transport", "Other"];

function formatDate(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
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
  minWidth: 420,
  flex: "1 1 520px",
};

export default function SelfEmployedSummaryPanel({ user, budget, refreshKey }) {
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

  if (loading) {
    return (
      <div style={cardStyle}>
        <h3>Budget vs Actual</h3>
        <p>Loading summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={cardStyle}>
        <h3>Budget vs Actual</h3>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  const hasBudget = budget !== null && budget > 0;
  const hasSpending = totalSpent > 0.01;
  const remaining = hasBudget ? budget - totalSpent : 0;
  const overBudget = hasBudget && remaining < 0;

  // if no budget yet → simple reminder card, no table / alert
  if (!hasBudget) {
    return (
      <div style={cardStyle}>
        <h3>Budget vs Actual</h3>
        <p
          style={{
            marginTop: "0.4rem",
            fontSize: "0.95rem",
            color: "#64748b",
          }}
        >
          Please use the <strong>Income &amp; Adaptive Budget</strong> panel to
          set your income-based monthly budget. Once a budget is saved, we&apos;ll
          compare it with your spending and show the full breakdown here.
        </p>
      </div>
    );
  }

  // sort categories by spend
  const sortedCategories = CATEGORIES.slice().sort(
    (a, b) => (categorySpend[b] || 0) - (categorySpend[a] || 0)
  );

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
        Budget vs Actual
      </h3>

      <p style={{ margin: 0, fontSize: "0.95rem" }}>
        Budget (70% of income): <strong>${budget.toFixed(2)}</strong>
      </p>
      <p style={{ margin: "0.2rem 0", fontSize: "0.95rem" }}>
        Spent this month: <strong>${totalSpent.toFixed(2)}</strong>
      </p>
      <p style={{ margin: "0.2rem 0", fontSize: "0.95rem" }}>
        Remaining:{" "}
        <strong style={{ color: overBudget ? "#dc2626" : "#16a34a" }}>
          ${remaining.toFixed(2)}
        </strong>
      </p>

      {overBudget && (
        <div
          style={{
            marginTop: "0.6rem",
            padding: "0.55rem 0.75rem",
            borderRadius: 8,
            backgroundColor: "#fef2f2",
            color: "#b91c1c",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          Alert: You went over your budget this month.
        </div>
      )}

      <h4 style={{ marginTop: "1.1rem", marginBottom: "0.4rem" }}>
        Spending by Category
      </h4>

      {!hasSpending ? (
        <p
          style={{
            fontSize: "0.9rem",
            color: "#64748b",
            marginTop: "0.2rem",
          }}
        >
          Upload a CSV bank statement to see your spending by category.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "0.4rem",
            tableLayout: "fixed",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  width: "34%",
                  textAlign: "left",
                  padding: "0.35rem 0.5rem",
                  color: "#475569",
                }}
              >
                Category
              </th>
              <th
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  width: "33%",
                  textAlign: "center",
                  padding: "0.35rem 0.5rem",
                  color: "#475569",
                }}
              >
                Spent
              </th>
              <th
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  width: "33%",
                  textAlign: "center",
                  padding: "0.35rem 0.5rem",
                  color: "#475569",
                }}
              >
                % of Total
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((c) => {
              const s = Number(categorySpend[c]) || 0;
              if (s <= 0.01) return null;
              const pct = totalSpent > 0 ? (s / totalSpent) * 100 : 0;

              return (
                <tr key={c}>
                  <td
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      padding: "0.3rem 0.5rem",
                      textAlign: "left",
                    }}
                  >
                    {c}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      padding: "0.3rem 0.5rem",
                      textAlign: "center",
                    }}
                  >
                    ${s.toFixed(2)}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      padding: "0.3rem 0.5rem",
                      textAlign: "center",
                    }}
                  >
                    {pct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
