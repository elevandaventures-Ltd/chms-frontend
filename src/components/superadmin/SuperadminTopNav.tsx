'use client';

/**
 * SuperadminTopNav — Day 41. Lightweight top bar for the platform-owner
 * workspace: page title, live "Platform Owner" badge, and sign out.
 */
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const PATH_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/superadmin':               { title: 'Platform Dashboard', subtitle: 'Health metrics across every church on Elevanda' },
  '/superadmin/churches':      { title: 'Churches',           subtitle: 'Manage every tenant on the platform' },
  '/superadmin/feature-flags': { title: 'Feature Flags',      subtitle: 'Toggle capabilities per church' },
  '/superadmin/audit-log':     { title: 'Audit Log',          subtitle: 'Every superadmin action, recorded' },
};

function titlesFromPath(pathname: string) {
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname];
  const partial = Object.keys(PATH_TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname.startsWith(k));
  return partial ? PATH_TITLES[partial] : { title: 'Platform Dashboard', subtitle: 'Elevanda Ventures superadmin' };
}

export function SuperadminTopNav() {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const [signingOut, setSigningOut] = useState(false);
  const { title, subtitle } = useMemo(() => titlesFromPath(pathname), [pathname]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const sb = getSupabaseBrowserClient();
      if (sb) await sb.auth.signOut();
    } catch { /* ignore */ }
    window.location.href = '/login';
  }

  return (
    <header className="sa-topnav" role="banner">
      <div className="sa-topnav__titles">
        <h1 className="sa-topnav__title">{title}</h1>
        <p className="sa-topnav__subtitle">{subtitle}</p>
      </div>

      <div className="sa-topnav__actions">
        <span className="sa-topnav__badge">
          <ShieldCheck size={13} aria-hidden="true" />
          Platform Owner
        </span>

        <div className="sa-topnav__user">
          <span className="sa-topnav__user-name">
            {currentUser.name || currentUser.email?.split('@')[0] || 'Platform Owner'}
          </span>
          <button
            type="button"
            className="sa-topnav__signout"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
          >
            <LogOut size={14} aria-hidden="true" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default SuperadminTopNav;
