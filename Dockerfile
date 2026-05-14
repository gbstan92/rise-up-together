# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    CI=true
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nextjs:nodejs /app/src/i18n ./src/i18n
COPY --from=builder --chown=nextjs:nodejs /app/messages ./messages
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

RUN mkdir -p /data/uploads && chown -R nextjs:nodejs /data

EXPOSE 3000

CMD ["sh", "-c", "set -ex; exec 2>&1; echo '[boot] container started'; mkdir -p /data/uploads; chown -R nextjs:nodejs /data; ./node_modules/.bin/prisma migrate deploy; echo \"[boot] migrate ok, PORT=${PORT:-3000}\"; exec runuser -u nextjs -- ./node_modules/.bin/next start"]
