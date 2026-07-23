/**
 * Shared, framework-agnostic CSV helpers. Kept in the shared `utils/` folder so
 * any feature that needs a client-side CSV export can reuse them.
 */

/**
 * Escapes a single CSV cell per RFC 4180 (quote when it contains ,"\r\n) and
 * neutralizes spreadsheet formula injection: a cell starting with =, +, -, or @
 * is prefixed with a leading apostrophe so Excel/Sheets treat it as text rather
 * than executing it. Credentials exports contain admin-entered names, so a name
 * like `=cmd|...` must never become a live formula when the file is opened.
 */
const escapeCell = (value: string): string => {
  const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\r\n]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }
  return guarded;
};

/** Serializes a header + rows into a CSV string. */
export const toCsv = (headers: string[], rows: string[][]): string =>
  [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');

/**
 * Triggers a browser download of `content` as a file named `filename`. Uses a
 * `Blob` + object URL and revokes the URL afterwards to avoid leaks.
 */
export const downloadCsv = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
