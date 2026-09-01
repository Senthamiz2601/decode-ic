import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Network,
  Boxes,
  FileCode2,
  Sparkles,
  ShieldAlert,
  TrendingDown,
  HeartPulse,
  Settings as SettingsIcon,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  Crosshair,
  FlaskConical,
  Wand2,
  LogOut,
  ChevronDown,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import {
  CommandPalette,
  useCommandPalette,
} from '@/components/CommandPalette';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/services/authService';

// No mock fallback.
// Repo-scoped navigation uses the real repository id from the route.
// When no repository is selected, the user is sent to the real
// Repositories page instead of using fake repository data.
function useActiveRepoId() {
  const params = useParams();
  return params.id ?? null;
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2.5 pl-4 ml-1',
          'border-l border-border',
          'group transition-colors'
        )}
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        <div
          className={cn(
            'size-8 rounded-full',
            'bg-accent/15 border border-accent/30',
            'flex items-center justify-center',
            'text-accent-light text-xs font-semibold',
            'shrink-0 transition-all duration-200',
            'group-hover:bg-accent/20 group-hover:border-accent/50'
          )}
        >
          {getInitials(user.fullName)}
        </div>

        <div className="hidden sm:block text-left max-w-[150px]">
          <div className="text-heading text-sm leading-tight truncate">
            {user.fullName}
          </div>

          <div className="text-muted text-xs leading-tight truncate mt-0.5">
            @{user.username}
          </div>
        </div>

        <ChevronDown
          size={14}
          className={cn(
            'text-muted hidden sm:block transition-transform duration-200',
            open && 'rotate-180 text-heading'
          )}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <div
            className={cn(
              'absolute right-0 top-full mt-3 w-60 z-20',
              'rounded-lg border border-border',
              'bg-surface shadow-card',
              'overflow-hidden',
              'animate-in fade-in slide-in-from-top-1 duration-150'
            )}
          >
            <div className="p-3.5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent-light text-xs font-semibold shrink-0">
                  {getInitials(user.fullName)}
                </div>

                <div className="min-w-0">
                  <div className="text-heading text-sm font-medium truncate">
                    {user.fullName}
                  </div>

                  <div className="text-muted text-xs truncate mt-0.5">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center gap-2.5',
                'px-3.5 py-3',
                'text-sm text-body',
                'hover:bg-surface-raised hover:text-heading',
                'transition-colors'
              )}
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { open, setOpen } = useCommandPalette();
  const repoId = useActiveRepoId();

  useEffect(() => {
  setNotifOpen(false);
}, [location.pathname]);

  const nav = [
    {
      label: 'Overview',
      to: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Repositories',
      to: '/repositories',
      icon: GitBranch,
    },
    {
      label: 'Architecture',
      to: repoId
        ? `/repositories/${repoId}/architecture`
        : '/repositories',
      icon: Network,
    },
    {
      label: 'Dependencies',
      to: repoId
        ? `/repositories/${repoId}/dependencies`
        : '/repositories',
      icon: Boxes,
    },
    {
      label: 'Code Explorer',
      to: repoId
        ? `/repositories/${repoId}/code`
        : '/repositories',
      icon: FileCode2,
    },
    {
      label: 'AI Assistant',
      to: repoId
        ? `/repositories/${repoId}/ai`
        : '/repositories',
      icon: Sparkles,
    },
    {
      label: 'Risk Center',
      to: repoId
        ? `/repositories/${repoId}/risks`
        : '/repositories',
      icon: ShieldAlert,
    },
    {
      label: 'Technical Debt',
      to: repoId
        ? `/repositories/${repoId}/technical-debt`
        : '/repositories',
      icon: TrendingDown,
    },
    {
      label: 'Code Health',
      to: repoId
        ? `/repositories/${repoId}/health`
        : '/repositories',
      icon: HeartPulse,
    },
    {
      label: 'Impact Analysis',
      to: repoId
        ? `/repositories/${repoId}/impact`
        : '/repositories',
      icon: Crosshair,
    },
    {
      label: 'Change Simulation',
      to: repoId
        ? `/repositories/${repoId}/simulate`
        : '/repositories',
      icon: FlaskConical,
    },
    {
      label: 'AI Refactoring',
      to: repoId
        ? `/repositories/${repoId}/refactoring`
        : '/repositories',
      icon: Wand2,
    },
    {
      label: 'Reports',
      to: '/reports',
      icon: FileBarChart,
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <div className="min-h-screen flex bg-base">
      {/* ─────────────────────────────────────────
          SIDEBAR
      ───────────────────────────────────────── */}

      <aside
        className={cn(
          'shrink-0',
          'border-r border-border',
          'bg-surface-sunken',
          'flex flex-col',
          'transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            'flex items-center h-16',
            'border-b border-border',
            collapsed
              ? 'justify-center px-2'
              : 'gap-2.5 px-4'
          )}
        >
          <div
            className={cn(
              'size-8 rounded-md',
              'bg-accent/15 border border-accent/30',
              'flex items-center justify-center',
              'shrink-0'
            )}
          >
            <span className="text-accent-light font-bold text-sm">
              D
            </span>
          </div>

          {!collapsed && (
            <span className="text-heading font-semibold text-sm tracking-tight">
              Decode.ic
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group relative',
                  'flex items-center gap-3',
                  'px-3 py-2.5 rounded-md',
                  'text-sm font-medium',
                  'transition-all duration-150',

                  isActive
                    ? [
                        'bg-accent/10',
                        'text-accent-light',
                        'shadow-[inset_2px_0_0_rgba(129,140,248,0.9)]',
                      ]
                    : [
                        'text-body',
                        'hover:bg-surface',
                        'hover:text-heading',
                      ],

                  collapsed && 'justify-center px-0'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={cn(
                      'shrink-0 transition-transform duration-150',
                      !isActive &&
                        'group-hover:scale-105'
                    )}
                  />

                  {!collapsed && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'flex items-center justify-center gap-2',
            'h-11',
            'border-t border-border',
            'text-muted text-xs',
            'hover:text-heading hover:bg-surface/60',
            'transition-colors'
          )}
          aria-label={
            collapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          }
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              Collapse
            </>
          )}
        </button>
      </aside>

      {/* ─────────────────────────────────────────
          MAIN APPLICATION
      ───────────────────────────────────────── */}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Modern Header */}
        <header
          className={cn(
            'h-16 shrink-0',
            'border-b border-border',
            'bg-base/90 backdrop-blur-md',
            'flex items-center justify-end',
            'px-6'
          )}
        >
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() =>
                  setNotifOpen((o) => !o)
                }
                className={cn(
                  'relative size-9',
                  'rounded-md',
                  'flex items-center justify-center',
                  'text-muted',
                  'border border-transparent',
                  'hover:border-border',
                  'hover:bg-surface',
                  'hover:text-heading',
                  'transition-all duration-150'
                )}
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                <Bell size={18} />

                {notifOpen && (
                  <span className="absolute inset-x-2 -bottom-px h-px bg-accent" />
                )}
              </button>

              <NotificationsPanel
                open={notifOpen}
                onClose={() =>
                  setNotifOpen(false)
                }
              />
            </div>

            {/* Profile */}
            <ProfileMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Command Palette remains available through its existing shortcut/state */}
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}