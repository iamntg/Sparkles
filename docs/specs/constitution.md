# Sparkles Constitution

The constitution is the set of principles that every spec, plan, and task
inherits. A feature that violates an article here is wrong by definition — the
feature changes, not the constitution. Amendments require an explicit version
bump and a note in the changelog at the bottom of this file.

**Version:** 1.2.0
**Ratified:** 2026-05-06
**Last amended:** 2026-06-25

---

## Article I — Local-First, Always

The device is the source of truth. Every core capability (capture, develop,
link, visualise) MUST work fully offline against the local SQLite database. The
network is an enhancement (AI, backup), never a dependency for the primary loop.

- No feature may block idea capture on a network round-trip.
- Remote services (AI clustering, Drive sync) MUST degrade gracefully to a
  clearly-communicated disabled state when offline.

## Article II — The User's Data Is the User's

Sparkles stores no user idea content on any server we operate.

- Backups go **only** to the user's own Google Drive, in the hidden AppData
  scope, and are encrypted client-side (`packages/crypto`, PBKDF2 + AES-GCM).
- Passphrases and derived keys are never transmitted and never written to a
  server. Device-held key material only.
- AI services process idea text in-memory to produce a result and MUST NOT
  persist it.

## Article III — Calm by Default

Sparkles is a thinking space, not a productivity dashboard. Every design
decision defers to calm.

- Prefer whitespace and progressive disclosure over dense, information-rich UI.
- Motion is subtle: soft glow, gentle fades, no abrupt or game-like animation.
- AI is offered, never forced. AI actions are opt-in buttons with honest
  loading and error states.

## Article IV — A Small, Shared Core

Domain logic lives in packages, not screens. Apps are thin.

- Domain types are defined once in `packages/core` and reused everywhere.
- All database access goes through repositories in `packages/db`; screens and
  services never write raw SQL.
- Reusable visual atoms live in `@sparkles/ui`; screens compose, they do not
  reinvent.

## Article V — Cross-Platform Parity

The monorepo targets mobile (Expo/React Native) and web from one codebase.

- Platform-specific implementations use the `*.native.ts` / `*.web.ts` split
  and MUST expose an identical public surface.
- A feature is not "done" until both platform variants compile and honour the
  same contract.

## Article VI — Specs Precede Code

No feature ships without a spec. When code and spec diverge, the spec is
corrected first and the code is brought back into line.

- Every feature folder carries `spec.md` (what/why), `plan.md` (how), and
  `tasks.md` (ordered work).
- Acceptance criteria in a spec are the definition of done.

---

## Amendment log

- **1.2.0** (2026-06-25) — Removed the tag subsystem; simplified idea model to
  title + text. Added Claude as a selectable AI provider (Article I unaffected).
- **1.1.0** (2026-05-18) — Constellation promoted to the default landing
  surface; capture moved to a dedicated route. Reinforced Article III.
- **1.0.0** (2026-05-06) — Initial ratification.
