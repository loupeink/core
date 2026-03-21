import type { IQueueStorage, QueueItem } from "./types";

const MAX_QUEUE_SIZE = 50;

export function createOfflineQueue(storage: IQueueStorage) {
  async function enqueue(item: QueueItem): Promise<void> {
    const queue = await storage.getQueue();
    queue.push(item);
    if (queue.length > MAX_QUEUE_SIZE) {
      queue.shift();
    }
    await storage.setQueue(queue);
  }

  async function drain(syncFn: (item: QueueItem) => Promise<void>): Promise<void> {
    const queue = await storage.getQueue();
    if (queue.length === 0) return;

    const remaining: QueueItem[] = [];

    for (const item of queue) {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        remaining.push(item);
        continue;
      }
      try {
        await syncFn(item);
      } catch {
        remaining.push(item);
      }
    }

    await storage.setQueue(remaining);

    if (remaining.length > 0) {
      setTimeout(() => drain(syncFn).catch(console.error), 15_000);
    }
  }

  return { enqueue, drain };
}
