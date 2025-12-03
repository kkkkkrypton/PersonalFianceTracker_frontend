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

export default function StudentSummaryPanel({ user, refreshKey }) {
  const [categorySpend, setCategorySpend] = useState({});
  const [categoryBudget, setCategoryBudget] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // load budgets from localStorage
  // re-run when refreshKey changes so numbers update right after Save Budget
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

  // load this month's transactions
  useEffect(() => {
    async function fetchTxns() {
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

    fetchTxns();
  }, [user.userId, refreshKey]);

  const totalBudget = CATEGORIES.reduce(
    (sum, c) => sum + (Number(categoryBudget[c]) || 0),
    0
  );
  const totalSpent = CATEGORIES.reduce(
    (sum, c) => sum + (Number(categorySpend[c]) || 0),
    0
  );
  const remaining = totalBudget - totalSpent;

  const hasBudget = totalBudget > 0.01;
  const overspent = hasBudget && totalSpent > totalBudget + 0.01;

  const rows = CATEGORIES.map((c) => {
    const budget = Number(categoryBudget[c]) || 0;
    const spent = Number(categorySpend[c]) || 0;
    const diff = spent - budget;
    return { category: c, budget, spent, diff };
  });

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        padding: "1.25rem 1.4rem",
        minWidth: 380,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
        flex: "1 1 0",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "0.6rem", color: "#0f172a" }}>
        Budget vs Actual
      </h3>

      {loading && <p>Loading spending data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* if no budget yet, show reminder instead of table + alert */}
          {!hasBudget ? (
            <p
              style={{
                marginTop: "0.4rem",
                fontSize: "0.9rem",
                color: "#64748b",
                lineHeight: 1.4,
              }}
            >
              Set your monthly category budget in the panel on the left to see a
              detailed breakdown of spending and alerts here.
            </p>
          ) : (
            <>
              <p style={{ margin: "0.3rem 0", fontSize: "0.95rem" }}>
                Budget: <strong>${totalBudget.toFixed(2)}</strong>
              </p>
              <p style={{ margin: "0.3rem 0", fontSize: "0.95rem" }}>
                Spent this month:{" "}
                <strong>${totalSpent.toFixed(2)}</strong>
              </p>
              <p style={{ margin: "0.3rem 0 0.6rem", fontSize: "0.95rem" }}>
                Remaining:{" "}
                <span
                  style={{
                    color: remaining >= 0 ? "#16a34a" : "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  ${remaining.toFixed(2)}
                </span>
              </p>

              {/* Overspend alert */}
              {overspent && (
                <div
                  style={{
                    marginTop: "0.7rem",
                    marginBottom: "0.9rem",
                    padding: "0.55rem 0.75rem",
                    borderRadius: 8,
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "0.9rem",
                  }}
                >
                  Alert: You went over your budget this month.
                </div>
              )}

              <h4
                style={{
                  marginTop: "0.6rem",
                  marginBottom: "0.3rem",
                  fontSize: "1rem",
                  color: "#0f172a",
                }}
              >
                By Category
              </h4>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "0.35rem",
                  fontSize: "0.9rem",
                }}
              >
                <colgroup>
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "25%" }} />
                </colgroup>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.45rem 0.6rem",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      Category
                    </th>
                    <th
                      style={{
                        textAlign: "Center",
                        padding: "0.45rem 0.6rem",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      Budget
                    </th>
                    <th
                      style={{
                        textAlign: "Center",
                        padding: "0.45rem 0.6rem",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      Spent
                    </th>
                    <th
                      style={{
                        textAlign: "Center",
                        padding: "0.45rem 0.6rem",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      Difference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={row.category}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.4rem 0.6rem",
                          borderBottom: "1px solid #edf2f7",
                        }}
                      >
                        {row.category}
                      </td>
                      <td
                        style={{
                          padding: "0.4rem 0.6rem",
                          borderBottom: "1px solid #edf2f7",
                          textAlign: "center",
                        }}
                      >
                        ${row.budget.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "0.4rem 0.6rem",
                          borderBottom: "1px solid #edf2f7",
                          textAlign: "center",
                        }}
                      >
                        ${row.spent.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "0.4rem 0.6rem",
                          borderBottom: "1px solid #edf2f7",
                          textAlign: "center",
                          color: row.diff > 0 ? "#dc2626" : "#16a34a",
                          fontWeight: 500,
                        }}
                      >
                        {row.diff > 0 ? "+" : ""}
                        {row.diff.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}
