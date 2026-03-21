# @loupeink/core

[![npm version](https://img.shields.io/npm/v/@loupeink/core)](https://www.npmjs.com/package/@loupeink/core)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

Platform-agnostic shared types, stores, and services for [Loupe](https://loupe.ink) — the screen capture and annotation tool.

This package is the foundation shared between `@loupeink/ui` (React components) and `@loupeink/web-sdk` (web widget). It contains annotation state management, offline queue, sync services, and shared TypeScript types.

## Install

```bash
npm install @loupeink/core
# or
yarn add @loupeink/core
# or
pnpm add @loupeink/core
```

## What's inside

| Module | Description |
|--------|-------------|
| **Types** | `WindowInfo`, `Project`, `AnnotationShape`, `FeedbackPoint`, and more |
| **Annotation state** | Pure state machine for annotation shapes — `createInitialState`, `addShape`, `undo`, `redo`, `clearAll` |
| **Stores** | Zustand stores — `useAppStore`, `useAuthStore`, `useSyncStore` |
| **Offline queue** | Persistent queue with `createOfflineQueue` + `LocalStorageQueueStorage` |
| **Sync service** | Supabase sync helpers — `syncFeedbackItem`, `ensureProject`, `deleteFeedbackItem` |
| **Storage** | `uploadScreenshotBytes` — uploads screenshot blobs to Supabase Storage |

## Usage

```typescript
import { createInitialState, addShape, undo } from '@loupeink/core';
import type { AnnotationShape } from '@loupeink/core';

let state = createInitialState();
state = addShape(state, { type: 'rect', x: 10, y: 10, w: 100, h: 50, color: '#f00' });
state = undo(state);
```

## Part of the Loupe ecosystem

- **`@loupeink/core`** — this package, shared foundation
- **`@loupeink/ui`** — React UI components (annotation overlay, feedback card)
- **`@loupeink/web-sdk`** — drop-in feedback widget for any web app

## License

[MIT](./LICENSE)
