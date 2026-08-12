/**
 * geo.ts — Africa outline projection for the superadmin geographic
 * distribution map (Day 45).
 *
 * The outline is a simplified/stylized silhouette (a low-vertex-count
 * coastline trace), not survey-accurate cartography — it's built to be
 * instantly recognizable at dashboard-widget size, not for measurement.
 * Both the outline and the church dot markers are projected through the
 * same equirectangular `projectLatLng`, so markers always land in the
 * right place *relative to the outline* even though the outline itself
 * is a simplification.
 */

const LNG_MIN = -18;
const LNG_MAX = 52;
const LAT_MIN = -36;
const LAT_MAX = 38;

export const GEO_VIEWBOX_WIDTH = 500;
export const GEO_VIEWBOX_HEIGHT = 520;

export function projectLatLng(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * GEO_VIEWBOX_WIDTH;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * GEO_VIEWBOX_HEIGHT;
  return { x, y };
}

/** [lat, lng] vertices tracing a simplified Africa coastline, clockwise from Tunisia. */
const AFRICA_OUTLINE_LATLNG: [number, number][] = [
  [37.0, 10.0],   // Tunisia, north coast
  [35.8, -5.5],   // Morocco, Mediterranean
  [30.5, -9.5],   // Morocco, Atlantic
  [21.0, -17.0],  // Western Sahara
  [18.0, -16.5],  // Mauritania
  [14.7, -17.5],  // Senegal (Dakar)
  [11.0, -15.5],  // Guinea-Bissau / Guinea
  [7.5, -13.0],   // Sierra Leone / Liberia
  [5.0, -3.0],    // Ivory Coast / Ghana
  [6.3, 2.5],     // Togo / Benin (Bight of Benin)
  [4.3, 8.0],      // Nigeria (Bight of Bonny)
  [2.2, 9.5],      // Cameroon
  [-1.0, 9.0],     // Gabon
  [-6.0, 12.0],    // Congo mouth
  [-12.0, 13.0],   // Angola
  [-18.5, 12.5],   // Namibia
  [-28.5, 14.5],   // Namibia / South Africa (Orange river)
  [-34.3, 18.0],   // Cape of Good Hope
  [-34.8, 20.0],   // Cape Agulhas
  [-29.9, 31.0],   // Durban, South Africa
  [-21.0, 35.5],   // Mozambique
  [-6.8, 39.3],    // Tanzania (Dar es Salaam)
  [-1.5, 41.5],    // Kenya coast
  [0.5, 42.5],     // Somalia (south)
  [11.8, 51.5],    // Cape Guardafui — Horn of Africa
  [11.5, 43.5],    // Gulf of Aden coast
  [15.0, 42.5],    // Eritrea / Djibouti
  [20.0, 37.5],    // Sudan, Red Sea
  [27.5, 34.5],    // Egypt, Red Sea
  [31.5, 34.0],    // Sinai
  [31.2, 29.0],    // Egypt, Mediterranean (Alexandria)
  [32.8, 20.0],    // Libya
  [33.2, 11.5],    // Libya / Tunisia
];

export const AFRICA_OUTLINE_PATH: string = (() => {
  const pts = AFRICA_OUTLINE_LATLNG.map(([lat, lng]) => projectLatLng(lat, lng));
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
})();
