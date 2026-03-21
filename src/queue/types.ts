import type { FeedbackPoint } from "../types/project";

export interface QueueItem {
  feedbackItem: FeedbackPoint;
  projectId: string;
  companyId: string;
}

export interface IQueueStorage {
  getQueue(): Promise<QueueItem[]>;
  setQueue(items: QueueItem[]): Promise<void>;
}
