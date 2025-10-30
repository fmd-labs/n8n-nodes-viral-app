# Repository Guidelines

## Project Structure & Module Organization
Sources for the custom node are in `nodes/ViralApp`: `descriptions/` holds resource and operation definitions, `GenericFunctions.ts` wraps ViralApp HTTP calls, and `ViralApp.node.ts` plus `.json` declare metadata. API credentials live in `credentials/ViralAppApi.credentials.ts`. The build pipeline emits JavaScript and assets to `dist/`, and the `Makefile` scripts handle linking into `~/.n8n/custom` for local n8n development.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (Node ≥18.10; Make targets load Node 22 via nvm).
- `pnpm build` — run `tsc` and `gulp build:icons`, refreshing `dist/`.
- `pnpm dev` — recompile TypeScript on save.
- `pnpm dev:hot` — run the watcher plus `n8n start` with hot reload.
- `pnpm lint` / `pnpm lintfix` — enforce rules from `eslint-plugin-n8n-nodes-base`.
- `pnpm format` — run Prettier on `nodes/` and `credentials/`.
- `make dev` — build, global-link, and start n8n in one step.

## Coding Style & Naming Conventions
Rely on strict TypeScript (ES2019 target) and Prettier defaults: two-space indentation, single quotes, trailing commas. Keep helper functions small and descriptive, mirroring ViralApp endpoints. Node classes stay PascalCase (`ViralApp`), credential classes end in `Api`, and new resources go under `descriptions/` grouped by API surface.

## Testing Guidelines
There is no unit-test suite; treat `pnpm build` as a type gate and `pnpm lint` as the quality baseline. For behavioral checks, link the package into n8n with `make link` or `make dev`, configure a ViralApp credential, and use the node’s “Test” button before merging. Describe any manual scenarios you exercised.

## Commit & Pull Request Guidelines
Favor concise, imperative commit titles, using Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) when they add clarity. Regenerate and commit `dist/` whenever TypeScript changes alter runtime behavior. Pull requests should outline the problem, the solution, and validation steps, and link issues or workflows that benefit from the change. Add screenshots or exported workflows for UX-facing updates.

## Security & Configuration Tips
Store ViralApp API keys only in n8n credentials; never in source. The credential test reaches `/accounts/tracked/count`, so confirm that endpoint is permitted before sharing logs. Redact `x-api-key` headers and short-lived download URLs in bug reports.
