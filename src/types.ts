export type StepCategory = 'core' | 'navigation' | 'analytics' | 'collaboration';

export interface OnboardingStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  category: StepCategory;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  actionPrompt?: string;
  actionType?: 'click' | 'type' | 'filter' | 'toggle' | 'none';
  autoAdvance?: boolean;
  badge?: string;
  keyInsight?: string;
  estimatedSeconds: number;
}

export type OnboardingRole = 'starter' | 'power-user' | 'analyst';

export interface BadgeAchievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAtStepCount: number;
  isUnlocked: boolean;
}

export interface WorkspaceProject {
  id: string;
  title: string;
  category: string;
  status: 'In Progress' | 'Completed' | 'Review';
  priority: 'High' | 'Medium' | 'Low';
  progress: number;
  dueDate: string;
  members: string[];
}
