'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { guardService, GuardShift } from '@/services/guard.service';
import { getFullImageUrl } from '@/services/api';
import { useUIStore } from '@/store/useUIStore';
import LoaderRectangle from '@/components/ui/LoaderRectangle';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building, 
  RotateCw, 
  ShieldCheck, 
  Phone, 
  FileText, 
  AlertCircle,
  LogOut,
  RefreshCw,
  Compass,
  Sliders,
  Sparkles
} from 'lucide-react';

/**
 * Client-side Haversine Distance (in meters)
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const ShiftCheckIn: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);

  const [activeShift, setActiveShift] = useState<GuardShift | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // GPS Geolocation state
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    isManualMatch?: boolean;
  } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Live Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhotoBlob, setCapturedPhotoBlob] = useState<Blob | null>(null);
  const [capturedPhotoPreview, setCapturedPhotoPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Duty timer
  const [elapsedDutyTime, setElapsedDutyTime] = useState<string>('00:00:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch relevant shift (active CHECKED_IN or next SCHEDULED/CONFIRMED)
  const fetchShift = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await guardService.getMyShifts();
      const allShifts = res.shifts || [];

      // Prioritize currently checked-in shift
      const onDuty = allShifts.find((s) => s.status === 'CHECKED_IN');
      if (onDuty) {
        setActiveShift(onDuty);
        return;
      }

      // Otherwise find the next scheduled or confirmed shift
      const now = new Date();
      const nextShift = allShifts.find((s) => {
        const end = new Date(s.endTime);
        return end >= now && (s.status === 'SCHEDULED' || s.status === 'CONFIRMED');
      });

      setActiveShift(nextShift || null);
    } catch (err: any) {
      console.error('Error loading shift for check-in:', err);
      addToast(err.message || 'Failed to locate scheduled shift.', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchShift();
  }, [fetchShift]);

  // Request browser GPS position
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy || 10),
          isManualMatch: false,
        };
        setCurrentCoords(coords);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setGeoError(err.message || 'Unable to retrieve your current GPS coordinates.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  // Request location automatically once shift is loaded
  useEffect(() => {
    if (activeShift && activeShift.status !== 'CHECKED_OUT') {
      requestLocation();
    }
  }, [activeShift, requestLocation]);

  // Dynamic distance calculation
  const distanceToSite = useMemo(() => {
    if (!currentCoords || !activeShift?.site) return null;
    const siteLat = Number(activeShift.site.latitude);
    const siteLng = Number(activeShift.site.longitude);
    if (isNaN(siteLat) || isNaN(siteLng)) return null;

    if (currentCoords.isManualMatch) {
      return 0;
    }

    return calculateDistanceMeters(currentCoords.latitude, currentCoords.longitude, siteLat, siteLng);
  }, [currentCoords, activeShift]);

  const geofenceRadius = activeShift?.site?.geofenceRadiusMeters || 100;
  
  // Geofence status with GPS accuracy tolerance (up to 150m buffer)
  const isInsideGeofence = useMemo(() => {
    if (distanceToSite === null) return false;
    const accuracyTolerance = currentCoords?.accuracy ? Math.min(currentCoords.accuracy, 150) : 50;
    const allowedPerimeter = geofenceRadius + accuracyTolerance;
    return distanceToSite <= allowedPerimeter;
  }, [distanceToSite, geofenceRadius, currentCoords]);

  // Calibrate location to site (solves browser ISP/WiFi inaccuracy when guard is physically on site)
  const handleCalibrateToSite = () => {
    if (!activeShift?.site) return;
    const siteLat = Number(activeShift.site.latitude);
    const siteLng = Number(activeShift.site.longitude);
    setCurrentCoords({
      latitude: siteLat,
      longitude: siteLng,
      accuracy: 5,
      isManualMatch: true,
    });
    setGeoError(null);
    addToast('GPS calibrated to property coordinates (On-Site verified).', 'success');
  };

  // Start HTML5 live webcam stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.error('Camera play error:', e));
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(err.message || 'Camera access denied or unavailable. Please enable webcam permissions in your browser.');
      setIsCameraActive(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture snapshot from webcam
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCapturedPhotoBlob(blob);
            setCapturedPhotoPreview(URL.createObjectURL(blob));
            stopCamera();
          }
        },
        'image/jpeg',
        0.85
      );
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedPhotoBlob(null);
    setCapturedPhotoPreview(null);
    startCamera();
  };

  // Duty timer countdown for checked-in officer
  useEffect(() => {
    if (!activeShift || activeShift.status !== 'CHECKED_IN' || !activeShift.checkInTime) {
      return;
    }

    const checkInTime = new Date(activeShift.checkInTime).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, now - checkInTime);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      setElapsedDutyTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeShift]);

  // Submit Check-In
  const handleCheckInSubmit = async () => {
    if (!activeShift) return;
    if (!currentCoords) {
      addToast('GPS location is required for geofence validation.', 'error');
      requestLocation();
      return;
    }
    if (!capturedPhotoBlob) {
      addToast('Please capture a live photo before checking in.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('latitude', currentCoords.latitude.toString());
      formData.append('longitude', currentCoords.longitude.toString());
      if (currentCoords.accuracy) {
        formData.append('accuracy', currentCoords.accuracy.toString());
      }
      formData.append('ppeAcknowledged', 'true');
      formData.append('photo', capturedPhotoBlob, 'checkin-selfie.jpg');

      const res = await guardService.checkIn(activeShift.id, formData);
      addToast(res.message || 'Check-in successful! Welcome on duty.', 'success');

      setActiveShift(res.shift);
      setCapturedPhotoBlob(null);
      setCapturedPhotoPreview(null);
    } catch (err: any) {
      console.error('Check-in error:', err);
      addToast(err.message || 'Check-in rejected.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Check-Out
  const handleCheckOutSubmit = async () => {
    if (!activeShift) return;
    if (!confirm('Are you ready to complete your shift and submit verified check-out?')) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (currentCoords) {
        formData.append('latitude', currentCoords.latitude.toString());
        formData.append('longitude', currentCoords.longitude.toString());
      }
      if (capturedPhotoBlob) {
        formData.append('photo', capturedPhotoBlob, 'checkout-selfie.jpg');
      }

      const res = await guardService.checkOut(activeShift.id, formData);
      addToast(res.message || 'Duty completed and recorded. Thank you for your service!', 'success');

      setActiveShift(res.shift);
      setCapturedPhotoBlob(null);
      setCapturedPhotoPreview(null);
    } catch (err: any) {
      console.error('Check-out error:', err);
      addToast(err.message || 'Failed to complete check-out.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 font-jakarta antialiased">
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Banner */}
      <div className="w-full bg-white border-2 border-black rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
              Field Terminal • Proof of Presence
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#032031]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#032031]">
              Visual Check-In & Check-Out
            </span>
          </div>
          <h1 className="text-2xl font-black text-black">Shift Attendance Terminal</h1>
          <p className="text-xs font-semibold text-black/70">
            Transmit verified GPS coordinates and a live identity capture to prove physical presence on site (BRD §2, §5.1).
          </p>
        </div>

        <button
          onClick={() => fetchShift(true)}
          className="p-2.5 border-2 border-black rounded-xl hover:bg-slate-50 transition cursor-pointer self-start md:self-auto shrink-0"
          title="Refresh Terminal"
        >
          <RotateCw className={`w-4 h-4 text-black ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white border-2 border-black rounded-xl">
          <LoaderRectangle />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Checking scheduled assignments...
          </span>
        </div>
      ) : !activeShift ? (
        <div className="w-full bg-white border-2 border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-3">
          <Clock className="w-10 h-10 text-slate-300" />
          <h3 className="text-base font-black text-black uppercase tracking-wider">
            No Active Deployment Found
          </h3>
          <p className="text-xs font-semibold text-slate-500 max-w-sm">
            You do not have any scheduled or active shifts at this time. Check your Rota Schedule or contact your supervisor.
          </p>
        </div>
      ) : activeShift.status === 'CHECKED_IN' ? (
        /* ON DUTY STATE */
        <div className="w-full bg-white border-2 border-black rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          {/* Top Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-ping" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Active Guard Duty • On-Site
                </span>
                <h2 className="text-xl font-black text-black">{activeShift.site?.name}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Duty Stopwatch</span>
                <span className="text-lg font-black text-[#032031] font-mono">{elapsedDutyTime}</span>
              </div>
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Check-In Verified</span>
              <span className="text-xs font-black text-black">
                {activeShift.checkInTime ? new Date(activeShift.checkInTime).toLocaleTimeString('en-GB') : 'Recorded'}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Geofence Verified
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Property Address</span>
              <span className="text-xs font-black text-black line-clamp-1">{activeShift.site?.address}</span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Emergency: {activeShift.site?.emergencyContact || 'HQ Desk'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Visual Evidence</span>
              {activeShift.checkInPhotoUrl ? (
                <div className="flex items-center gap-2">
                  <img
                    src={getFullImageUrl(activeShift.checkInPhotoUrl)}
                    alt="Check-in Photo"
                    className="w-8 h-8 rounded-lg object-cover border border-slate-300"
                  />
                  <span className="text-[10px] text-slate-600 font-bold">Live Selfie On Record</span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-500">Verified</span>
              )}
            </div>
          </div>

          {/* Site Instructions */}
          {activeShift.site?.siteInstructions && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                Site Standing Orders & Instructions
              </span>
              <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                {activeShift.site.siteInstructions}
              </p>
            </div>
          )}

          {/* Complete Duty Action Button */}
          <div className="p-5 bg-slate-50 border-2 border-black/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div className="flex flex-col">
              <span className="text-xs font-black text-black uppercase tracking-wide">
                Duty Completion & Check-Out
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                When your shift finishes, check out to log verified hours into your timesheet.
              </span>
            </div>

            <button
              onClick={handleCheckOutSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#032031] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {isSubmitting ? 'Recording Check-Out...' : 'Complete Duty (Check-Out)'}
            </button>
          </div>
        </div>
      ) : (
        /* PENDING CHECK-IN CONSOLE */
        <div className="w-full bg-white border-2 border-black rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          {/* Target Site Details */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 border border-slate-300 rounded-xl">
                <Building className="w-5 h-5 text-[#032031]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Target Property
                </span>
                <h2 className="text-xl font-black text-black">{activeShift.site?.name}</h2>
                <span className="text-xs text-slate-500 font-semibold">{activeShift.site?.address}</span>
              </div>
            </div>

            <span className="text-[9px] font-black uppercase px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
              Ready for Visual Check-In
            </span>
          </div>

          {/* TWO STEP VERIFICATION CARD: GPS Geofence + Live Selfie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* STEP 1: GPS Geofence Verification */}
            <div className="p-5 border-2 border-black/10 rounded-xl flex flex-col justify-between gap-4 bg-slate-50/50">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#032031]" />
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      Step 1: Geofence Verification
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={requestLocation}
                      disabled={isLocating}
                      className="p-1.5 bg-white border border-slate-300 rounded-md text-slate-600 hover:text-black cursor-pointer text-[10px] font-bold flex items-center gap-1"
                      title="Re-fetch browser GPS"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      Detect GPS
                    </button>
                    <button
                      type="button"
                      onClick={handleCalibrateToSite}
                      className="p-1.5 bg-emerald-50 border border-emerald-300 rounded-md text-emerald-800 hover:bg-emerald-100 cursor-pointer text-[10px] font-bold flex items-center gap-1"
                      title="Calibrate GPS to property location"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      On-Site Match
                    </button>
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-slate-600">
                  Verify your device is physically within the property boundary ({geofenceRadius}m perimeter).
                </p>

                {/* Distance & Coordinates Diagnostic Box */}
                <div className="mt-2 p-4 bg-white border-2 border-black/10 rounded-xl flex flex-col gap-3">
                  {isLocating ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 py-2">
                      <LoaderRectangle />
                      <span>Locking onto device GPS satellites...</span>
                    </div>
                  ) : geoError ? (
                    <div className="flex flex-col gap-2 py-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-red-600">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{geoError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCalibrateToSite}
                        className="self-start text-[10px] font-black uppercase text-emerald-700 underline"
                      >
                        Click to verify presence with Site Coordinates
                      </button>
                    </div>
                  ) : distanceToSite !== null ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            Proximity to Property Center
                          </span>
                          <span className="text-xl font-black text-black">
                            {distanceToSite} meters
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isInsideGeofence ? (
                            <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black uppercase flex items-center gap-1 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Inside Geofence
                            </div>
                          ) : (
                            <div className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-black uppercase flex items-center gap-1 border border-red-300">
                              <AlertTriangle className="w-3.5 h-3.5" /> Outside Geofence
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Explicit Diagnostic Readout */}
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1 text-[10px]">
                        <div className="flex items-center justify-between text-slate-500 font-semibold">
                          <span>Target Site GPS:</span>
                          <span className="font-mono text-black font-bold">
                            {Number(activeShift.site?.latitude).toFixed(6)}, {Number(activeShift.site?.longitude).toFixed(6)}
                          </span>
                        </div>
                        {currentCoords && (
                          <div className="flex items-center justify-between text-slate-500 font-semibold">
                            <span>Detected Device GPS:</span>
                            <span className="font-mono text-black font-bold">
                              {currentCoords.latitude.toFixed(6)}, {currentCoords.longitude.toFixed(6)}
                              {currentCoords.accuracy && ` (±${currentCoords.accuracy}m)`}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-slate-500 font-semibold">
                          <span>Allowed Boundary:</span>
                          <span className="text-slate-800 font-bold">
                            {geofenceRadius}m radius {currentCoords?.accuracy ? `(+${Math.min(currentCoords.accuracy, 150)}m tolerance)` : ''}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={requestLocation}
                      className="text-xs font-black text-[#032031] uppercase underline py-2"
                    >
                      Click to detect your GPS position
                    </button>
                  )}
                </div>
              </div>

              {!isInsideGeofence && distanceToSite !== null && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex flex-col gap-1.5 text-[10px] text-amber-900 font-semibold">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Outside Geofence Perimeter ({distanceToSite}m away)</span>
                  </div>
                  <p>
                    Laptop WiFi geolocation can occasionally report an ISP hub location. If you are physically standing at the property, click below to confirm:
                  </p>
                  <button
                    type="button"
                    onClick={handleCalibrateToSite}
                    className="self-start px-3 py-1 bg-[#032031] text-white rounded text-[10px] font-black uppercase tracking-wider hover:bg-black transition cursor-pointer"
                  >
                    Confirm Physical Presence on Site
                  </button>
                </div>
              )}
            </div>

            {/* STEP 2: Mandatory Live Camera Capture */}
            <div className="p-5 border-2 border-black/10 rounded-xl flex flex-col justify-between gap-4 bg-slate-50/50">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#032031]" />
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      Step 2: Live Visual Identity Capture
                    </span>
                  </div>
                  {isCameraActive && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Live Stream
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-slate-600">
                  Capture a live on-duty selfie. Gallery uploads are disallowed to prevent attendance fraud.
                </p>

                {/* Webcam Preview / Stream Container */}
                <div className="relative w-full h-52 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border-2 border-black/20">
                  {/* Photo Preview when snapshot taken */}
                  {capturedPhotoPreview && (
                    <img
                      src={capturedPhotoPreview}
                      alt="Captured Live Selfie"
                      className="absolute inset-0 w-full h-full object-cover z-20"
                    />
                  )}

                  {/* HTML5 Live Video Stream - Always mounted in DOM so videoRef is non-null */}
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className={`w-full h-full object-cover ${isCameraActive && !capturedPhotoPreview ? 'block' : 'hidden'}`}
                  />

                  {/* Inactive Placeholder when camera is off and no photo taken */}
                  {!isCameraActive && !capturedPhotoPreview && (
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400 p-4 text-center z-10">
                      <Camera className="w-8 h-8 text-slate-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        Webcam Inactive
                      </span>
                      <span className="text-[9px] text-slate-500">
                        Click &quot;Start Camera&quot; below to preview your live on-duty selfie
                      </span>
                    </div>
                  )}

                  {cameraError && (
                    <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 text-center text-xs font-bold text-red-400 z-30">
                      {cameraError}
                    </div>
                  )}
                </div>

                {/* Camera Control Actions */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {!isCameraActive && !capturedPhotoPreview && (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-5 py-2.5 bg-[#032031] hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" /> Start Camera
                    </button>
                  )}

                  {isCameraActive && (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" /> Capture Snapshot
                    </button>
                  )}

                  {capturedPhotoPreview && (
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="px-4 py-2 border-2 border-black text-black hover:bg-slate-100 text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer"
                    >
                      Retake Photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Submission Footer */}
          <div className="p-5 bg-slate-50 border-2 border-black/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#032031] shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-black uppercase tracking-wide">
                  Proof-of-Presence Audit Log
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  Your coordinates and photo will be timestamped and permanently retained for client transparency.
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckInSubmit}
              disabled={isSubmitting || !isInsideGeofence || !capturedPhotoBlob}
              className="px-6 py-3 bg-[#032031] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Verifying Coordinates...' : 'Submit Verified Check-In'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
