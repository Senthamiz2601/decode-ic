import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileCode, GitBranch, ShieldAlert, Boxes, FileBarChart } from 'lucide-react';
import { listRepositories } from '@/services/repositoryService';

interface Item { id: string; label: string; hint: string; icon: React.ComponentType<{ size?: number | string; className?: string }>; to: string; }

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return { open, setOpen };
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Real, backend-connected repositories only — no mock repository
  // list and no hardcoded demo repo id for the Risk Center shortcut.
  const [repos, setRepos] = useState<{ id: string; name: string; language: string | null; status: string }[]>([]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await listRepositories();
        if (!cancelled && result?.ok) {
          setRepos((result.repositories as any[]) || []);
        }
      } catch {
        if (!cancelled) setRepos([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const items: Item[] = useMemo(() => {
    const analyzed = repos.find((r) => r.status === 'complete');

    const base: Item[] = [
      { id: 'dash', label: 'Overview', hint: 'Dashboard', icon: Boxes, to: '/dashboard' },
      { id: 'repos', label: 'Repositories', hint: 'Repository list', icon: GitBranch, to: '/repositories' },
      { id: 'reports', label: 'Reports', hint: 'Generated reports', icon: FileBarChart, to: '/reports' },
      ...repos.map((r) => ({
        id: r.id, label: r.name, hint: `Repository · ${r.language || 'Unknown'}`, icon: FileCode,
        to: `/repositories/${r.id}`,
      })),
      ...(analyzed
        ? [{ id: 'risks', label: 'Risk Center', hint: analyzed.name, icon: ShieldAlert, to: `/repositories/${analyzed.id}/risks` }]
        : []),
    ];
    if (!query.trim()) return base;
    return base.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  }, [query, repos]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-lg shadow-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={16} className="text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories, files, functions, risks…"
            className="flex-1 bg-transparent outline-none text-sm text-heading placeholder:text-muted"
          />
          <kbd className="text-[10px] text-muted border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {items.length === 0 && <div className="px-4 py-6 text-center text-muted text-sm">No results found.</div>}
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => { navigate(item.to); onClose(); setQuery(''); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-raised transition-colors"
            >
              <item.icon size={16} className="text-muted shrink-0" />
              <div className="min-w-0">
                <div className="text-sm text-heading truncate">{item.label}</div>
                <div className="text-xs text-muted truncate">{item.hint}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
