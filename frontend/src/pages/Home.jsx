import React, { useState, useEffect } from 'react'
import Topbar from '../components/Topbar/Topbar'
import InfiniteLoader from '../components/InfiniteLoader/InfiniteLoader'
import MidiasTable from '../components/MidiasTable/MidiasTable'
import AddMidiaModal from '../components/AddMidia/AddMidiaModal'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [search, setSearch]         = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [items, setItems]           = useState([])
  const [cursor, setCursor]         = useState(null)
  const [hasMore, setHasMore]       = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  async function fetchMore() {
    const { data, nextCursor } = await fetchMidias({ cursor, pageSize: 20, search })
    setItems(prev => [...prev, ...data])
    setCursor(nextCursor)
    setHasMore(!!nextCursor)
  }

  useEffect(() => {
    setItems([])
    setCursor(null)
    setHasMore(true)
  }, [search])

  useEffect(() => {
    fetchMore()
  }, [cursor === null, search])

  const handleAddSubmit = newMedia => {
    setItems(prev => [ { id: Date.now(), ...newMedia }, ...prev ])
  }

  return (
    <div className={styles.container}>
      <Topbar
        search={search}
        onSearch={setSearch}
        onAdd={() => setShowAddModal(true)}
        profileOpen={profileOpen}
        onToggle={setProfileOpen}
      />

      {showAddModal && (
        <AddMidiaModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
        />
      )}

      <InfiniteLoader loadMore={fetchMore} hasMore={hasMore}>
        <MidiasTable items={items} onRatingChange={(id, nota) => {
          setItems(prev => prev.map(i => i.id === id ? { ...i, nota } : i))
        }}/>
      </InfiniteLoader>
    </div>
  )
}
