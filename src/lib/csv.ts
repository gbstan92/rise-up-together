export function toCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(escape).join(",")];
  for (const r of rows) lines.push(r.map(escape).join(","));
  return lines.join("\n") + "\n";
}

export function csvResponse(filename: string, body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
