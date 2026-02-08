import { create } from 'zustand';

type Organization_type = {
  organization: string ;
  setOrganization: (org: string ) => void;
};

export const useStoreOrganizationID = create<Organization_type>((set) => ({
  organization: '',
  setOrganization: (organization) => set({ organization }),
}));
