import React from 'react';
import { Card } from './primitives';
import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';

export function MetricCard({
  label, value, icon: Icon, trend, tone = 'default',
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: { value: string; positive: boolean };
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const toneColor = {
    default: 'text-heading',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  }[tone];
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted text-xs font-semibold uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={16} className="text-muted" />}
      </div>
      <div className={cn('font-mono text-2xl font-semibold', toneColor)}>{value}</div>
      {trend && (
        <div className={cn('text-xs mt-2', trend.positive ? 'text-success' : 'text-danger')}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </Card>
  );
}

export function ChartCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-start justify-between p-5 pb-0">
        <div>
          <h3 className="text-heading font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-muted text-xs mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

export function HealthScore({ score, size = 96 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#4edea3' : score >= 60 ? '#facc15' : '#ffb4ab';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#171f33" strokeWidth={8} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={8} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-semibold text-heading">{score}</span>
        <span className="text-[10px] text-muted">/ 100</span>
      </div>
    </div>
  );
}

export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {headers.map((h) => (
              <th key={h} className="text-muted text-xs font-semibold uppercase tracking-wide px-5 py-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr onClick={onClick} className={cn('border-b border-border/60 last:border-0', onClick && 'cursor-pointer hover:bg-surface-raised/60')}>
      {children}
    </tr>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-5 py-3.5 text-body whitespace-nowrap', className)}>{children}</td>;
}
