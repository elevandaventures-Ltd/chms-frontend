'use client';

/**
 * BillingHistoryTable — Day 42. Invoice list with a Download Invoice
 * button per row (dependency-free print-to-PDF, see lib/export-invoice.ts).
 */
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { downloadInvoice } from '@/lib/export-invoice';
import type { Invoice } from '@/lib/billing';

const STATUS_TONE: Record<Invoice['status'], 'success' | 'warning' | 'danger' | 'default'> = {
  paid: 'success', failed: 'danger', refunded: 'warning', pending: 'warning',
};

const STATUS_LABEL: Record<Invoice['status'], string> = {
  paid: 'Paid', failed: 'Failed', refunded: 'Refunded', pending: 'Pending',
};

export function BillingHistoryTable({ invoices, churchName }: { invoices: Invoice[]; churchName: string }) {
  if (invoices.length === 0) {
    return <p className="billing-history__empty">No invoices yet.</p>;
  }

  return (
    <div className="billing-history">
      <table className="billing-history__table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.invoiceNumber}</td>
              <td>{new Date(inv.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
              <td>{inv.currency} {inv.amount.toFixed(2)}</td>
              <td><Badge tone={STATUS_TONE[inv.status]}>{STATUS_LABEL[inv.status]}</Badge></td>
              <td>
                <button
                  type="button"
                  className="billing-history__download"
                  onClick={() => downloadInvoice(inv, churchName)}
                >
                  <Download size={13} aria-hidden="true" />
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BillingHistoryTable;
