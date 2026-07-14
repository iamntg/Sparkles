#!/usr/bin/env bash
# Verify a feature has the artifacts required to advance to the next SDD stage.
#
# Usage:
#   bash docs/specs/scripts/check-prerequisites.sh 007-ideas-list  # one feature
#   bash docs/specs/scripts/check-prerequisites.sh --all           # every feature
#
# Exit code is non-zero if any checked feature is incomplete, so this is safe to
# wire into CI as a gate.

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

check_one() {
  local dir="$1" id status=0
  id="$(basename "$dir")"
  log "Checking ${id}"

  for artifact in spec.md plan.md tasks.md; do
    if [ -f "${dir}/${artifact}" ]; then
      ok "  ${artifact} present"
    else
      warn "  ${artifact} MISSING"
      status=1
    fi
  done

  if [ -f "${dir}/spec.md" ] && grep -q "NEEDS CLARIFICATION" "${dir}/spec.md"; then
    warn "  spec.md has unresolved [NEEDS CLARIFICATION] markers"
    status=1
  fi

  return $status
}

overall=0
if [ "${1:-}" = "--all" ]; then
  for d in "${SPECS_DIR}"/*/; do
    [ -d "$d" ] || continue
    # Only numbered feature folders (NNN-slug); skip templates/, scripts/, etc.
    case "$(basename "$d")" in
      [0-9][0-9][0-9]-*) : ;;
      *) continue ;;
    esac
    check_one "$d" || overall=1
  done
else
  [ $# -eq 1 ] || die "Usage: check-prerequisites.sh <feature-id> | --all"
  dir="${SPECS_DIR}/$1"
  [ -d "$dir" ] || die "No such feature: $1"
  check_one "$dir" || overall=1
fi

[ $overall -eq 0 ] && ok "All prerequisites satisfied" || warn "Some prerequisites are missing"
exit $overall
