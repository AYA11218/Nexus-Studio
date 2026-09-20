import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Compass, 
  Zap, 
  Award,
  Layers
} from 'lucide-react';
import { BadgeAchievement, OnboardingRole } from '../types';

interface OnboardingCelebrationModalProps {
  isOpen: boolean;
  badges: BadgeAchievement[];
  userRole: OnboardingRole;
  onClose: () => void;
  onRestart: () => void;
  onChangeRole: (role: OnboardingRole) => void;
}

export const OnboardingCelebrationModal: React.FC<OnboardingCelebrationModalProps> = ({
  isOpen,
  badges,
  userRole,
  onClose,
  onRestart,
  onChangeRole,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Second delayed burst for extra delight
        const timer = setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Confetti failed to trigger:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100"
        >
          {/* Top Decorative Banner */}
          <div className="p-6 pb-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 transform -translate-x-4 translate-y-4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md shadow-inner border border-white/20 mb-3">
              <Trophy className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight">
              Onboarding Complete!
            </h2>
            <p className="mt-1 text-sm text-blue-100 max-w-xs mx-auto">
              You’ve successfully mastered all key workspace tools, workflows, and interactive capabilities.
            </p>
          </div>

          {/* Body stats and unlocked achievements */}
          <div className="p-6 space-y-5">
            {/* Quick stats grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="block text-2xl font-extrabold text-blue-600 dark:text-blue-400">100%</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="block text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{badges.filter(b => b.isUnlocked).length}</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Badges Won</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="block text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">Ready</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workspace</span>
              </div>
            </div>

            {/* Badges unlocked section */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Unlocked Achievements
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  All badges claimed
                </span>
              </div>

              <div className="space-y-2">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        {b.iconName === 'Compass' ? (
                          <Compass className="w-4 h-4" />
                        ) : b.iconName === 'Zap' ? (
                          <Zap className="w-4 h-4" />
                        ) : (
                          <Award className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          {b.title}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {b.description}
                        </span>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Change persona suggestion */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                Try another persona track:
              </span>
              <select
                value={userRole}
                onChange={(e) => {
                  onChangeRole(e.target.value as OnboardingRole);
                  onClose();
                }}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="starter">Standard Tour</option>
                <option value="power-user">Productivity & Actions</option>
                <option value="analyst">Data & Metrics</option>
              </select>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              id="modal-btn-restart"
              onClick={onRestart}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Walkthrough</span>
            </button>

            <button
              id="modal-btn-explore"
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
            >
              <span>Explore Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
