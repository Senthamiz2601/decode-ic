import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/primitives';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center text-center px-4">
      <span className="font-mono text-accent-light text-sm mb-3">404</span>
      <h1 className="text-heading text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-muted text-sm mb-6 max-w-sm">The screen you're looking for doesn't exist or has moved.</p>
      <Link to="/dashboard"><Button>Back to Overview</Button></Link>
    </div>
  );
}
