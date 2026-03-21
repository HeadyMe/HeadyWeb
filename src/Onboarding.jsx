/**
 * Onboarding.jsx — 8-stage onboarding flow for HeadyWeb / headyme.com
 *
 * Stages:
 *   1. Welcome          — Brand intro + value props
 *   2. Auth             — Google OAuth / email sign-in
 *   3. Permissions      — Grant access scopes
 *   4. Account Setup    — Choose @headyme.com username
 *   5. Email Setup      — Configure secure email (skippable)
 *   6. UI Customization — Pick theme + layout
 *   7. Companion Config — Personalise HeadyBuddy (skippable)
 *   8. Complete         — Success + go to dashboard
 */
import React, { useState, useRef, useEffect } from 'react';
import { signInGoogle, signUpEmail, signInEmail } from './firebase.js';

// ─── Step metadata ───────────────────────────────────────────────────
const STEP_META = {
  WELCOME:          { label: 'Welcome',           icon: '👋', color: 'from-purple-500 to-indigo-600' },
  AUTH:             { label: 'Sign In',            icon: '🔐', color: 'from-blue-500 to-cyan-600' },
  PERMISSIONS:      { label: 'Permissions',        icon: '🛡️', color: 'from-emerald-500 to-teal-600' },
  ACCOUNT_SETUP:    { label: 'Account',            icon: '👤', color: 'from-amber-500 to-orange-600' },
  EMAIL_SETUP:      { label: 'Email',              icon: '📧', color: 'from-pink-500 to-rose-600' },
  UI_CUSTOMIZATION: { label: 'Customise',          icon: '🎨', color: 'from-violet-500 to-purple-600' },
  COMPANION_CONFIG: { label: 'Companion',          icon: '🤖', color: 'from-cyan-500 to-blue-600' },
  COMPLETE:         { label: 'Ready!',             icon: '🚀', color: 'from-green-500 to-emerald-600' },
};

