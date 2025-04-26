import React from 'react';
import styles from '../../styles/starReview.module.css';

export default function StarReview({ rating, max = 5 }) {
  const r = Math.max(0, Math.min(rating, max));
  const overlayPercent = `${((max - r) / max) * 100}%`;
  
  return (
    <div
      className={styles.reviewStars}
      title={`${r} de ${max} estrelas`}
      style={{ '--overlay-percent': overlayPercent }}
    />
  );
}
