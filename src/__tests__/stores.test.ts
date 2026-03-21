import { describe, it, expect, beforeEach } from 'vitest';
// These imports will fail until Wave 1 extracts stores
import { useSyncStore } from '../stores/syncStore';
import { useAppStore } from '../stores/appStore';

describe('useSyncStore — CORE-03', () => {
  beforeEach(() => {
    useSyncStore.setState({ companyId: null, isSyncing: false, pendingCount: 0, lastSyncedAt: null, error: null });
  });

  it('setCompanyId updates companyId', () => {
    useSyncStore.getState().setCompanyId('company-123');
    expect(useSyncStore.getState().companyId).toBe('company-123');
  });

  it('incrementPending/decrementPending track count', () => {
    useSyncStore.getState().incrementPending();
    useSyncStore.getState().incrementPending();
    expect(useSyncStore.getState().pendingCount).toBe(2);
    useSyncStore.getState().decrementPending();
    expect(useSyncStore.getState().pendingCount).toBe(1);
  });

  it('decrementPending does not go below 0', () => {
    useSyncStore.getState().decrementPending();
    expect(useSyncStore.getState().pendingCount).toBe(0);
  });
});

describe('useAppStore — CORE-03', () => {
  it('has default theme of dark', () => {
    expect(useAppStore.getState().theme).toBe('dark');
  });

  it('setTheme updates theme synchronously', () => {
    useAppStore.getState().setTheme('light');
    expect(useAppStore.getState().theme).toBe('light');
    useAppStore.getState().setTheme('dark');
  });
});
