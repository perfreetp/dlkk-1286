import type { Version, TestingReport, Checklist, ReleaseRecord, Approval, ChecklistItem } from '@/types';

const today = new Date();
const getDateStr = (offset: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

const getDateTimeStr = (offset: number, hour: number = 10): string => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const mockVersions: Version[] = [
  {
    id: 'ver-1',
    versionNumber: 'v2.1.0',
    title: '商品详情页改版',
    status: 'released',
    releaseType: 'minor',
    plannedDate: getDateStr(-30),
    actualDate: getDateStr(-28),
    owner: '张明',
    description: '本次版本主要包含商品详情页改版、搜索功能增强和库存预警功能',
    affectedSystems: ['商品系统', '搜索系统', '库存系统'],
    riskLevel: 'low',
    riskDescription: '改动范围较小，风险可控',
    rollbackPlan: '回滚商品详情页模板，恢复搜索索引配置',
    requirementIds: ['req-3', 'req-6', 'req-11'],
    attachments: [],
    createdAt: getDateTimeStr(-45),
    updatedAt: getDateTimeStr(-28),
  },
  {
    id: 'ver-2',
    versionNumber: 'v2.2.0',
    title: '支付流程优化',
    status: 'testing',
    releaseType: 'minor',
    plannedDate: getDateStr(7),
    owner: '张明',
    description: '优化支付流程，增加支付方式选择，简化退款申请流程',
    affectedSystems: ['支付系统', '退款系统'],
    riskLevel: 'medium',
    riskDescription: '涉及支付核心流程，需充分测试',
    rollbackPlan: '关闭新支付方式入口，恢复原退款流程配置',
    requirementIds: ['req-4', 'req-13'],
    attachments: [],
    createdAt: getDateTimeStr(-20),
    updatedAt: getDateTimeStr(-5),
  },
  {
    id: 'ver-3',
    versionNumber: 'v2.2.1',
    title: '消息通知系统',
    status: 'approved',
    releaseType: 'patch',
    plannedDate: getDateStr(14),
    owner: '张明',
    description: '实现站内消息通知，支持订单状态变更提醒',
    affectedSystems: ['消息系统', '订单系统'],
    riskLevel: 'low',
    riskDescription: '新增功能，不影响现有流程',
    rollbackPlan: '关闭消息通知开关',
    requirementIds: ['req-7'],
    attachments: [],
    createdAt: getDateTimeStr(-15),
    updatedAt: getDateTimeStr(-3),
  },
  {
    id: 'ver-4',
    versionNumber: 'v3.0.0',
    title: '会员体系上线',
    status: 'pending',
    releaseType: 'major',
    plannedDate: getDateStr(21),
    owner: '张明',
    description: '建立会员等级体系，实现优惠券发放和使用功能',
    affectedSystems: ['会员系统', '优惠券系统', '订单系统', '支付系统'],
    riskLevel: 'high',
    riskDescription: '大版本升级，涉及多个核心系统，需灰度发布',
    rollbackPlan: '关闭会员入口，回滚优惠券配置，恢复订单计算逻辑',
    requirementIds: ['req-9', 'req-10'],
    attachments: [],
    createdAt: getDateTimeStr(-10),
    updatedAt: getDateTimeStr(-10),
  },
  {
    id: 'ver-5',
    versionNumber: 'v2.1.1',
    title: '物流跟踪优化',
    status: 'ready',
    releaseType: 'patch',
    plannedDate: getDateStr(3),
    owner: '张明',
    description: '实时物流信息展示，支持物流异常提醒',
    affectedSystems: ['物流系统', '消息系统'],
    riskLevel: 'low',
    riskDescription: '新增展示功能，不影响物流核心流程',
    rollbackPlan: '关闭实时物流展示，恢复原物流查询接口',
    requirementIds: ['req-12'],
    attachments: [],
    createdAt: getDateTimeStr(-8),
    updatedAt: getDateTimeStr(-1),
  },
  {
    id: 'ver-6',
    versionNumber: 'v1.0.0-hotfix',
    title: '支付异常修复',
    status: 'rolled_back',
    releaseType: 'hotfix',
    plannedDate: getDateStr(-60),
    actualDate: getDateStr(-60),
    owner: '王强',
    description: '修复支付回调异常导致订单状态不一致问题',
    affectedSystems: ['支付系统', '订单系统'],
    riskLevel: 'high',
    riskDescription: '紧急修复，需验证支付全流程',
    rollbackPlan: '恢复原支付回调处理逻辑',
    requirementIds: [],
    attachments: [],
    createdAt: getDateTimeStr(-61),
    updatedAt: getDateTimeStr(-60),
  },
  {
    id: 'ver-7',
    versionNumber: 'v2.0.0',
    title: '用户登录优化',
    status: 'released',
    releaseType: 'major',
    plannedDate: getDateStr(-90),
    actualDate: getDateStr(-88),
    owner: '张明',
    description: '优化登录流程，支持手机号验证码登录',
    affectedSystems: ['用户系统', '认证系统'],
    riskLevel: 'medium',
    riskDescription: '涉及用户认证核心流程',
    rollbackPlan: '关闭验证码登录入口，恢复原登录配置',
    requirementIds: ['req-1', 'req-2'],
    attachments: [],
    createdAt: getDateTimeStr(-100),
    updatedAt: getDateTimeStr(-88),
  },
];

export const mockTestingReports: TestingReport[] = [
  {
    id: 'test-1',
    versionId: 'ver-2',
    totalCases: 120,
    passedCases: 108,
    failedCases: 12,
    defects: [
      { id: 'def-1', title: '支付页面偶现白屏', severity: 'major', status: 'open', owner: '王强' },
      { id: 'def-2', title: '退款金额计算错误', severity: 'critical', status: 'fixed', owner: '王强' },
      { id: 'def-3', title: '支付方式选择样式错位', severity: 'minor', status: 'open', owner: '王强' },
    ],
    blockers: [
      { id: 'blk-1', title: '第三方支付接口不稳定', description: '测试环境支付回调延迟严重', owner: '王强', dueDate: getDateStr(2), status: 'open' },
    ],
    signOff: null,
  },
  {
    id: 'test-2',
    versionId: 'ver-5',
    totalCases: 45,
    passedCases: 45,
    failedCases: 0,
    defects: [],
    blockers: [],
    signOff: {
      user: '李华',
      time: getDateTimeStr(-1, 16),
      comment: '测试通过，可以发布',
    },
  },
  {
    id: 'test-3',
    versionId: 'ver-1',
    totalCases: 80,
    passedCases: 78,
    failedCases: 2,
    defects: [
      { id: 'def-4', title: '商品详情页加载慢', severity: 'minor', status: 'wontfix', owner: '王强' },
    ],
    blockers: [],
    signOff: {
      user: '李华',
      time: getDateTimeStr(-29, 18),
      comment: '遗留问题不影响发布，后续优化',
    },
  },
];

const defaultChecklistItems: ChecklistItem[] = [
  { id: 'chk-1', category: 'config', title: '环境配置检查', description: '确认生产环境配置正确', checked: false },
  { id: 'chk-2', category: 'config', title: '数据库配置', description: '确认数据库连接和参数配置', checked: false },
  { id: 'chk-3', category: 'config', title: '缓存配置', description: '确认Redis缓存配置正确', checked: false },
  { id: 'chk-4', category: 'config', title: '日志配置', description: '确认日志级别和输出配置', checked: false },
  { id: 'chk-5', category: 'notification', title: '发布通知', description: '发送发布通知邮件给相关人员', checked: false },
  { id: 'chk-6', category: 'notification', title: '客服通知', description: '通知客服团队发布时间和影响范围', checked: false },
  { id: 'chk-7', category: 'notification', title: '运维通知', description: '通知运维团队准备发布环境', checked: false },
  { id: 'chk-8', category: 'backup', title: '数据库备份', description: '备份相关数据库表', checked: false },
  { id: 'chk-9', category: 'backup', title: '配置文件备份', description: '备份当前配置文件', checked: false },
  { id: 'chk-10', category: 'backup', title: '代码备份', description: '备份当前版本代码', checked: false },
  { id: 'chk-11', category: 'grayscale', title: '灰度比例设置', description: '设置灰度发布比例', checked: false },
  { id: 'chk-12', category: 'grayscale', title: '灰度用户范围', description: '确认灰度用户范围配置', checked: false },
  { id: 'chk-13', category: 'grayscale', title: '监控配置', description: '配置灰度监控指标', checked: false },
  { id: 'chk-14', category: 'grayscale', title: '回滚预案', description: '确认回滚方案和步骤', checked: false },
];

export const mockChecklists: Checklist[] = [
  {
    id: 'cl-1',
    versionId: 'ver-5',
    items: defaultChecklistItems.map(item => ({ ...item, checked: true })),
  },
  {
    id: 'cl-2',
    versionId: 'ver-2',
    items: defaultChecklistItems.map(item => ({
      ...item,
      checked: item.category === 'config' || item.category === 'backup',
    })),
  },
  {
    id: 'cl-3',
    versionId: 'ver-4',
    items: defaultChecklistItems,
  },
];

export const mockApprovals: Approval[] = [
  {
    id: 'appr-1',
    versionId: 'ver-2',
    user: '陈发布',
    status: 'approved',
    comment: '发布范围明确，风险可控，同意发布',
    createdAt: getDateTimeStr(-5, 14),
  },
  {
    id: 'appr-2',
    versionId: 'ver-3',
    user: '陈发布',
    status: 'approved',
    comment: '功能简单，同意发布',
    createdAt: getDateTimeStr(-3, 10),
  },
  {
    id: 'appr-3',
    versionId: 'ver-4',
    user: '陈发布',
    status: 'approved',
    comment: '大版本升级，需充分测试和灰度发布',
    createdAt: getDateTimeStr(-2, 15),
  },
];

export const mockReleaseRecords: ReleaseRecord[] = [
  {
    id: 'rec-1',
    versionId: 'ver-1',
    timeline: [
      { id: 'tl-1', time: getDateTimeStr(-30, 9), title: '开始发布', description: '开始部署新版本', user: '王强' },
      { id: 'tl-2', time: getDateTimeStr(-30, 10), title: '部署完成', description: '所有服务部署完成', user: '王强' },
      { id: 'tl-3', time: getDateTimeStr(-30, 11), title: '验证通过', description: '功能验证通过', user: '李华' },
      { id: 'tl-4', time: getDateTimeStr(-30, 12), title: '发布完成', description: '发布成功，通知相关人员', user: '陈发布' },
    ],
    participants: ['张明', '李华', '王强', '陈发布'],
    result: 'success',
    reviewConclusion: '发布顺利，遗留问题后续优化',
    releasedAt: getDateTimeStr(-30, 12),
  },
  {
    id: 'rec-2',
    versionId: 'ver-7',
    timeline: [
      { id: 'tl-5', time: getDateTimeStr(-90, 9), title: '开始发布', description: '开始部署新版本', user: '王强' },
      { id: 'tl-6', time: getDateTimeStr(-90, 10), title: '部署完成', description: '所有服务部署完成', user: '王强' },
      { id: 'tl-7', time: getDateTimeStr(-90, 11), title: '验证通过', description: '功能验证通过', user: '李华' },
      { id: 'tl-8', time: getDateTimeStr(-90, 12), title: '发布完成', description: '发布成功', user: '陈发布' },
    ],
    participants: ['张明', '李华', '王强', '陈发布'],
    result: 'success',
    reviewConclusion: '登录优化效果显著，用户反馈良好',
    releasedAt: getDateTimeStr(-90, 12),
  },
  {
    id: 'rec-3',
    versionId: 'ver-6',
    timeline: [
      { id: 'tl-9', time: getDateTimeStr(-60, 18), title: '开始发布', description: '紧急修复发布', user: '王强' },
      { id: 'tl-10', time: getDateTimeStr(-60, 19), title: '部署完成', description: '服务部署完成', user: '王强' },
      { id: 'tl-11', time: getDateTimeStr(-60, 20), title: '发现问题', description: '发现新的支付异常', user: '李华' },
      { id: 'tl-12', time: getDateTimeStr(-60, 21), title: '执行回滚', description: '回滚到上一版本', user: '王强' },
    ],
    participants: ['王强', '李华', '陈发布'],
    result: 'failed',
    reviewConclusion: '修复方案不完整，需重新评估',
    releasedAt: getDateTimeStr(-60, 21),
  },
];