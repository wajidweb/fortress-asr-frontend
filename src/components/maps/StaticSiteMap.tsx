'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { createBrandPinIcon, setupLeafletDefaultIcons } from './LeafletSetup';

setupLeafletDefaultIcons();

interface StaticSiteMapProps {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  propertyName?: string;
  address?: string;
  height?: string;
  zoom?: number;
}

export const StaticSiteMap: React.FC<StaticSiteMapProps> = ({
  latitude,
  longitude,
  radiusMeters = 100,
  propertyName,
  address,
  height = '240px',
  zoom = 17,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);

  const [mapType, setMapType] = useState<'satellite' | 'streets'>('satellite');

  const validLat = Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 ? latitude : 51.5074;
  const validLng = Number.isFinite(longitude) && longitude >= -180 && longitude <= 180 ? longitude : -0.1278;

  const brandIcon = useMemo(() => createBrandPinIcon('#032031', '#10b981'), []);

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
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
        }
      ).addTo(map);

      labelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

    const map = L.map(container, {
      center: [validLat, validLng],
      zoom: zoom,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;

    applyTileLayer(mapType);

    if (radiusMeters > 0) {
      L.circle([validLat, validLng], {
        radius: radiusMeters,
        color: '#ffffff',
        fillColor: '#10b981',
        fillOpacity: 0.22,
        weight: 2,
      }).addTo(map);
    }

    const marker = L.marker([validLat, validLng], { icon: brandIcon }).addTo(map);

    if (propertyName) {
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
          <strong style="color: #032031; display: block; font-size: 12px;">${propertyName}</strong>
          ${address ? `<span style="color: #64748b; font-size: 10px; display: block;">${address}</span>` : ''}
          <span style="color: #059669; font-weight: bold; font-size: 9px; display: block; margin-top: 4px; text-transform: uppercase;">
            ${radiusMeters}m Geofence Perimeter
          </span>
        </div>
      `);
    }

    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 150);

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
  }, []);

  useEffect(() => {
    applyTileLayer(mapType);
  }, [mapType]);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-2xs relative z-0" style={{ height }}>
      <div 
        ref={containerRef} 
        style={{ height: '100%', width: '100%' }} 
        className="z-0" 
      />

      <div className="absolute top-2 right-2 z-[400] flex items-center bg-white/95 backdrop-blur-xs p-0.5 rounded-md border border-slate-300 shadow-xs text-[9px] font-black uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-2 py-0.5 rounded transition ${mapType === 'satellite' ? 'bg-[#032031] text-white' : 'text-slate-600'}`}
        >
          🛰️ Sat
        </button>
        <button
          type="button"
          onClick={() => setMapType('streets')}
          className={`px-2 py-0.5 rounded transition ${mapType === 'streets' ? 'bg-[#032031] text-white' : 'text-slate-600'}`}
        >
          🗺️ Map
        </button>
      </div>
    </div>
  );
};

export default StaticSiteMap;
