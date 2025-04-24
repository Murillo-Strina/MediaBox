import React from 'react'
import styles from '../../styles/Topbar.module.css'
import ProfileMenu from '../ProfileMenu/ProfileMenu'

export default function Topbar({
  search,
  onSearch,
  onAdd,
  profileOpen,
  onToggleProfile
}) {
  return (
    <nav className={styles.topbar}>
      <div className={styles.logo}>
        <img src="/MediaBoxLogo.png" alt="MediaBox Logo" />
      </div>

      <input
        type="text"
        className={styles.searchInput}
        placeholder="Buscar por título ou tag…"
        value={search}
        onChange={e => onSearch(e.target.value)}
      />

      <div className={styles.actions}>
        <button onClick={onAdd} className={styles.addButton}>＋</button>
        <ProfileMenu isOpen={profileOpen} onToggle={onToggleProfile}/>
      </div>
    </nav>
  )
}
