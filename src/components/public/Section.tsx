import { cn } from "@/lib/utils";
import { Container } from "./Container";

export function Section({
  className,
  eyebrow,
  title,
  description,
  children,
  align = "left",
}: {
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <Container>
        {(eyebrow || title || description) && (
          <div
            className={cn(
              "mb-10 max-w-2xl",
              align === "center" && "mx-auto text-center",
            )}
          >
            {eyebrow && (
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-lg text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
