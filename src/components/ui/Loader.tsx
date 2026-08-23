import React from 'react';
import styles from './Loader.module.css';

interface LoaderProps {
  size?: number | string;
  className?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 140, 
  className = '', 
  fullScreen = false 
}) => {
  const content = (
    <div className={`${styles.loader} ${className}`}>
      <svg
        className={styles.container}
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield background track */}
        <path
          className={styles.shieldTrack}
          d="M32 4L52 12V28C52 42 44 52 32 59C20 52 12 42 12 28V12L32 4Z"
        ></path>

        {/* Animated scanning shield border */}
        <path
          className={styles.shield}
          pathLength="100"
          d="M32 4L52 12V28C52 42 44 52 32 59C20 52 12 42 12 28V12L32 4Z"
        ></path>

        {/* High-Fidelity Metallic Brand Logo centered inside shield */}
        <image
          href="/logo.png"
          x="19"
          y="16"
          width="26"
          height="26"
          className={styles.logoImage}
        />

        {/* Laser scan line passing over both shield and logo */}
        <line className={styles.scan} x1="16" y1="16" x2="48" y2="16"></line>
      </svg>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950/95 z-50 transition-all duration-300">
        {content}
      </div>
    );
  }

  return content;
};
export default Loader;