// ─── Progress Bar ────────────────────────────────────────────────────
function ProgressBar({ steps, currentStep, completedSteps, onStepClick }) {
  const currentIdx = steps.indexOf(currentStep);
  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.filter(s => s !== 'COMPLETE').map((step, i) => {
          const meta = STEP_META[step];
          const done = completedSteps[step];
          const active = step === currentStep;
          const accessible = done || active;
          return (
            <React.Fragment key={step}>
              {i > 0 && (
                <div className={`flex-1 h-0.5 mx-1 rounded transition-colors duration-500 ${
                  done ? 'bg-green-400' : 'bg-white/15'
                }`} />
              )}
              <button
                onClick={() => accessible && onStepClick(step)}
                disabled={!accessible}
                title={meta.label}
                className={`relative flex items-center justify-center w-9 h-9 rounded-full text-sm transition-all duration-300 ${
                  done
                    ? 'bg-green-500/30 text-green-300 border border-green-400/40'
                    : active
                      ? 'bg-white/20 text-white border border-white/40 ring-2 ring-white/20 scale-110'
                      : 'bg-white/5 text-white/30 border border-white/10'
                } ${accessible ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
              >
                {done ? '✓' : meta.icon}
              </button>
            </React.Fragment>
          );
        })}
      </div>
      <div className="text-center mt-2">
        <span className="text-xs text-white/50">
          Step {currentIdx + 1} of {steps.length - 1} — {STEP_META[currentStep]?.label}
        </span>
      </div>
    </div>
  );
}

// ─── Step Container ──────────────────────────────────────────────────
function StepContainer({ children, stepKey }) {
  const meta = STEP_META[stepKey];
  return (
    <div className="animate-fadeIn">
      <div className={`mx-auto max-w-lg bg-gradient-to-br ${meta.color} p-[1px] rounded-2xl`}>
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── 1. Welcome ──────────────────────────────────────────────────────
function WelcomeStep({ onNext }) {
  const features = [
    { icon: '🧠', title: 'AI-Powered', desc: 'Multi-LLM routing via Heady Brain' },
    { icon: '🔒', title: 'Secure Email', desc: 'Encrypted @headyme.com address' },
    { icon: '🎨', title: 'Custom UI', desc: 'Sacred-Geometry-optimised layouts' },
    { icon: '⚡', title: 'HeadySwarm', desc: 'Cloud workers for peak performance' },
  ];

  return (
    <StepContainer stepKey="WELCOME">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🌟</div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to HeadyBuddy</h2>
        <p className="text-white/60 text-sm leading-relaxed">
          Your intelligent workspace companion. Set up takes about 3 minutes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {features.map(f => (
          <div key={f.title} className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-xl mb-1">{f.icon}</div>
            <h3 className="text-white text-sm font-semibold">{f.title}</h3>
            <p className="text-white/40 text-xs">{f.desc}</p>
          </div>
        ))}
      </div>

      <button onClick={onNext}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-indigo-500 transition-all active:scale-[0.98]">
        Get Started
      </button>
    </StepContainer>
  );
}

// ─── 2. Auth ─────────────────────────────────────────────────────────
function AuthStep({ onNext, user }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, auto-advance
  useEffect(() => {
    if (user) {
      onNext({
        provider: user.providerData?.[0]?.providerId || 'email',
        email: user.email,
        displayName: user.displayName,
      });
    }
  }, [user]);

  const handleGoogle = async () => {
    setLoading(true); setError('');
    const result = await signInGoogle();
    setLoading(false);
    if (result.error) setError(result.error);
    // onAuthChange in parent will trigger onNext via useOnboarding
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const fn = mode === 'signup' ? signUpEmail : signInEmail;
    const result = await fn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <StepContainer stepKey="AUTH">
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">🔐</div>
        <h2 className="text-xl font-bold text-white">Sign In to Continue</h2>
        <p className="text-white/50 text-sm">Create or access your Heady account</p>
      </div>

      <button onClick={handleGoogle} disabled={loading}
        className="w-full py-3 bg-white text-gray-800 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors mb-4 disabled:opacity-50">
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-white/15" />
        <span className="text-white/30 text-xs">or</span>
        <div className="flex-1 h-px bg-white/15" />
      </div>

      <form onSubmit={handleEmail} className="space-y-3">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email address" required
          className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password" required minLength={6}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400" />

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-400 hover:to-cyan-500 transition-all disabled:opacity-50">
          {loading ? 'Loading...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <button onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}
        className="w-full text-center text-white/40 text-xs mt-3 hover:text-white/60">
        {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>

      {error && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-xs text-center">
          {error}
        </div>
      )}
    </StepContainer>
  );
}

// ─── 3. Permissions ──────────────────────────────────────────────────
function PermissionsStep({ onNext }) {
  const [grants, setGrants] = useState({
    filesystem: true,
    integrations: true,
    cloudStorage: true,
    notifications: true,
    analytics: false,
  });

  const toggleGrant = (key) => setGrants(g => ({ ...g, [key]: !g[key] }));

  const permItems = [
    { key: 'filesystem', label: 'Local Files', desc: 'Read project files for AI context', icon: '📁' },
    { key: 'integrations', label: 'Service Integrations', desc: 'Connect GitHub, Slack, Discord', icon: '🔌' },
    { key: 'cloudStorage', label: 'Cloud Storage', desc: 'Store preferences and context', icon: '☁️' },
    { key: 'notifications', label: 'Notifications', desc: 'Task updates and AI suggestions', icon: '🔔' },
    { key: 'analytics', label: 'Usage Analytics', desc: 'Help improve HeadyBuddy (optional)', icon: '📊' },
  ];

  return (
    <StepContainer stepKey="PERMISSIONS">
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">🛡️</div>
        <h2 className="text-xl font-bold text-white">Configure Permissions</h2>
        <p className="text-white/50 text-sm">Choose what HeadyBuddy can access</p>
      </div>

      <div className="space-y-2 mb-6">
        {permItems.map(p => (
          <button key={p.key} onClick={() => toggleGrant(p.key)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              grants[p.key]
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-white/5 border-white/10 opacity-60'
            }`}>
            <span className="text-xl">{p.icon}</span>
            <div className="flex-1 text-left">
              <div className="text-white text-sm font-medium">{p.label}</div>
              <div className="text-white/40 text-xs">{p.desc}</div>
            </div>
            <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${
              grants[p.key] ? 'bg-emerald-500 justify-end' : 'bg-white/15 justify-start'
            }`}>
              <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </div>
          </button>
        ))}
      </div>

      <button onClick={() => onNext({ scope: 'custom', ...grants })}
        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all active:scale-[0.98]">
        Continue
      </button>
    </StepContainer>
  );
}

// ─── 4. Account Setup ────────────────────────────────────────────────
function AccountSetupStep({ onNext, user }) {
  const defaultUsername = (user?.displayName || user?.email?.split('@')[0] || '')
    .toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9._-]/g, '').slice(0, 24);
  const [username, setUsername] = useState(defaultUsername);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [error, setError] = useState('');

  const validate = () => {
    const u = username.trim().toLowerCase();
    if (u.length < 3) return 'Username must be at least 3 characters';
    if (u.length > 24) return 'Username must be 24 characters or fewer';
    if (!/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/.test(u)) return 'Must start/end with letter or number';
    const reserved = ['admin', 'root', 'heady', 'support', 'noreply', 'postmaster'];
    if (reserved.includes(u)) return `"${u}" is reserved`;
    return '';
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setError(err); return; }
    onNext({
      username: username.trim().toLowerCase(),
      email: `${username.trim().toLowerCase()}@headyme.com`,
      displayName: displayName.trim() || username,
      timezone,
    });
  };

  return (
    <StepContainer stepKey="ACCOUNT_SETUP">
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">👤</div>
        <h2 className="text-xl font-bold text-white">Create Your Account</h2>
        <p className="text-white/50 text-sm">Choose your @headyme.com identity</p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-white/60 text-xs block mb-1">Username</label>
          <div className="flex items-center bg-white/5 border border-white/15 rounded-xl overflow-hidden focus-within:border-amber-400">
            <input type="text" value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="your-name"
              className="flex-1 px-4 py-2.5 bg-transparent text-white placeholder-white/30 text-sm focus:outline-none" />
            <span className="pr-4 text-white/30 text-sm">@headyme.com</span>
          </div>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        <div>
          <label className="text-white/60 text-xs block mb-1">Display Name</label>
          <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
            placeholder="Your Name"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400" />
        </div>

        <div>
          <label className="text-white/60 text-xs block mb-1">Timezone</label>
          <select value={timezone} onChange={e => setTimezone(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 appearance-none">
            {Intl.supportedValuesOf?.('timeZone')?.slice(0, 50).map(tz => (
              <option key={tz} value={tz} className="bg-gray-900">{tz}</option>
            )) || <option value={timezone} className="bg-gray-900">{timezone}</option>}
          </select>
        </div>
      </div>

      {username.trim().length >= 3 && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
          <span className="text-amber-300 text-sm font-medium">{username.trim().toLowerCase()}@headyme.com</span>
        </div>
      )}

      <button onClick={handleSubmit}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all active:scale-[0.98]">
        Create Account
      </button>
    </StepContainer>
  );
}

// ─── 5. Email Setup (skippable) ──────────────────────────────────────
function EmailSetupStep({ onNext, onSkip, accountData }) {
  const headyEmail = accountData?.email || 'you@headyme.com';
  const [mode, setMode] = useState('gmail-web');
  const [forwardTo, setForwardTo] = useState('');

  const modes = [
    { id: 'gmail-web', label: 'Gmail Web', desc: 'Access via Gmail — no setup needed', icon: '🌐' },
    { id: 'secure-client', label: 'Secure Client', desc: 'Thunderbird, K-9 Mail, FairEmail', icon: '🔒' },
    { id: 'forward', label: 'Forward Email', desc: 'Forward to another email address', icon: '📤' },
  ];

  return (
    <StepContainer stepKey="EMAIL_SETUP">
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">📧</div>
        <h2 className="text-xl font-bold text-white">Set Up Secure Email</h2>
        <p className="text-white/50 text-sm">
          Your address: <span className="text-pink-300 font-medium">{headyEmail}</span>
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {modes.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              mode === m.id ? 'bg-pink-500/10 border-pink-500/30' : 'bg-white/5 border-white/10'
            }`}>
            <span className="text-xl">{m.icon}</span>
            <div className="text-left flex-1">
              <div className="text-white text-sm font-medium">{m.label}</div>
              <div className="text-white/40 text-xs">{m.desc}</div>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 ${
              mode === m.id ? 'border-pink-400 bg-pink-400' : 'border-white/20'
            }`} />
          </button>
        ))}
      </div>

      {mode === 'forward' && (
        <input type="email" value={forwardTo} onChange={e => setForwardTo(e.target.value)}
          placeholder="Forward to email..."
          className="w-full px-4 py-2.5 mb-4 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-400" />
      )}

      <div className="flex gap-2">
        <button onClick={onSkip}
          className="flex-1 py-3 bg-white/5 border border-white/15 text-white/60 font-medium rounded-xl hover:bg-white/10 transition-all">
          Skip for Now
        </button>
        <button onClick={() => onNext({ mode, forwardTo: mode === 'forward' ? forwardTo : null, headyEmail })}
          className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-400 hover:to-rose-500 transition-all active:scale-[0.98]">
          Configure
        </button>
      </div>
    </StepContainer>
  );
}

// ─── 6. UI Customization ─────────────────────────────────────────────
function UICustomizationStep({ onNext }) {
  const [theme, setTheme] = useState('dark');
  const [density, setDensity] = useState('comfortable');
  const [accent, setAccent] = useState('#8b5cf6');

  const themes = [
    { id: 'dark', label: 'Dark', preview: 'bg-gray-900' },
    { id: 'light', label: 'Light', preview: 'bg-gray-100' },
    { id: 'auto', label: 'Auto', preview: 'bg-gradient-to-r from-gray-900 to-gray-100' },
  ];

  const densities = [
    { id: 'compact', label: 'Compact' },
    { id: 'comfortable', label: 'Comfortable' },
    { id: 'spacious', label: 'Spacious' },
  ];

  const accents = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  return (
    <StepContainer stepKey="UI_CUSTOMIZATION">
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">🎨</div>
        <h2 className="text-xl font-bold text-white">Customise Your Workspace</h2>
        <p className="text-white/50 text-sm">Make it yours</p>
      </div>

      {/* Theme */}
      <div className="mb-4">
        <label className="text-white/60 text-xs block mb-2">Theme</label>
        <div className="flex gap-2">
          {themes.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className={`flex-1 p-3 rounded-xl border transition-all ${
                theme === t.id ? 'border-violet-400 ring-1 ring-violet-400/30' : 'border-white/10'
              }`}>
              <div className={`w-full h-8 rounded-lg mb-1 ${t.preview}`} />
              <span className="text-white text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div className="mb-4">
        <label className="text-white/60 text-xs block mb-2">Layout Density</label>
        <div className="flex gap-2">
          {densities.map(d => (
            <button key={d.id} onClick={() => setDensity(d.id)}
              className={`flex-1 py-2 rounded-xl border text-sm transition-all ${
                density === d.id
                  ? 'border-violet-400 bg-violet-500/10 text-white'
                  : 'border-white/10 text-white/40'
              }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accent colour */}
      <div className="mb-6">
        <label className="text-white/60 text-xs block mb-2">Accent Colour</label>
        <div className="flex gap-2">
          {accents.map(c => (
            <button key={c} onClick={() => setAccent(c)}
              className={`w-8 h-8 rounded-full transition-all ${
                accent === c ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
              }`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-4 p-4 rounded-xl border border-white/10" style={{ borderColor: accent + '40' }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
          <span className="text-white text-sm font-medium">Dashboard Preview</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-16 rounded-lg bg-white/5 border border-white/5" />
          <div className="flex-1 h-16 rounded-lg bg-white/5 border border-white/5" />
          <div className="flex-1 h-16 rounded-lg bg-white/5 border border-white/5" />
        </div>
      </div>

      <button onClick={() => onNext({ theme, density, colorAccent: accent })}
        className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-400 hover:to-purple-500 transition-all active:scale-[0.98]">
        Apply & Continue
      </button>
    </StepContainer>
  );
}

// ─── 7. Companion Config (skippable) ─────────────────────────────────
function CompanionConfigStep({ onNext, onSkip }) {
  const [name, setName] = useState('HeadyBuddy');
  const [persona, setPersona] = useState('professional');
  const [proactive, setProactive] = useState(true);
  const [capabilities, setCapabilities] = useState({
    research: true, code: true, creative: true, data: true,
  });

  const personas = [
    { id: 'professional', label: 'Professional', icon: '👔', desc: 'Focused and efficient' },
    { id: 'casual', label: 'Casual', icon: '😊', desc: 'Friendly and conversational' },
    { id: 'technical', label: 'Technical', icon: '🔧', desc: 'Detailed and precise' },
    { id: 'creative', label: 'Creative', icon: '🎭', desc: 'Imaginative and explorative' },
  ];

  const toggleCap = key => setCapabilities(c => ({ ...c, [key]: !c[key] }));

  return (
    <StepContainer stepKey="COMPANION_CONFIG">
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">🤖</div>
        <h2 className="text-xl font-bold text-white">Configure Your Companion</h2>
        <p className="text-white/50 text-sm">Personalise your AI assistant</p>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="text-white/60 text-xs block mb-1">Companion Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="HeadyBuddy"
          className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-400" />
      </div>

      {/* Persona */}
      <div className="mb-4">
        <label className="text-white/60 text-xs block mb-2">Personality</label>
        <div className="grid grid-cols-2 gap-2">
          {personas.map(p => (
            <button key={p.id} onClick={() => setPersona(p.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                persona === p.id
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-white/10 bg-white/5'
              }`}>
              <div className="text-lg">{p.icon}</div>
              <div className="text-white text-xs font-medium">{p.label}</div>
              <div className="text-white/30 text-[10px]">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div className="mb-4">
        <label className="text-white/60 text-xs block mb-2">Capabilities</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(capabilities).map(([key, enabled]) => (
            <button key={key} onClick={() => toggleCap(key)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                enabled
                  ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-300'
                  : 'border-white/10 text-white/30'
              }`}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Proactive toggle */}
      <button onClick={() => setProactive(!proactive)}
        className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 mb-6">
        <div>
          <div className="text-white text-sm">Proactive Suggestions</div>
          <div className="text-white/30 text-xs">Let Buddy offer tips automatically</div>
        </div>
        <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${
          proactive ? 'bg-cyan-500 justify-end' : 'bg-white/15 justify-start'
        }`}>
          <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
        </div>
      </button>

      <div className="flex gap-2">
        <button onClick={onSkip}
          className="flex-1 py-3 bg-white/5 border border-white/15 text-white/60 font-medium rounded-xl hover:bg-white/10 transition-all">
          Use Defaults
        </button>
        <button onClick={() => onNext({
          name, persona, proactiveMode: proactive,
          capabilities: Object.entries(capabilities).filter(([,v]) => v).map(([k]) => k),
        })}
          className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-[0.98]">
          Save & Continue
        </button>
      </div>
    </StepContainer>
  );
}

// ─── 8. Complete ─────────────────────────────────────────────────────
function CompleteStep({ onFinish, progress }) {
  const accountData = progress?.stepData?.ACCOUNT_SETUP || {};
  const companionData = progress?.stepData?.COMPANION_CONFIG || {};

  return (
    <StepContainer stepKey="COMPLETE">
      <div className="text-center mb-6">
        <div className="text-6xl mb-3 animate-bounce">🚀</div>
        <h2 className="text-2xl font-bold text-white mb-2">You're All Set!</h2>
        <p className="text-white/60 text-sm">
          Welcome to HeadyBuddy, <span className="text-green-300 font-medium">
          {accountData.displayName || accountData.username || 'friend'}</span>
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {accountData.email && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-xl">📧</span>
            <div>
              <div className="text-white text-sm font-medium">Your Email</div>
              <div className="text-green-300 text-xs">{accountData.email}</div>
            </div>
          </div>
        )}
        {companionData.name && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-xl">🤖</span>
            <div>
              <div className="text-white text-sm font-medium">Your Companion</div>
              <div className="text-cyan-300 text-xs">{companionData.name} ({companionData.persona || 'professional'})</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
          <div className="text-lg">📊</div>
          <div className="text-white text-xs mt-1">Dashboard</div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
          <div className="text-lg">💬</div>
          <div className="text-white text-xs mt-1">Chat with Buddy</div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
          <div className="text-lg">🔌</div>
          <div className="text-white text-xs mt-1">Connectors</div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
          <div className="text-lg">⚙️</div>
          <div className="text-white text-xs mt-1">Settings</div>
        </div>
      </div>

      <button onClick={onFinish}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all active:scale-[0.98] text-lg">
        Go to Dashboard
      </button>
    </StepContainer>
  );
}

// ─── Main Onboarding Component ───────────────────────────────────────
export default function Onboarding({ user, onboarding, onComplete }) {
  const {
    progress, currentStep, advanceStep, skipStep, goToStep,
  } = onboarding;

  const renderStep = () => {
    switch (currentStep) {
      case 'WELCOME':
        return <WelcomeStep onNext={() => advanceStep('WELCOME', { viewedAt: Date.now() })} />;
      case 'AUTH':
        return <AuthStep user={user} onNext={(data) => advanceStep('AUTH', data)} />;
      case 'PERMISSIONS':
        return <PermissionsStep onNext={(data) => advanceStep('PERMISSIONS', data)} />;
      case 'ACCOUNT_SETUP':
        return <AccountSetupStep user={user} onNext={(data) => advanceStep('ACCOUNT_SETUP', data)} />;
      case 'EMAIL_SETUP':
        return <EmailSetupStep
          onNext={(data) => advanceStep('EMAIL_SETUP', data)}
          onSkip={() => skipStep('EMAIL_SETUP')}
          accountData={progress.stepData?.ACCOUNT_SETUP} />;
      case 'UI_CUSTOMIZATION':
        return <UICustomizationStep onNext={(data) => advanceStep('UI_CUSTOMIZATION', data)} />;
      case 'COMPANION_CONFIG':
        return <CompanionConfigStep
          onNext={(data) => advanceStep('COMPANION_CONFIG', data)}
          onSkip={() => skipStep('COMPANION_CONFIG')} />;
      case 'COMPLETE':
        return <CompleteStep progress={progress} onFinish={onComplete} />;
      default:
        return <WelcomeStep onNext={() => advanceStep('WELCOME', { viewedAt: Date.now() })} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950 flex flex-col">
      {/* Progress bar */}
      <ProgressBar
        steps={onboarding.STEPS}
        currentStep={currentStep}
        completedSteps={progress.completedSteps}
        onStepClick={goToStep}
      />

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="text-center py-3 text-white/20 text-xs">
        HeadyBuddy by HeadyConnection &middot; headyme.com
      </div>
    </div>
  );
}
