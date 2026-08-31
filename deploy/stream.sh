#!/usr/bin/env bash
# Pousse en boucle infinie stream/code_loop.mp4 vers pump.fun (ou tout
# ingest RTMP) en remux pur (-c copy) : la video est deja encodee au bon
# format (H.264/AAC), donc pas de reencodage -> quasi aucun cout CPU, ce
# qui compte sur un VPS qui fait tourner l'API et le site a cote.
#
# Necessite RTMP_URL dans l'environnement (voir .env, jamais commite).
# Usage : RTMP_URL="rtmp://.../live/<cle>" ./stream.sh
set -euo pipefail

if [ -z "${RTMP_URL:-}" ]; then
  echo "RTMP_URL manquante (URL + cle de stream fournies par pump.fun)" >&2
  exit 1
fi

VIDEO="$(dirname "$0")/../stream/code_loop.mp4"

exec ffmpeg -re -stream_loop -1 -i "$VIDEO" -c copy -f flv "$RTMP_URL"
