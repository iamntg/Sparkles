# Sparkles — Spec-Driven Development

Sparkles is built using **Spec-Driven Development (SDD)**. Instead of jumping
straight to code, every feature starts life as an executable specification. The
spec is the source of truth; the implementation is a projection of it.

This directory (`docs/specs/`) holds the machinery for that workflow: the project
constitution, the templates each artifact is generated from, the helper scripts
that scaffold new work, and the living specs for every shipped feature.

> **Why `docs/specs/`?** SDD toolkits like GitHub Spec Kit keep a `specs/` tree
> of numbered feature folders next to a sidecar of templates + scripts +
> constitution. We follow that model but root it under `docs/`, the
> conventional home for project documentation, so the whole spec surface lives
> in one discoverable place.

## The workflow

```
   /constitution     →   docs/specs/constitution.md      (immovable project principles)
        │
        ▼
   /specify           →   docs/specs/NNN-feature/spec.md   (the WHAT and WHY — no tech)
        │
        ▼
   /plan              →   docs/specs/NNN-feature/plan.md    (the HOW — stack, data, contracts)
        │
        ▼
   /tasks             →   docs/specs/NNN-feature/tasks.md   (ordered, testable work items)
        │
        ▼
   /implement         →   apps/*  packages/*               (code that satisfies the tasks)
```

Each stage is gated by the previous one. A `plan.md` may not introduce behaviour
that is absent from its `spec.md`; a `tasks.md` may not invent work that no plan
calls for. When reality and the spec disagree, the spec is updated first and the
code follows.

## Layout

```
docs/specs/
├── README.md              # this file
├── constitution.md        # non-negotiable principles every feature inherits
├── templates/             # the shapes /specify, /plan, /tasks fill in
│   ├── spec-template.md
│   ├── plan-template.md
│   └── tasks-template.md
├── scripts/               # scaffolding + gate-checking helpers (bash, no deps)
│   ├── common.sh
│   ├── create-new-feature.sh
│   ├── setup-plan.sh
│   └── check-prerequisites.sh
├── 001-capture-idea/      # one folder per feature, numbered in build order
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
├── 002-develop-idea/
├── 003-linking-ideas/
├── 004-constellation-view/
├── 005-ai-clusters/
├── 006-backup-restore/
└── 007-ideas-list/
```

## Feature index

| #   | Feature              | Status  | Primary surfaces |
| --- | -------------------- | ------- | ---------------- |
| 001 | Capture Idea         | Shipped | `apps/mobile/app/(app)/add.tsx`, `packages/db` |
| 002 | Develop Idea         | Shipped | `apps/mobile/app/(app)/develop/[id].tsx` |
| 003 | Linking Ideas        | Shipped | `apps/mobile/services/linkService.ts`, `packages/db/linkRepository` |
| 004 | Constellation View   | Shipped | `apps/mobile/app/(app)/(tabs)/constellation.tsx`, `@sparkles/ui` |
| 005 | AI Clusters          | Shipped | `apps/ai-service`, `packages/ai` |
| 006 | Backup & Restore     | Shipped | `apps/mobile/services/backupService.ts`, `packages/crypto` |
| 007 | Ideas List (Stream)  | Shipped | `apps/mobile/app/(app)/(tabs)/inbox.tsx` |

## Running the helpers

```bash
# Scaffold the next feature folder from the templates
bash docs/specs/scripts/create-new-feature.sh "Timeline view of ideas"

# Materialise a plan.md + tasks.md next to an approved spec.md
bash docs/specs/scripts/setup-plan.sh 008-timeline-view

# Verify a feature has the artifacts required for the next stage
bash docs/specs/scripts/check-prerequisites.sh 008-timeline-view
bash docs/specs/scripts/check-prerequisites.sh --all
```

The scripts are intentionally dependency-free (POSIX `bash` only) so the workflow
runs anywhere the repo is checked out. `check-prerequisites.sh --all` returns a
non-zero exit code when any feature is missing an artifact, so it can gate CI.

## Related documents

- [`../../README.md`](../../README.md) — the project overview: features, tech
  stack, and the design principles the constitution's "calm by default" article
  draws from.
