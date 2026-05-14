import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { PublicTournamentCard } from "@/server/tournaments";

function formatRange(start: Date, end: Date | null, locale: string) {
  const fmt = new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (!end || start.toDateString() === end.toDateString()) return fmt.format(start);
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function TournamentCard({
  t,
  locale,
}: {
  t: PublicTournamentCard;
  locale: "ro" | "en";
}) {
  const cover = t.coverMd ?? t.coverThumb;
  return (
    <Link
      href={{ pathname: "/turnee/[slug]", params: { slug: t.slugLocale } }}
      className="group block overflow-hidden rounded-xl border bg-card transition hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full bg-muted">
        {cover && (
          <Image
            src={`/uploads/${cover}`}
            alt=""
            fill
            sizes="(min-width:768px) 33vw, 100vw"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.15em] text-primary">
          {formatRange(t.startDate, t.endDate, locale)}
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold leading-tight">
          {t.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{t.venueName}</p>
        {t.summary && (
          <p className="mt-3 line-clamp-3 text-sm text-foreground/80">{t.summary}</p>
        )}
      </div>
    </Link>
  );
}
