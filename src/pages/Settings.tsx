import React, { useState } from 'react';
import {
  User,
  Github,
  Settings2,
  Sparkles,
  Bell,
  Shield,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  KeyRound,
} from 'lucide-react';

import { Card, Input, Button, Select, Tabs } from '@/components/primitives';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/services/api';
import { getToken } from '@/services/authService';

const sections = [
  { id: 'account', label: 'Account' },
  { id: 'github', label: 'GitHub' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'ai', label: 'AI' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
];

function Toggle({
  label,
  description,
  defaultChecked = true,
  onChange,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
  onChange?: (value: boolean) => void;
}) {
  const [on, setOn] = useState(defaultChecked);

  function toggle() {
    const next = !on;
    setOn(next);
    onChange?.(next);
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-0">
      <div className="min-w-0">
        <div className="text-body text-sm font-medium">{label}</div>
        <div className="text-muted text-xs mt-1">{description}</div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${
          on
            ? 'bg-accent shadow-[0_0_14px_rgba(59,130,246,0.25)]'
            : 'bg-surface-raised border border-border'
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
            on ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-5 border-b border-border">
      <div className="size-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
        <Icon size={17} className="text-accent-light" />
      </div>

      <div>
        <h2 className="text-heading text-sm font-semibold">{title}</h2>
        <p className="text-muted text-xs mt-1">{description}</p>
      </div>
    </div>
  );
}

function StatusMessage({
  type,
  message,
}: {
  type: 'success' | 'error';
  message: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs ${
        type === 'success'
          ? 'border-success/20 bg-success/5 text-success'
          : 'border-danger/20 bg-danger/5 text-danger'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 size={14} />
      ) : (
        <AlertCircle size={14} />
      )}
      <span>{message}</span>
    </div>
  );
}

export default function Settings() {
  const [active, setActive] = useState('account');

  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [analysisFrequency, setAnalysisFrequency] =
    useState('push');

  const [supportedLanguages, setSupportedLanguages] =
    useState('TypeScript, Python, Go, SQL');

  const [excludedFolders, setExcludedFolders] =
    useState('node_modules, dist, .next, __pycache__');

  const [excludedFiles, setExcludedFiles] =
    useState('*.min.js, *.lock');

  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const [analysisSaved, setAnalysisSaved] = useState(false);

  const [aiProvider, setAiProvider] = useState('claude');
  const [aiModel, setAiModel] = useState('sonnet');
  const [contextWindow, setContextWindow] = useState('repository');

  const [savingAI, setSavingAI] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);

  async function saveProfile() {
    if (!fullName.trim() || !email.trim()) {
      setProfileMessage({
        type: 'error',
        text: 'Name and email are required.',
      });
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMessage(null);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/auth/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      if (data.user) {
        localStorage.setItem(
          'decode_ic_user',
          JSON.stringify(data.user),
        );
      }

      setProfileMessage({
        type: 'success',
        text: 'Profile updated successfully.',
      });
    } catch (error) {
      setProfileMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to update profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Please fill in all password fields.',
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must contain at least 8 characters.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'New password and confirmation do not match.',
      });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must be different from your current password.',
      });
      return;
    }

    try {
      setChangingPassword(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.message || 'Failed to change password.',
        );
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setPasswordMessage({
        type: 'success',
        text: 'Password changed successfully.',
      });
    } catch (error) {
      setPasswordMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to change password.',
      });
    } finally {
      setChangingPassword(false);
    }
  }

  async function saveAnalysisSettings() {
    setSavingAnalysis(true);
    setAnalysisSaved(false);

    // These preferences are currently frontend-only.
    // Replace with API persistence when analysis settings endpoint is added.
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSavingAnalysis(false);
    setAnalysisSaved(true);

    setTimeout(() => setAnalysisSaved(false), 2500);
  }

  async function saveAISettings() {
    setSavingAI(true);
    setAiSaved(false);

    // AI preferences are currently frontend-only.
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSavingAI(false);
    setAiSaved(true);

    setTimeout(() => setAiSaved(false), 2500);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings2 size={20} className="text-accent-light" />
          <h1 className="text-heading text-2xl font-semibold">
            Settings
          </h1>
        </div>

        <p className="text-muted text-sm mt-1">
          Manage your account, integrations, analysis preferences,
          and security.
        </p>
      </div>

      {/* Navigation */}
      <Tabs
        tabs={sections}
        active={active}
        onChange={setActive}
      />

      {/* ACCOUNT */}
      {active === 'account' && (
        <Card className="overflow-hidden">
          <div className="p-6">
            <SectionHeader
              icon={User}
              title="Account Information"
              description="Update the personal information associated with your Decode.ic account."
            />

            <div className="space-y-5 mt-6">
              <div>
                <label className="text-body text-xs font-medium mb-1.5 block">
                  Full Name
                </label>

                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="text-body text-xs font-medium mb-1.5 block">
                  Email Address
                </label>

                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="text-body text-xs font-medium mb-1.5 block">
                  Username
                </label>

                <Input
                  value={user?.username || ''}
                  disabled
                />

                <p className="text-muted text-[11px] mt-1.5">
                  Username cannot currently be changed.
                </p>
              </div>

              {profileMessage && (
                <StatusMessage
                  type={profileMessage.type}
                  message={profileMessage.text}
                />
              )}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={saveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <>
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* GITHUB */}
      {active === 'github' && (
        <Card className="overflow-hidden">
          <div className="p-6">
            <SectionHeader
              icon={Github}
              title="GitHub Integration"
              description="Manage the GitHub account used to access and analyze repositories."
            />

            <div className="mt-6">
              <div className="rounded-xl border border-border bg-surface-sunken p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center">
                      <Github size={20} className="text-heading" />
                    </div>

                    <div>
                      <div className="text-heading text-sm font-medium">
                        GitHub Account
                      </div>

                      <div className="text-muted text-xs mt-0.5">
                        GitHub integration connected
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                    <span className="size-1.5 rounded-full bg-success" />
                    Connected
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="text-body text-xs font-medium mb-1.5 block">
                    Repository Access
                  </label>

                  <Select className="w-full">
                    <option value="all">
                      All accessible repositories
                    </option>
                    <option value="selected">
                      Selected repositories only
                    </option>
                  </Select>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="text-heading text-sm font-medium">
                    GitHub Personal Access Token
                  </div>

                  <p className="text-muted text-xs mt-1">
                    Your GitHub credentials are securely used by the
                    backend for repository analysis.
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-success">
                    <CheckCircle2 size={14} />
                    Authentication token configured
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="secondary" size="sm">
                    <RefreshCw size={14} />
                    Reconnect GitHub
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ANALYSIS */}
      {active === 'analysis' && (
        <Card className="overflow-hidden">
          <div className="p-6">
            <SectionHeader
              icon={Settings2}
              title="Analysis Preferences"
              description="Control how Decode.ic analyzes your repositories."
            />

            <div className="space-y-5 mt-6">
              <div>
                <label className="text-body text-xs font-medium mb-1.5 block">
                  Analysis Frequency
                </label>

                <Select
                  className="w-full"
                  value={analysisFrequency}
                  onChange={(e) =>
                    setAnalysisFrequency(e.target.value)
                  }
                >
                  <option value="push">On every push</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="manual">Manual only</option>
                </Select>
              </div>

              <div>
                <label className="text-body text-xs font-medium mb-1.5 block">
                  Supported Languages
                </label>

                <Input
                  value={supportedLanguages}
                  onChange={(e) =>
                    setSupportedLanguages(e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-body text-xs font-medium mb-1.5 block">
                  Excluded Folders
                </label>

                <Input
                  value={excludedFolders}
                  onChange={(e) =>
                    setExcludedFolders(e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-body text-xs font-medium mb-1.5 block">
                  Excluded Files
                </label>

                <Input
                  value={excludedFiles}
                  onChange={(e) =>
                    setExcludedFiles(e.target.value)
                  }
                />
              </div>

              {analysisSaved && (
                <StatusMessage
                  type="success"
                  message="Analysis preferences saved."
                />
              )}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={saveAnalysisSettings}
                  disabled={savingAnalysis}
                >
                  {savingAnalysis ? (
                    <>
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* AI */}
      {active === 'ai' && (
        <Card className="overflow-hidden">
          <div className="p-6">
            <SectionHeader
              icon={Sparkles}
              title="AI Configuration"
              description="Configure how AI-powered repository insights should use your code context."
            />

            <div className="space-y-5 mt-6">
              <div>
                <label className="text-body text-xs font-medium mb-1.5 block">
                  AI Provider
                </label>

                <Select
                  className="w-full"
                  value={aiProvider}
                  onChange={(e) =>
                    setAiProvider(e.target.value)
                  }
                >
                  <option value="claude">
                    Anthropic Claude
                  </option>
                  <option value="openai">
                    OpenAI
                  </option>
                </Select>
              </div>

              <div>
                <label className="text-body text-xs font-medium mb-1.5 block">
                  Model
                </label>

                <Select
                  className="w-full"
                  value={aiModel}
                  onChange={(e) =>
                    setAiModel(e.target.value)
                  }
                >
                  <option value="sonnet">
                    Claude Sonnet
                  </option>
                  <option value="opus">
                    Claude Opus
                  </option>
                </Select>
              </div>

              <div>
                <label className="text-body text-xs font-medium mb-1.5 block">
                  Context Window
                </label>

                <Select
                  className="w-full"
                  value={contextWindow}
                  onChange={(e) =>
                    setContextWindow(e.target.value)
                  }
                >
                  <option value="repository">
                    Repository-wide
                  </option>
                  <option value="dependents">
                    Current file + dependents
                  </option>
                  <option value="file">
                    Current file only
                  </option>
                </Select>
              </div>

              <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles
                    size={16}
                    className="text-accent-light mt-0.5"
                  />

                  <div>
                    <div className="text-heading text-xs font-semibold">
                      AI safety
                    </div>

                    <p className="text-muted text-xs mt-1 leading-relaxed">
                      AI features provide analysis and recommendations.
                      Decode.ic does not automatically modify your source
                      code.
                    </p>
                  </div>
                </div>
              </div>

              {aiSaved && (
                <StatusMessage
                  type="success"
                  message="AI preferences saved."
                />
              )}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={saveAISettings}
                  disabled={savingAI}
                >
                  {savingAI ? (
                    <>
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* NOTIFICATIONS */}
      {active === 'notifications' && (
        <Card className="overflow-hidden">
          <div className="p-6">
            <SectionHeader
              icon={Bell}
              title="Notifications"
              description="Choose which repository events should notify you."
            />

            <div className="mt-2">
              <Toggle
                label="Analysis completed"
                description="Notify when a repository finishes analyzing."
                defaultChecked
              />

              <Toggle
                label="High-risk detection"
                description="Notify when a module crosses the high-risk threshold."
                defaultChecked
              />

              <Toggle
                label="Technical debt changes"
                description="Notify when technical debt changes significantly."
                defaultChecked={false}
              />

              <Toggle
                label="Dependency issues"
                description="Notify when dependency-related issues are detected."
                defaultChecked
              />
            </div>
          </div>
        </Card>
      )}

      {/* SECURITY */}
      {active === 'security' && (
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="p-6">
              <SectionHeader
                icon={Shield}
                title="Security"
                description="Protect your Decode.ic account and manage authentication credentials."
              />

              <div className="mt-6">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface-sunken">
                  <div className="size-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Lock
                      size={18}
                      className="text-accent-light"
                    />
                  </div>

                  <div>
                    <div className="text-heading text-sm font-medium">
                      Password Authentication
                    </div>

                    <div className="text-muted text-xs mt-1">
                      Your password is securely hashed before storage.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Change Password */}
          <Card className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-3 pb-5 border-b border-border">
                <div className="size-9 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
                  <KeyRound
                    size={17}
                    className="text-warning"
                  />
                </div>

                <div>
                  <h2 className="text-heading text-sm font-semibold">
                    Change Password
                  </h2>

                  <p className="text-muted text-xs mt-1">
                    Use a strong password that you do not reuse elsewhere.
                  </p>
                </div>
              </div>

              <div className="space-y-5 mt-6">
                <div>
                  <label className="text-body text-xs font-medium mb-1.5 block">
                    Current Password
                  </label>

                  <div className="relative">
                    <Input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(e.target.value)
                      }
                      className="pr-10"
                      placeholder="Enter current password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrent((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors"
                    >
                      {showCurrent ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-body text-xs font-medium mb-1.5 block">
                    New Password
                  </label>

                  <div className="relative">
                    <Input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      className="pr-10"
                      placeholder="Enter new password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNew((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors"
                    >
                      {showNew ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>

                  <p className="text-muted text-[11px] mt-1.5">
                    Minimum 8 characters.
                  </p>
                </div>

                <div>
                  <label className="text-body text-xs font-medium mb-1.5 block">
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      className="pr-10"
                      placeholder="Confirm new password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirm((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors"
                    >
                      {showConfirm ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>
                </div>

                {passwordMessage && (
                  <StatusMessage
                    type={passwordMessage.type}
                    message={passwordMessage.text}
                  />
                )}

                <div className="flex justify-end pt-1">
                  <Button
                    onClick={changePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <>
                        <RefreshCw
                          size={14}
                          className="animate-spin"
                        />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Sessions */}
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-heading text-sm font-medium">
                  Active Sessions
                </div>

                <div className="text-muted text-xs mt-1">
                  Your current authenticated session is active.
                </div>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                Active
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}