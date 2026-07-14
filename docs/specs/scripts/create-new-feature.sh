#!/usr/bin/env bash
# Scaffold a new feature folder from the spec template.
#
# Usage: bash docs/specs/scripts/create-new-feature.sh "Timeline view of ideas"
#
# Creates docs/specs/NNN-slug/spec.md seeded from templates/spec-template.md
# with the id, slug, and date filled in. Mirrors the /specify step of SDD.

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

[ $# -ge 1 ] || die "Usage: create-new-feature.sh \"<feature description>\""

description="$*"
slug="$(slugify "$description")"
number="$(next_feature_number)"
feature_id="${number}-${slug}"
dest="${SPECS_DIR}/${feature_id}"
today="$(date +%Y-%m-%d)"

[ -d "$dest" ] && die "Feature folder already exists: ${dest}"

mkdir -p "$dest"
sed \
  -e "s|\[FEATURE NAME\]|${description}|g" \
  -e "s|\[NNN-slug\]|${feature_id}|g" \
  -e "s|\[YYYY-MM-DD\]|${today}|g" \
  "${TEMPLATES_DIR}/spec-template.md" > "${dest}/spec.md"

ok "Created ${dest#${REPO_ROOT}/}/spec.md"
log "Next: fill in the spec, then run setup-plan.sh ${feature_id}"
