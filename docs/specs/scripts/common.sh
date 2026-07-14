#!/usr/bin/env bash
# Shared helpers for the Sparkles Spec-Driven Development workflow.
# Sourced by the other scripts in this directory.

set -euo pipefail

# Resolve repo-relative paths regardless of where the script is invoked from.
# Layout: docs/specs/{scripts,templates,NNN-feature}/
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # docs/specs/scripts
SPECS_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"                   # docs/specs — SDD root; feature folders live here
TEMPLATES_DIR="${SPECS_DIR}/templates"
REPO_ROOT="$(cd "${SPECS_DIR}/../.." && pwd)"                 # repo root (up from docs/specs)

log()  { printf '\033[0;36m•\033[0m %s\n' "$*"; }
ok()   { printf '\033[0;32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[0;33m!\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[0;31m✗\033[0m %s\n' "$*" >&2; exit 1; }

# slugify "Timeline View of Ideas" -> "timeline-view-of-ideas"
slugify() {
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'
}

# next_feature_number -> zero-padded next id, e.g. "007"
next_feature_number() {
  local max=0 n
  for d in "${SPECS_DIR}"/*/; do
    [ -d "$d" ] || continue
    n="$(basename "$d" | cut -d- -f1)"
    case "$n" in
      ''|*[!0-9]*) continue ;;
      *) (( 10#$n > max )) && max=$((10#$n)) ;;
    esac
  done
  printf '%03d' $((max + 1))
}
