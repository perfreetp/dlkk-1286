import { create } from 'zustand';
import type { Requirement, RequirementStatus } from '@/types';
import { mockRequirements } from '@/data/mockRequirements';
import { saveToStorage, loadFromStorage } from '@/utils/storage';
import { generateId } from '@/utils/date';

interface RequirementStore {
  requirements: Requirement[];
  
  init: () => void;
  getRequirement: (id: string) => Requirement | undefined;
  getRequirementsByIds: (ids: string[]) => Requirement[];
  createRequirement: (req: Omit<Requirement, 'id' | 'createdAt'>) => Requirement;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  updateStatus: (id: string, status: RequirementStatus) => void;
  linkToVersion: (reqId: string, versionId: string) => void;
  unlinkFromVersion: (reqId: string, versionId: string) => void;
}

export const useRequirementStore = create<RequirementStore>((set, get) => ({
  requirements: [],
  
  init: () => {
    const storedRequirements = loadFromStorage<Requirement[]>('requirements', mockRequirements);
    set({ requirements: storedRequirements });
  },
  
  getRequirement: (id) => get().requirements.find(r => r.id === id),
  
  getRequirementsByIds: (ids) => get().requirements.filter(r => ids.includes(r.id)),
  
  createRequirement: (reqData) => {
    const newRequirement: Requirement = {
      ...reqData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    set(state => {
      const newRequirements = [...state.requirements, newRequirement];
      saveToStorage('requirements', newRequirements);
      return { requirements: newRequirements };
    });
    
    return newRequirement;
  },
  
  updateRequirement: (id, updates) => set(state => {
    const newRequirements = state.requirements.map(r =>
      r.id === id ? { ...r, ...updates } : r
    );
    saveToStorage('requirements', newRequirements);
    return { requirements: newRequirements };
  }),
  
  deleteRequirement: (id) => set(state => {
    const newRequirements = state.requirements.filter(r => r.id !== id);
    saveToStorage('requirements', newRequirements);
    return { requirements: newRequirements };
  }),
  
  updateStatus: (id, status) => set(state => {
    const newRequirements = state.requirements.map(r =>
      r.id === id ? { ...r, status } : r
    );
    saveToStorage('requirements', newRequirements);
    return { requirements: newRequirements };
  }),
  
  linkToVersion: (reqId, versionId) => {
    set(state => {
      const newRequirements = state.requirements.map(r =>
        r.id === reqId ? { ...r, status: 'developing' as RequirementStatus } : r
      );
      saveToStorage('requirements', newRequirements);
      return { requirements: newRequirements };
    });
  },
  
  unlinkFromVersion: (reqId, versionId) => {
    set(state => {
      const newRequirements = state.requirements.map(r =>
        r.id === reqId ? { ...r, status: 'pending' as RequirementStatus } : r
      );
      saveToStorage('requirements', newRequirements);
      return { requirements: newRequirements };
    });
  },
}));