/**
 * useOnboarding — React hook for managing the 8-stage onboarding flow.
 * Persists progress to localStorage so users can resume across sessions.
 * Syncs with backend /api/onboarding/* when available.
 */
import { useState, useCallback, useEffect } from 'react';

export const STEPS = [
  'WELCOME',
  'AUTH',
  'PERMISSIONS',
  'ACCOUNT_SETUP',
  'EMAIL_SETUP',
  'UI_CUSTOMIZATION',
  'COMPANION_CONFIG',
  'COMPLETE',
];

const SKIPPABLE = new Set(['EMAIL_SETUP', 'COMPANION_CONFIG']);
const STORAGE_KEY = 'heady:onboarding:progress';
const API_BASE = import.meta.env.VITE_API_URL || 'https://manager.headysystems.com';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch { /* quota */ }
}

function seedProgress() {
  return {
    currentStep: 'WELCOME',
    status: 'in_progress',
    completedSteps: {},
    skippedSteps: {},
    stepData: {},
    startedAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function useOnboarding(user) {
  const [progress, setProgress] = useState(() => loadProgress() || seedProgress());

  // Persist on every change
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // If user completes auth externally (firebase), auto-advance past AUTH
  useEffect(() => {
    if (user && progress.currentStep === 'AUTH' && !progress.completedSteps.AUTH) {
      advanceStep('AUTH', {
        provider: user.providerData?.[0]?.providerId || 'email',
        email: user.email,
        displayName: user.displayName,
        uid: user.uid,
      });
    }
  }, [user, progress.currentStep]);

  const currentStepIndex = STEPS.indexOf(progress.currentStep);
  const percentComplete = progress.status === 'complete'
    ? 100
    : Math.round((Object.keys(progress.completedSteps).length / (STEPS.length - 1)) * 100);

  const advanceStep = useCallback((stepName, stepData = {}) => {
    setProgress(prev => {
      const idx = STEPS.indexOf(stepName);
      if (idx === -1) return prev;

      const next = { ...prev };
      next.completedSteps = { ...next.completedSteps, [stepName]: true };
      next.stepData = { ...next.stepData, [stepName]: stepData };
      next.updatedAt = Date.now();

      // Find next uncompleted step
      for (let i = idx + 1; i < STEPS.length; i++) {
        if (!next.completedSteps[STEPS[i]] && !next.skippedSteps[STEPS[i]]) {
          next.currentStep = STEPS[i];
          break;
        }
      }

      if (next.currentStep === 'COMPLETE' || STEPS.indexOf(next.currentStep) <= idx) {
        next.currentStep = 'COMPLETE';
        next.status = 'complete';
        next.completedAt = Date.now();
      }

      return next;
    });

    // Best-effort sync to backend
    syncToBackend(stepName, stepData).catch(() => {});
  }, []);

  const skipStep = useCallback((stepName) => {
    if (!SKIPPABLE.has(stepName)) return;
    setProgress(prev => {
      const idx = STEPS.indexOf(stepName);
      const next = { ...prev };
      next.skippedSteps = { ...next.skippedSteps, [stepName]: true };
      next.completedSteps = { ...next.completedSteps, [stepName]: true };
      next.updatedAt = Date.now();

      for (let i = idx + 1; i < STEPS.length; i++) {
        if (!next.completedSteps[STEPS[i]] && !next.skippedSteps[STEPS[i]]) {
          next.currentStep = STEPS[i];
          return next;
        }
      }
      next.currentStep = 'COMPLETE';
      next.status = 'complete';
      next.completedAt = Date.now();
      return next;
    });
  }, []);

  const goToStep = useCallback((stepName) => {
    const idx = STEPS.indexOf(stepName);
    if (idx === -1) return;
    setProgress(prev => ({ ...prev, currentStep: stepName, updatedAt: Date.now() }));
  }, []);

  const resetOnboarding = useCallback(() => {
    const fresh = seedProgress();
    setProgress(fresh);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isComplete = progress.status === 'complete';
  const isSkippable = SKIPPABLE.has(progress.currentStep);

  return {
    progress,
    currentStep: progress.currentStep,
    currentStepIndex,
    percentComplete,
    isComplete,
    isSkippable,
    advanceStep,
    skipStep,
    goToStep,
    resetOnboarding,
    STEPS,
  };
}

async function syncToBackend(stepName, stepData) {
  try {
    await fetch(`${API_BASE}/api/onboarding/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: stepName.toLowerCase().replace('_', '-'), ...stepData }),
      signal: AbortSignal.timeout(3000),
    });
  } catch { /* best-effort */ }
}
