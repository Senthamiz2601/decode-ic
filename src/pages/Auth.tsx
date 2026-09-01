import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/primitives';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/api';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-danger">
      <AlertCircle size={12} className="shrink-0" />
      {message}
    </p>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start gap-2 rounded-sm border border-danger/30 bg-danger/10 px-3 py-2.5 text-xs text-danger">
      <AlertCircle size={14} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete: string;
  id: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
        required
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/repositories/new';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email is required.';
    else if (!emailPattern.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email: email.trim(), password, rememberMe });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-heading text-xl font-semibold mb-1.5">Welcome back</h1>
      <p className="text-muted text-sm mb-6">Sign in to continue to Decode.ic.</p>

      <FormError message={formError} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="login-email" className="text-body text-xs font-medium mb-1.5 block">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FieldError message={errors.email} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-body text-xs font-medium block">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-accent-light hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="login-password" value={password} onChange={setPassword} autoComplete="current-password" />
          <FieldError message={errors.password} />
        </div>

        <label className="flex items-center gap-2 text-xs text-body cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-3.5 rounded-sm border-border bg-surface-sunken accent-accent"
          />
          Remember me
        </label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-border" />
        <span className="text-muted text-[11px] uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-muted text-sm text-center">
        Don't have an account? <Link to="/register" className="text-accent-light hover:underline">Create account</Link>
      </p>
    </div>
  );
}

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-accent', 'bg-success'];

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/repositories/new';

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [errors, setErrors] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
  const strength = passwordStrength(password);

  function validate() {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = 'Full name is required.';
    if (!username.trim()) next.username = 'Username is required.';
    else if (!usernamePattern.test(username.trim()))
      next.username = '3–20 characters: letters, numbers, and underscores only.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!emailPattern.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match.';
    if (!agreedToTerms) next.terms = 'You must accept the Terms and Privacy Policy.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ fullName: fullName.trim(), username: username.trim(), email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-heading text-xl font-semibold mb-1.5">Create your account</h1>
      <p className="text-muted text-sm mb-6">Start understanding your codebase in minutes.</p>

      <FormError message={formError} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="register-name" className="text-body text-xs font-medium mb-1.5 block">
            Full name
          </label>
          <Input
            id="register-name"
            type="text"
            placeholder="Ada Lovelace"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <FieldError message={errors.fullName} />
        </div>

        <div>
          <label htmlFor="register-username" className="text-body text-xs font-medium mb-1.5 block">
            Username
          </label>
          <Input
            id="register-username"
            type="text"
            placeholder="ada_lovelace"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FieldError message={errors.username} />
        </div>

        <div>
          <label htmlFor="register-email" className="text-body text-xs font-medium mb-1.5 block">
            Email
          </label>
          <Input
            id="register-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FieldError message={errors.email} />
        </div>

        <div>
          <label htmlFor="register-password" className="text-body text-xs font-medium mb-1.5 block">
            Password
          </label>
          <PasswordInput id="register-password" value={password} onChange={setPassword} autoComplete="new-password" />
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i < strength ? strengthColors[strength] : 'bg-surface-raised'}`}
                  />
                ))}
              </div>
              <p className="text-muted text-[11px] mt-1">{strengthLabels[strength]}</p>
            </div>
          )}
          <FieldError message={errors.password} />
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="text-body text-xs font-medium mb-1.5 block">
            Confirm password
          </label>
          <PasswordInput
            id="register-confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
          <FieldError message={errors.confirmPassword} />
        </div>

        <div>
          <label className="flex items-start gap-2 text-xs text-body cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="size-3.5 mt-0.5 rounded-sm border-border bg-surface-sunken accent-accent shrink-0"
            />
            <span>
              I agree to the <a href="#" className="text-accent-light hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-accent-light hover:underline">Privacy Policy</a>.
            </span>
          </label>
          <FieldError message={errors.terms} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-border" />
        <span className="text-muted text-[11px] uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-muted text-sm text-center">
        Already have an account? <Link to="/login" className="text-accent-light hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
