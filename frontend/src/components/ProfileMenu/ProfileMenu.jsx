import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/ProfileMenu.module.css';

export default function ProfileMenu({ isOpen, onToggle, onOpenConfig, avatarRef }) {
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = e => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !(avatarRef?.current?.contains(e.target))
      ) {
        onToggle(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle, avatarRef]);  

  return (
    <div ref={menuRef} className={styles.profile}>
      {isOpen && (
        <div className={styles.dropdown}>
          <button
            type="button"
            onClick={() => {
              onToggle(false);
              if (typeof onOpenConfig === 'function') onOpenConfig();
            }}
          >
            Configurações
          </button>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
