# Parallax Resolve

**Understand first. Resolve wisely.**

Mobile-first conflict reasoning and resolution assistant. It separates facts from assumptions, explores multiple perspectives, evaluates evidence quality, suggests constructive next steps, and generates calm messages without claiming to prove truth or deception.

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Required for live analysis: `OPENROUTER_API_KEY`. Optional model override: `OPENROUTER_MODEL` (defaults to `openrouter/free`).

Secrets are excluded by `.gitignore`.
