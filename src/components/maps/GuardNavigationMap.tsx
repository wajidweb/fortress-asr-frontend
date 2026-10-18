'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { createBrandPinIcon, setupLeafletDefaultIcons } from './LeafletSetup';
import { Navigation, Compass, ExternalLink, RotateCw, MapPin } from 'lucide-react';

setupLeafletDefaultIcons();

// Custom Officer Live Marker Pin
const createOfficerPinIcon = () => {
  const html = `
    <div style="position: relative; width: 26px; height: 26px;">
      <div style="position: absolute; inset: -5px; border-radius: 9999px; background: rgba(37, 99, 235, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 26px; height: 26px; border-radius: 9999px; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
        <div style="width: 7px; height: 7px; border-radius: 9999px; background: #ffffff;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'officer-live-marker',
    html,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16],
  });
};

// Haversine distance formula in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface GuardNavigationMapProps {
  siteLatitude: number;
  siteLongitude: number;
  siteRadiusMeters?: number;
  propertyName?: string;
  address?: string;
  height?: string;
  zoom?: number;
  className?: string;
}

export const GuardNavigationMap: React.FC<GuardNavigationMapProps> = ({
  siteLatitude,
  siteLongitude,
  siteRadiusMeters = 100,
  propertyName,
  address,
  height,
  zoom = 16,
  className = 'h-[220px] sm:h-[260px] md:h-[280px]',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [mapType, setMapType] = useState<'satellite' | 'streets'>('satellite');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  const validSiteLat = Number.isFinite(siteLatitude) && siteLatitude >= -90 && siteLatitude <= 90 ? siteLatitude : 51.5074;
  const validSiteLng = Number.isFinite(siteLongitude) && siteLongitude >= -180 && siteLongitude <= 180 ? siteLongitude : -0.1278;

  const siteIcon = useMemo(() => createBrandPinIcon('#032031', '#10b981'), []);
  const officerIcon = useMemo(() => createOfficerPinIcon(), []);

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
        { maxZoom: 19 }
      ).addTo(map);

      labelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    }
  };

  // Request Guard's live location
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });

        const dist = calculateDistanceKm(lat, lng, validSiteLat, validSiteLng);
        setDistanceKm(dist);

        const map = mapRef.current;
        if (!map) return;

        // Update or add user marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([lat, lng]);
        } else {
          userMarkerRef.current = L.marker([lat, lng], { icon: officerIcon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
                <strong style="color: #2563eb; display: block; font-size: 12px;">Your Current Location</strong>
                <span style="color: #64748b; font-size: 10px; display: block;">
                  ${dist < 1 ? `${Math.round(dist * 1000)} meters` : `${dist.toFixed(2)} km`} from post
                </span>
              </div>
            `);
        }

        // Update or add dashed route line
        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs([
            [lat, lng],
            [validSiteLat, validSiteLng],
          ]);
        } else {
          routeLineRef.current = L.polyline(
            [
              [lat, lng],
              [validSiteLat, validSiteLng],
            ],
            {
              color: '#3b82f6',
              weight: 3,
              dashArray: '6, 8',
              opacity: 0.85,
            }
          ).addTo(map);
        }

        // Fit map bounds to show both user and site
        const bounds = L.latLngBounds([
          [lat, lng],
          [validSiteLat, validSiteLng],
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [validSiteLat, validSiteLng, officerIcon]);

  // Center on site
  const centerOnSite = () => {
    if (mapRef.current) {
      mapRef.current.setView([validSiteLat, validSiteLng], zoom, { animate: true });
    }
  };

  // Fit both locations
  const fitRoute = () => {
    if (mapRef.current && userCoords) {
      const bounds = L.latLngBounds([
        [userCoords.lat, userCoords.lng],
        [validSiteLat, validSiteLng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    } else {
      locateUser();
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

    // Enable zooming, dragging, doubleClickZoom, touchZoom
    const map = L.map(container, {
      center: [validSiteLat, validSiteLng],
      zoom: zoom,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      touchZoom: true,
      zoomControl: true,
      attributionControl: false,
    });
    mapRef.current = map;

    applyTileLayer(mapType);

    // Geofence Circle
    if (siteRadiusMeters > 0) {
      L.circle([validSiteLat, validSiteLng], {
        radius: siteRadiusMeters,
        color: '#ffffff',
        fillColor: '#10b981',
        fillOpacity: 0.25,
        weight: 2.5,
      }).addTo(map);
    }

    // Site Destination Marker
    const siteMarker = L.marker([validSiteLat, validSiteLng], { icon: siteIcon }).addTo(map);

    siteMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
        <strong style="color: #032031; display: block; font-size: 12px;">${propertyName || 'Designated Security Post'}</strong>
        ${address ? `<span style="color: #64748b; font-size: 10px; display: block;">${address}</span>` : ''}
        <span style="color: #059669; font-weight: bold; font-size: 9px; display: block; margin-top: 4px; text-transform: uppercase;">
          ${siteRadiusMeters}m Geofence Perimeter
        </span>
      </div>
    `);

    // Invalidate size once rendered
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);

    // Automatically locate user
    locateUser();

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
    <div 
      className={`w-full rounded-2xl overflow-hidden border-2 border-slate-300 shadow-2xs relative z-0 flex flex-col ${className}`} 
      style={height ? { height } : undefined}
    >
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} className="z-0" />

      {/* Top Map Layer Controls */}
      <div className="absolute top-2.5 right-2.5 z-[400] flex items-center gap-1.5 flex-wrap">
        {distanceKm !== null && (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-xs rounded-lg border-2 border-slate-300 shadow-xs text-[10px] font-black text-slate-800">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>{distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m away` : `${distanceKm.toFixed(1)} km to post`}</span>
          </div>
        )}

        {/* Map View Toggle */}
        <div className="flex items-center bg-white/95 backdrop-blur-xs p-0.5 rounded-lg border-2 border-slate-300 shadow-xs text-[9px] font-black uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2 py-1 rounded transition ${mapType === 'satellite' ? 'bg-[#032031] text-white shadow-2xs' : 'text-slate-600 hover:text-black'}`}
          >
            🛰️ Sat
          </button>
          <button
            type="button"
            onClick={() => setMapType('streets')}
            className={`px-2 py-1 rounded transition ${mapType === 'streets' ? 'bg-[#032031] text-white shadow-2xs' : 'text-slate-600 hover:text-black'}`}
          >
            🗺️ Street
          </button>
        </div>
      </div>

      {/* Bottom Floating Navigation Toolbar */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-[400] flex items-center justify-between gap-2 pointer-events-none">
        {/* Left: Distance badge on mobile */}
        {distanceKm !== null ? (
          <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#032031] text-white rounded-xl border border-white/20 shadow-md text-[10px] font-black tracking-wide">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>{distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m to post` : `${distanceKm.toFixed(1)} km to post`}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={locateUser}
            disabled={isLocating}
            className="pointer-events-auto inline-flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-xs rounded-xl border-2 border-slate-300 shadow-md text-[10px] font-black text-slate-800 uppercase tracking-wider cursor-pointer"
          >
            <Compass className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Locating...' : 'Enable GPS'}
          </button>
        )}

        {/* Right Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {userCoords && (
            <button
              type="button"
              onClick={fitRoute}
              className="px-2.5 py-1.5 bg-white/95 backdrop-blur-xs rounded-xl border-2 border-slate-300 shadow-md text-[10px] font-black text-slate-800 hover:bg-slate-100 uppercase tracking-wider transition cursor-pointer"
              title="Fit Both Locations"
            >
              Fit Route
            </button>
          )}

          <button
            type="button"
            onClick={centerOnSite}
            className="px-2.5 py-1.5 bg-white/95 backdrop-blur-xs rounded-xl border-2 border-slate-300 shadow-md text-[10px] font-black text-slate-800 hover:bg-slate-100 uppercase tracking-wider transition cursor-pointer"
            title="Center On Site Post"
          >
            Site Post
          </button>

          <button
            type="button"
            onClick={locateUser}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
            title="Update Live GPS Route"
          >
            <Navigation className="w-3 h-3" />
            <span className="hidden sm:inline">Live Route</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuardNavigationMap;
