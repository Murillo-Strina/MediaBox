import React, { useEffect, useState, useRef } from 'react';
import styles from '../../styles/Topbar.module.css';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FaPlus, FaPencilAlt } from 'react-icons/fa';
import { CgProfile } from "react-icons/cg";

export default function Topbar({
  onAdd,
  onEdit,
  profileOpen,
  onToggleProfile,
  onOpenConfig,
  searchTerm,
  onSearchChange
}) {
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
        placeholder="Buscar por título, tipo ou tag…"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className={styles.actions}>
        <button onClick={onAdd} className={styles.actionButton} aria-label="Adicionar">
          <FaPlus />
        </button>
        <button onClick={onEdit} className={styles.actionButton} aria-label="Editar">
          <FaPencilAlt />
        </button>

        <div
          ref={avatarRef}
          className={styles.profileIcon}
          onClick={() => onToggleProfile(!profileOpen)}
        >
          {avatar ? (
            <img src={avatar} alt="avatar" className={styles.avatarImg} />
          ) : (
            <span className={styles.icon}>
              <CgProfile />
            </span>
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