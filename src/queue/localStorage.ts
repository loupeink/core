import type { IQueueStorage, QueueItem } from "./types";

export class LocalStorageQueueStorage implements IQueueStorage {
  private readonly key = "loupe_offline_queue";

  async getQueue(): Promise<QueueItem[]> {
    try {
      return JSON.parse(localStorage.getItem(this.key) ?? "[]") as QueueItem[];
    } catch {
      return [];
    }
  }

  async setQueue(items: QueueItem[]): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}
