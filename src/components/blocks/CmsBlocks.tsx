import type { PageView } from "@/server/pages";
import { RichTextBlock } from "./RichTextBlock";

export function CmsBlocks({ blocks }: { blocks: PageView["blocks"] }) {
  if (!blocks.length) return null;
  return (
    <div className="space-y-8">
      {blocks.map((b) => (
        <RichTextBlock key={b.id} html={b.bodyHtml} />
      ))}
    </div>
  );
}
