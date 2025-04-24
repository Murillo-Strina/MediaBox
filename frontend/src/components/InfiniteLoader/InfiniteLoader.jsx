import { useRef, useEffect } from 'react';
import styles from '../../styles/InfiniteLoader.module.css';

export default function InfiniteLoader({ loadMore, hasMore, children }) {
  const sentinel = useRef();

  useEffect(() => {
    if (!hasMore) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { rootMargin: '200px' });
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [loadMore, hasMore]);

  return (
    <>
      {children}
      {hasMore && <div ref={sentinel} style={{ height: 1 }} />}
    </>
  );
}
