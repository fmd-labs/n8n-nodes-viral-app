# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a custom n8n community node package for the ViralApp API, providing video analytics for TikTok, Instagram, and YouTube platforms. The package is built as a TypeScript n8n node following n8n's community node conventions.

## Development Commands

### Essential Commands
- `pnpm install` - Install dependencies
- `pnpm build` - Build the TypeScript project and copy icons (`tsc && gulp build:icons`)
- `pnpm dev` - Watch mode for development (`tsc --watch`)
- `pnpm dev:hot` - Hot reload development with n8n (`concurrently "tsc --watch" "N8N_DEV_RELOAD=true n8n start"`)
- `pnpm lint` - Run ESLint
- `pnpm lintfix` - Auto-fix ESLint issues
- `pnpm format` - Format code with Prettier

### Makefile Development Workflow
The project includes a comprehensive Makefile for n8n development:

- `make dev` - Full development setup with hot reload (recommended)
- `make build` - Build project with Node v22 via nvm
- `make link` - Link package to n8n custom directory for testing
- `make start` - Start n8n locally at http://localhost:5678
- `make clean` - Clean build artifacts and node_modules
- `make lint` / `make lintfix` - Linting commands

## Node.js Version

- **Required**: Node.js v22 (specified in `.nvmrc`)
- The Makefile automatically uses nvm to ensure Node v22 is used
- Package manager: pnpm (>=9.1)

## Architecture

### Core Structure
```
nodes/ViralApp/
├── ViralApp.node.ts          # Main node implementation
├── GenericFunctions.ts       # Shared API request functions
├── descriptions/             # Operation definitions for each resource
│   ├── AccountAnalytics.ts
│   ├── VideoAnalytics.ts
│   ├── TrackedAccounts.ts
│   ├── TrackedIndividualVideos.ts
│   ├── Projects.ts
│   ├── Integrations.ts
│   └── GeneralAnalytics.ts
└── viralapp.svg             # Node icon

credentials/
└── ViralAppApi.credentials.ts # API authentication
```

### n8n Node Resources
The ViralApp node supports these resources:
1. **Account Analytics** - Analytics for social media accounts
2. **Video Analytics** - Individual video performance metrics  
3. **Tracked Accounts** - Account management and tracking
4. **Tracked Individual Videos** - Video tracking operations
5. **Projects** - Project management functionality
6. **Integrations** - Third-party integrations
7. **General Analytics** - Aggregated analytics data

### API Integration
- Base URL: `https://viral.app/api/v1`
- Authentication via `viralAppApi` credentials
- Pagination handled automatically in `viralAppApiRequestAllItems()`
- Error handling through n8n's `NodeApiError`

## Development Notes

### TypeScript Configuration
- Target: ES2019
- Strict mode enabled
- Outputs to `dist/` directory
- Includes type declarations and source maps

### ESLint Rules
- Uses n8n-specific ESLint plugin (`eslint-plugin-n8n-nodes-base`)
- Separate configurations for credentials and nodes
- Pre-publish validation with stricter rules

### Build Process
1. TypeScript compilation (`tsc`)
2. Icon copying via Gulp (`gulp build:icons`)
3. ESLint validation before publishing

### Testing with n8n
Use `make dev` for the best development experience:
1. Builds and links the node to n8n's custom directory
2. Starts n8n with hot reload enabled
3. TypeScript watches for changes and recompiles automatically
4. n8n automatically reloads the node on changes