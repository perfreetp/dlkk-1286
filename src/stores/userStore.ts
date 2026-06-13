import { create } from 'zustand';
import type { User } from '@/types';
import { mockUsers } from '@/data/mockUsers';

interface UserStore {
  users: User[];
  currentUser: User;
  
  init: () => void;
  getUser: (id: string) => User | undefined;
  getUserByName: (name: string) => User | undefined;
  setCurrentUser: (user: User) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: mockUsers,
  currentUser: mockUsers[3],
  
  init: () => {
    set({ users: mockUsers, currentUser: mockUsers[3] });
  },
  
  getUser: (id) => get().users.find(u => u.id === id),
  
  getUserByName: (name) => get().users.find(u => u.name === name),
  
  setCurrentUser: (user) => set({ currentUser: user }),
}));