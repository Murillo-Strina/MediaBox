import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/ProfileMenu.module.css';
import { auth } from '../../firebase/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';

export default function ProfileMenu({ isOpen, onToggle, onOpenConfig, avatarRef }) {
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      toast.error('Não foi possível deslogar.');
    }
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