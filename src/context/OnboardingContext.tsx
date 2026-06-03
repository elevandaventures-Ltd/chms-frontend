'use client';

/**
 * OnboardingContext — wizard state management.
 *
 * Holds all form data across 5 steps and provides helpers for navigation
 * (next, back, goTo) and field updates (patch).  A single `useOnboarding`
 * hook is exposed for step components to consume.
 *
 * Data structure mirrors the `churches` table columns so the final submit
 * can POST it directly to /api/onboarding.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OnboardingData = {
  // Step 1 — Identity
  churchName: string;
  logoFile: File | null;
  logoPreviewUrl: string;

  // Step 2 — Denomination
  denomination: string;
  denominationOther: string;

  // Step 3 — Contact & Address
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type StepId = 1 | 2 | 3 | 4 | 5;

type OnboardingContextValue = {
  step: StepId;
  data: OnboardingData;
  /** Partially update the wizard data (shallow merge). */
  patch: (updates: Partial<OnboardingData>) => void;
  next: () => void;
  back: () => void;
  goTo: (step: StepId) => void;
  totalSteps: number;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_DATA: OnboardingData = {
  churchName: '',
  logoFile: null,
  logoPreviewUrl: '',
  denomination: '',
  denominationOther: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Ghana',
};

const TOTAL_STEPS: StepId = 5;

// ─── Context ──────────────────────────────────────────────────────────────────

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<StepId>(1);
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);

  const patch = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const next = useCallback(() => {
    setStep((s) => (s < TOTAL_STEPS ? ((s + 1) as StepId) : s));
  }, []);

  const back = useCallback(() => {
    setStep((s) => (s > 1 ? ((s - 1) as StepId) : s));
  }, []);

  const goTo = useCallback((target: StepId) => {
    setStep(target);
  }, []);

  return (
    <OnboardingContext.Provider value={{ step, data, patch, next, back, goTo, totalSteps: TOTAL_STEPS }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used inside <OnboardingProvider>.');
  }
  return ctx;
}
