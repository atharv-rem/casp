import { create } from 'zustand';

type OrganizationStore = {
  organization: string | null;
  setOrganization: (org: string | null) => void;
};

export const useOrganizationStore = create<OrganizationStore>((set) => ({
  organization: null,
  setOrganization: (organization) => set({ organization }),
}));
