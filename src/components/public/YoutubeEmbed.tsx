export function YoutubeEmbed({ id, title }: { id: string; title?: string | null }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title ?? "YouTube video"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
