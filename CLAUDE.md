# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server with HMR (http://localhost:5173)
npm run build      # Create production build
npm run start      # Run production server (requires build first)
npm run typecheck  # Generate route types and run TypeScript check
```

## Architecture

This is a React Router v7 application with server-side rendering (SSR) enabled, using Vite as the build tool.

### Key Files

- `react-router.config.ts` - React Router configuration (SSR enabled by default)
- `vite.config.ts` - Vite config with Tailwind CSS and React Router plugins
- `app/routes.ts` - Route definitions using React Router's route config API
- `app/root.tsx` - Root layout component with document structure and error boundary

### Routing

Routes are defined in `app/routes.ts` using the `@react-router/dev/routes` API. Each route file exports:
- `meta` - Page metadata
- `loader` - Server-side data loading (optional)
- `action` - Form mutations (optional)
- Default export - React component

Route types are auto-generated in `.react-router/types/` via `react-router typegen`.

### Styling

Uses Tailwind CSS v4 with the Vite plugin. Global styles are in `app/app.css` with:
- Inter font configured as default sans font
- Dark mode support via `prefers-color-scheme`

### Path Aliases

`~/` maps to `./app/` (configured in tsconfig.json)
