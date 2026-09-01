import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/primitives';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!emailPattern.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setError(undefined);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent/10 border border-accent/30">
          <MailCheck size={22} className="text-accent-light" />
        </div>
        <h1 className="text-heading text-xl font-semibold mb-1.5">Password reset unavailable</h1>
        <p className="text-muted text-sm mb-6">
          Password reset will be available once authentication is connected to a backend. This is a
          development-only preview of the flow — no email has actually been sent.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent-light hover:underline"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-heading text-xl font-semibold mb-1.5">Reset your password</h1>
      <p className="text-muted text-sm mb-6">
        Enter the email associated with your account and we'll help you get back in.
      </p>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-sm border border-danger/30 bg-danger/10 px-3 py-2.5 text-xs text-danger">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="forgot-email" className="text-body text-xs font-medium mb-1.5 block">
            Email
          </label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Send reset instructions
        </Button>
      </form>

      <p className="text-muted text-sm text-center mt-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-accent-light hover:underline">
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
