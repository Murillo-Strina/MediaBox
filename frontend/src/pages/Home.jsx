import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/firebase.js'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, orderBy, startAfter, limit, getDocs } from 'firebase/firestore'
import Topbar from '../components/Topbar/Topbar'
import InfiniteLoader from '../components/InfiniteLoader/InfiniteLoader'
import MidiasTable from '../components/MidiasTable/MidiasTable'
import AddMidiaModal from '../components/AddMidia/AddMidiaModal'
import EditMidiaModal from '../components/EditMidia/EditMidiaModal'
import ProfileConfig from '../components/ProfileConfig/ProfileConfig';
import styles from '../styles/Home.module.css'

export default function Home() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [items, setItems] = useState([])
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [mediaEdit, setMediaEdit] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [showProfileConfig, setShowProfileConfig] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) setUser(u)
      else navigate('/login', { replace: true })
      setAuthLoading(false)
    })
    return () => unsub()
  }, [navigate])

  const mediaCol = user && collection(db, 'Usuarios', user.uid, 'midias')

  const fetchMore = async () => {
    if (!mediaCol) return
    let q = query(mediaCol, orderBy('dataInclusao', 'desc'), limit(20))
    if (lastDoc) q = query(mediaCol, orderBy('dataInclusao', 'desc'), startAfter(lastDoc), limit(20))
    const snap = await getDocs(q)
    const docsData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setItems(prev => {
      const seen = new Set(prev.map(i => i.id))
      const unique = docsData.filter(d => !seen.has(d.id))
      return [...prev, ...unique]
    })
    const last = snap.docs[snap.docs.length - 1]
    setLastDoc(last)
    setHasMore(snap.docs.length === 20)
  }

  useEffect(() => {
    if (!authLoading && user) {
      setItems([])
      setLastDoc(null)
      setHasMore(true)
      fetchMore()
    }
  }, [authLoading, user])

  const handleAddSuccess = newDoc => {
    setItems(prev => [newDoc, ...prev])
  }

  const handleRowClick = media => {
    setMediaEdit(media)
  }

  const handleEditClick = () => {
    if (!mediaEdit) return alert('Selecione uma mídia')
    setShowEditModal(true)
  }

  const handleEditSuccess = updated => {
    if (!updated) {
      setItems(prev =>
        prev.map(i =>
          i.id === mediaEdit?.id ? { ...i, _removing: true } : i
        )
      )
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== mediaEdit?.id))
        setMediaEdit(null)
        setShowEditModal(false)
      }, 300)
    } else {
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    }
  }

  if (authLoading) return null

  return (
    <div className={styles.container}>
      <Topbar
        onAdd={() => setShowAddModal(true)}
        onEdit={handleEditClick}
        profileOpen={profileOpen}
        onToggleProfile={setProfileOpen}
        onOpenConfig={() => setShowProfileConfig(true)}
      />
      {showAddModal && (
        <AddMidiaModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
      {showEditModal && (
        <EditMidiaModal
          media={mediaEdit}
          onClose={() => setShowEditModal(false)}
          onSuccess={updated => {
            handleEditSuccess(updated)
            if (updated !== null) {
              setShowEditModal(false)
            }
          }}
        />
      )}
      {showProfileConfig && (
        <ProfileConfig onClose={() => setShowProfileConfig(false)} />
      )}
      <InfiniteLoader loadMore={fetchMore} hasMore={hasMore}>
        <MidiasTable
          items={items}
          selectedId={mediaEdit?.id}
          onSelect={handleRowClick}
          onRatingChange={(id, nota) =>
            setItems(prev => prev.map(i => i.id === id ? { ...i, nota } : i))
          }
        />
      </InfiniteLoader>
    </div>
  )
}
