import React from "react";

export default function RoleBadge({ userType }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <strong>Current Role:</strong> {userType}
    </div>
  );
}
