import React from "react";

export function renderAuditValue(value) {
  if (!value) return "-";

  if (typeof value === "string") {
    if (!value.includes(",")) return value;

    return (
      <ul style={{ paddingLeft: 16, margin: 0 }}>
        {value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
          .map((v) => (
            <li key={v}>{v}</li>
          ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    return Object.entries(value).map(([key, val]) => (
      <div key={key} style={{ marginBottom: 6 }}>
        <b>{key.replace(/_/g, " ").toUpperCase()}</b>
        <div>{renderAuditValue(val)}</div>
      </div>
    ));
  }

  return String(value);
}

export function flattenAuditLogs(logs = []) {
  const rows = [];

  logs.forEach((log) => {
    let before = log.before;
    let after = log.after;

    try {
      if (typeof before === "string") before = JSON.parse(before);
      if (typeof after === "string") after = JSON.parse(after);
    } catch {}

    if (typeof before === "object" || typeof after === "object") {
      const keys = new Set([
        ...Object.keys(before || {}),
        ...Object.keys(after || {}),
      ]);

      keys.forEach((key) => {
        rows.push({
          ...log,
          column: key,
          before: before?.[key] ?? "-",
          after: after?.[key] ?? "-",
        });
      });
    } else {
      rows.push({
        ...log,
        column: log.column ?? "-",
        before,
        after,
      });
    }
  });

  return rows;
}

export function formatColumnName(column) {
  if (!column) return "-";

  return column
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
