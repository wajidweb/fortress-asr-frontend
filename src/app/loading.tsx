import React from 'react';
import Loader from '@/components/ui/Loader';

/**
 * Standard Next.js App Router global loading wrapper.
 * Displays during dynamic server rendering, lazy loading, and route transitions.
 */
export default function Loading() {
  return <Loader fullScreen />;
}
