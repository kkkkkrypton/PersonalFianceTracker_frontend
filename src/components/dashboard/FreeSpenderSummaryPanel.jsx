import React, { useEffect, useState } from "react";
import { getTransactionsBetweenDates } from "../../api/txnApi";

const CATEGORIES = ["Rent", "Food", "Entertainment", "Transport", "Other"];

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

const cardStyle = {
  border: "1px solid #e2e8f0",
  padding: "1.25rem 1.4rem 1.4rem",
  borderRadius: 12,
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
  minWidth: 360,
  flex: "2 1 0",
};

export default function FreeSpenderSummaryPanel({ user, budget, refreshKey }) {
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

  const hasBudget = typeof budget === "number" && budget > 0;

  const totalSpent = CATEGORIES.reduce(
    (sum, c) => sum + (categorySpend[c] || 0),
    0
  );
  const remaining = (budget || 0) - totalSpent;
  const overspent = hasBudget && remaining < -0.01;

  // build sorted rows for the table
  const rows = CATEGORIES.map((c) => ({
    category: c,
    spent: categorySpend[c] || 0,
    pct: totalSpent > 0 ? (categorySpend[c] || 0) / totalSpent * 100 : 0,
  }))
    .filter((r) => r.spent > 0.01)
    .sort((a, b) => b.spent - a.spent);

  return (
    <div style={cardStyle}>
      <h3
        style={{
          marginTop: 0,
          marginBottom: "0.75rem",
          fontSize: "1.1rem",
          color: "#0f172a",
        }}
      >
        Budget vs Actual
      </h3>

      {loading ? (
        <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
          Loading this month&apos;s spending…
        </p>
      ) : error ? (
        <p style={{ fontSize: "0.9rem", color: "#dc2626" }}>{error}</p>
      ) : !hasBudget ? (
        // when budget is 0 / not set → hide table & alert, show reminder
        <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.5 }}>
          Set your monthly budget above to unlock your full spending breakdown
          and alerts. Once a budget is saved, we&apos;ll compare it with your
          spending and highlight your top categories here.
        </p>
      ) : (
        <>
          <p style={{ margin: "0 0 0.25rem", fontSize: "0.9rem" }}>
            Budget: <strong>${budget.toFixed(2)}</strong>
          </p>
          <p style={{ margin: "0 0 0.25rem", fontSize: "0.9rem" }}>
            Spent this month: <strong>${totalSpent.toFixed(2)}</strong>
          </p>
          <p style={{ margin: "0 0 0.6rem", fontSize: "0.9rem" }}>
            Remaining:{" "}
            <span
              style={{
                fontWeight: 600,
                color: remaining >= 0 ? "#16a34a" : "#dc2626",
              }}
            >
              {remaining >= 0 ? "" : "-"}${Math.abs(remaining).toFixed(2)}
            </span>
          </p>

          {overspent && (
            <div
              style={{
                margin: "0.4rem 0 0.9rem",
                padding: "0.6rem 0.75rem",
                borderRadius: 8,
                backgroundColor: "#fee2e2",
                border: "1px solid #fecaca",
                fontSize: "0.9rem",
                color: "#b91c1c",
              }}
            >
              Alert: You went over your budget this month.
            </div>
          )}

          {rows.length === 0 ? (
            <p style={{ fontSize: "0.88rem", color: "#64748b" }}>
              We didn&apos;t find any spending for this month yet. Upload a CSV
              statement to see your top categories.
            </p>
          ) : (
            <>
              <h4
                style={{
                  margin: "0.4rem 0 0.4rem",
                  fontSize: "0.98rem",
                  color: "#0f172a",
                }}
              >
                Top Spending Categories
              </h4>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                  tableLayout: "fixed",
                }}
              >
                <colgroup>
                  <col style={{ width: "34%" }} />
                  <col style={{ width: "33%" }} />
                  <col style={{ width: "33%" }} />
                </colgroup>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem 0.6rem",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      Category
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "0.5rem 0.6rem",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      Spent
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "0.5rem 0.6rem",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={row.category}
                      style={{
                        backgroundColor:
                          idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.45rem 0.6rem",
                          borderBottom: "1px solid #edf2f7",
                        }}
                      >
                        {row.category}
                      </td>
                      <td
                        style={{
                          padding: "0.45rem 0.6rem",
                          borderBottom: "1px solid #edf2f7",
                          textAlign: "center",
                        }}
                      >
                        ${row.spent.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "0.45rem 0.6rem",
                          borderBottom: "1px solid #edf2f7",
                          textAlign: "center",
                        }}
                      >
                        {row.pct.toFixed(1)}%
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
