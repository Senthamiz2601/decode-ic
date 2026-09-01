import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-transparent" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="size-9 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center">
            <span className="text-accent-light font-bold">D</span>
          </div>
          <span className="text-heading font-semibold text-lg tracking-tight">Decode.ic</span>
        </Link>
        <div className="bg-surface border border-border rounded-lg p-8 shadow-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
