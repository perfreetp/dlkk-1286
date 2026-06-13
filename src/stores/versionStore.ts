import { create } from 'zustand';
import type { Version, TestingReport, Checklist, ReleaseRecord, Approval, VersionStatus } from '@/types';
import { mockVersions, mockTestingReports, mockChecklists, mockReleaseRecords, mockApprovals } from '@/data/mockVersions';
import { saveToStorage, loadFromStorage } from '@/utils/storage';
import { generateId } from '@/utils/date';

interface VersionStore {
  versions: Version[];
  testingReports: TestingReport[];
  checklists: Checklist[];
  releaseRecords: ReleaseRecord[];
  approvals: Approval[];
  currentVersion: Version | null;
  
  init: () => void;
  getVersion: (id: string) => Version | undefined;
  getTestingReport: (versionId: string) => TestingReport | undefined;
  getChecklist: (versionId: string) => Checklist | undefined;
  getReleaseRecord: (versionId: string) => ReleaseRecord | undefined;
  getApprovals: (versionId: string) => Approval[];
  setCurrentVersion: (version: Version | null) => void;
  createVersion: (version: Omit<Version, 'id' | 'createdAt' | 'updatedAt'>) => Version;
  updateVersion: (id: string, updates: Partial<Version>) => void;
  deleteVersion: (id: string) => void;
  updateStatus: (id: string, status: VersionStatus, rejectedReason?: string) => void;
  updateTestingReport: (versionId: string, report: Partial<TestingReport>) => void;
  updateChecklist: (versionId: string, items: Partial<Checklist>['items']) => void;
  addApproval: (approval: Omit<Approval, 'id' | 'createdAt'>) => void;
  addReleaseRecord: (record: Omit<ReleaseRecord, 'id'>) => void;
  updateReleaseRecord: (versionId: string, updates: Partial<ReleaseRecord>) => void;
  checkConflicts: (plannedDate: string) => Version[];
}

