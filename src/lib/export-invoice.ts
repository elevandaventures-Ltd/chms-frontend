/**
 * export-invoice.ts — "Download Invoice" for the billing history table
 * (Day 42). Dependency-free, same window.print() trick as
 * lib/export-members.ts's exportMembersPdf.
 */
import type { Invoice } from '@/lib/billing';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const STATUS_LABEL: Record<Invoice['status'], string> = {
  paid: 'Paid', failed: 'Failed', refunded: 'Refunded', pending: 'Pending',
};

export function downloadInvoice(invoice: Invoice, churchName = 'Your church'): void {
  const win = window.open('', '_blank');
  if (!win) return; // popup blocked — caller surfaces a hint

  const issued = new Date(invoice.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  win.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(invoice.invoiceNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Inter, system-ui, sans-serif; color: #231d18; margin: 40px; }
    .brand { font-size: 20px; font-weight: 700; margin: 0 0 2px; }
    .sub { color: #6b625b; font-size: 12px; margin: 0 0 28px; }
    h1 { font-size: 16px; margin: 0 0 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e5ddd3; }
    th { background: #f4efe8; text-transform: uppercase; letter-spacing: 0.04em; font-size: 10px; }
    .total-row td { font-weight: 700; border-top: 2px solid #231d18; border-bottom: none; }
    .status { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .status--paid { background: rgba(64,170,85,0.12); color: #2a7a36; }
    .status--failed { background: rgba(220,38,38,0.08); color: #7a1f1f; }
    .status--refunded { background: rgba(244,162,0,0.12); color: #9a6000; }
    .status--pending { background: rgba(244,162,0,0.12); color: #9a6000; }
    @media print { body { margin: 12mm; } }
  </style>
</head>
<body>
  <p class="brand">Elevanda Ventures</p>
  <p class="sub">Church Management System — Billing</p>
  <h1>Invoice ${escapeHtml(invoice.invoiceNumber)}</h1>
  <table>
    <tbody>
      <tr><th>Billed to</th><td>${escapeHtml(churchName)}</td></tr>
      <tr><th>Issued</th><td>${escapeHtml(issued)}</td></tr>
      <tr><th>Status</th><td><span class="status status--${invoice.status}">${STATUS_LABEL[invoice.status]}</span></td></tr>
    </tbody>
  </table>
  <table>
    <thead><tr><th>Description</th><th>Amount</th></tr></thead>
    <tbody>
      <tr><td>Subscription charge</td><td>${invoice.currency} ${invoice.amount.toFixed(2)}</td></tr>
      <tr class="total-row"><td>Total</td><td>${invoice.currency} ${invoice.amount.toFixed(2)}</td></tr>
    </tbody>
  </table>
  <script>window.onload = function () { window.focus(); window.print(); };<\/script>
</body>
</html>`);
  win.document.close();
}
