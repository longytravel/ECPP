# CJM Coach Portal

An AI-style **coaching portal prototype for Customer Journey Managers (CJMs)**. It coaches, challenges and guides CJMs to think better — it is a coaching *partner*, not a replacement, not a facilitator, and never makes formal governance/risk decisions.

**Live demo:** _(Vercel URL added after deploy)_

## What it does

A deterministic, rules-based coaching engine drives a complete CJM thinking workflow:

1. **Dashboard** — current session, quick start, recent sessions, weekly-reflection shortcut, 4 demo personas, 4 demo problems, progress snapshot.
2. **Coaching Workspace** — paste a problem/ask; the app auto-recommends a support mode (you can override), gently flags premature solutioning, and walks you through a visible **5-stage thinking framework**: *Pause → Define → Research → Explore → Validate*, with 3–5 coaching questions per stage and a chat-style log.
3. **Side panels** — customer-first decision framework, end-to-end journey checklist, role-integrity monitor (journey-owner vs BA-drift), data/evidence confidence, future & external thinking prompts, and light-touch risk/governance support.
4. **Requirement Validator** — paste epics / user stories / requirements; get heuristic findings (strengths, risks/gaps, improvements, clarifying questions) and sub-scores for clarity, completeness, ambiguity, traceability and acceptance-criteria quality.
5. **Weekly Reflection** — 10 prompts → reflection summary, coaching observations, growth actions and next-week focus.

## Tech

- **Vanilla JavaScript + custom CSS. No framework, no build step, no bundler, no CDN, fully offline.**
- Opens by double-clicking `index.html` (works over `file://`), or served as a static site.
- The "coaching AI" is a deterministic keyword/heuristic engine in `js/engine.js` — no live LLM, no API keys.

## Run locally

Just open `index.html` in a browser. Or serve it:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html              # shell, nav, script load order
css/styles.css          # design system + components
js/data.js              # CJM_DATA — stages, modes, content, personas, problems
js/engine.js            # CJM_ENGINE — deterministic coaching heuristics
js/store.js             # CJM_STORE — state + localStorage (with in-memory fallback)
js/app.js               # router + nav wiring
js/views/               # dashboard, workspace, validator, reflection, shared panels
```

> Prototype for demonstration. Coaching guidance is heuristic and supportive — not a definitive audit, and not a substitute for professional judgement.
