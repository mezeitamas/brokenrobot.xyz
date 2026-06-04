# Development tooling

How this repository is set up to be worked on with **Claude Code** — the agent/skill workflow and
the sandbox that constrains it. This is deliberately kept separate from the application
documentation in [../README.md](../README.md), which covers what the site _is_ and how its code is
built. These docs cover _how we work on it_.

- [workflow.md](workflow.md) — the frontend spec-driven workflow: the role-based agents, the
  skills, and the propose → apply → verify → review loop a change moves through.
- [sandbox.md](sandbox.md) — the Claude Code sandbox & permission model: what the agent may read,
  write, run, and reach on the network, and why.

## The pieces (in `.claude/`)

The committed tooling configuration lives under [`.claude/`](../../.claude): `agents/` and
`skills/` (the workflow — see [workflow.md](workflow.md)), `commands/` (the `opsx` slash commands),
and `settings.json` (the sandbox & permissions — see [sandbox.md](sandbox.md)).

The OpenSpec _process_ these agents follow (proposing and applying site changes) is part of the
application workflow and is documented with the project docs in
[../spec-driven-development.md](../spec-driven-development.md).
