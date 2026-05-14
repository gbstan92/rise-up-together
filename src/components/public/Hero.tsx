import Image from "next/image";
import { Container } from "./Container";

export function Hero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/40 to-background">
      <Container className="grid items-center gap-10 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
        <div>
          {eyebrow && (
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-sm md:max-w-md">
          <Image
            src="/logo.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 24rem, 18rem"
            className="object-contain"
          />
        </div>
      </Container>
    </section>
  );
}
