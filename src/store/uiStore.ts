import { create } from 'zustand';

interface UIState {
  selectedLeadId: string | null;
  isDetailPanelOpen: boolean;
  activeModal: string | null;
  openDetailPanel: (leadId: string) => void;
  closeDetailPanel: () => void;
  openModal: (name: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UIState>((set) => ({
  selectedLeadId: null,
  isDetailPanelOpen: false,
  activeModal: null,
  openDetailPanel: (leadId) => set({ selectedLeadId: leadId, isDetailPanelOpen: true }),
  closeDetailPanel: () => set({ selectedLeadId: null, isDetailPanelOpen: false }),
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null })
}));
