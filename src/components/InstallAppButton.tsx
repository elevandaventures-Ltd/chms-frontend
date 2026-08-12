'use client';

/**
 * InstallAppButton — Day 56 Task 1. Custom "Install App" button in the
 * nav bar; only renders once a `beforeinstallprompt` event has actually
 * fired (so it's invisible on browsers that don't support it, rather
 * than a dead button — see useInstallPrompt's header comment).
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

export function InstallAppButton() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [busy, setBusy] = useState(false);

  if (!canInstall) return null;

  async function handleClick() {
    setBusy(true);
    try {
      const outcome = await promptInstall();
      if (outcome === 'accepted') toast.success('Elevanda ChMS installed!');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="install-app-btn" onClick={handleClick} disabled={busy}>
      <Download size={14} aria-hidden="true" />
      Install App
    </button>
  );
}

export default InstallAppButton;
