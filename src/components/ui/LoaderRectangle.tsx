import React from 'react';
import styles from './LoaderRectangle.module.css';

interface LoaderRectangleProps {
  fullScreen?: boolean;
}

export const LoaderRectangle: React.FC<LoaderRectangleProps> = ({ fullScreen = false }) => {
  const content = (
    <div className={styles.loaderRectangle}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50 transition-all duration-300">
        {content}
      </div>
    );
  }

  return content;
};

export default LoaderRectangle;
