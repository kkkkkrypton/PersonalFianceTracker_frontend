import React, { useEffect, useState } from "react";
import { getTransactionsBetweenDates } from "../../api/txnApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CATEGORIES = ["Food", "Rent", "Entertainment", "Transport", "Other"];

// helpers
function defaultEndDate() {
  const today = new Date();
  return today.toISOString().slice(0, 10); // YYYY-MM-DD
}

function defaultStartDate() {
  const end = new Date(defaultEndDate());
  const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
  return start.toISOString().slice(0, 10);
}

function formatMonthLabel(key /* 'YYYY-MM' */) {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleString("default", { month: "short", year: "numeric" });
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

// components
export default function AnalyticsPanel({ user, refreshKey }) {
  // date range (remembered in localStorage)
  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem("pft_analytics_start") || defaultStartDate();
  });
  const [endDate, setEndDate] = useState(() => {
    return localStorage.getItem("pft_analytics_end") || defaultEndDate();
  });

  // global bounds from uploaded data
  const [dataMinDate, setDataMinDate] = useState(null);
  const [dataMaxDate, setDataMaxDate] = useState(null);

  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [monthCategoryMap, setMonthCategoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // selected category for chart
  const [selectedCategory, setSelectedCategory] = useState("All");

  // persist chosen dates
  useEffect(() => {
    localStorage.setItem("pft_analytics_start", startDate);
  }, [startDate]);

  useEffect(() => {
    localStorage.setItem("pft_analytics_end", endDate);
  }, [endDate]);

  // load earliest & latest transaction dates across ALL uploaded data
  useEffect(() => {
    async function loadBounds() {
      try {
        const txns = await getTransactionsBetweenDates(
          user.userId,
          "1900-01-01",
          "2100-12-31"
        );

        if (!txns || txns.length === 0) {
          setDataMinDate(null);
          setDataMaxDate(null);
          return;
        }

        let min = null;
        let max = null;

        txns.forEach((t) => {
          const dateStr = (t.txnDate || t.date || "").slice(0, 10);
          if (!dateStr) return;
          if (!min || dateStr < min) min = dateStr;
          if (!max || dateStr > max) max = dateStr;
        });

        setDataMinDate(min);
        setDataMaxDate(max);

        if (min && max) {
          setStartDate((prev) => {
            if (!prev) return min;
            if (prev < min) return min;
            if (prev > max) return max;
            return prev;
          });
          setEndDate((prev) => {
            if (!prev) return max;
            if (prev > max) return max;
            if (prev < min) return min;
            return prev;
          });
        }
      } catch (e) {
        console.error("Failed to load analytics bounds", e);
      }
    }

    loadBounds();
  }, [user.userId, refreshKey]);

  // load analytics for the selected range
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");

      try {
        const txns = await getTransactionsBetweenDates(
          user.userId,
          startDate,
          endDate
        );

        let total = 0;
        const monthMap = {};
        const perMonthCat = {}; // { 'YYYY-MM': { All, Food, Rent, ... } }
        const catTotals = CATEGORIES.reduce((acc, c) => {
          acc[c] = 0;
          return acc;
        }, {});

        txns.forEach((t) => {
          const amount = Number(t.txnAmount) || 0;
          if (amount < 0) {
            const spent = Math.abs(amount);
            total += spent;

            const dateStr = (t.txnDate || t.date || "").slice(0, 10);
            if (!dateStr) return;
            const monthKey = dateStr.slice(0, 7); // YYYY-MM

            if (!perMonthCat[monthKey]) {
              perMonthCat[monthKey] = { All: 0 };
              CATEGORIES.forEach((cat) => {
                perMonthCat[monthKey][cat] = 0;
              });
            }

            monthMap[monthKey] = (monthMap[monthKey] || 0) + spent;

            const cat = categorizeTxn(t);
            perMonthCat[monthKey].All += spent;
            perMonthCat[monthKey][cat] =
              (perMonthCat[monthKey][cat] || 0) + spent;

            catTotals[cat] = (catTotals[cat] || 0) + spent;
          }
        });

        const keys = Object.keys(monthMap).sort();
        const monthly = keys.map((k, idx) => {
          const totalForMonth = monthMap[k];
          let delta = null;
          if (idx > 0) {
            const prevKey = keys[idx - 1];
            delta = totalForMonth - monthMap[prevKey];
          }
          return {
            key: k,
            label: formatMonthLabel(k),
            total: totalForMonth,
            delta,
          };
        });

        setTotalSpent(total);
        setMonthlyTotals(monthly);
        setCategoryTotals(catTotals);
        setMonthCategoryMap(perMonthCat);
      } catch (e) {
        setError(e.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user.userId, startDate, endDate, refreshKey]);

  const categoryEntries = CATEGORIES.map((c) => ({
    name: c,
    amount: Number(categoryTotals[c]) || 0,
  })).filter((c) => c.amount > 0.01);

  // helpers for min/max on date inputs
  const startMin = dataMinDate || undefined;
  const startMax = dataMaxDate || undefined;

  const endMin = startDate || dataMinDate || undefined;
  const endMax = dataMaxDate || undefined;

  // Chart data: per month, for the selected category (or All)
  const trendChartData = monthlyTotals.map((m) => {
    const monthData = monthCategoryMap[m.key] || {};
    const key = selectedCategory === "All" ? "All" : selectedCategory;
    return {
      month: m.label,
      spent: monthData[key] || 0,
    };
  });

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        padding: "1.6rem 1.8rem",
        borderRadius: 12,
        backgroundColor: "#ffffff",
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
        minWidth: 520,
        flex: "1 1 720px",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "0.5rem",
          fontSize: "1.2rem",
          color: "#0f172a",
        }}
      >
        Trend Analytics
      </h3>
      <p
        style={{
          marginTop: 0,
          marginBottom: "1rem",
          fontSize: "0.92rem",
          color: "#64748b",
        }}
      >
        Upload CSV statements from multiple months. Use the date range below to
        see how your spending changes over time.
      </p>

      {/* Date range controls */}
      <div
        style={{
          display: "flex",
          gap: "1.4rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
          fontSize: "0.9rem",
        }}
      >
        <div>
          <label style={{ color: "#475569", fontWeight: 500 }}>
            Start Date
            <br />
            <input
              type="date"
              value={startDate}
              min={startMin}
              max={startMax}
              onChange={(e) => {
                const newStart = e.target.value;
                if (!newStart) {
                  if (dataMinDate) {
                    setStartDate(dataMinDate);
                    if (endDate && endDate < dataMinDate) {
                      setEndDate(dataMinDate);
                    }
                  }
                  return;
                }
                setStartDate(newStart);
                if (endDate && endDate < newStart) {
                  setEndDate(newStart);
                }
              }}
              style={{
                marginTop: "0.25rem",
                padding: "0.35rem 0.55rem",
                borderRadius: 8,
                border: "1px solid #cbd5f5",
                backgroundColor: "#f8fafc",
                fontSize: "0.9rem",
              }}
            />
          </label>
        </div>

        <div>
          <label style={{ color: "#475569", fontWeight: 500 }}>
            End Date
            <br />
            <input
              type="date"
              value={endDate}
              min={endMin}
              max={endMax}
              onChange={(e) => {
                const newEnd = e.target.value;
                if (!newEnd) {
                  if (dataMaxDate) {
                    setEndDate(dataMaxDate);
                  }
                  return;
                }
                if (startDate && newEnd < startDate) {
                  setEndDate(startDate);
                } else {
                  setEndDate(newEnd);
                }
              }}
              style={{
                marginTop: "0.25rem",
                padding: "0.35rem 0.55rem",
                borderRadius: 8,
                border: "1px solid #cbd5f5",
                backgroundColor: "#f8fafc",
                fontSize: "0.9rem",
              }}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <p>Loading analytics...</p>
      ) : error ? (
        <p style={{ color: "#dc2626" }}>{error}</p>
      ) : (
        <>
          <p
            style={{
              fontSize: "0.95rem",
              marginBottom: "1rem",
              color: "#0f172a",
            }}
          >
            Total spending in this period:{" "}
            <strong>${totalSpent.toFixed(2)}</strong>
          </p>

          {/* Monthly trend section */}
          <h4
            style={{
              marginTop: 0,
              marginBottom: "0.45rem",
              fontSize: "1rem",
              color: "#0f172a",
            }}
          >
            Monthly Spending Trend
          </h4>

          {monthlyTotals.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
              No spending found in this period.
            </p>
          ) : (
            <>
              {/* Filter stays on top right of the chart */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "left",
                  marginBottom: "0.8rem",
                }}
              >
              <div style={{ width: "100%", maxWidth: 620 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  marginBottom: "0.25rem",
                  gap: "0.35rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#64748b",
                  }}
                >
                  Filter by category:
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: "0.3rem 0.55rem",
                    borderRadius: 999,
                    border: "1px solid #cbd5f5",
                    backgroundColor: "#f8fafc",
                    fontSize: "0.85rem",
                  }}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  width: "100%",
                  height: 260,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #e2f3ff 100%)",
                  padding: "0.75rem 0.75rem 0.25rem",
                }}
              >
                <ResponsiveContainer>
                  <LineChart
                    data={trendChartData}
                    margin={{ top: 10, right: 24, left: 0, bottom: 24 }}
                  >
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis tickFormatter={(v) => `$${v.toFixed(0)}`} />
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toFixed(2)}`,
                        "Spent",
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="spent"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

              {/* Monthly table */}
              <table
                style={{
                  width: "100%",
                  maxWidth: 640,
                  borderCollapse: "collapse",
                  marginTop: "0.4rem",
                  fontSize: "0.9rem",
                  tableLayout: "fixed",
                }}
              >
                <colgroup>
                  <col style={{ width: "33%" }} />
                  <col style={{ width: "33%" }} />
                  <col style={{ width: "34%" }} />
                </colgroup>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        textAlign: "left",
                        padding: "0.45rem 0.6rem",
                      }}
                    >
                      Month
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        textAlign: "right",
                        padding: "0.45rem 0.6rem",
                      }}
                    >
                      Spent
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        textAlign: "right",
                        padding: "0.45rem 0.6rem",
                      }}
                    >
                      vs Previous
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTotals.map((m, idx) => (
                    <tr
                      key={m.key}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                      }}
                    >
                      <td
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          padding: "0.4rem 0.6rem",
                        }}
                      >
                        {m.label}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          padding: "0.4rem 0.6rem",
                          textAlign: "right",
                        }}
                      >
                        ${m.total.toFixed(2)}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          padding: "0.4rem 0.6rem",
                          textAlign: "right",
                          color:
                            m.delta == null
                              ? "#64748b"
                              : m.delta > 0
                              ? "#dc2626"
                              : "#16a34a",
                        }}
                      >
                        {m.delta == null
                          ? "—"
                          : `${m.delta > 0 ? "+" : ""}$${Math.abs(
                              m.delta
                            ).toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Category breakdown */}
          <h4
            style={{
              marginTop: "1.3rem",
              marginBottom: "0.4rem",
              fontSize: "1rem",
              color: "#0f172a",
            }}
          >
            Spending by Category in this period
          </h4>
          {categoryEntries.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
              No transactions in this period.
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                maxWidth: 640,
                borderCollapse: "collapse",
                marginTop: "0.2rem",
                fontSize: "0.9rem",
                tableLayout: "fixed",
              }}
            >
              <colgroup>
                <col style={{ width: "33%" }} />
                <col style={{ width: "33%" }} />
                <col style={{ width: "34%" }} />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  <th
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      textAlign: "left",
                      padding: "0.45rem 0.6rem",
                    }}
                  >
                    Category
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      textAlign: "right",
                      padding: "0.45rem 0.6rem",
                    }}
                  >
                    Spent
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      textAlign: "right",
                      padding: "0.45rem 0.6rem",
                    }}
                  >
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoryEntries.map((c, idx) => {
                  const pct = totalSpent > 0 ? (c.amount / totalSpent) * 100 : 0;
                  return (
                    <tr
                      key={c.name}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                      }}
                    >
                      <td
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          padding: "0.4rem 0.6rem",
                        }}
                      >
                        {c.name}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          padding: "0.4rem 0.6rem",
                          textAlign: "right",
                        }}
                      >
                        ${c.amount.toFixed(2)}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          padding: "0.4rem 0.6rem",
                          textAlign: "right",
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
        </>
      )}
    </div>
  );
}
