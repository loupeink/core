// @loupe/core — Platform-agnostic shared types, stores, and services

// Types
export type { WindowInfo, ProjectType, Project, AnnotationShape, FeedbackPoint, OverlayPosition } from './types/project';

// Annotation state
export type { AnnotationState } from './annotation/annotationState';
export { createInitialState, addShape, undo, redo, replaceShape, clearAll } from './annotation/annotationState';

// Stores
export { useSyncStore } from './stores/syncStore';
export { useAuthStore } from './stores/authStore';
export { useAppStore } from './stores/appStore';

// Queue
export type { QueueItem, IQueueStorage } from './queue/types';
export { createOfflineQueue } from './queue/offlineQueue';
export { LocalStorageQueueStorage } from './queue/localStorage';

// Storage
export { uploadScreenshotBytes } from './storage/storageUpload';
