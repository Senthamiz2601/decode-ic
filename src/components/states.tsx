import React from 'react';
import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react';
import { Button } from './primitives';

export function EmptyState({
  title, description, cta, onCta, icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  cta?: string;
  onCta?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-border rounded-lg">
      <div className="size-12 rounded-full bg-surface-raised flex items-center justify-center mb-4">
        <Icon size={22} className="text-muted" />
      </div>
      <h3 className="text-heading font-semibold text-base mb-1.5">{title}</h3>
      <p className="text-muted text-sm max-w-sm mb-6">{description}</p>
      {cta && <Button onClick={onCta}>{cta}</Button>}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="size-8 rounded-full border-2 border-border border-t-accent animate-spin" />
      <span className="text-muted text-sm font-mono">{label}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-raised rounded-sm ${className ?? 'h-4 w-full'}`} />;
}

export function ErrorState({
  title = 'Repository analysis failed', reasons, onRetry, onCheckConnection,
}: {
  title?: string;
  reasons: string[];
  onRetry?: () => void;
  onCheckConnection?: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 border border-danger/30 bg-danger/5 rounded-lg">
      <div className="size-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <AlertTriangle size={22} className="text-danger" />
      </div>
      <h3 className="text-heading font-semibold text-base mb-2">{title}</h3>
      <ul className="text-muted text-sm mb-6 space-y-1">
        {reasons.map((r) => <li key={r}>· {r}</li>)}
      </ul>
      <div className="flex gap-3">
        {onRetry && <Button onClick={onRetry}>Retry Analysis</Button>}
        {onCheckConnection && <Button variant="secondary" onClick={onCheckConnection}>Check Connection</Button>}
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-lg w-full max-w-lg shadow-card">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-heading font-semibold">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-heading">✕</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 p-5 border-t border-border">{footer}</div>}
      </div>
    </div>
  );
}
