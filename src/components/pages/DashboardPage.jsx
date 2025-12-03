import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import BudgetPanel from "../dashboard/BudgetPanel";
import CategoryBudgetPanel from "../dashboard/CategoryBudgetPanel";
import CsvUploadPanel from "../dashboard/CsvUploadPanel";
import SummaryPanel from "../dashboard/SummaryPanel";
import TipsPanel from "../dashboard/TipsPanel";
import IncomePanel from "../dashboard/IncomePanel";
import AnalyticsPanel from "../dashboard/AnalyticsPanel";
import StudentSummaryPanel from "../dashboard/StudentSummaryPanel";
import StudentTipsPanel from "../dashboard/StudentTipsPanel";
import FreeSpenderSummaryPanel from "../dashboard/FreeSpenderSummaryPanel";
import FreeSpenderTipsPanel from "../dashboard/FreeSpenderTipsPanel";
import SelfEmployedSummaryPanel from "../dashboard/SelfEmployedSummaryPanel";
import SelfEmployedTipsPanel from "../dashboard/SelfEmployedTipsPanel";
import { getBudget , setBudget } from "../../api/userApi";
import { getMonthsTotal } from "../../api/txnApi";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [budget, setBudgetState] = useState(null);
  const [monthTotal, setMonthTotal] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!user) return;

    getBudget(user.userId)
      .then(setBudgetState)
      .catch(() => setBudgetState(0));

    getMonthsTotal(user.userId)
      .then(setMonthTotal)
      .catch(() => setMonthTotal(0));
  }, [user, refreshFlag]);

  const handleDataChanged = () => {
    setRefreshFlag((f) => f + 1);
  };

  const isStudent = user.userType === "Student";
  const isFreeSpender = user.userType === "Free_Spender";
  const isSelfEmployed = user.userType === "Business_Owner";
  const isFinancialLiterate = user.userType === "Financially_Inclined";

  const hasBudget = budget !== null && budget > 0;
  const hasSpending = monthTotal !== null && Math.abs(monthTotal) > 0.01;
  const canShowTips = hasBudget && hasSpending;

  // clear / Start Over
  const handleClearAll = async () => {
    const ok = window.confirm(
      "This will reset your budgets and local filters so you can start over.\n\n" +
        "Your uploaded transactions will stay. Continue?"
    );
    if (!ok) return;

    try {
      setClearing(true);

      const uid = user.userId;

      // local per-user state
      localStorage.removeItem(`categoryBudget_${uid}`);
      localStorage.removeItem(`incomeSources_${uid}`);
      localStorage.removeItem(`trendRange_${uid}`);

      // backend budget -> 0
      await setBudget(uid, 0);

      // reset top-level state
      setBudgetState(0);
      setMonthTotal(0);
      setRefreshFlag((f) => f + 1);

      setResetKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to clear dashboard state", err);
      alert("Sorry, something went wrong while resetting. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  // simple top nav
  const roleLabelMap = {
    Student: "Student",
    Free_Spender: "Free Spender",
    Business_Owner: "Self-Employed",
    Financially_Inclined: "Financially Literate",
  };
  const roleLabel = roleLabelMap[user.userType] || user.userType;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fdf2ff 0%, #f1f5ff 40%, #e7fbff 100%)",
        fontFamily:
          "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "1.5rem 0 2.5rem",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 1.75rem",
        }}
      >
        {/* top nav bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
            padding: "0.75rem 1rem",
            borderRadius: 999,
            backgroundColor: "#ffffffcc",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#94a3b8",
              }}
            >
              Personal Finance Tracker
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Dashboard
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.9rem",
              color: "#0f172a",
            }}
          >
            <span>
              Welcome{" "}
              <strong>
                {user.firstName || user.email?.split("@")[0]}
              </strong>
            </span>

            <span
              style={{
                padding: "0.2rem 0.7rem",
                borderRadius: 999,
                border: "1px solid #cbd5f5",
                fontSize: "0.8rem",
                background:
                  "linear-gradient(135deg, #eff6ff, #f5f3ff)",
              }}
            >
              {roleLabel}
            </span>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={clearing}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: 999,
                border: "1px solid #cbd5f5",
                backgroundColor: clearing ? "#e5e7eb" : "#f9fafb",
                cursor: clearing ? "default" : "pointer",
                fontSize: "0.85rem",
              }}
            >
              {clearing ? "Clearing..." : "Clear / Start Over"}
            </button>

            <button
              type="button"
              onClick={logout}
              style={{
                padding: "0.35rem 0.9rem",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg, #f97373, #ef4444, #dc2626)",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(220,38,38,0.35)",
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* --- MAIN LAYOUT --- */}
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {isStudent ? (
            <>
              {/* Row 1 – budget + upload */}
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "1.25rem",
                }}
              >
                <CategoryBudgetPanel
                  key={`cat-${resetKey}`}
                  user={user}
                  onBudgetUpdated={handleDataChanged}
                />
                <CsvUploadPanel
                  user={user}
                  onUploadSuccess={handleDataChanged}
                  canUpload={isFinancialLiterate || hasBudget}
                />
              </section>

              {/* Row 2 – summary wider + tips */}
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: canShowTips
                    ? "minmax(0, 1.7fr) minmax(0, 1.1fr)"
                    : "minmax(0, 1fr)",
                  gap: "1.25rem",
                  alignItems: "flex-start",
                }}
              >
                <StudentSummaryPanel
                  key={`stud-sum-${resetKey}`}
                  user={user}
                  refreshKey={refreshFlag}
                />
                {canShowTips && (
                  <StudentTipsPanel
                    key={`stud-tips-${resetKey}`}
                    user={user}
                    refreshKey={refreshFlag}
                  />
                )}
              </section>
            </>
          ) : isFreeSpender ? (
            <>
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "1.25rem",
                }}
              >
                <BudgetPanel
                  key={`bud-${resetKey}`}
                  user={user}
                  budget={budget}
                  onBudgetUpdated={handleDataChanged}
                />
                <CsvUploadPanel
                  user={user}
                  onUploadSuccess={handleDataChanged}
                  canUpload={isFinancialLiterate || hasBudget}
                />
              </section>

              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: canShowTips
                    ? "minmax(0, 1.7fr) minmax(0, 1.1fr)"
                    : "minmax(0, 1fr)",
                  gap: "1.25rem",
                  alignItems: "flex-start",
                }}
              >
                <FreeSpenderSummaryPanel
                  key={`fs-sum-${resetKey}`}
                  user={user}
                  budget={budget}
                  refreshKey={refreshFlag}
                />
                {canShowTips && (
                  <FreeSpenderTipsPanel
                    key={`fs-tips-${resetKey}`}
                    user={user}
                    budget={budget}
                    refreshKey={refreshFlag}
                  />
                )}
              </section>
            </>
          ) : isSelfEmployed ? (
            <>
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "1.25rem",
                }}
              >
                <IncomePanel
                  key={`inc-${resetKey}`}
                  user={user}
                  budget={budget}
                  onBudgetUpdated={handleDataChanged}
                  resetKey={resetKey}
                />
                <CsvUploadPanel
                  user={user}
                  onUploadSuccess={handleDataChanged}
                  canUpload={isFinancialLiterate || hasBudget}
                />
              </section>

              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: canShowTips
                    ? "minmax(0, 1.7fr) minmax(0, 1.1fr)"
                    : "minmax(0, 1fr)",
                  gap: "1.25rem",
                  alignItems: "flex-start",
                }}
              >
                <SelfEmployedSummaryPanel
                  key={`se-sum-${resetKey}`}
                  user={user}
                  budget={budget}
                  refreshKey={refreshFlag}
                />
                {canShowTips && (
                  <SelfEmployedTipsPanel
                    key={`se-tips-${resetKey}`}
                    user={user}
                    budget={budget}
                    refreshKey={refreshFlag}
                  />
                )}
              </section>
            </>
          ) : isFinancialLiterate ? (
            <section>
              <CsvUploadPanel
                user={user}
                onUploadSuccess={handleDataChanged}
                canUpload={true}
              />
              <div style={{ marginTop: "1.25rem" }}>
                <AnalyticsPanel
                  key={`analytics-${resetKey}`}
                  user={user}
                  refreshKey={refreshFlag}
                />
              </div>
            </section>
          ) : (
            <>
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "1.25rem",
                }}
              >
                <BudgetPanel
                  key={`bud-${resetKey}`}
                  user={user}
                  budget={budget}
                  onBudgetUpdated={handleDataChanged}
                />
                <CsvUploadPanel
                  user={user}
                  onUploadSuccess={handleDataChanged}
                  canUpload={isFinancialLiterate || hasBudget}
                />
              </section>

              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: canShowTips
                    ? "minmax(0, 1.7fr) minmax(0, 1.1fr)"
                    : "minmax(0, 1fr)",
                  gap: "1.25rem",
                  alignItems: "flex-start",
                }}
              >
                <SummaryPanel
                  key={`std-sum-${resetKey}`}
                  user={user}
                  budget={budget}
                  monthTotal={monthTotal}
                />
                {canShowTips && (
                  <TipsPanel
                    key={`std-tips-${resetKey}`}
                    userType={user.userType}
                    budget={budget}
                    monthTotal={monthTotal}
                  />
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}