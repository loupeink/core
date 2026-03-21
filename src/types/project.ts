export interface WindowInfo {
  id: string; // Hyprland address or xcap window ID
  title: string; // Display title
  appName: string; // App class name
}

export type ProjectType = "video" | "design" | "website" | "general";

export interface Project {
  id: string;
  name: string;
  title: string;
  projectType?: ProjectType;
  createdAt: string;
  updatedAt: string;
  feedbackPoints: FeedbackPoint[];
  overlayPosition?: OverlayPosition;
}

export interface AnnotationShape {
  type: "rect" | "arrow" | "freehand" | "text" | "blur" | "circle" | "line";
  points: number[][];
  color: string;
  strokeWidth: number;
  pressure?: number[]; // per-point pressure, parallel to points[]; undefined for non-freehand
  text?: string;
  fontSize?: number;
}

export interface FeedbackPoint {
  id: string;
  comment: string;
  timestamp?: string;
  severity?: "critical" | "major" | "minor" | "suggestion";
  tags: string[];
  screenshotPath?: string;
  annotatedScreenshotPath?: string;
  annotations?: AnnotationShape[];
  createdAt: string;
}

export interface OverlayPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}
