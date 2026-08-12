'use client';

/**
 * /settings/permissions — Day 49 Task 1. Interactive table: all 6 roles
 * × every feature permission. Click a cell to see exactly what enforces
 * it. Derived live from lib/permissions.ts (itself derived from the
 * sidebar's actual role gates), so it can't drift from what's real.
 */
import { useState } from 'react';
import { Check, Info } from 'lucide-react';
import { ALL_ROLES, ROLE_LABEL, PERMISSION_MATRIX } from '@/lib/permissions';

export default function PermissionsPage() {
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const visibleRoles = roleFilter === 'all' ? ALL_ROLES : [roleFilter as (typeof ALL_ROLES)[number]];

  return (
    <div className="perm-page">
      <div className="bulletin-editor__head">
        <div>
          <h1>Roles &amp; permissions</h1>
          <p>What each of the 6 roles can access. Click a cell for the exact rule behind it.</p>
        </div>
        <label className="sa-select">
          <span>Role</span>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </label>
      </div>

      <div className="perm-matrix-wrap">
        <table className="perm-matrix">
          <thead>
            <tr>
              <th>Feature</th>
              {visibleRoles.map((r) => <th key={r}>{ROLE_LABEL[r]}</th>)}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MATRIX.map((row) => (
              <tr key={row.feature}>
                <td className="perm-matrix__feature">{row.feature}</td>
                {visibleRoles.map((r) => {
                  const has = row.roles.includes(r);
                  const cellKey = `${row.feature}-${r}`;
                  return (
                    <td key={r} className="perm-matrix__cell">
                      <button
                        type="button"
                        className={`perm-matrix__mark${has ? ' perm-matrix__mark--yes' : ''}`}
                        onClick={() => setActiveCell(activeCell === cellKey ? null : cellKey)}
                        aria-label={`${row.feature} — ${ROLE_LABEL[r]}: ${has ? 'allowed' : 'not allowed'}`}
                      >
                        {has ? <Check size={14} aria-hidden="true" /> : <span aria-hidden="true">—</span>}
                      </button>
                      {activeCell === cellKey && (
                        <div className="perm-matrix__tooltip">
                          <Info size={12} aria-hidden="true" />
                          {row.enforcedBy}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
