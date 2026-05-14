export function RichTextBlock({ html }: { html: string }) {
  return (
    <div
      className="cms-rich-text max-w-3xl text-base leading-relaxed text-foreground/90 [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-semibold [&>h3]:mt-6 [&>h3]:mb-2 [&>h3]:font-display [&>h3]:text-xl [&>h3]:font-semibold [&>p]:my-3 [&>ul]:my-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:my-3 [&>ol]:list-decimal [&>ol]:pl-6 [&>a]:text-primary [&>a]:underline [&>a]:underline-offset-2 [&>blockquote]:my-4 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
