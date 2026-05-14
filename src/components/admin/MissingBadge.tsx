export function MissingBadge({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
      {label ?? "Missing EN"}
    </span>
  );
}
