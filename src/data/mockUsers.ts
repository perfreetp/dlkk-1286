import type { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: '张明',
    role: 'product',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  },
  {
    id: 'user-2',
    name: '李华',
    role: 'test',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  },
  {
    id: 'user-3',
    name: '王强',
    role: 'dev',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  },
  {
    id: 'user-4',
    name: '陈发布',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
  },
];

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(u => u.id === id);
};

export const getUserByName = (name: string): User | undefined => {
  return mockUsers.find(u => u.name === name);
};