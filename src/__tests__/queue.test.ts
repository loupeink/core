import { describe, it, expect, beforeEach } from 'vitest';
// These imports will fail until Wave 1 creates queue module
import { createOfflineQueue } from '../queue/offlineQueue';
import { LocalStorageQueueStorage } from '../queue/localStorage';
import type { IQueueStorage, QueueItem } from '../queue/types';

const makeFeedback = (id: string): QueueItem => ({
  feedbackItem: { id, comment: 'test', tags: [], createdAt: '2026-01-01' },
  projectId: 'proj-1',
  companyId: 'comp-1',
});

describe('LocalStorageQueueStorage — CORE-04', () => {
  let storage: IQueueStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageQueueStorage();
  });

  it('getQueue returns empty array by default', async () => {
    const q = await storage.getQueue();
    expect(q).toEqual([]);
  });

  it('setQueue then getQueue round-trips correctly', async () => {
    const items = [makeFeedback('f1'), makeFeedback('f2')];
    await storage.setQueue(items);
    const q = await storage.getQueue();
    expect(q).toHaveLength(2);
    expect(q[0].feedbackItem.id).toBe('f1');
  });
});

describe('createOfflineQueue — CORE-04', () => {
  let storage: IQueueStorage;
  let queue: ReturnType<typeof createOfflineQueue>;

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageQueueStorage();
    queue = createOfflineQueue(storage);
  });

  it('enqueue adds item to storage', async () => {
    await queue.enqueue(makeFeedback('f1'));
    const q = await storage.getQueue();
    expect(q).toHaveLength(1);
  });

  it('drain calls syncFn for each item and clears on success', async () => {
    await queue.enqueue(makeFeedback('f1'));
    await queue.enqueue(makeFeedback('f2'));
    const synced: string[] = [];
    await queue.drain(async (item) => { synced.push(item.feedbackItem.id); });
    expect(synced).toEqual(['f1', 'f2']);
    expect(await storage.getQueue()).toHaveLength(0);
  });

  it('drain keeps failed items for retry', async () => {
    await queue.enqueue(makeFeedback('f1'));
    await queue.drain(async () => { throw new Error('network'); });
    expect(await storage.getQueue()).toHaveLength(1);
  });
});
