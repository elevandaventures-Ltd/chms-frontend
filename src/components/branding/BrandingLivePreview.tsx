'use client';

/**
 * BrandingLivePreview — Day 50 Task 1. Right-side panel showing how the
 * platform looks with the *currently edited* (not-yet-saved) logo/color
 * settings — a miniature sidebar, buttons, and card rendered with the
 * live values so changes are visible before Save.
 */
import { Church, LayoutDashboard, Users, Bell } from 'lucide-react';
import type { ChurchBranding } from '@/lib/church-branding';

export function BrandingLivePreview({ branding }: { branding: ChurchBranding }) {
  return (
    <div className="brand-preview">
      <span className="brand-preview__label">Live preview</span>

      <div className="brand-preview__frame">
        <div className="brand-preview__sidebar">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logoUrl} alt="" className="brand-preview__logo" />
          ) : (
            <span className="brand-preview__logo-fallback"><Church size={14} aria-hidden="true" /></span>
          )}
          <span className="brand-preview__sidebar-name">Elevanda ChMS</span>
          <div className="brand-preview__nav">
            <span className="brand-preview__nav-item brand-preview__nav-item--active" style={{ background: `${branding.accentColor}22`, color: branding.accentColor }}>
              <LayoutDashboard size={12} aria-hidden="true" /> Dashboard
            </span>
            <span className="brand-preview__nav-item"><Users size={12} aria-hidden="true" /> Members</span>
            <span className="brand-preview__nav-item"><Bell size={12} aria-hidden="true" /> Notifications</span>
          </div>
        </div>

        <div className="brand-preview__main">
          <div className="brand-preview__card">
            <strong>Welcome message</strong>
            <p>{branding.welcomeMessage || 'Your welcome message will appear here.'}</p>
          </div>
          <div className="brand-preview__buttons">
            <span className="brand-preview__btn brand-preview__btn--primary" style={{ background: branding.accentColor }}>Primary button</span>
            <span className="brand-preview__btn brand-preview__btn--secondary" style={{ color: branding.accentColor, borderColor: branding.accentColor }}>Secondary</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandingLivePreview;
