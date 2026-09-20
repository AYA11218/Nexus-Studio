import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  RotateCcw, 
  Award, 
  Sparkles, 
  Compass, 
  Zap, 
  CheckCheck,
  ChevronRight,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import { OnboardingStep, BadgeAchievement, OnboardingRole } from '../types';
import { ROLE_TRACKS } from '../data/onboardingSteps';

interface ProgressTrackerDrawerProps {
  steps: OnboardingStep[];
  currentStepIndex: number;
  completedStepIds: string[];
  badges: BadgeAchievement[];
  isTourActive: boolean;
  userRole: OnboardingRole;
  onSelectStep: (index: number) => void;
  onStartTour: () => void;
  onRestartTour: () => void;
  onChangeRole: (role: OnboardingRole) => void;
}

export const ProgressTrackerDrawer: React.FC<ProgressTrackerDrawerProps> = ({
  steps,
  currentStepIndex,
  completedStepIds,
  badges,
  isTourActive,
  userRole,
  onSelectStep,
  onStartTour,
  onRestartTour,
  onChangeRole,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'checklist' | 'badges'>('checklist');

  const totalSteps = steps.length;
  // Completed count based on step IDs currently marked complete
  const completedCount = steps.filter((s) => completedStepIds.includes(s.id)).length;
  const progressPercent = Math.round((completedCount / (totalSteps || 1)) * 100);
  const isFinished = completedCount === totalSteps;

  // Icon mapping helper for badges
  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-4 h-4 text-blue-500" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Award':
        return <Award className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-3 text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span className="text-xs font-semibold tracking-wide uppercase text-blue-100">
                    Smart Onboarding Flow
                  </span>
                </div>
                <h4 className="text-base font-bold mt-0.5">Workspace Guide</h4>
              </div>

              <button
                id="tracker-collapse-btn"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                title="Collapse drawer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Circular Progress Gauge & Track Overview */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-4">
                {/* Circular Progress Gauge */}
                <div
                  id="circular-progress-gauge"
                  className="relative flex-shrink-0 flex items-center justify-center"
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Onboarding track completion: ${progressPercent}%`}
                >
                  <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 84 84">
                    <defs>
                      <linearGradient id="drawerGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={isFinished ? "#10b981" : "#3b82f6"} />
                        <stop offset="100%" stopColor={isFinished ? "#059669" : "#6366f1"} />
                      </linearGradient>
                      <filter id="drawerGaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow
                          dx="0"
                          dy="1"
                          stdDeviation="2"
                          floodColor={isFinished ? "#10b981" : "#3b82f6"}
                          floodOpacity="0.25"
                        />
                      </filter>
                    </defs>

                    {/* Track background circle */}
                    <circle
                      cx="42"
                      cy="42"
                      r="35"
                      strokeWidth="7"
                      fill="none"
                      className="stroke-slate-200 dark:stroke-slate-700/80"
                    />

                    {/* Gauge meter arc */}
                    <motion.circle
                      cx="42"
                      cy="42"
                      r="35"
                      strokeWidth="7"
                      fill="none"
                      stroke="url(#drawerGaugeGradient)"
                      strokeLinecap="round"
                      filter="url(#drawerGaugeGlow)"
                      initial={{ strokeDashoffset: 219.91 }}
                      animate={{
                        strokeDashoffset:
                          219.91 - (219.91 * Math.min(100, Math.max(0, progressPercent))) / 100,
                      }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      style={{
                        strokeDasharray: 219.91,
                      }}
                    />
                  </svg>

                  {/* Centered value / icon */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                    {isFinished ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-0.5" />
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          100%
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                          {progressPercent}%
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                          Progress
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Track Details & Status next to Gauge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isFinished
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {isFinished ? (
                        <>
                          <Award className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Track Complete
                        </>
                      ) : (
                        <>
                          <Compass className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          In Progress
                        </>
                      )}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {ROLE_TRACKS[userRole]?.label || 'Onboarding Track'}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {completedCount} of {totalSteps} tasks completed
                    {!isFinished && totalSteps > completedCount && (
                      <span> ({totalSteps - completedCount} remaining)</span>
                    )}
                  </p>

                  {/* Micro track horizontal accent line */}
                  <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-1.5 rounded-full overflow-hidden mt-2">
                    <motion.div
                      className={`h-full rounded-full ${
                        isFinished
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              {/* Role Track Selector */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  Active Track:
                </span>
                <select
                  id="tracker-role-selector"
                  value={userRole}
                  onChange={(e) => onChangeRole(e.target.value as OnboardingRole)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-xs"
                >
                  <option value="starter">Standard (6 steps)</option>
                  <option value="power-user">Productivity (3 steps)</option>
                  <option value="analyst">Data & Metrics (3 steps)</option>
                </select>
              </div>
            </div>

            {/* Navigation Tabs (Checklist vs Achievements) */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
              <button
                id="tab-checklist"
                onClick={() => setActiveTab('checklist')}
                className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'checklist'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/40 dark:bg-blue-950/20'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Step Checklist ({completedCount}/{totalSteps})
              </button>
              <button
                id="tab-badges"
                onClick={() => setActiveTab('badges')}
                className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'badges'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/40 dark:bg-blue-950/20'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Badges ({badges.filter((b) => b.isUnlocked).length}/{badges.length})
              </button>
            </div>

            {/* Tab Body */}
            <div className="max-h-72 overflow-y-auto p-3 space-y-1.5">
              {activeTab === 'checklist' ? (
                steps.map((step, idx) => {
                  const isDone = completedStepIds.includes(step.id);
                  const isCurrent = isTourActive && currentStepIndex === idx;

                  return (
                    <button
                      key={step.id}
                      id={`checklist-step-${idx}`}
                      onClick={() => {
                        onSelectStep(idx);
                        if (!isTourActive) onStartTour();
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-3 transition-all ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 shadow-sm'
                          : isDone
                          ? 'bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          </div>
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate flex items-center justify-between">
                          <span className={isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                            {idx + 1}. {step.title}
                          </span>
                          {step.badge && (
                            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ml-1">
                              {step.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {step.actionPrompt || step.description}
                        </p>
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    </button>
                  );
                })
              ) : (
                <div className="space-y-2 py-1">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                        badge.isUnlocked
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-50/40 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        badge.isUnlocked
                          ? 'bg-emerald-100 dark:bg-emerald-900/40'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        {renderBadgeIcon(badge.iconName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {badge.title}
                          </span>
                          {badge.isUnlocked ? (
                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                              Unlocked
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              Requires {badge.unlockedAtStepCount} steps
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Quick Actions */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                id="tracker-restart-btn"
                onClick={onRestartTour}
                className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1.5 px-2.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Walkthrough</span>
              </button>

              {!isTourActive && (
                <button
                  id="tracker-resume-btn"
                  onClick={onStartTour}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-1.5 px-3 rounded-lg shadow-sm shadow-blue-500/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isFinished ? 'Replay Guide' : 'Resume Guide'}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Floating Launch Pill / Widget */}
      <motion.button
        id="tracker-pill-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-full shadow-2xl hover:shadow-blue-500/20 border border-slate-700 dark:border-slate-200 font-medium text-xs sm:text-sm transition-all"
      >
        {/* Animated circular progress indicator */}
        <div className="relative flex items-center justify-center w-6 h-6">
          <svg className="w-6 h-6 transform -rotate-90">
            <circle
              cx="12"
              cy="12"
              r="9"
              className="text-slate-700 dark:text-slate-300 stroke-current"
              strokeWidth="2.5"
              fill="transparent"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              className="text-blue-500 stroke-current transition-all duration-500"
              strokeWidth="2.5"
              strokeDasharray={56.5}
              strokeDashoffset={56.5 - (56.5 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute text-[8px] font-bold">
            {isFinished ? '✓' : `${progressPercent}%`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>Smart Onboarding</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500 text-white">
            {completedCount}/{totalSteps}
          </span>
        </div>

        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        )}
      </motion.button>
    </div>
  );
};
