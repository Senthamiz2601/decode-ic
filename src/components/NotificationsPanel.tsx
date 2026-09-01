import React from 'react';
import { Bell } from 'lucide-react';

// There is no notification backend/event system in this project yet
// (no persisted notifications, no push/webhook pipeline). Rather than
// showing invented notifications, this panel shows a clean empty
// state until a real notifications source exists.
export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-96 bg-surface border border-border rounded-lg shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-heading font-semibold text-sm">Notifications</h3>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
          <div className="size-9 rounded-full bg-surface-raised flex items-center justify-center">
            <Bell size={16} className="text-muted" />
          </div>
          <p className="text-sm text-body">No new notifications</p>
        </div>
      </div>
    </>
  );
}
