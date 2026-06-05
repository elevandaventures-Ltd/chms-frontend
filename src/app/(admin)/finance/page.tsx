import AdminShell from '@/components/AdminShell';

export default function FinancePage() {
  return (
    <AdminShell title="Finance" subtitle="Giving records and financial reports">
      <div className="admin-placeholder">
        <h2>Finance</h2>
        <p>This page is only visible to Admin and Finance roles.</p>
        <p>Giving records, budgets, and financial reporting will be built in a future sprint.</p>
      </div>
    </AdminShell>
  );
}
