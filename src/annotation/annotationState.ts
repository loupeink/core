import type { AnnotationShape } from "../types/project";

export interface AnnotationState {
  shapes: AnnotationShape[];
  redoStack: AnnotationShape[];
}

export function createInitialState(
  existingAnnotations?: AnnotationShape[],
): AnnotationState {
  return {
    shapes: existingAnnotations ? [...existingAnnotations] : [],
    redoStack: [],
  };
}

export function addShape(
  state: AnnotationState,
  shape: AnnotationShape,
): AnnotationState {
  return {
    shapes: [...state.shapes, shape],
    redoStack: [],
  };
}

export function undo(state: AnnotationState): AnnotationState {
  if (state.shapes.length === 0) return state;
  const shapes = state.shapes.slice(0, -1);
  const popped = state.shapes[state.shapes.length - 1];
  return {
    shapes,
    redoStack: [...state.redoStack, popped],
  };
}

export function redo(state: AnnotationState): AnnotationState {
  if (state.redoStack.length === 0) return state;
  const redoStack = state.redoStack.slice(0, -1);
  const popped = state.redoStack[state.redoStack.length - 1];
  return {
    shapes: [...state.shapes, popped],
    redoStack,
  };
}

export function replaceShape(
  state: AnnotationState,
  index: number,
  shape: AnnotationShape,
): AnnotationState {
  const shapes = [...state.shapes];
  shapes[index] = shape;
  return {
    shapes,
    redoStack: [],
  };
}

export function removeShape(
  state: AnnotationState,
  index: number,
): AnnotationState {
  const removed = state.shapes[index];
  if (!removed) return state;
  const shapes = state.shapes.filter((_, i) => i !== index);
  return {
    shapes,
    redoStack: [...state.redoStack, removed],
  };
}

export function clearAll(_state: AnnotationState): AnnotationState {
  return {
    shapes: [],
    redoStack: [],
  };
}
