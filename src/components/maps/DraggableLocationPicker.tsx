'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { createBrandPinIcon, setupLeafletDefaultIcons } from './LeafletSetup';

// Ensure icons are set up
setupLeafletDefaultIcons();

interface DraggableLocationPickerProps {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  onChange?: (lat: number, lng: number) => void;
  height?: string;
  zoom?: number;
  interactive?: boolean;
}

export const DraggableLocationPicker: React.FC<DraggableLocationPickerProps> = ({
  latitude,
  longitude,
  radiusMeters = 100,
  onChange,
  height = '320px',
  zoom = 17,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);
  const onChangeRef = useRef(onChange);

  // Map layer toggle: 'satellite' shows actual high-res photographic buildings/roofs, 'streets' shows standard roads
  const [mapType, setMapType] = useState<'satellite' | 'streets'>('satellite');

  // Keep latest onChange in ref to prevent re-triggering map initialization
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Validate coordinates to avoid Leaflet NaN crashes
  const validLat = Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 ? latitude : 51.5074;
  const validLng = Number.isFinite(longitude) && longitude >= -180 && longitude <= 180 ? longitude : -0.1278;

  const brandIcon = useMemo(() => createBrandPinIcon('#032031', '#10b981'), []);

  // Function to switch between Satellite Photography and Street Map
  const applyTileLayer = (type: 'satellite' | 'streets') => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
      labelsLayerRef.current = null;
    }

    if (type === 'satellite') {
      // Free High-Resolution Satellite & Aerial Imagery (Actual photographic buildings, roofs, yards, fences)
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
        }
      ).addTo(map);

      // Overlay road names and place labels on top of the satellite imagery
      labelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      // 100% Free OpenStreetMap standard street map
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    }
  };

  // 1. Initialize map on mount, destroy cleanly on unmount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Destroy any existing map instance and reset container ID to prevent "already initialized" errors
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {
        // Fallback
      }
      mapRef.current = null;
    }

    if ((container as any)._leaflet_id) {
      try {
        delete (container as any)._leaflet_id;
      } catch (e) {
        (container as any)._leaflet_id = null;
      }
    }

    // Create fresh Leaflet map instance with no attribution control
    const map = L.map(container, {
      center: [validLat, validLng],
      zoom: zoom,
      scrollWheelZoom: interactive,
      zoomControl: interactive,
      dragging: interactive,
      attributionControl: false,
    });
    mapRef.current = map;

    // Apply initial satellite tile layer
    applyTileLayer(mapType);

    // Add circular geofence boundary (crisp white/emerald for high visibility over satellite imagery)
    const circle = L.circle([validLat, validLng], {
      radius: radiusMeters,
      color: '#ffffff',
      fillColor: '#10b981',
      fillOpacity: 0.22,
      weight: 2.5,
      dashArray: '5, 5',
    }).addTo(map);
    circleRef.current = circle;

    // Add central draggable gate marker
    const marker = L.marker([validLat, validLng], {
      draggable: interactive,
      icon: brandIcon,
    }).addTo(map);
    markerRef.current = marker;

    // Handle marker dragging
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const newLat = Number(pos.lat.toFixed(6));
      const newLng = Number(pos.lng.toFixed(6));
      circle.setLatLng([newLat, newLng]);
      if (onChangeRef.current) {
        onChangeRef.current(newLat, newLng);
      }
    });

    // Handle clicking anywhere on the map to relocate pin
    if (interactive) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const newLat = Number(e.latlng.lat.toFixed(6));
        const newLng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        circle.setLatLng([newLat, newLng]);
        if (onChangeRef.current) {
          onChangeRef.current(newLat, newLng);
        }
      });
    }

    // Invalidate map size after a brief delay to ensure tiles fill full container within modals
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 150);

    // Cleanup: completely remove map instance on unmount
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Fallback
        }
        mapRef.current = null;
      }
      if (container && (container as any)._leaflet_id) {
        try {
          delete (container as any)._leaflet_id;
        } catch (e) {
          (container as any)._leaflet_id = null;
        }
      }
    };
  }, []); // Run once on component mount

  // 2. React to map mode switch (Satellite vs Street)
  useEffect(() => {
    applyTileLayer(mapType);
  }, [mapType]);

  // 3. Handle external coordinate updates (e.g. from "Use Device GPS")
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const circle = circleRef.current;

    if (map && marker && circle) {
      const currentPos = marker.getLatLng();
      if (Math.abs(currentPos.lat - validLat) > 0.000001 || Math.abs(currentPos.lng - validLng) > 0.000001) {
        marker.setLatLng([validLat, validLng]);
        circle.setLatLng([validLat, validLng]);
        map.setView([validLat, validLng], map.getZoom(), { animate: true });
      }
    }
  }, [validLat, validLng]);

  // 4. Handle geofence radius updates
  useEffect(() => {
    if (circleRef.current && Number.isFinite(radiusMeters) && radiusMeters > 0) {
      circleRef.current.setRadius(radiusMeters);
    }
  }, [radiusMeters]);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-2xs relative z-0" style={{ height }}>
      {/* Target DOM container for Leaflet */}
      <div 
        ref={containerRef} 
        style={{ height: '100%', width: '100%' }} 
        className="z-0" 
      />

      {/* Satellite / Street View Toggle Button */}
      <div className="absolute top-2 right-2 z-[400] flex items-center bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-300 shadow-xs text-[10px] font-black uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
            mapType === 'satellite'
              ? 'bg-[#032031] text-white shadow-2xs'
              : 'text-slate-600 hover:text-black'
          }`}
        >
          🛰️ Satellite
        </button>
        <button
          type="button"
          onClick={() => setMapType('streets')}
          className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
            mapType === 'streets'
              ? 'bg-[#032031] text-white shadow-2xs'
              : 'text-slate-600 hover:text-black'
          }`}
        >
          🗺️ Street
        </button>
      </div>

      {/* Helpful overlay badge */}
      {interactive && (
        <div className="absolute bottom-2 left-2 z-[400] bg-black/80 text-white backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/20 text-[10px] font-black uppercase tracking-wider shadow-xs pointer-events-none">
          Click map or drag pin &bull; {radiusMeters}m Geofence
        </div>
      )}
    </div>
  );
};

export default DraggableLocationPicker;
