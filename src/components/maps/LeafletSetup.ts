import L from 'leaflet';

/**
 * Custom Fortress ASR Brand Marker Pin (Deep Navy #032031 with Emerald Accents)
 * Zero external asset dependencies - uses clean SVG for crisp vector rendering on all displays.
 */
export const createBrandPinIcon = (color = '#032031', accent = '#10b981') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 28 16 28s16-16.5 16-28c0-8.837-7.163-16-16-16z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="7" fill="#ffffff"/>
      <circle cx="16" cy="16" r="4.5" fill="${accent}"/>
    </svg>
  `;

  return L.divIcon({
    className: 'fortress-map-marker',
    html: svg,
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -40],
  });
};

/**
 * Default fallback configuration for Leaflet in Next.js
 */
export function setupLeafletDefaultIcons() {
  if (typeof window === 'undefined') return;

  // Fix default icon paths if generic L.Marker is used without an explicit icon
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}
