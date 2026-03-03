# Sentry + Claude PoC

Boilerplate for integrating **Sentry** error monitoring with **Claude** AI-powered code review on GitHub.

## Architecture

```
                         ┌──────────────┐
                         │    Sentry    │
                         └──▲────────▲──┘
                            │        │
               errors/traces│        │errors/traces
                            │        │
┌───────────────────────────┼────────┼───── docker compose ──┐
│                           │        │                       │
│  ┌────────────────────────┼──┐  ┌──┼────────────────────┐  │
│  │  Frontend :3000           │  │  Backend :8000        │  │
│  │  React + Vite + TS        │  │  FastAPI + Python     │  │
│  │  @sentry/react            │  │  sentry-sdk           │  │
│  └───────────┬───────────────┘  └───▲──────┬────────────┘  │
│              │         /api/v1      │      │               │
│              └────────────────▶─────┘      │               │
│                                            │               │
│                                   ┌────────▼──────────┐    │
│                                   │  PostgreSQL :5432 │    │
│                                   └───────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

## Sentry Integration


| Layer    | SDK             | Config                    |
| -------- | --------------- | ------------------------- |
| Backend  | `sentry-sdk`    | `SENTRY_DSN` env var      |
| Frontend | `@sentry/react` | `VITE_SENTRY_DSN` env var |


Both SDKs initialize only when a DSN is provided.

## Sentry → Claude Pipeline

When a new error is captured by Sentry, it can automatically trigger Claude to analyze and propose a fix:

```
Sentry error → Pipedream webhook → GitHub Issue created → Claude analyzes & opens fix PR
```

This uses [Pipedream](https://pipedream.com) (free tier) as a bridge since Sentry's free plan doesn't support automatic GitHub issue creation. See [docs/pipedream-setup.md](docs/pipedream-setup.md) for setup instructions.

## Claude Workflows

Reusable GitHub Actions workflows that trigger when `@claude` is mentioned:


| Workflow                    | Trigger                          | Action                                |
| --------------------------- | -------------------------------- | ------------------------------------- |
| `claude_issue_reviewer.yml` | Issue created / commented        | Analyzes root cause, suggests fixes   |
| `claude_pr_reviewer.yml`    | PR opened / reviewed / commented | Reviews code, flags bugs and security |


See [docs/claude-github-setup.md](docs/claude-github-setup.md) for setup instructions.

## Quick Start

```bash
cp .env.example .env   # configure SENTRY_DSN, VITE_SENTRY_DSN
docker compose up
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

