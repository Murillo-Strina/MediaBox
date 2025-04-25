import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/ProfileMenu.module.css';

export default function ProfileMenu({ isOpen, onToggle }) {
  const ref = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target) && typeof onToggle === 'function') {
        onToggle(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onToggle]);

  return (
    <div ref={ref} className={styles.profile}>
      <span
        className={styles.icon}
        onClick={() => typeof onToggle === 'function' && onToggle(!isOpen)}
      >
        👤
      </span>
      {isOpen && (
        <div className={styles.dropdown}>
          <button>Configurações</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}