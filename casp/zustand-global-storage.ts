import { create } from 'zustand';

type Organization_type = {
  organization: string ;
  setOrganization: (org: string ) => void;
};

type AiPanelState = {
  isAiPanelOpen: boolean;
  toggleAiPanel: () => void;
  setAiPanelOpen: (isOpen: boolean) => void;
};

export const useStoreOrganizationID = create<Organization_type>((set) => ({
  organization: '',
  setOrganization: (organization) => set({ organization }),
}));

export const useAiPanelStore = create<AiPanelState>((set) => ({
  isAiPanelOpen: true,
  toggleAiPanel: () => set((state) => ({ isAiPanelOpen: !state.isAiPanelOpen })),
  setAiPanelOpen: (isOpen) => set({ isAiPanelOpen: isOpen }),
}));
