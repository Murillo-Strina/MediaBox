import React, { useEffect, useState, useRef } from 'react';
import styles from '../../styles/Topbar.module.css';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Topbar({ onAdd, onEdit, profileOpen, onToggleProfile, onOpenConfig }) {
  const [avatar, setAvatar] = useState(null);
  const avatarRef = useRef();

  useEffect(() => {
    const fetchAvatar = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, 'Usuarios', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.avatarBase64) {
          setAvatar(data.avatarBase64);
        }
      }
    };

    fetchAvatar();
  }, []);

  return (
    <nav className={styles.topbar}>
      <div className={styles.logo}>
        <img
          src={`${import.meta.env.BASE_URL}MediaBoxLogo.png`}
          alt="MediaBox Logo"
        />
      </div>

      <input
        type="text"
        className={styles.searchInput}
        placeholder="Buscar por título ou tag…"
      />

      <div className={styles.actions}>
        <button onClick={onAdd} className={styles.addButton}>＋</button>
        <button onClick={onEdit} className={styles.editButton}>✏️</button>

        <div
          ref={avatarRef}
          className={styles.profileIcon}
          onClick={() => onToggleProfile(!profileOpen)}
        >
          {avatar ? (
            <img src={avatar} alt="avatar" className={styles.avatarImg} />
          ) : (
            <span className={styles.icon}>👤</span>
          )}
        </div>

        <ProfileMenu
          isOpen={profileOpen}
          onToggle={onToggleProfile}
          onOpenConfig={onOpenConfig}
          avatarRef={avatarRef}
        />
      </div>
    </nav>
  );
}
