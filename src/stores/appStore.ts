import { create } from "zustand";

type Theme = "dark" | "light";

interface AppStore {
  theme: Theme;
  isFirstLaunch: boolean;
  isInitialized: boolean;
  initialize: (settings: { theme: Theme; isFirstLaunch: boolean }) => void;
  setTheme: (theme: Theme) => void;
  setFirstLaunch: (isFirst: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  theme: "dark",
  isFirstLaunch: true,
  isInitialized: false,
  initialize: (settings) => set({ theme: settings.theme, isFirstLaunch: settings.isFirstLaunch, isInitialized: true }),
  setTheme: (theme) => set({ theme }),
  setFirstLaunch: (isFirst) => set({ isFirstLaunch: isFirst }),
}));
