# @loupeink/core — Agent Instructions

This is the core utilities and state management package for [Loupe](https://loupe.ink).

## Package Overview

- **npm**: `@loupeink/core`
- **Repo**: `https://github.com/loupeink/core` (public, MIT)
- **Monorepo**: `https://github.com/AhsanAyaz/loupe` (private — this package lives at `packages/loupe-core/`)
- **License**: MIT

## Development

```bash
npm install
npm run build   # tsup
npm test        # vitest
```

## Key Files

- `src/` — TypeScript source
- `dist/` — compiled output (not committed, built on publish)
- `tsup.config.ts` — build config

## Conventions

- TypeScript strict mode
- No default exports — named exports only
- Tests alongside source or in `src/__tests__/`

## Contributing

Changes to this package are made in the private monorepo and synced here via `git subtree`. Pull requests on this public repo are welcome — the maintainers will integrate them into the monorepo.
