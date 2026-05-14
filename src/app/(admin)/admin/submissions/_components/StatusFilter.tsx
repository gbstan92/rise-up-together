import Link from "next/link";

const STATUSES = [
  { value: "", label: "All" },
  { value: "NEW", label: "New" },
  { value: "HANDLED", label: "Handled" },
  { value: "ARCHIVED", label: "Archived" },
];

export function StatusFilter({ basePath, current }: { basePath: string; current?: string }) {
  return (
    <div className="flex gap-1 text-xs">
      {STATUSES.map((s) => {
        const active = (current ?? "") === s.value;
        const href = s.value ? `${basePath}?status=${s.value}` : basePath;
        return (
          <Link
            key={s.value || "all"}
            href={href}
            className={
              "rounded-full border px-3 py-1 " +
              (active ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")
            }
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
