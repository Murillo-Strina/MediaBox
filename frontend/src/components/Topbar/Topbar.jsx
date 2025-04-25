import React from 'react'
import styles from '../../styles/Topbar.module.css'
import ProfileMenu from '../ProfileMenu/ProfileMenu'

export default function Topbar({
  onAdd,
  onEdit,
  profileOpen,
  onToggleProfile
}) {
  return (
    <nav className={styles.topbar}>
      <div className={styles.logo}>
        <img src={`${import.meta.env.BASE_URL}MediaBoxLogo.png`} alt="MediaBox Logo"/>
      </div>

      <input
        type="text"
        className={styles.searchInput}
        placeholder="Buscar por título ou tag…"
        disabled
        readOnly
      />

      <div className={styles.actions}>
        <button onClick={onAdd} className={styles.addButton}>＋</button>
        <button onClick={onEdit} className={styles.editButton}>✏️</button>
        <ProfileMenu isOpen={profileOpen} onToggle={onToggleProfile}/>
      </div>
    </nav>
  )
}
