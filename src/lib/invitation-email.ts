/**
 * invitation-email.ts — Day 46 Task 2: branded staff-invitation email.
 * Same self-contained inline-styled HTML approach as lib/bulletin.ts's
 * renderBulletinEmailHtml — email clients strip <style> blocks/external CSS.
 */
import type { ChurchBranding } from '@/lib/church-branding';
import { ROLE_LABEL } from '@/lib/team';
import type { UserRole } from '@/lib/site';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderInvitationEmailHtml(opts: {
  churchName: string;
  branding: ChurchBranding;
  inviterName: string;
  role: UserRole;
  acceptUrl: string;
}): string {
  const { churchName, branding, inviterName, role, acceptUrl } = opts;

  return `<!doctype html>
<html><body style="margin:0;background:#f3efe7;font-family:Georgia,serif;color:#1d1a17;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;margin:24px 0;border-radius:12px;overflow:hidden;">
      <tr><td style="background:${branding.accentColor};padding:28px 32px;text-align:center;">
        ${branding.logoUrl ? `<img src="${escapeHtml(branding.logoUrl)}" alt="${escapeHtml(churchName)}" height="40" style="margin-bottom:8px;" />` : ''}
        <div style="color:#fff;font-size:20px;font-weight:bold;">${escapeHtml(churchName)}</div>
      </td></tr>
      <tr><td style="padding:28px 32px;">
        <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
          <strong>${escapeHtml(inviterName)}</strong> has invited you to join the <strong>${escapeHtml(churchName)}</strong> team on Elevanda ChMS as <strong>${ROLE_LABEL[role]}</strong>.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${escapeHtml(acceptUrl)}" style="display:inline-block;background:${branding.accentColor};color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:bold;">
            Accept Invitation
          </a>
        </div>
        <p style="font-size:13px;color:#6b625b;line-height:1.5;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${escapeHtml(acceptUrl)}" style="color:${branding.accentColor};">${escapeHtml(acceptUrl)}</a>
        </p>
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #eee;text-align:center;color:#a39c93;font-size:12px;">
        ${escapeHtml(churchName)} · Elevanda ChMS
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
