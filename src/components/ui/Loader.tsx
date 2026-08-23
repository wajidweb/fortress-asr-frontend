import React from 'react';
import styles from './Loader.module.css';

interface LoaderProps {
  size?: number | string;
  className?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 100, 
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
        <path
          className={styles.shieldTrack}
          d="M32 4L52 12V28C52 42 44 52 32 59C20 52 12 42 12 28V12L32 4Z"
        ></path>

        <path
          className={styles.shield}
          pathLength="100"
          d="M32 4L52 12V28C52 42 44 52 32 59C20 52 12 42 12 28V12L32 4Z"
        ></path>

        <rect className={styles.lockBody} x="23" y="28" width="18" height="15" rx="3"></rect>

        <path
          className={styles.lock}
          d="M27 28V23C27 20.2 29.2 18 32 18C34.8 18 37 20.2 37 23V28"
        ></path>

        <circle className={styles.keyhole} cx="32" cy="34" r="2"></circle>

        <path className={styles.keyholeLine} d="M32 36V39"></path>

        <line className={styles.scan} x1="16" y1="16" x2="48" y2="16"></line>
      </svg>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900/90 z-50 transition-all duration-300">
        {content}
      </div>
    );
  }

  return content;
};
export default Loader;
