'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { isDemoMode } from '../lib/isDemoMode';
import {
  LayoutDashboard, Radar, Zap, CircleDot, ShieldAlert, MessageSquare,
  FileText, Users, UsersRound, BookOpen, Target, Plug, KeyRound,
  GitBranch, Settings, Bug, Calendar, BarChart3, Coins,
  Clock, Webhook, Bell, FolderKanban, Network, Scale, FileCode,
  PanelLeftClose, PanelLeft, Menu, X, MessageCircle, Activity, SlidersHorizontal,
  Shield, BotMessageSquare, LogOut, User, ChevronDown, Plus, ArrowLeft,
} from 'lucide-react';
import DashClawLogo from './DashClawLogo';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/mission-control', icon: Radar, label: 'Mission Control' },
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/swarm', icon: Users, label: 'Swarm Intelligence' },
      { href: '/chat', icon: BotMessageSquare, label: 'Chat' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { href: '/content', icon: FileText, label: 'Content' },
      { href: '/messages', icon: MessageSquare, label: 'Messages' },
      { href: '/workspace', icon: FolderKanban, label: 'Workspace' },
      { href: '/calendar', icon: Calendar, label: 'Calendar' },
    ],
  },
  {
    label: 'Records',
    items: [
      { href: '/relationships', icon: Users, label: 'Relationships' },
      { href: '/learning', icon: BookOpen, label: 'Learning' },
      { href: '/learning/analytics', icon: Zap, label: 'Learning Analytics' },
      { href: '/goals', icon: Target, label: 'Goals' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/actions', icon: Zap, label: 'Decisions' },
      { href: '/approvals', icon: Clock, label: 'Approval Queue' },
      { href: '/routing', icon: Network, label: 'Task Routing' },
      { href: '/evaluations', icon: BarChart3, label: 'Evaluations' },
      { href: '/scoring', icon: SlidersHorizontal, label: 'Scoring' },
      { href: '/prompts', icon: FileCode, label: 'Prompts' },
      { href: '/feedback', icon: MessageCircle, label: 'Feedback' },
      { href: '/drift', icon: Activity, label: 'Drift Detection' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/integrations', icon: Plug, label: 'Integrations' },
      { href: '/pairings', icon: CircleDot, label: 'Pairings' },
      { href: '/api-keys', icon: KeyRound, label: 'API Keys' },
      { href: '/activity', icon: Clock, label: 'Activity' },
      { href: '/webhooks', icon: Webhook, label: 'Webhooks' },
      { href: '/workflows', icon: GitBranch, label: 'Workflows' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/bug-hunter', icon: Bug, label: 'Bug Hunter' },
    ],
  },
];

const orgSettingsItems = [
  { href: '/compliance', icon: Scale, label: 'Compliance' },
  { href: '/policies', icon: Shield, label: 'Policies' },
  { href: '/security', icon: ShieldAlert, label: 'Security' },
  { href: '/team', icon: UsersRound, label: 'Team' },
  { href: '/tokens', icon: Coins, label: 'Token Budget' },
  { href: '/usage', icon: BarChart3, label: 'Usage' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const demo = isDemoMode();
  const { data: session } = useSession();
  const navRef = useRef(null);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const orgMenuRef = useRef(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [orgSettingsMode, setOrgSettingsMode] = useState(false);

  // Persist org settings mode across navigations
  useEffect(() => {
    const saved = sessionStorage.getItem('sidebar-org-settings');
    if (saved === 'true') setOrgSettingsMode(true);
  }, []);

  const enterOrgSettings = useCallback(() => {
    setOrgSettingsMode(true);
    sessionStorage.setItem('sidebar-org-settings', 'true');
    setOrgMenuOpen(false);
    setMobileOpen(false);
  }, []);

  const exitOrgSettings = useCallback(() => {
    setOrgSettingsMode(false);
    sessionStorage.removeItem('sidebar-org-settings');
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (nav) {
      const saved = sessionStorage.getItem('sidebar-scroll');
      if (saved) nav.scrollTop = parseInt(saved, 10);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (orgMenuRef.current && !orgMenuRef.current.contains(e.target)) {
        setOrgMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavScroll = useCallback((e) => {
    sessionStorage.setItem('sidebar-scroll', String(e.target.scrollTop));
  }, []);

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Org switcher */}
      <div className="relative border-b border-[rgba(255,255,255,0.06)]" ref={orgMenuRef}>
        <button
          onClick={() => !demo && setOrgMenuOpen(!orgMenuOpen)}
          className={`flex items-center gap-2.5 px-4 py-5 w-full hover:bg-white/5 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <DashClawLogo size={20} />
          {!collapsed && (
            <>
              <span className="text-lg font-semibold text-white flex-1 text-left">DashClaw</span>
              {!demo && <ChevronDown size={14} className={`text-zinc-500 transition-transform ${orgMenuOpen ? 'rotate-180' : ''}`} />}
            </>
          )}
        </button>
        {orgMenuOpen && !collapsed && (
          <div className="absolute left-2 right-2 top-full mt-1 rounded-lg bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] shadow-xl z-50 p-1.5">
            <button
              onClick={enterOrgSettings}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              <Settings size={14} />
              Organization Settings
            </button>
            <Link
              href="/settings/organization/new"
              onClick={() => { setOrgMenuOpen(false); setMobileOpen(false); }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              <Plus size={14} />
              Create Organization
            </Link>
          </div>
        )}
      </div>

      {/* Nav Groups */}
      <nav ref={navRef} onScroll={handleNavScroll} className="flex-1 overflow-y-auto py-3 px-2">
        {orgSettingsMode ? (
          <>
            {/* Back button */}
            <button
              onClick={exitOrgSettings}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors duration-150 mb-3 w-full ${collapsed ? 'justify-center' : ''}`}
            >
              <ArrowLeft size={16} className="flex-shrink-0" />
              {!collapsed && <span>Back</span>}
            </button>
            {!collapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                Organization
              </div>
            )}
            {orgSettingsItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 mb-0.5 relative ${
                    active
                      ? 'bg-white/5 text-white'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-brand rounded-r" />
                  )}
                  <Icon size={16} className="flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        ) : (
          navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 mb-0.5 relative ${
                      active
                        ? 'bg-white/5 text-white'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-brand rounded-r" />
                    )}
                    <Icon size={16} className="flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[rgba(255,255,255,0.06)] px-2 py-3">
        {/* User profile with dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-7 h-7 rounded-full flex-shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-zinc-400" />
              </div>
            )}
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-sm text-white truncate">{session?.user?.name || 'User'}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{session?.user?.email}</div>
                </div>
                <ChevronDown size={14} className={`text-zinc-500 transition-transform flex-shrink-0 ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {profileMenuOpen && !collapsed && (
            <div className="absolute left-1 right-1 bottom-full mb-1 rounded-lg bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] shadow-xl z-50 p-1.5">
              <Link
                href="/notifications"
                onClick={() => { setProfileMenuOpen(false); setMobileOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                <Bell size={14} />
                Email Notifications
              </Link>
              {!demo && (
                <button
                  onClick={async () => {
                    await fetch('/api/auth/local', { method: 'DELETE' });
                    signOut({ callbackUrl: '/' });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden md:flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors duration-150 mt-1 text-xs w-full ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-surface-secondary border border-[rgba(255,255,255,0.06)]"
      >
        <Menu size={18} className="text-zinc-400" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56 bg-surface-secondary border-r border-[rgba(255,255,255,0.06)] flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 text-zinc-500 hover:text-white"
            >
              <X size={16} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex flex-col flex-shrink-0 bg-surface-secondary border-r border-[rgba(255,255,255,0.06)] h-screen sticky top-0 z-20 transition-all duration-200 ${
          collapsed ? 'w-14' : 'w-56'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
