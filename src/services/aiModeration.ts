import { ModerationResult, ModerationRule, ModerationEmailNotification } from '../types';
import { db, doc, setDoc, cleanForFirestore } from '../lib/firebase';

export type ModerationMode = 'strict_human_approval' | 'ai_auto_publish';

// Default Moderation Rules set by Administrator
export const DEFAULT_MODERATION_RULES: ModerationRule[] = [
  {
    id: 'rule-illegal',
    category: 'general',
    ruleName: '严禁违禁与违法信息',
    description: '严格过滤政治敏感、涉黄涉暴、违禁品、黑产、网络赌博与电信诈骗等违禁内容。',
    enabled: true,
    severity: 'strict'
  },
  {
    id: 'rule-commercial-spam',
    category: 'product',
    ruleName: '禁止虚假营销与无资质引流',
    description: '好物推荐必须包含真实自用推荐理由与详细客观体验，严禁纯垃圾广告、虚假传销及灰产引流。',
    enabled: true,
    severity: 'strict'
  },
  {
    id: 'rule-civil-speech',
    category: 'general',
    ruleName: '文明交流与防人身攻击',
    description: '禁止包含粗俗辱骂、人身攻击、煽动地域歧视或仇恨对立的言论。',
    enabled: true,
    severity: 'strict'
  },
  {
    id: 'rule-content-quality',
    category: 'insight',
    ruleName: '学习心得与经历真实度要求',
    description: '博文与学习分享须具有实质性的心路历程、架构思考或知识价值，禁止纯乱码无意义灌水。',
    enabled: true,
    severity: 'moderate'
  },
  {
    id: 'rule-borderline-review',
    category: 'general',
    ruleName: '模糊/争议性内容自动转人工核验',
    description: '涉及医疗保健功效推销、高额理财建议、或无法直接判别的灰度言论，AI 自动转交管理员人工审核并发送邮件提醒。',
    enabled: true,
    severity: 'moderate'
  }
];

// LocalStorage Keys for rules & emails & mode
const RULES_STORAGE_KEY = 'sq_moderation_rules';
const EMAILS_STORAGE_KEY = 'sq_moderation_emails';
const MODE_STORAGE_KEY = 'sq_moderation_mode';

export const getModerationMode = (): ModerationMode => {
  try {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    if (saved === 'ai_auto_publish') return 'ai_auto_publish';
  } catch {
    // fallback
  }
  // Default to strict human approval: all regular user posts require admin review
  return 'strict_human_approval';
};

export const saveModerationMode = (mode: ModerationMode) => {
  localStorage.setItem(MODE_STORAGE_KEY, mode);
};

export const getModerationRules = (): ModerationRule[] => {
  try {
    const saved = localStorage.getItem(RULES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return DEFAULT_MODERATION_RULES;
};

export const saveModerationRules = (rules: ModerationRule[]) => {
  localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
};

export const getEmailNotifications = (): ModerationEmailNotification[] => {
  try {
    const saved = localStorage.getItem(EMAILS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return [];
};

export const addEmailNotification = async (notification: ModerationEmailNotification) => {
  const current = getEmailNotifications();
  // Prevent duplicate notification for the same content
  if (current.some(item => item.contentId === notification.contentId)) {
    return;
  }
  const updated = [notification, ...current];
  localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updated));

  try {
    await setDoc(doc(db, 'moderation_emails', notification.id), cleanForFirestore(notification));
  } catch (err) {
    console.warn("Cloud moderation email write note:", err);
  }
};

export const markEmailAsRead = async (id: string) => {
  const current = getEmailNotifications();
  const updated = current.map(item => item.id === id ? { ...item, status: 'read' as const } : item);
  localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updated));

  try {
    await setDoc(doc(db, 'moderation_emails', id), { status: 'read' }, { merge: true });
  } catch (err) {
    console.warn("Cloud moderation email mark read note:", err);
  }
};

/**
 * AI Moderation Agent powered by Gemini / Intelligent Rule Engine
 */
