export type VersionStatus = 'pending' | 'approved' | 'testing' | 'ready' | 'released' | 'rolled_back' | 'cancelled';
export type ReleaseType = 'major' | 'minor' | 'patch' | 'hotfix';
export type RiskLevel = 'high' | 'medium' | 'low';
export type ReleaseResult = 'success' | 'failed' | 'partial';
export type RequirementStatus = 'pending' | 'developing' | 'testing' | 'done';
export type Priority = 'p0' | 'p1' | 'p2' | 'p3';
export type DefectSeverity = 'critical' | 'major' | 'minor' | 'trivial';
export type DefectStatus = 'open' | 'fixed' | 'wontfix';
export type BlockerStatus = 'open' | 'resolved';
export type UserRole = 'product' | 'test' | 'dev' | 'admin';
export type ApprovalStatus = 'approved' | 'rejected';
export type ChecklistCategory = 'config' | 'notification' | 'backup' | 'grayscale';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface Version {
  id: string;
  versionNumber: string;
  title: string;
  status: VersionStatus;
  releaseType: ReleaseType;
  plannedDate: string;
  actualDate?: string;
  owner: string;
  description: string;
  affectedSystems: string[];
  riskLevel: RiskLevel;
  riskDescription?: string;
  rollbackPlan?: string;
  requirementIds: string[];
  rejectedReason?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  status: RequirementStatus;
  priority: Priority;
  owner: string;
  createdAt: string;
}

export interface Defect {
  id: string;
  title: string;
  severity: DefectSeverity;
  status: DefectStatus;
  owner: string;
}

export interface Blocker {
  id: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  status: BlockerStatus;
}

export interface SignOff {
  user: string;
  time: string;
  comment: string;
}

export interface TestingReport {
  id: string;
  versionId: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  defects: Defect[];
  blockers: Blocker[];
  signOff: SignOff | null;
}

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  checked: boolean;
  note?: string;
}

export interface Checklist {
  id: string;
  versionId: string;
  items: ChecklistItem[];
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  user: string;
}

export interface ReleaseRecord {
  id: string;
  versionId: string;
  timeline: TimelineEvent[];
  participants: string[];
  result: ReleaseResult;
  reviewConclusion?: string;
  releasedAt: string;
}

export interface Attachment {
  id: string;
  versionId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface Approval {
  id: string;
  versionId: string;
  user: string;
  status: ApprovalStatus;
  comment: string;
  createdAt: string;
}

export const STATUS_LABELS: Record<VersionStatus, string> = {
  pending: '待审核',
  approved: '审核通过',
  testing: '测试中',
  ready: '待发布',
  released: '已发布',
  rolled_back: '已回滚',
  cancelled: '已取消',
};

export const STATUS_COLORS: Record<VersionStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  testing: 'bg-purple-100 text-purple-800 border-purple-200',
  ready: 'bg-green-100 text-green-800 border-green-200',
  released: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rolled_back: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  major: '大版本',
  minor: '小版本',
  patch: '补丁',
  hotfix: '热修复',
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  high: '高风险',
  medium: '中风险',
  low: '低风险',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

export const REQUIREMENT_STATUS_LABELS: Record<RequirementStatus, string> = {
  pending: '待处理',
  developing: '开发中',
  testing: '测试中',
  done: '已完成',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  p0: 'P0',
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  p0: 'bg-red-100 text-red-800 border-red-200',
  p1: 'bg-orange-100 text-orange-800 border-orange-200',
  p2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  p3: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const DEFECT_SEVERITY_LABELS: Record<DefectSeverity, string> = {
  critical: '严重',
  major: '重要',
  minor: '一般',
  trivial: '轻微',
};

export const DEFECT_SEVERITY_COLORS: Record<DefectSeverity, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  major: 'bg-orange-100 text-orange-800 border-orange-200',
  minor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  trivial: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  product: '产品经理',
  test: '测试工程师',
  dev: '研发工程师',
  admin: '发布管理员',
};

export const CHECKLIST_CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  config: '配置检查',
  notification: '通知确认',
  backup: '数据备份',
  grayscale: '灰度安排',
};