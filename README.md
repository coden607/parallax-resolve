# Parallax Resolve

**Understand first. Resolve wisely.**

Parallax Resolve is a mobile-first conflict reasoning and relationship-support app. It separates facts from assumptions, compares perspectives, evaluates evidence quality, identifies unknowns and contradictions, and helps users plan calmer next steps without claiming to prove truth or deception.

## Production

https://parallax-resolve.vercel.app

## Shipped features

- Eight analysis modes: Quick Review, Deep Analysis, Reality Check, Boundary Planner, Credibility Insight, Relationship Coach, Repair Conversation, and Decision Support.
- Local-first saved analyses with search, filters, favorites, tags, import/export, and comparison.
- Relationship check-ins with seven-day trend summaries.
- Private journal.
- Decision matrix.
- Repair conversation planner.
- Boundary builder.
- Evidence ledger.
- Share-safe redaction.
- Neutral question bank.
- Agreements tracker.
- Physiological arousal/anomaly interpretation with an explicit non-deception boundary.

## Privacy and safety boundaries

Saved history, check-ins, journal entries, agreements, and tool data are stored in the browser unless the user explicitly exports or shares them. OpenRouter credentials stay server-side. Physiological signals are treated as arousal/anomaly information only and are never converted into a probability that someone is lying.

The analyzer includes input limits and a best-effort per-instance request throttle. It is not a substitute for platform-level abuse controls if traffic becomes high.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Required for live analysis:

```bash
OPENROUTER_API_KEY=...
```

Optional:

```bash
OPENROUTER_MODEL=openrouter/free
```

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

GitHub Actions runs those checks for pull requests and pushes to `main`. Vercel builds preview deployments for feature branches and production from `main`.

Secrets are excluded by `.gitignore`.
