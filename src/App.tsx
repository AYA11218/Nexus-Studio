import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { OnboardingRole, OnboardingStep, BadgeAchievement, WorkspaceProject } from './types';
import { STARTER_STEPS, ROLE_TRACKS, INITIAL_BADGES } from './data/onboardingSteps';
import { INITIAL_PROJECTS } from './data/mockProjects';
import { AppWorkspace } from './components/AppWorkspace';
import { SpotlightOverlay } from './components/SpotlightOverlay';
import { ProgressTrackerDrawer } from './components/ProgressTrackerDrawer';
import { OnboardingCelebrationModal } from './components/OnboardingCelebrationModal';
import { ResumeTourNotification } from './components/ResumeTourNotification';

const STORAGE_KEYS = {
  COMPLETED_STEPS: 'smart_onboarding_completed_steps_v1',
  TOUR_DISMISSED: 'smart_onboarding_tour_dismissed_v1',
  USER_ROLE: 'smart_onboarding_role_v1',
  CURRENT_STEP_INDEX: 'smart_onboarding_step_index_v1',
  LAST_ACTIVE_TIME: 'smart_onboarding_last_active_time_v1',
  TOUR_WAS_ACTIVE: 'smart_onboarding_tour_was_active_v1',
};

export default function App() {
  // Role track
  const [userRole, setUserRole] = useState<OnboardingRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    return (saved as OnboardingRole) || 'starter';
  });

  // Steps matching current role track
  const activeSteps = useMemo(() => {
    const track = ROLE_TRACKS[userRole] || ROLE_TRACKS.starter;
    return STARTER_STEPS.filter((s) => track.stepIds.includes(s.id));
  }, [userRole]);

  // Completed step IDs
  const [completedStepIds, setCompletedStepIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED_STEPS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tour active flag
  const [isTourActive, setIsTourActive] = useState<boolean>(() => {
    const dismissed = localStorage.getItem(STORAGE_KEYS.TOUR_DISMISSED);
    return dismissed !== 'true';
  });

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    const savedIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP_INDEX);
    if (savedIndex !== null) {
      const parsed = parseInt(savedIndex, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  });

  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showResumeNotification, setShowResumeNotification] = useState(false);
  const [awayDurationText, setAwayDurationText] = useState<string>('');
  const leftOffTimestampRef = useRef<number | null>(null);

  // Workspace mock state
  const [projects, setProjects] = useState<WorkspaceProject[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Sync currentStepIndex to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP_INDEX, currentStepIndex.toString());
  }, [currentStepIndex]);

  // Sync tour active flag to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOUR_WAS_ACTIVE, isTourActive ? 'true' : 'false');
  }, [isTourActive]);

  // Record active heartbeat and check for return on load
  useEffect(() => {
    // Check if user is returning from a previous session where a tour was in progress
    const lastActiveStr = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_TIME);
    const wasTourActive = localStorage.getItem(STORAGE_KEYS.TOUR_WAS_ACTIVE) === 'true';
    const isDismissed = localStorage.getItem(STORAGE_KEYS.TOUR_DISMISSED) === 'true';
    const completedCount = completedStepIds.length;
    const allCompleted = completedCount >= activeSteps.length;

    if (lastActiveStr && wasTourActive && !isDismissed && !allCompleted) {
      const lastActive = parseInt(lastActiveStr, 10);
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((now - lastActive) / 1000));

      // If user was away for at least 5 seconds or returned in a fresh session
      if (diffSeconds >= 5) {
        let text = 'Just now';
        if (diffSeconds < 60) {
          text = `${diffSeconds}s ago`;
        } else if (diffSeconds < 3600) {
          text = `${Math.floor(diffSeconds / 60)}m ago`;
        } else {
          text = `${Math.floor(diffSeconds / 3600)}h ago`;
        }
        setAwayDurationText(text);
        setShowResumeNotification(true);
      }
    }

    // Set initial timestamp
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_TIME, Date.now().toString());

    // Update timestamp regularly and on beforeunload / visibilitychange
    const interval = setInterval(() => {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_TIME, Date.now().toString());
    }, 5000);

    const handleBeforeUnload = () => {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_TIME, Date.now().toString());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        leftOffTimestampRef.current = Date.now();
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_TIME, Date.now().toString());
      } else if (document.visibilityState === 'visible') {
        // User switched back to this tab!
        const awayTime = leftOffTimestampRef.current;
        const now = Date.now();
        if (awayTime && (now - awayTime) >= 3000) {
          const diffSeconds = Math.floor((now - awayTime) / 1000);
          const text = diffSeconds < 60 ? `${diffSeconds}s ago` : `${Math.floor(diffSeconds / 60)}m ago`;
          
          // Only show if tour is in progress and not dismissed
          const dismissed = localStorage.getItem(STORAGE_KEYS.TOUR_DISMISSED) === 'true';
          const stepsDone = (JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_STEPS) || '[]') as string[]).length;
          
          if (!dismissed && stepsDone < activeSteps.length) {
            setAwayDurationText(text);
            setShowResumeNotification(true);
          }
        }
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_TIME, Date.now().toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeSteps.length, completedStepIds.length]);

  // Sync completed steps to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_STEPS, JSON.stringify(completedStepIds));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [completedStepIds]);

  // Sync role to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, userRole);
  }, [userRole]);

  // Calculate dynamic badges based on completed steps count
  const badges: BadgeAchievement[] = useMemo(() => {
    const completedCount = completedStepIds.length;
    return INITIAL_BADGES.map((badge) => ({
      ...badge,
      isUnlocked: completedCount >= badge.unlockedAtStepCount,
    }));
  }, [completedStepIds]);

  // Current active step object
  const currentStep = useMemo(() => {
    if (!isTourActive || activeSteps.length === 0) return null;
    return activeSteps[currentStepIndex] || activeSteps[0] || null;
  }, [isTourActive, activeSteps, currentStepIndex]);

  // Handler: Complete a step
  const handleStepComplete = useCallback((stepId: string) => {
    setCompletedStepIds((prev) => {
      if (prev.includes(stepId)) return prev;
      const next = [...prev, stepId];
      // Check if all steps in current track are completed
      const allActiveCompleted = activeSteps.every((s) => next.includes(s.id));
      if (allActiveCompleted) {
        setTimeout(() => {
          setIsTourActive(false);
          setShowCelebrationModal(true);
        }, 1200);
      }
      return next;
    });
  }, [activeSteps]);

  // Next step
  const handleNext = useCallback(() => {
    if (!currentStep) return;
    handleStepComplete(currentStep.id);

    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Finished all steps in tour
      setIsTourActive(false);
      setShowCelebrationModal(true);
      localStorage.setItem(STORAGE_KEYS.TOUR_DISMISSED, 'true');
    }
  }, [currentStep, currentStepIndex, activeSteps.length, handleStepComplete]);

  // Prev step
  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // Skip tour
  const handleSkip = useCallback(() => {
    setIsTourActive(false);
    localStorage.setItem(STORAGE_KEYS.TOUR_DISMISSED, 'true');
  }, []);

  // Jump to specific step from checklist
  const handleSelectStep = useCallback((index: number) => {
    setCurrentStepIndex(index);
    setIsTourActive(true);
  }, []);

  // Start / Resume Tour
  const handleStartTour = useCallback(() => {
    setIsTourActive(true);
    setShowResumeNotification(false);
    localStorage.setItem(STORAGE_KEYS.TOUR_DISMISSED, 'false');
  }, []);

  // Handler explicitly called from Resume notification
  const handleResumeWhereLeftOff = useCallback(() => {
    setIsTourActive(true);
    setShowResumeNotification(false);
    localStorage.setItem(STORAGE_KEYS.TOUR_DISMISSED, 'false');
  }, []);

  const handleDismissResumeNotification = useCallback(() => {
    setShowResumeNotification(false);
  }, []);

  // Restart Tour completely
  const handleRestartTour = useCallback(() => {
    setCompletedStepIds([]);
    setCurrentStepIndex(0);
    setIsTourActive(true);
    setShowCelebrationModal(false);
    setShowResumeNotification(false);
    localStorage.removeItem(STORAGE_KEYS.TOUR_DISMISSED);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_STEPS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP_INDEX);
  }, []);

  // Role change
  const handleChangeRole = useCallback((newRole: OnboardingRole) => {
    setUserRole(newRole);
    setCurrentStepIndex(0);
    setIsTourActive(true);
  }, []);

  // Live action triggered from host app
  const handleActionTriggered = useCallback((actionType: string) => {
    if (!currentStep) return;
    if (currentStep.actionType === actionType || currentStep.actionType === 'click' && actionType === 'click') {
      handleStepComplete(currentStep.id);
    }
  }, [currentStep, handleStepComplete]);

  // Project handlers for workspace
  const handleCreateProject = useCallback((newProj: Omit<WorkspaceProject, 'id'>) => {
    const project: WorkspaceProject = {
      ...newProj,
      id: `proj-${Date.now()}`,
    };
    setProjects((prev) => [project, ...prev]);
  }, []);

  const handleToggleProjectStatus = useCallback((id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextStatus = p.status === 'Completed' ? 'In Progress' : 'Completed';
        const nextProgress = nextStatus === 'Completed' ? 100 : 50;
        return {
          ...p,
          status: nextStatus,
          progress: nextProgress,
        };
      })
    );
  }, []);

  return (
    <div className="relative min-h-screen font-sans selection:bg-blue-500 selection:text-white antialiased">
      {/* Host Application Canvas */}
      <AppWorkspace
        projects={projects}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateProject={handleCreateProject}
        onToggleProjectStatus={handleToggleProjectStatus}
        onStartTour={handleStartTour}
        isTourActive={isTourActive}
        onActionTriggered={handleActionTriggered}
      />

      {/* Dynamic Interactive Spotlight Overlay */}
      {isTourActive && currentStep && (
        <SpotlightOverlay
          step={currentStep}
          stepIndex={currentStepIndex}
          totalSteps={activeSteps.length}
          completedStepIds={completedStepIds}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={handleSkip}
          onStepComplete={handleStepComplete}
          onClose={handleSkip}
        />
      )}

      {/* Persistent Progress Tracking Dock & Checklist Drawer */}
      <ProgressTrackerDrawer
        steps={activeSteps}
        currentStepIndex={currentStepIndex}
        completedStepIds={completedStepIds}
        badges={badges}
        isTourActive={isTourActive}
        userRole={userRole}
        onSelectStep={handleSelectStep}
        onStartTour={handleStartTour}
        onRestartTour={handleRestartTour}
        onChangeRole={handleChangeRole}
      />

      {/* 'Resume where you left off' Notification on return */}
      <ResumeTourNotification
        isOpen={showResumeNotification && (!isTourActive || showResumeNotification)}
        currentStep={activeSteps[currentStepIndex] || activeSteps[0] || null}
        currentStepIndex={currentStepIndex}
        totalSteps={activeSteps.length}
        completedCount={completedStepIds.length}
        awayDurationText={awayDurationText}
        onResume={handleResumeWhereLeftOff}
        onDismiss={handleDismissResumeNotification}
        onRestart={handleRestartTour}
      />

      {/* Completion Celebration Modal with Fireworks */}
      <OnboardingCelebrationModal
        isOpen={showCelebrationModal}
        badges={badges}
        userRole={userRole}
        onClose={() => setShowCelebrationModal(false)}
        onRestart={handleRestartTour}
        onChangeRole={handleChangeRole}
      />
    </div>
  );
}