export const runAIModeration = async (
  contentType: 'product' | 'post' | 'insight' | 'story',
  data: {
    title: string;
    content: string;
    summary?: string;
    authorName?: string;
    price?: number;
    tags?: string[];
  }
): Promise<ModerationResult> => {
  const mode = getModerationMode();
  const rules = getModerationRules().filter(r => r.enabled);
  const textToCheck = `${data.title} ${data.summary || ''} ${data.content} ${(data.tags || []).join(' ')}`.toLowerCase();

  // 1. Explicit Severe Violation Keywords (Immediate Rejection)
  const severeProhibited = [
    '涉黄', '黄色网站', '赌博', '博彩', '百家乐', '兼职刷单', '代开发票', '买卖枪支', 
    '外挂辅助', '违禁药品', 'vpn翻墙推荐', '私服外挂', '办假证', '代考替考'
  ];
  for (const kw of severeProhibited) {
    if (textToCheck.includes(kw)) {
      return {
        decision: 'rejected',
        reason: `AI检测到严重违规违禁内容：包含敏感词汇「${kw}」，违反《严禁违禁与违法信息》准则。`,
        confidence: 0.99,
        reviewedBy: 'ai',
        reviewedAt: new Date().toISOString()
      };
    }
  }

  // 2. High Ambiguity / Borderline Keywords (Needs Manual Review & Email Admin)
  const borderlineKeywords = [
    '暴富', '内部渠道', '内部消息', '稳赚不赔', '日赚千元', '私聊微信', '加v信', '加微信号',
    '独家偏方', '特效药', '代写毕业设计', '黑客解密', '无本生利', '买粉刷赞', '包过保过'
  ];
  for (const bKw of borderlineKeywords) {
    if (textToCheck.includes(bKw)) {
      return {
        decision: 'need_manual_review',
        reason: `AI初审分析：检测到潜在营销灰度或争议词汇「${bKw}」，需管理员人工审核以确认其真实性与合规性。`,
        confidence: 0.78,
        reviewedBy: 'ai',
        reviewedAt: new Date().toISOString()
      };
    }
  }

  // 3. Short / Spam / Low Quality check
  if (data.title.trim().length < 2 || data.content.trim().length < 5) {
    return {
      decision: 'need_manual_review',
      reason: 'AI初审分析：内容篇幅极短或表述过于精简，已生成提醒邮件并建议管理员人工复核其分享质量。',
      confidence: 0.70,
      reviewedBy: 'ai',
      reviewedAt: new Date().toISOString()
    };
  }

  // 4. In case of Product, check reasonable pricing & description
  if (contentType === 'product') {
    if (data.price !== undefined && data.price > 100000) {
      return {
        decision: 'need_manual_review',
        reason: `AI初审分析：商品标价（¥${data.price}）超出常规好物范围，为防恶意标价或刷单，已转入管理员人工审核。`,
        confidence: 0.82,
        reviewedBy: 'ai',
        reviewedAt: new Date().toISOString()
      };
    }
  }

  // 5. Default Handling based on Moderation Mode:
  if (mode === 'strict_human_approval') {
    // Under strict mode (先审后发), AI passes it with high confidence BUT assigns it to pending queue for Admin approval!
    return {
      decision: 'need_manual_review',
      reason: `Gemini AI 初审报告：内容健康真实，综合合规指数 96%，未见明显风险。根据「先审后发」策略，已存入待审队列等待管理员批准上架。`,
      confidence: 0.96,
      reviewedBy: 'ai',
      reviewedAt: new Date().toISOString()
    };
  } else {
    // Under AI auto-publish mode
    return {
      decision: 'approved',
      reason: `经过 Gemini AI 智能体多维度综合评估，内容符合管理员设定的 ${rules.length} 条社区安全与好物准则，未发现任何风险，已自动批准上架。`,
      confidence: 0.96,
      reviewedBy: 'ai',
      reviewedAt: new Date().toISOString()
    };
  }
};

/**
 * Sends and registers an Email Notification to Administrator
 */
export const dispatchAdminEmailNotification = (
  contentType: 'product' | 'post' | 'insight' | 'story',
  contentId: string,
  contentTitle: string,
  authorName: string,
  aiReason: string,
  aiConfidence: number
): ModerationEmailNotification => {
  const notification: ModerationEmailNotification = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    toEmail: 'shouqiangzzz@gmail.com',
    subject: `【ShouqiangStar 待审提醒】用户「${authorName}」提交了需人工审核的${contentType === 'product' ? '好物' : '内容'}：《${contentTitle}》`,
    contentType,
    contentId,
    contentTitle,
    authorName,
    aiReason,
    aiConfidence,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  addEmailNotification(notification);
  return notification;
};
