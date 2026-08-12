'use client';

/**
 * GeoDistributionMap — Day 45. Simplified SVG outline of Africa with a dot
 * marker per church, positioned from church_profiles.latitude/longitude.
 */
import { useState } from 'react';
import { AFRICA_OUTLINE_PATH, GEO_VIEWBOX_WIDTH, GEO_VIEWBOX_HEIGHT, projectLatLng } from '@/lib/geo';
import { PLAN_LABEL, STATUS_LABEL, type SuperadminChurch } from '@/lib/superadmin';

const STATUS_DOT_COLOR: Record<SuperadminChurch['status'], string> = {
  active: '#16a34a', trial: '#d97706', suspended: '#b91c1c', churned: '#8a8377',
};

export function GeoDistributionMap({ churches }: { churches: SuperadminChurch[] }) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const located = churches.filter((c) => c.latitude && c.longitude);
  const hovered = located.find((c) => c.id === hoverId) ?? null;

  return (
    <div className="sa-geomap">
      <svg
        viewBox={`0 0 ${GEO_VIEWBOX_WIDTH} ${GEO_VIEWBOX_HEIGHT}`}
        className="sa-geomap__svg"
        role="img"
        aria-label="Church locations across Africa"
      >
        <path d={AFRICA_OUTLINE_PATH} className="sa-geomap__outline" />

        {located.map((c) => {
          const { x, y } = projectLatLng(c.latitude, c.longitude);
          const isHover = hoverId === c.id;
          return (
            <g key={c.id}>
              <circle
                cx={x} cy={y} r={isHover ? 8 : 6}
                fill={STATUS_DOT_COLOR[c.status]}
                stroke="#fff"
                strokeWidth={2}
                className="sa-geomap__dot"
                onPointerEnter={() => setHoverId(c.id)}
                onPointerLeave={() => setHoverId((id) => (id === c.id ? null : id))}
                tabIndex={0}
                onFocus={() => setHoverId(c.id)}
                onBlur={() => setHoverId((id) => (id === c.id ? null : id))}
                aria-label={`${c.name}, ${c.city}, ${c.country}`}
              />
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div
          className="sa-geomap__tooltip"
          style={{
            left: `${(projectLatLng(hovered.latitude, hovered.longitude).x / GEO_VIEWBOX_WIDTH) * 100}%`,
            top: `${(projectLatLng(hovered.latitude, hovered.longitude).y / GEO_VIEWBOX_HEIGHT) * 100}%`,
          }}
        >
          <strong>{hovered.name}</strong>
          <span>{hovered.city}, {hovered.country}</span>
          <span>{PLAN_LABEL[hovered.plan]} · {STATUS_LABEL[hovered.status]}</span>
        </div>
      )}

      <div className="sa-geomap__legend">
        {(Object.keys(STATUS_DOT_COLOR) as SuperadminChurch['status'][]).map((s) => (
          <span key={s} className="sa-geomap__legend-item">
            <span className="sa-geomap__legend-dot" style={{ background: STATUS_DOT_COLOR[s] }} />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

export default GeoDistributionMap;
