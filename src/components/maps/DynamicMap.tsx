'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import LoaderRectangle from '@/components/ui/LoaderRectangle';

/**
 * Loading fallback placeholder rendered on the server before client-side hydration
 */
const MapLoadingPlaceholder = ({ height = '320px', text = 'Loading interactive map...' }: { height?: string; text?: string }) => (
  <div 
    className="w-full rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2.5 shadow-2xs"
    style={{ height }}
  >
    <LoaderRectangle />
    <span className="text-[10px] font-black uppercase tracking-wider text-[#032031]/60">
      {text}
    </span>
  </div>
);

/**
 * SSR-Safe Interactive Location Picker Map
 * Allows dragging the pin or clicking to calibrate GPS coordinates and preview circular geofences.
 */
export const LocationPickerMap = dynamic(
  () => import('./DraggableLocationPicker').then((mod) => mod.DraggableLocationPicker),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder height="320px" text="Loading GPS geofence map..." />,
  }
);

/**
 * SSR-Safe Read-Only Site Geofence Preview Map
 */
export const StaticSiteMap = dynamic(
  () => import('./StaticSiteMap').then((mod) => mod.StaticSiteMap),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder height="240px" text="Loading perimeter overview..." />,
  }
);

export default LocationPickerMap;
