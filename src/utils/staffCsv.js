/* ==========================================================================
   CSV serialisation for the staff attendance export
   --------------------------------------------------------------------------
   Two protections are applied to every cell:

   - Quotes are escaped and a cell containing a comma, quote or line break is
     wrapped in quotes, so a name such as `Ada, "The Countess"` stays one cell.
   - A value beginning with =, +, -, @, a tab or a carriage return is prefixed
     with an apostrophe, so spreadsheet software treats it as text instead of
     evaluating it as a formula.
   ========================================================================== */

const FORMULA_START = /^[=+\-@\t\r]/;
const NEEDS_QUOTES = /[",\r\n]/;

export function escapeCsvCell(value) {
  let text = value === null || value === undefined ? "" : String(value);

  if (FORMULA_START.test(text)) {
    text = `'${text}`;
  }

  if (NEEDS_QUOTES.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/** Serialises a header row plus data rows using CRLF line endings. */
export function toCsv(headers, rows) {
  return [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
}
