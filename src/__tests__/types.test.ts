import { describe, it, expect } from 'vitest';
// These imports will fail until Wave 1 extracts types to @loupeink/core
import type { WindowInfo, ProjectType, Project, AnnotationShape, FeedbackPoint, OverlayPosition } from '../types/project';
import { createInitialState, addShape, undo, redo, replaceShape, clearAll } from '../annotation/annotationState';

describe('types — CORE-02', () => {
  it('Project shape is correct', () => {
    const p: Project = {
      id: 'p1', name: 'Test', description: 'Test description',
      createdAt: '2026-01-01', updatedAt: '2026-01-01', feedbackPoints: [],
    };
    expect(p.id).toBe('p1');
  });

  it('AnnotationShape type accepts all tool types', () => {
    const shape: AnnotationShape = { type: 'rect', points: [[0,0],[1,1]], color: '#f00', strokeWidth: 2 };
    expect(shape.type).toBe('rect');
  });
});

describe('annotationState — CORE-02', () => {
  it('createInitialState returns empty shapes', () => {
    const state = createInitialState();
    expect(state.shapes).toHaveLength(0);
    expect(state.redoStack).toHaveLength(0);
  });

  it('addShape appends and clears redoStack', () => {
    const shape: AnnotationShape = { type: 'rect', points: [], color: '#f00', strokeWidth: 1 };
    const s0 = createInitialState();
    const s1 = addShape(s0, shape);
    expect(s1.shapes).toHaveLength(1);
    expect(s1.redoStack).toHaveLength(0);
  });

  it('undo/redo cycle works', () => {
    const shape: AnnotationShape = { type: 'arrow', points: [], color: '#00f', strokeWidth: 1 };
    const s0 = createInitialState();
    const s1 = addShape(s0, shape);
    const s2 = undo(s1);
    expect(s2.shapes).toHaveLength(0);
    const s3 = redo(s2);
    expect(s3.shapes).toHaveLength(1);
  });

  it('clearAll empties everything', () => {
    const shape: AnnotationShape = { type: 'text', points: [], color: '#0f0', strokeWidth: 1 };
    const s0 = addShape(createInitialState(), shape);
    const s1 = clearAll(s0);
    expect(s1.shapes).toHaveLength(0);
  });
});
