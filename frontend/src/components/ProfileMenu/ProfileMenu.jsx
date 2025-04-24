import React, { useRef, useEffect } from 'react'
import styles from '../../styles/ProfileMenu.module.css'

export default function ProfileMenu({ isOpen, onToggle }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onToggle(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onToggle])

  return (
    <div ref={ref} className={styles.profile}>
      <span
        className={styles.icon}
        onClick={() => onToggle(open => !open)}
      >
        👤
      </span>
      {isOpen && (
        <div className={styles.dropdown}>
          <button>Configurações</button>
          <button>Logout</button>
        </div>
      )}
    </div>
  )
}
