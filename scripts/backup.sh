#!/usr/bin/env bash
# Rise Up Together — point-in-time backup.
# Run from a host that can reach the Railway Postgres instance and has the
# UPLOAD_DIR mounted (or run inside the Railway service container).
#
# Usage:
#   DATABASE_URL=postgres://... UPLOAD_DIR=/data/uploads ./scripts/backup.sh ./backups
#
# Produces ./backups/<stamp>/{db.sql.gz, uploads.tar.gz}.
# Keep at least 7 daily snapshots off-site (S3, R2, etc.).

set -euo pipefail

OUT_DIR="${1:-./backups}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
TARGET="${OUT_DIR}/${STAMP}"
mkdir -p "${TARGET}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[backup] DATABASE_URL is required" >&2
  exit 1
fi

UPLOAD_DIR="${UPLOAD_DIR:-/data/uploads}"

echo "[backup] dumping Postgres → ${TARGET}/db.sql.gz"
pg_dump --no-owner --no-privileges "${DATABASE_URL}" | gzip > "${TARGET}/db.sql.gz"

if [[ -d "${UPLOAD_DIR}" ]]; then
  echo "[backup] archiving volume ${UPLOAD_DIR} → ${TARGET}/uploads.tar.gz"
  tar -C "$(dirname "${UPLOAD_DIR}")" -czf "${TARGET}/uploads.tar.gz" "$(basename "${UPLOAD_DIR}")"
else
  echo "[backup] WARN: UPLOAD_DIR ${UPLOAD_DIR} does not exist — skipping"
fi

echo "[backup] done: ${TARGET}"
ls -lh "${TARGET}"
