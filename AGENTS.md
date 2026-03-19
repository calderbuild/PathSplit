# Repository Guidelines

## Project Structure & Module Organization
`src/app` contains the Next.js app shell, global styles, and API routes such as `/api/explore`, `/api/chat/*`, and `/api/crossroad/*`. `src/components` holds UI building blocks like `PathSplitExperience`, `PerspectiveCard`, `EvidenceCard`, `CrossroadConversation`, and `LiveModePanel`. `src/lib` contains core logic: prompt builders, safety checks, SecondMe auth/API clients, crossroad matching, real-agent orchestration, and colocated `*.test.ts` files. Real-agent seed data lives in `src/config/secondme-agent-seeds.json`. Planning docs are in `docs/plans/`, runbooks are in `docs/runbooks/`, and review follow-ups are tracked in `todos/`.

## Product Reality Checks
- Do not assume Phase 2 is OAuth-gated. The current `CrossroadConversation` flow and `/api/crossroad/converse` + `/api/crossroad/match` routes run without SecondMe login and currently use mock data.
- The OAuth gate applies to the live self-followup path only. `/api/chat/live` requires a valid SecondMe session; this is the "real human pipeline" shown in `LiveModePanel`.
- Be precise when describing A2A status. `/api/explore` currently streams three perspectives in parallel, but that alone is not strong evidence of agent-to-agent interaction. Avoid overstating current A2A compliance.
- Mixed mode matters for judging. Preserve clear labeling between mock path data and authorized SecondMe responses, and avoid changes that blur that boundary.
- Scoring and launch priorities are driven by the hackathon rules documented in `docs/plans/2026-03-14-feat-final-sprint-launch-growth-zhihu-plan.md`: public demo accessibility, stable OAuth, correct Portal `Client ID`, and login conversion are higher leverage than cosmetic UI polish.

## Build, Test, and Development Commands
- `npm run dev` — start the local Next.js app on `http://localhost:3000`
- `npm run build` — run a production build and TypeScript validation
- `npm run lint` — run ESLint with `--max-warnings=0`
- `npm test` — run the full Vitest suite
- `npx vitest run src/lib/safety.test.ts` — run one focused test file
- `npm run seed:agents` — inject seed memories into configured real SecondMe agents

## Coding Style & Naming Conventions
Use TypeScript with strict, explicit types and 2-space indentation. Prefer `@/` imports over deep relative paths. React components use PascalCase filenames (`PerspectiveCard.tsx`); utility modules use kebab-case (`real-agents.ts`, `narrative-prompts.ts`). Keep user-facing errors sanitized through existing helpers such as `redactErrorMessage()`. For streaming routes, preserve the custom JSON SSE format and required headers, especially `X-Accel-Buffering: no`.

## Testing Guidelines
Vitest runs in a Node environment with tests colocated next to the implementation as `*.test.ts`. Add tests for any new lib module, route behavior, or SSE contract change. Prefer small deterministic tests for prompt builders, safety rules, and mock route flows; use route-level tests when changing `/api/explore` or `/api/chat/*`.

## Commit & Pull Request Guidelines
Follow the existing conventional style: `init: ...`, `feat(scope): ...`, `fix(scope): ...`. Keep commits focused and descriptive. PRs should include a short summary, commands run (`npm test`, `npm run lint`, `npm run build`), screenshots for UI changes, and any env/config changes. If you touch SecondMe integration, note whether the change affects OAuth, agent slots, or seeded memories.

## Security & Configuration Tips
Do not commit `.env.local` or `.pathsplit-agent-slots.local.json`. Use `.env.local.example` as the source of truth for required variables. Real-agent work requires valid `SECONDME_CLIENT_ID` and `SECONDME_CLIENT_SECRET`; mock mode should remain runnable without secrets.
