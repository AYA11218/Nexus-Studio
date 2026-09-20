import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Compass, ArrowRight, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { OnboardingStep } from '../types';

interface ResumeTourNotificationProps {
  isOpen: boolean;
  currentStep: OnboardingStep | null;
  currentStepIndex: number;
  totalSteps: number;
  completedCount: number;
  awayDurationText?: string;
  onResume: () => void;
  onDismiss: () => void;
  onRestart: () => void;
}

export const ResumeTourNotification: React.FC<ResumeTourNotificationProps> = ({
  isOpen,
  currentStep,
  currentStepIndex,
  totalSteps,
  completedCount,
  awayDurationText,
  onResume,
  onDismiss,
  onRestart,
}) => {
  if (!isOpen || !currentStep) return null;

  const progressPercent = Math.round((completedCount / (totalSteps || 1)) * 100);

  return (
    <AnimatePresence>
      <motion.div
        id="resume-tour-notification"
        initial={{ opacity: 0, y: -24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.95 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-blue-200/80 dark:border-blue-900/60 p-4 text-slate-800 dark:text-slate-100"
      >
        {/* Accent Glow Line */}
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 shadow-sm">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  Welcome Back
                </span>
                {awayDurationText && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {awayDurationText}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                Resume where you left off?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                You were on <span className="font-semibold text-blue-600 dark:text-blue-400">Step {currentStepIndex + 1}: {currentStep.title}</span>. Your progress has been saved.
              </p>
            </div>
          </div>

          <button
            id="btn-dismiss-resume"
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mini progress bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Progress: {completedCount} of {totalSteps} steps</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 pt-2 flex items-center justify-between gap-2">
          <button
            id="btn-restart-from-resume"
            onClick={onRestart}
            className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            Restart tour
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-not-now-resume"
              onClick={onDismiss}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              Not now
            </button>
            <button
              id="btn-confirm-resume"
              onClick={onResume}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Tour</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
