import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles, 
  Lightbulb, 
  RotateCcw,
  Zap,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Command,
  ChevronDown,
  ChevronUp,
  Bot,
  Volume2,
  VolumeX
} from 'lucide-react';
import { OnboardingStep, OnboardingRole } from '../types';
import { soundManager } from '../utils/audioFeedback';

export interface ProTipData {
  proTip: string;
  shortcut?: string;
  efficiencyGain?: string;
  source?: string;
}

interface SpotlightOverlayProps {
  step: OnboardingStep | null;
  stepIndex: number;
  totalSteps: number;
  completedStepIds: string[];
  userRole?: OnboardingRole;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onStepComplete: (stepId: string) => void;
  onClose: () => void;
}

interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
  step,
  stepIndex,
  totalSteps,
  completedStepIds,
  userRole = 'starter',
  onNext,
  onPrev,
  onSkip,
  onStepComplete,
  onClose,
}) => {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [placement, setPlacement] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [actionSuccess, setActionSuccess] = useState(false);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(() => soundManager.isEnabled());
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Sync sound manager enabled state
  useEffect(() => {
    return soundManager.subscribe(setAudioEnabled);
  }, []);

  // Cancel auto-advance if user wants to stay on current step
  const handleCancelAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setAutoAdvancing(false);
  }, []);

  const triggerNext = useCallback(() => {
    handleCancelAutoAdvance();
    if (stepIndex === totalSteps - 1) {
      soundManager.playTourComplete();
    } else {
      soundManager.playStepNext();
    }
    onNext();
  }, [handleCancelAutoAdvance, onNext, stepIndex, totalSteps]);

  const triggerPrev = useCallback(() => {
    handleCancelAutoAdvance();
    soundManager.playStepPrev();
    onPrev();
  }, [handleCancelAutoAdvance, onPrev]);

  const triggerClose = useCallback(() => {
    handleCancelAutoAdvance();
    onClose();
  }, [handleCancelAutoAdvance, onClose]);

  // AI Pro-tip states
  const [proTipMap, setProTipMap] = useState<Record<string, ProTipData>>({});
  const proTipMapRef = useRef<Record<string, ProTipData>>({});
  const [loadingStepId, setLoadingStepId] = useState<string | null>(null);
  const [isProTipExpanded, setIsProTipExpanded] = useState(true);

  // Fetch contextual Pro-tip from server-side Gemini API
  const fetchProTip = useCallback(async (targetStep: OnboardingStep, force = false) => {
    if (!targetStep) return;
    if (!force && proTipMapRef.current[targetStep.id]) return;

    setLoadingStepId(targetStep.id);
    try {
      const response = await fetch('/api/pro-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: targetStep.id,
          stepTitle: targetStep.title,
          stepDescription: targetStep.description,
          stepCategory: targetStep.category,
          actionPrompt: targetStep.actionPrompt,
          keyInsight: targetStep.keyInsight,
          userRole: userRole || 'starter',
          force,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const tipEntry: ProTipData = {
          proTip: data.proTip,
          shortcut: data.shortcut,
          efficiencyGain: data.efficiencyGain,
          source: data.source,
        };
        proTipMapRef.current[targetStep.id] = tipEntry;
        setProTipMap((prev) => ({
          ...prev,
          [targetStep.id]: tipEntry,
        }));
      }
    } catch {
      // Gracefully handle network failures without logging noisy errors
    } finally {
      setLoadingStepId((curr) => (curr === targetStep.id ? null : curr));
    }
  }, [userRole]);

  // Trigger pro-tip fetch when current step changes
  useEffect(() => {
    if (step) {
      fetchProTip(step);
    }
  }, [step?.id, fetchProTip]);

  // Update target bounding client rect
  const updateTargetRect = useCallback(() => {
    if (!step) {
      setTargetRect(null);
      return;
    }

    const el = document.getElementById(step.targetId);
    if (!el) {
      // Fallback: center in viewport if element not found
      setTargetRect({
        x: window.innerWidth / 2 - 150,
        y: window.innerHeight / 2 - 100,
        width: 300,
        height: 200,
        top: window.innerHeight / 2 - 100,
        bottom: window.innerHeight / 2 + 100,
        left: window.innerWidth / 2 - 150,
        right: window.innerWidth / 2 + 150,
      });
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;
    const computed = {
      x: Math.max(4, rect.left - padding),
      y: Math.max(4, rect.top - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      top: rect.top - padding,
      bottom: rect.bottom + padding,
      left: rect.left - padding,
      right: rect.right + padding,
    };
    setTargetRect(computed);
  }, [step]);

  // Position tooltip based on target rect and available space
  useEffect(() => {
    if (!targetRect || !step) return;

    const margin = 16;
    const tooltipWidth = 380;
    const tooltipHeight = 280; // approximate
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    let preferred = step.position || 'bottom';
    let chosen = preferred;

    // Check collision for chosen placement
    if (chosen === 'bottom' && targetRect.bottom + tooltipHeight + margin > winHeight) {
      chosen = targetRect.top > tooltipHeight + margin ? 'top' : 'bottom';
    } else if (chosen === 'top' && targetRect.top - tooltipHeight - margin < 0) {
      chosen = targetRect.bottom + tooltipHeight + margin < winHeight ? 'bottom' : 'top';
    }

    let top = 0;
    let left = 0;

    if (chosen === 'bottom') {
      top = Math.min(targetRect.bottom + margin, winHeight - tooltipHeight - 16);
      left = Math.max(16, Math.min(targetRect.x + targetRect.width / 2 - tooltipWidth / 2, winWidth - tooltipWidth - 16));
    } else if (chosen === 'top') {
      top = Math.max(16, targetRect.y - tooltipHeight - margin);
      left = Math.max(16, Math.min(targetRect.x + targetRect.width / 2 - tooltipWidth / 2, winWidth - tooltipWidth - 16));
    } else if (chosen === 'left') {
      left = Math.max(16, targetRect.x - tooltipWidth - margin);
      top = Math.max(16, Math.min(targetRect.y + targetRect.height / 2 - tooltipHeight / 2, winHeight - tooltipHeight - 16));
    } else if (chosen === 'right') {
      left = Math.min(targetRect.right + margin, winWidth - tooltipWidth - 16);
      top = Math.max(16, Math.min(targetRect.y + targetRect.height / 2 - tooltipHeight / 2, winHeight - tooltipHeight - 16));
    }

    setPlacement(chosen);
    setTooltipPos({ top, left });
  }, [targetRect, step]);

  // Scroll element into view smoothly if offscreen
  useEffect(() => {
    if (!step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
    // Reset action success status & auto-advance timer for new step
    setActionSuccess(false);
    setAutoAdvancing(false);
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    // Initial update
    const timer = setTimeout(updateTargetRect, 80);
    return () => clearTimeout(timer);
  }, [step, updateTargetRect]);

  // Listen to window resize and scroll
  useEffect(() => {
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    const observer = new ResizeObserver(updateTargetRect);
    if (step) {
      const el = document.getElementById(step.targetId);
      if (el) observer.observe(el);
    }

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
      observer.disconnect();
    };
  }, [step, updateTargetRect]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        triggerNext();
      } else if (e.key === 'ArrowLeft') {
        triggerPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerNext, triggerPrev, triggerClose]);

  // Smart action detection: listen for user actions on the target element
  useEffect(() => {
    if (!step || step.actionType === 'none') return;
    const el = document.getElementById(step.targetId);
    if (!el) return;

    let advanceTimeout: NodeJS.Timeout | null = null;

    const handleAction = () => {
      soundManager.playTaskComplete();
      setActionSuccess(true);
      onStepComplete(step.id);

      // Auto-advance feature: automatically triggers handleNext when required action is completed
      if (step.autoAdvance) {
        setAutoAdvancing(true);
        if (autoAdvanceTimerRef.current) {
          clearTimeout(autoAdvanceTimerRef.current);
        }
        advanceTimeout = setTimeout(() => {
          if (stepIndex === totalSteps - 1) {
            soundManager.playTourComplete();
          } else {
            soundManager.playStepNext();
          }
          onNext();
          setAutoAdvancing(false);
          setActionSuccess(false);
          autoAdvanceTimerRef.current = null;
        }, 1000);
        autoAdvanceTimerRef.current = advanceTimeout;
      } else {
        setTimeout(() => {
          setActionSuccess(false);
        }, 1500);
      }
    };

    if (step.actionType === 'click') {
      el.addEventListener('click', handleAction, { once: true });
      return () => {
        el.removeEventListener('click', handleAction);
        if (advanceTimeout) clearTimeout(advanceTimeout);
      };
    } else if (step.actionType === 'type') {
      el.addEventListener('input', handleAction, { once: true });
      return () => {
        el.removeEventListener('input', handleAction);
        if (advanceTimeout) clearTimeout(advanceTimeout);
      };
    } else if (step.actionType === 'filter') {
      el.addEventListener('click', handleAction, { once: true });
      return () => {
        el.removeEventListener('click', handleAction);
        if (advanceTimeout) clearTimeout(advanceTimeout);
      };
    }

    return () => {
      if (advanceTimeout) clearTimeout(advanceTimeout);
    };
  }, [step, onStepComplete, onNext, stepIndex, totalSteps]);

  if (!step || !targetRect) return null;

  const isCompleted = completedStepIds.includes(step.id);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <div id="smart-onboarding-overlay" className="fixed inset-0 z-50 pointer-events-none">
      {/* SVG Mask for dynamic spotlight with backdrop blur */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300">
        <defs>
          <mask id="spotlight-mask">
            {/* White covers entire viewport */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black hole cuts out the target element */}
            <rect
              x={targetRect.x}
              y={targetRect.y}
              width={targetRect.width}
              height={targetRect.height}
              rx="12"
              ry="12"
              fill="black"
            />
          </mask>
        </defs>

        {/* Dark backdrop masked by the spotlight cutout */}
        <rect
          x="0"
          y="0"
          width="100%" height="100%"
          fill="rgba(15, 23, 42, 0.65)"
          mask="url(#spotlight-mask)"
          className="backdrop-blur-[2px] transition-all duration-300"
        />
      </svg>

      {/* Target Focus Ring & Interactive Beacon */}
      <motion.div
        layoutId="spotlight-active-ring"
        initial={false}
        animate={{
          x: targetRect.x,
          y: targetRect.y,
          width: targetRect.width,
          height: targetRect.height,
        }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="absolute pointer-events-none rounded-xl border-2 border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.25),0_0_25px_rgba(59,130,246,0.35)]"
      >
        {/* Pulsing Beacon Dot */}
        <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
        </div>
      </motion.div>

      {/* Clickable passthrough zone over target so users can actually interact with the highlighted element */}
      <div
        id="tour-target-passthrough"
        className="absolute pointer-events-none"
        style={{
          left: `${targetRect.x}px`,
          top: `${targetRect.y}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
        }}
        title="Interactive target"
      />

      {/* Interactive Tooltip Card */}
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          top: `${tooltipPos.top}px`,
          left: `${tooltipPos.left}px`,
        }}
        className="absolute pointer-events-auto w-[400px] max-w-[calc(100vw-32px)] max-h-[88vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-5 z-50 text-slate-800 dark:text-slate-100"
      >
        {/* Pointer indicator arrow */}
        <div
          className={`absolute w-3 h-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transform rotate-45 ${
            placement === 'bottom'
              ? '-top-1.5 left-1/2 -translate-x-1/2 border-t border-l'
              : placement === 'top'
              ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r'
              : placement === 'right'
              ? '-left-1.5 top-1/2 -translate-y-1/2 border-b border-l'
              : '-right-1.5 top-1/2 -translate-y-1/2 border-t border-r'
          }`}
        />

        {/* Header: Step pill & Dismiss */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              Step {stepIndex + 1} of {totalSteps}
            </span>
            {step.badge && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {step.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="flex items-center text-[11px] text-slate-400 dark:text-slate-500 font-mono mr-1">
              <Clock className="w-3 h-3 mr-1" />
              ~{step.estimatedSeconds}s
            </span>
            <button
              id="tour-btn-sound-toggle"
              onClick={() => soundManager.toggle()}
              className={`p-1 rounded-lg transition-colors ${
                audioEnabled
                  ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={audioEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              aria-label={audioEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              id="tour-btn-dismiss"
              onClick={triggerClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close guide (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Title & Description */}
        <div className="mb-3.5">
          <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {step.title}
            {isCompleted && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Live Action Prompt with Real-time Success Notification & Auto-Advance */}
        {step.actionPrompt && (
          <div className="mb-3">
            <div
              id="spotlight-action-box"
              className={`p-2.5 rounded-xl text-xs flex items-start gap-2.5 border transition-all duration-300 ${
                actionSuccess
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                  : 'bg-amber-50/80 border-amber-200/80 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/60 dark:text-amber-200'
              }`}
            >
              {actionSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5 animate-bounce" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-semibold block truncate">
                    {actionSuccess ? 'Action completed!' : 'Try it live now:'}
                  </span>

                  {/* Auto-advance configuration indicator */}
                  {step.autoAdvance && !actionSuccess && (
                    <span
                      id="badge-auto-advance"
                      className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex-shrink-0"
                      title="This step will automatically advance when you complete the action"
                    >
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      Auto-advance
                    </span>
                  )}

                  {/* Cancel button if currently auto-advancing */}
                  {autoAdvancing && (
                    <button
                      id="btn-cancel-auto-advance"
                      onClick={handleCancelAutoAdvance}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100 underline font-medium flex-shrink-0 ml-1"
                      title="Cancel automatic advance and stay on this step"
                    >
                      Stay on step
                    </button>
                  )}
                </div>

                <span className="text-[11px] leading-snug block">
                  {actionSuccess
                    ? autoAdvancing
                      ? 'Live action detected! Auto-advancing to next step...'
                      : 'Great job! Live interaction detected on this component.'
                    : step.actionPrompt}
                </span>

                {/* Visual countdown progress bar when auto-advancing */}
                {autoAdvancing && (
                  <div className="w-full bg-emerald-200/80 dark:bg-emerald-900/70 h-1.5 rounded-full overflow-hidden mt-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, ease: 'linear' }}
                      className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Context-Aware AI Pro-tip Feature Powered by Gemini */}
        <div className="mb-3.5">
          <div
            id="spotlight-pro-tip-card"
            className="rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-blue-50/50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/60 p-3 shadow-xs relative overflow-hidden transition-all duration-200"
          >
            {/* Top decorative aura */}
            <div className="absolute top-0 right-0 w-24 h-12 bg-gradient-to-bl from-purple-400/20 to-transparent blur-lg pointer-events-none" />

            {/* Header row */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 tracking-tight flex items-center gap-1">
                  AI Pro-Tip
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300">
                    Gemini AI
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  id="btn-refresh-pro-tip"
                  onClick={() => {
                    if (step) {
                      soundManager.playProTipChime();
                      fetchProTip(step, true);
                    }
                  }}
                  disabled={loadingStepId === step.id}
                  className="p-1 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 transition-colors disabled:opacity-50"
                  title="Generate fresh AI hint"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStepId === step.id ? 'animate-spin' : ''}`} />
                </button>
                <button
                  id="btn-toggle-pro-tip"
                  onClick={() => setIsProTipExpanded(!isProTipExpanded)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                  title={isProTipExpanded ? 'Collapse pro-tip' : 'Expand pro-tip'}
                >
                  {isProTipExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Pro-tip Content Body */}
            {isProTipExpanded && (
              <div>
                {loadingStepId === step.id && !proTipMap[step.id] ? (
                  <div className="py-2 space-y-1.5 animate-pulse">
                    <div className="h-3 bg-indigo-200/70 dark:bg-indigo-900/50 rounded-full w-3/4" />
                    <div className="h-3 bg-indigo-200/50 dark:bg-indigo-900/30 rounded-full w-5/6" />
                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 flex items-center gap-1 pt-1">
                      <Zap className="w-3 h-3 animate-bounce" />
                      Gemini is generating contextual power-tips for {step.title}...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 mt-1">
                    <p className="text-xs text-indigo-950 dark:text-indigo-100 leading-relaxed font-normal">
                      {proTipMap[step.id]?.proTip || step.keyInsight || 'Use keyboard shortcuts and quick actions to accelerate your daily workflow.'}
                    </p>

                    {/* Metadata chips: Shortcut & Efficiency Gain */}
                    {(proTipMap[step.id]?.shortcut || proTipMap[step.id]?.efficiencyGain) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {proTipMap[step.id]?.shortcut && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-indigo-200/60 dark:border-indigo-800 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs">
                            <Command className="w-2.5 h-2.5" />
                            {proTipMap[step.id]?.shortcut}
                          </span>
                        )}

                        {proTipMap[step.id]?.efficiencyGain && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                            {proTipMap[step.id]?.efficiencyGain}
                          </span>
                        )}

                        <span className="text-[9px] text-slate-400 dark:text-slate-500 ml-auto flex items-center gap-0.5">
                          ✨ Contextual AI hint
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Key Insight Box */}
        {step.keyInsight && (
          <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{step.keyInsight}</span>
          </div>
        )}

        {/* Progress Dots Indicator */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === stepIndex
                    ? 'w-5 bg-blue-600'
                    : completedStepIds.includes(String(idx)) || idx < stepIndex
                    ? 'w-2 bg-emerald-500'
                    : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Action Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              id="tour-btn-prev"
              onClick={triggerPrev}
              disabled={isFirst}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center transition-colors ${
                isFirst
                  ? 'border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-600 cursor-not-allowed'
                  : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Previous step (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="tour-btn-next"
              onClick={triggerNext}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-sm shadow-blue-500/30 flex items-center gap-1.5 transition-all"
            >
              <span>{isLast ? 'Complete Tour' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer shortcuts hint */}
        <div className="mt-2 pt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
          <span>Shortcuts: ← / → or Esc</span>
          <button
            id="tour-btn-skip"
            onClick={triggerClose}
            className="hover:underline text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            Skip all
          </button>
        </div>
      </motion.div>
    </div>
  );
};
