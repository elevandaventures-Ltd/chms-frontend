'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, QrCode } from 'lucide-react';
import { encodeMemberQr } from '@/lib/qr';
import type { Member } from '@/lib/site';

type MemberQRCodeProps = { member: Member };

// Renders the member's check-in QR code with a print action. The QR encodes a
// namespaced token (see lib/qr) so the attendance scanner can recognise it.
export function MemberQRCode({ member }: MemberQRCodeProps) {
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(encodeMemberQr(member.id), { width: 220, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => { if (!cancelled) setDataUrl(url); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [member.id]);

  function handlePrint() {
    if (!dataUrl) return;
    const win = window.open('', '_blank');
    if (!win) return;
    const safeName = member.fullName.replace(/[<>&"]/g, '');
    win.document.write(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>Check-in QR · ${safeName}</title>
<style>
  body { font-family: Inter, system-ui, sans-serif; text-align: center; margin: 0; padding: 48px 24px; color: #231d18; }
  .name { font-size: 20px; font-weight: 700; margin: 20px 0 4px; }
  .sub { font-size: 13px; color: #6b625b; margin: 0; }
  img { width: 280px; height: 280px; }
</style></head>
<body>
  <img src="${dataUrl}" alt="QR code for ${safeName}" />
  <p class="name">${safeName}</p>
  <p class="sub">Scan to check in · Elevanda ChMS</p>
  <script>window.onload = function () { window.focus(); window.print(); };<\/script>
</body></html>`);
    win.document.close();
  }

  return (
    <section className="mpd-info__section">
      <h4 className="mpd-info__section-title">Check-in QR</h4>
      <div className="member-qr">
        <div className="member-qr__code">
          {error ? (
            <span className="member-qr__error"><QrCode size={28} aria-hidden="true" /></span>
          ) : dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt={`Check-in QR code for ${member.fullName}`} className="member-qr__img" />
          ) : (
            <span className="member-qr__loading" aria-hidden="true" />
          )}
        </div>
        <div className="member-qr__copy">
          <p className="member-qr__hint">Present this code at the door to check in by camera.</p>
          <button type="button" className="msm-btn msm-btn--secondary" onClick={handlePrint} disabled={!dataUrl}>
            <Printer size={15} aria-hidden="true" /> Print QR
          </button>
        </div>
      </div>
    </section>
  );
}

export default MemberQRCode;
