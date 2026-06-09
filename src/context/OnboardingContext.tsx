'use client';

/**
 * OnboardingContext — wizard state management for the 5-step church
 * registration flow.
 *
 * Steps:
 *   1 — Identity + Denomination (church name, logo, affiliation — merged)
 *   2 — Contact       (contact details + address)
 *   3 — Plan          (Community / Growth / Enterprise)
 *   4 — Review        (read-only summary + submit)
 *   5 — Done          (success screen)
 */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

// ── Plan type ─────────────────────────────────────────────────────────────────

export type PlanId = 'community' | 'growth' | 'enterprise';

export type Plan = {
  id: PlanId;
  name: string;
  price: string;          // display string e.g. "Free", "$29 / mo"
  priceMonthly: number;   // numeric for submission (0, 29, 99)
  description: string;
  features: string[];
  highlight?: boolean;    // renders the "Recommended" badge
};

export const PLANS: Plan[] = [
  {
    id: 'community',
    name: 'Community',
    price: 'Free',
    priceMonthly: 0,
    description: 'Everything you need to get started.',
    features: [
      'Up to 100 members',
      'Attendance tracking',
      'Basic event management',
      'Email communication',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$29 / mo',
    priceMonthly: 29,
    description: 'For growing churches ready to scale.',
    features: [
      'Up to 500 members',
      'Advanced reporting',
      'Finance module',
      'SMS communication',
      'Priority support',
    ],
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99+ / mo',
    priceMonthly: 99,
    description: 'Unlimited capacity for large ministries.',
    features: [
      'Unlimited members',
      'Multi-campus support',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
  },
];

// ── Wizard data ───────────────────────────────────────────────────────────────

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

  // Step 4 — Plan
  plan: PlanId;
};

export type StepId = 1 | 2 | 3 | 4 | 5;

type OnboardingContextValue = {
  step: StepId;
  data: OnboardingData;
  patch: (updates: Partial<OnboardingData>) => void;
  next: () => void;
  back: () => void;
  goTo: (step: StepId) => void;
  totalSteps: number;
};

// ── Defaults ──────────────────────────────────────────────────────────────────

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
  plan: 'community',
};

const TOTAL_STEPS = 5;

// ── Context ───────────────────────────────────────────────────────────────────

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
    <OnboardingContext.Provider
      value={{ step, data, patch, next, back, goTo, totalSteps: TOTAL_STEPS }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>.');
  return ctx;
}
