import React, { useState, useEffect } from "react";
import { uploadCsv } from "../../api/txnApi";

const cardStyle = {
  border: "1px solid #e2e8f0",
  padding: "1.4rem 1.6rem",
  borderRadius: 12,
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
  minWidth: 360,
  flex: "1 1 420px",
};

export default function CsvUploadPanel({
  user,
  onUploadSuccess,
  canUpload = true,
}) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [lastUploadedLabel, setLastUploadedLabel] = useState("");

  const storageKey = `lastCsvUpload_${user.userId}`;

  // load last uploaded filename on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setLastUploadedLabel(saved);
    }
  }, [storageKey]);

  const handleUpload = async () => {
    if (!canUpload) {
      setStatus("Please set your monthly budget before uploading a CSV.");
      return;
    }

    if (!file) {
      setStatus("Please choose a CSV file first.");
      return;
    }

    setStatus("Uploading…");
    try {
      await uploadCsv(user.userId, file);

      const labelToSave = file.name || "CSV uploaded";
      localStorage.setItem(storageKey, labelToSave);
      setLastUploadedLabel(labelToSave);
      setFile(null); // clear internal ref

      setStatus("Upload successful!");
      onUploadSuccess && onUploadSuccess();
    } catch (err) {
      setStatus(`Upload failed: ${err.message}`);
    }
  };

  const fileStatusText =
    file?.name ||
    (lastUploadedLabel
      ? `Last uploaded: ${lastUploadedLabel}`
      : "No file uploaded yet");

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
        Upload Bank Statement
      </h3>

      <p
        style={{
          margin: 0,
          marginBottom: "0.9rem",
          fontSize: "0.92rem",
          color: "#64748b",
        }}
      >
        Upload a CSV bank statement to analyze your spending. Uploading a new
        file will replace your previous transactions for this account.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            setFile(e.target.files[0] || null);
            setStatus("");
          }}
          style={{ fontSize: "0.86rem" }}
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={!canUpload}
          style={{
            padding: "0.45rem 1.1rem",
            borderRadius: 999,
            border: "none",
            background: canUpload
              ? "linear-gradient(135deg, #38bdf8, #2563eb)"
              : "#e2e8f0",
            color: canUpload ? "#ffffff" : "#94a3b8",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: canUpload ? "pointer" : "not-allowed",
            boxShadow: canUpload
              ? "0 8px 18px rgba(37,99,235,0.35)"
              : "none",
          }}
        >
          Upload
        </button>
      </div>

      {/* file status line */}
      <div
        style={{
          marginTop: "0.5rem",
          fontSize: "0.85rem",
          color: lastUploadedLabel ? "#16a34a" : "#64748b",
        }}
      >
        {fileStatusText}
      </div>

      {/* extra tip when upload is disabled by budget */}
      {!canUpload && (
        <p
          style={{
            marginTop: "0.25rem",
            fontSize: "0.8rem",
            color: "#9ca3af",
          }}
        >
          Tip: set a monthly budget first to unlock CSV uploads.
        </p>
      )}

      {/* message / error line */}
      {status && (
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.85rem",
            color: status.toLowerCase().includes("fail")
              ? "#dc2626"
              : "#475569",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}
