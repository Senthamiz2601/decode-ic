import React from 'react';
import { cn } from '@/utils/cn';
import type { RiskLevel } from '@/types';

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'md' ? 'px-6 py-3' : 'px-3.5 py-2 text-xs',
        variant === 'primary' && 'bg-accent text-white hover:bg-accent/90 shadow-[0px_0px_7.5px_rgba(59,130,246,0.3)]',
        variant === 'secondary' && 'border border-border text-heading hover:bg-surface',
        variant === 'ghost' && 'text-body hover:text-heading hover:bg-surface',
        variant === 'danger' && 'border border-danger/40 text-danger hover:bg-danger/10',
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-surface border border-border rounded-lg', className)}
      {...props}
    />
  );
}

export function CardHeader({ title, subtitle, action }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
      <div>
        <h3 className="text-heading font-semibold text-sm">{title}</h3>
        {subtitle && <p className="text-muted text-xs mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const riskStyles: Record<RiskLevel, string> = {
  low: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  high: 'bg-danger/10 text-danger border-danger/30',
  critical: 'bg-danger/20 text-danger border-danger/50',
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-sm border text-[11px] font-semibold uppercase tracking-wide', riskStyles[level])}>
      {level}
    </span>
  );
}

export function Badge({ children, tone = 'neutral', className }: { children: React.ReactNode; tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger'; className?: string }) {
  const tones: Record<string, string> = {
    neutral: 'bg-surface-raised text-body border-border',
    accent: 'bg-accent/10 text-accent-light border-accent/30',
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    danger: 'bg-danger/10 text-danger border-danger/30',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-sm border text-[11px] font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full bg-surface-sunken border border-border rounded-sm px-3 py-2 text-sm text-heading placeholder:text-muted focus:border-accent outline-none transition-colors',
        props.className,
      )}
    />
  );
}

export function Select({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'bg-surface-sunken border border-border rounded-sm px-3 py-2 text-sm text-heading focus:border-accent outline-none transition-colors',
        className,
      )}
    >
      {children}
    </select>
  );
}

export function ProgressBar({ value, tone = 'accent' }: { value: number; tone?: 'accent' | 'success' | 'warning' | 'danger' }) {
  const tones: Record<string, string> = {
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };
  return (
    <div className="h-2 w-full rounded-full bg-surface-raised overflow-hidden">
      <div className={cn('h-full rounded-full transition-all', tones[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
            active === tab.id ? 'text-heading border-accent' : 'text-muted border-transparent hover:text-body',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function IconButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn('inline-flex items-center justify-center size-9 rounded-full text-body hover:text-heading hover:bg-surface-raised transition-colors', className)}
    />
  );
}