export const useVersionStore = create<VersionStore>((set, get) => ({
  versions: [],
  testingReports: [],
  checklists: [],
  releaseRecords: [],
  approvals: [],
  currentVersion: null,
  
  init: () => {
    const storedVersions = loadFromStorage<Version[]>('versions', mockVersions);
    const storedTestingReports = loadFromStorage<TestingReport[]>('testingReports', mockTestingReports);
    const storedChecklists = loadFromStorage<Checklist[]>('checklists', mockChecklists);
    const storedReleaseRecords = loadFromStorage<ReleaseRecord[]>('releaseRecords', mockReleaseRecords);
    const storedApprovals = loadFromStorage<Approval[]>('approvals', mockApprovals);
    
    set({
      versions: storedVersions,
      testingReports: storedTestingReports,
      checklists: storedChecklists,
      releaseRecords: storedReleaseRecords,
      approvals: storedApprovals,
    });
  },
  
  getVersion: (id) => get().versions.find(v => v.id === id),
  
  getTestingReport: (versionId) => get().testingReports.find(t => t.versionId === versionId),
  
  getChecklist: (versionId) => get().checklists.find(c => c.versionId === versionId),
  
  getReleaseRecord: (versionId) => get().releaseRecords.find(r => r.versionId === versionId),
  
  getApprovals: (versionId) => get().approvals.filter(a => a.versionId === versionId),
  
  setCurrentVersion: (version) => set({ currentVersion: version }),
  
  createVersion: (versionData) => {
    const now = new Date().toISOString();
    const newVersion: Version = {
      ...versionData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    const newTestingReport: TestingReport = {
      id: generateId(),
      versionId: newVersion.id,
      totalCases: 0,
      passedCases: 0,
      failedCases: 0,
      defects: [],
      blockers: [],
      signOff: null,
    };
    
    const newChecklist: Checklist = {
      id: generateId(),
      versionId: newVersion.id,
      items: [
        { id: generateId(), category: 'config', title: '环境配置检查', description: '确认生产环境配置正确', checked: false },
        { id: generateId(), category: 'config', title: '数据库配置', description: '确认数据库连接和参数配置', checked: false },
        { id: generateId(), category: 'config', title: '缓存配置', description: '确认Redis缓存配置正确', checked: false },
        { id: generateId(), category: 'config', title: '日志配置', description: '确认日志级别和输出配置', checked: false },
        { id: generateId(), category: 'notification', title: '发布通知', description: '发送发布通知邮件给相关人员', checked: false },
        { id: generateId(), category: 'notification', title: '客服通知', description: '通知客服团队发布时间和影响范围', checked: false },
        { id: generateId(), category: 'notification', title: '运维通知', description: '通知运维团队准备发布环境', checked: false },
        { id: generateId(), category: 'backup', title: '数据库备份', description: '备份相关数据库表', checked: false },
        { id: generateId(), category: 'backup', title: '配置文件备份', description: '备份当前配置文件', checked: false },
        { id: generateId(), category: 'backup', title: '代码备份', description: '备份当前版本代码', checked: false },
        { id: generateId(), category: 'grayscale', title: '灰度比例设置', description: '设置灰度发布比例', checked: false },
        { id: generateId(), category: 'grayscale', title: '灰度用户范围', description: '确认灰度用户范围配置', checked: false },
        { id: generateId(), category: 'grayscale', title: '监控配置', description: '配置灰度监控指标', checked: false },
        { id: generateId(), category: 'grayscale', title: '回滚预案', description: '确认回滚方案和步骤', checked: false },
      ],
    };
    
    set(state => {
      const newVersions = [...state.versions, newVersion];
      const newTestingReports = [...state.testingReports, newTestingReport];
      const newChecklists = [...state.checklists, newChecklist];
      saveToStorage('versions', newVersions);
      saveToStorage('testingReports', newTestingReports);
      saveToStorage('checklists', newChecklists);
      return { versions: newVersions, testingReports: newTestingReports, checklists: newChecklists };
    });
    
    return newVersion;
  },
  
  updateVersion: (id, updates) => set(state => {
    const newVersions = state.versions.map(v => 
      v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
    );
    saveToStorage('versions', newVersions);
    return { versions: newVersions };
  }),
  
  deleteVersion: (id) => set(state => {
    const newVersions = state.versions.filter(v => v.id !== id);
    const newTestingReports = state.testingReports.filter(t => t.versionId !== id);
    const newChecklists = state.checklists.filter(c => c.versionId !== id);
    const newReleaseRecords = state.releaseRecords.filter(r => r.versionId !== id);
    const newApprovals = state.approvals.filter(a => a.versionId !== id);
    
    saveToStorage('versions', newVersions);
    saveToStorage('testingReports', newTestingReports);
    saveToStorage('checklists', newChecklists);
    saveToStorage('releaseRecords', newReleaseRecords);
    saveToStorage('approvals', newApprovals);
    
    return {
      versions: newVersions,
      testingReports: newTestingReports,
      checklists: newChecklists,
      releaseRecords: newReleaseRecords,
      approvals: newApprovals,
    };
  }),
  
  updateStatus: (id, status, rejectedReason?: string) => set(state => {
    const newVersions = state.versions.map(v => 
      v.id === id ? { 
        ...v, 
        status, 
        rejectedReason: rejectedReason !== undefined ? rejectedReason : v.rejectedReason,
        updatedAt: new Date().toISOString() 
      } : v
    );
    saveToStorage('versions', newVersions);
    return { versions: newVersions };
  }),
  
  updateTestingReport: (versionId, report) => set(state => {
    const newTestingReports = state.testingReports.map(t =>
      t.versionId === versionId ? { ...t, ...report } : t
    );
    saveToStorage('testingReports', newTestingReports);
    return { testingReports: newTestingReports };
  }),
  
  updateChecklist: (versionId, items) => set(state => {
    const newChecklists = state.checklists.map(c =>
      c.versionId === versionId ? { ...c, items } : c
    );
    saveToStorage('checklists', newChecklists);
    return { checklists: newChecklists };
  }),
  
  addApproval: (approval) => set(state => {
    const newApproval: Approval = {
      ...approval,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const newApprovals = [...state.approvals, newApproval];
    saveToStorage('approvals', newApprovals);
    return { approvals: newApprovals };
  }),
  
  addReleaseRecord: (record) => set(state => {
    const newRecord: ReleaseRecord = {
      ...record,
      id: generateId(),
    };
    const newReleaseRecords = [...state.releaseRecords, newRecord];
    saveToStorage('releaseRecords', newReleaseRecords);
    return { releaseRecords: newReleaseRecords };
  }),

  updateReleaseRecord: (versionId, updates) => set(state => {
    const newReleaseRecords = state.releaseRecords.map(r =>
      r.versionId === versionId ? { ...r, ...updates } : r
    );
    saveToStorage('releaseRecords', newReleaseRecords);
    return { releaseRecords: newReleaseRecords };
  }),
  
  checkConflicts: (plannedDate) => {
    const versions = get().versions;
    const targetDate = new Date(plannedDate);
    return versions.filter(v => {
      if (v.status === 'cancelled' || v.status === 'rolled_back') return false;
      const vDate = new Date(v.plannedDate);
      return Math.abs(vDate.getTime() - targetDate.getTime()) < 24 * 60 * 60 * 1000;
    });
  },
}));