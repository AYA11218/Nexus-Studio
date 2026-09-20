import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  LayoutGrid, 
  ListFilter, 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  MoreVertical, 
  Zap, 
  Compass, 
  Sparkles, 
  UserPlus, 
  X,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { WorkspaceProject } from '../types';
import { VELOCITY_DATA } from '../data/mockProjects';

interface AppWorkspaceProps {
  projects: WorkspaceProject[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onCreateProject: (project: Omit<WorkspaceProject, 'id'>) => void;
  onToggleProjectStatus: (id: string) => void;
  onStartTour: () => void;
  isTourActive: boolean;
  onActionTriggered?: (actionType: string) => void;
}

export const AppWorkspace: React.FC<AppWorkspaceProps> = ({
  projects,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onCreateProject,
  onToggleProjectStatus,
  onStartTour,
  isTourActive,
  onActionTriggered,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Fri');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  // New project form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Product Experience');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Filter projects by search and status
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateProject({
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'In Progress',
      progress: 10,
      dueDate: 'Nov 30, 2026',
      members: ['You', 'Sarah Chen'],
    });

    setNewTitle('');
    setIsCreateModalOpen(false);
    onActionTriggered?.('click');
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteEmail('');
      setIsInviteModalOpen(false);
    }, 1200);
    onActionTriggered?.('click');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo and Workspace title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm sm:text-base">
                  Nexus Studio
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-0.5 hidden sm:block">
                Production Workspace • Smart Onboarding Active
              </p>
            </div>
          </div>

          {/* Target 1: Global Search & Command Bar */}
          <div id="tour-search" className="flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-input-field"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  onActionTriggered?.('type');
                }}
                placeholder="Search projects, automations, or press ⌘K..."
                className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              <kbd className="hidden sm:flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Target 6: Team Presence & Invite */}
            <div id="tour-team" className="flex items-center gap-1.5">
              <div className="hidden lg:flex items-center -space-x-2 mr-1">
                <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                  AR
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                  SC
                </div>
                <div className="w-7 h-7 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                  MV
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  +3
                </div>
              </div>

              <button
                id="btn-team-invite"
                onClick={() => {
                  setIsInviteModalOpen(true);
                  onActionTriggered?.('click');
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Manage team members"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Invite</span>
              </button>
            </div>

            {/* Target 2: Quick Create Button */}
            <button
              id="tour-create-btn"
              onClick={() => {
                setIsCreateModalOpen(true);
                onActionTriggered?.('click');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>

            {/* Guide Tour Launcher Button */}
            <button
              id="tour-guide-toggle"
              onClick={onStartTour}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isTourActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
              title="Launch Guided Tour"
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="hidden md:inline">Guided Tour</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Workspace Welcome / Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Operations & Sprints
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Live tracking for Q4 sprint deliverables, velocity benchmarks, and cross-functional team milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Cycle: Sprint 42 (Active)
            </span>
          </div>
        </div>

        {/* Target 3: Live Metrics Overview Bar */}
        <div
          id="tour-metrics"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Active Workspaces</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                +14%
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              18
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              4 new deployed this week
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Completed Automations</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                99.6%
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              1,420
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Zero pipeline disruptions
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Team Velocity</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                Optimal
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              124 pts
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-500" />
              18% higher than median
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Sprint Health Score</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                Healthy
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              96 / 100
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              All critical SLAs on track
            </p>
          </div>
        </div>

        {/* Target 4: Interactive Velocity & Activity Timeline */}
        <div
          id="tour-chart"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Velocity & Daily Task Throughput
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click any weekday below to inspect daily cycle completion metrics.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Tasks
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Velocity Score
              </span>
            </div>
          </div>

          {/* Interactive Bar Chart Visualization */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-40 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            {VELOCITY_DATA.map((item) => {
              const isSelected = selectedDay === item.day;
              const maxVelocity = 130;
              const heightPercent = Math.round((item.velocity / maxVelocity) * 100);

              return (
                <button
                  key={item.day}
                  id={`chart-day-${item.day}`}
                  onClick={() => {
                    setSelectedDay(item.day);
                    onActionTriggered?.('click');
                  }}
                  className={`flex flex-col items-center justify-end h-full group focus:outline-none transition-all ${
                    isSelected ? 'scale-105' : 'hover:opacity-90'
                  }`}
                >
                  <div className="w-full flex items-end justify-center gap-1 h-32 px-1">
                    {/* Primary Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20'
                          : 'bg-blue-100 dark:bg-slate-800 group-hover:bg-blue-300 dark:group-hover:bg-slate-700'
                      }`}
                    />
                  </div>

                  <span
                    className={`mt-2 text-[11px] font-semibold transition-colors ${
                      isSelected
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.day}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected day detail banner */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {selectedDay} Insight:
              </span>{' '}
              {VELOCITY_DATA.find((d) => d.day === selectedDay)?.tasks} tasks resolved • Velocity rating{' '}
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {VELOCITY_DATA.find((d) => d.day === selectedDay)?.velocity} pts
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Interactive timeline synced with project pipeline
            </div>
          </div>
        </div>

        {/* Target 5: Filter Pipeline & Custom Views */}
        <div
          id="tour-filters"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'In Progress', 'Review', 'Completed'].map((status) => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  id={`filter-${status.toLowerCase().replace(' ', '-')}`}
                  onClick={() => {
                    onStatusFilterChange(status);
                    onActionTriggered?.('filter');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {status}
                  <span className="ml-1.5 text-[10px] opacity-75 font-normal">
                    {status === 'All'
                      ? projects.length
                      : projects.filter((p) => p.status === status).length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Layout (Grid vs Table) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline">
              Layout:
            </span>
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <button
                id="view-mode-grid"
                onClick={() => {
                  onViewModeChange('grid');
                  onActionTriggered?.('filter');
                }}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                id="view-mode-table"
                onClick={() => {
                  onViewModeChange('table');
                  onActionTriggered?.('filter');
                }}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
                title="Table view"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Project Items Content */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <SlidersHorizontal className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No matching initiatives found
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords or switching back to the "All" status filter.
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                onStatusFilterChange('All');
              }}
              className="mt-3 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {project.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        project.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : project.status === 'Review'
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  {/* Progress Indicator */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Completion</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${project.progress}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          project.progress === 100
                            ? 'bg-emerald-500'
                            : 'bg-blue-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Due Date & Member Avatars */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {project.dueDate}
                    </span>

                    <button
                      onClick={() => onToggleProjectStatus(project.id)}
                      className={`text-[11px] font-medium px-2 py-1 rounded-lg border transition-colors ${
                        project.status === 'Completed'
                          ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Toggle project completion state"
                    >
                      {project.status === 'Completed' ? 'Mark Active' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Initiative</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProjects.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {p.title}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{p.category}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : p.status === 'Review'
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
                              : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${p.progress}%` }}
                              className="bg-blue-600 h-full rounded-full"
                            />
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {p.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{p.dueDate}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onToggleProjectStatus(p.id)}
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          {p.status === 'Completed' ? 'Reopen' : 'Done'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* New Project Interactive Modal / Drawer */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Create New Initiative
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Real-Time Notification Service"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                >
                  <option value="Product Experience">Product Experience</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="Data Platform">Data Platform</option>
                  <option value="Security & Auth">Security & Auth</option>
                  <option value="Fintech Engine">Fintech Engine</option>
                  <option value="AI Platform">AI Platform</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(['High', 'Medium', 'Low'] as const).map((pr) => (
                    <button
                      type="button"
                      key={pr}
                      onClick={() => setNewPriority(pr)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                        newPriority === pr
                          ? 'bg-blue-50 text-blue-600 border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Save Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Teammates Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Invite Contributors
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-4 space-y-3 text-xs">
              <p className="text-slate-500">
                Grant role-based access and collaborate in real-time on sprint boards.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teammate Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborator@company.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {inviteSent && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Invitation dispatched successfully!
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={inviteSent}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
