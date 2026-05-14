import { notFound } from "next/navigation";
import Link from "next/link";
import { PageKey } from "@/generated/prisma/enums";
import { getAdminPage } from "@/server/pages";
import { PageEditor } from "./PageEditor";

export const dynamic = "force-dynamic";

const VALID = new Set<string>([
  "HOME",
  "WHO_WE_ARE",
  "WHAT_WE_DO",
  "GET_INVOLVED",
  "PRIVACY",
]);

export default async function AdminPageEditPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!VALID.has(key)) notFound();

  const page = await getAdminPage(key as PageKey);
  if (!page) notFound();

  return (
    <div className="p-8 space-y-6">
      <header>
        <Link
          href="/admin/pages"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Pages
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold">
          {page.ro.title || key}
        </h1>
        <p className="text-sm text-muted-foreground">
          Edit page content. Body accepts HTML.
        </p>
      </header>
      <PageEditor initial={page} />
    </div>
  );
}
