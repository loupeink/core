import { create } from "zustand";

interface SyncState {
  companyId: string | null;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  error: string | null;
  // Actions
  setCompanyId: (id: string | null) => void;
  setIsSyncing: (val: boolean) => void;
  incrementPending: () => void;
  decrementPending: () => void;
  setError: (err: string | null) => void;
  setLastSyncedAt: (ts: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  companyId: null,
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
  error: null,

  setCompanyId: (id) => set({ companyId: id }),
  setIsSyncing: (val) => set({ isSyncing: val }),
  incrementPending: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),
  decrementPending: () =>
    set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),
  setError: (err) => set({ error: err }),
  setLastSyncedAt: (ts) => set({ lastSyncedAt: ts }),
}));
