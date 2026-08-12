'use client';

/**
 * OnboardingChecklistWidget — Day 50 Task 2. "Complete your setup — N of
 * 7 steps done" with an expandable checklist and direct links to each
 * incomplete step. Hides itself once everything is done.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, ListChecks } from 'lucide-react';
import type { ChecklistStep } from '@/app/api/church/onboarding-checklist/route';

export function OnboardingChecklistWidget() {
  const [steps, setSteps] = useState<ChecklistStep[]>([]);
  const [doneCount, setDoneCount] = useState(0);
  const [total, setTotal] = useState(7);
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/church/onboarding-checklist')
      .then((r) => r.json())
      .then((json: { data?: { steps: ChecklistStep[]; doneCount: number; total: number } }) => {
        if (json.data) {
          setSteps(json.data.steps);
          setDoneCount(json.data.doneCount);
          setTotal(json.data.total);
        }
      })
      .catch(() => {});
  }, []);

  if (dismissed || total === 0 || doneCount >= total) return null;

  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className="onboard-widget">
      <button type="button" className="onboard-widget__head" onClick={() => setOpen((o) => !o)}>
        <span className="onboard-widget__icon"><ListChecks size={16} aria-hidden="true" /></span>
        <span className="onboard-widget__copy">
          <strong>Complete your setup</strong>
          <span>{doneCount} of {total} steps done</span>
        </span>
        <span className="onboard-widget__track">
          <span className="onboard-widget__fill" style={{ width: `${pct}%` }} />
        </span>
        {open ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
      </button>

      {open && (
        <ul className="onboard-widget__steps">
          {steps.map((s) => (
            <li key={s.key} className={s.done ? 'onboard-widget__step--done' : ''}>
              {s.done ? <CheckCircle2 size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
              {s.done ? (
                <span>{s.label}</span>
              ) : (
                <Link href={s.href}>{s.label}</Link>
              )}
            </li>
          ))}
          <li className="onboard-widget__dismiss">
            <button type="button" onClick={() => setDismissed(true)}>Hide this checklist</button>
          </li>
        </ul>
      )}
    </div>
  );
}

export default OnboardingChecklistWidget;
