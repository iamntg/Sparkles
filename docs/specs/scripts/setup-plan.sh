#!/usr/bin/env bash
# Materialise plan.md (and tasks.md) next to an approved spec.md.
#
# Usage: bash docs/specs/scripts/setup-plan.sh 007-ideas-list
#
# Gate: refuses to run unless spec.md exists and contains no unresolved
# [NEEDS CLARIFICATION] markers. Mirrors the /plan step of SDD.

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

[ $# -eq 1 ] || die "Usage: setup-plan.sh <feature-id>"

feature_id="$1"
dir="${SPECS_DIR}/${feature_id}"
today="$(date +%Y-%m-%d)"

[ -d "$dir" ]           || die "No such feature: ${feature_id}"
[ -f "${dir}/spec.md" ] || die "Missing spec.md — run create-new-feature.sh first"

if grep -q "NEEDS CLARIFICATION" "${dir}/spec.md"; then
  die "spec.md still has unresolved [NEEDS CLARIFICATION] markers — resolve them before planning"
fi

name="$(grep -m1 '^# Feature Specification:' "${dir}/spec.md" | sed 's/^# Feature Specification: //')"
: "${name:=${feature_id}}"

for stage in plan tasks; do
  out="${dir}/${stage}.md"
  if [ -f "$out" ]; then
    warn "${stage}.md already exists — leaving it untouched"
    continue
  fi
  sed \
    -e "s|\[FEATURE NAME\]|${name}|g" \
    -e "s|\[NNN-slug\]|${feature_id}|g" \
    -e "s|\[YYYY-MM-DD\]|${today}|g" \
    "${TEMPLATES_DIR}/${stage}-template.md" > "$out"
  ok "Created ${out#${REPO_ROOT}/}"
done
