import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activePanel: string;
  activeTheme: 'light' | 'dark';
  activeAlertCount: number;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActivePanel: (panel: string) => void;
  toggleTheme: () => void;
  setActiveAlertCount: (count: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activePanel: 'dashboard',
  activeTheme: 'light',
  activeAlertCount: 0,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  toggleTheme: () => set((state) => ({ activeTheme: state.activeTheme === 'light' ? 'dark' : 'light' })),
  setActiveAlertCount: (count) => set({ activeAlertCount: count }),
}));
