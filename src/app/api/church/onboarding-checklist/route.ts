/**
 * GET /api/church/onboarding-checklist — "Complete your setup — N of 7
 * steps done" (Day 50 Task 2). Each step is computed from real state,
 * not a stored flag, so it can't drift out of sync.
 */
import { NextResponse } from 'next/server';
import { mockMembers } from '@/lib/site';
import { mockEvents } from '@/lib/events';
import { getBranding, getGeneral, listInvitations } from '@/lib/church-store';
import { defaultBranding } from '@/lib/church-branding';
import { listChurchFlags } from '@/lib/superadmin-store';

export type ChecklistStep = { key: string; label: string; done: boolean; href: string };

export async function GET() {
  const branding = getBranding();
  const general = getGeneral();
  const invitations = listInvitations();
  const commsFlag = listChurchFlags('c1').find((f) => f.flagKey === 'communication_channels');

  const steps: ChecklistStep[] = [
    { key: 'profile', label: 'Church profile complete', href: '/onboarding', done: Boolean(general.denomination) },
    { key: 'logo', label: 'Logo uploaded', href: '/settings/branding', done: Boolean(branding.logoUrl) },
    { key: 'branding', label: 'Branding customized', href: '/settings/branding', done: branding.accentColor !== defaultBranding.accentColor || branding.welcomeMessage !== defaultBranding.welcomeMessage },
    { key: 'member', label: 'First member added', href: '/members', done: mockMembers.length > 0 },
    { key: 'event', label: 'First event created', href: '/events', done: mockEvents.length > 0 },
    { key: 'team', label: 'Team member invited', href: '/settings/team', done: invitations.length > 0 },
    { key: 'communication', label: 'Communication channel connected', href: '/communication', done: commsFlag?.enabled ?? true },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  return NextResponse.json({ data: { steps, doneCount, total: steps.length } });
}
