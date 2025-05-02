import React from 'react';
import styles from '../../styles/starReview.module.css';

export default function StarReview({ rating, max = 5 }) {
  const r = Math.max(0, Math.min(Math.round(rating), max));

  return (
    <div className={styles.reviewStars} title={`${r} de ${max} estrelas`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={i < r ? styles.starFilled : styles.starEmpty}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}
