import React, { useState, useEffect } from 'react'
import Topbar from '../components/Topbar/Topbar'
import InfiniteLoader from '../components/InfiniteLoader/InfiniteLoader'
import MidiasTable from '../components/MidiasTable/MidiasTable'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [search, setSearch] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)

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

  return (
    <div className={styles.container}>
      <Topbar
        search={search}
        onSearch={setSearch}
        onAdd={() => {  }}
        profileOpen={profileOpen}
        onToggleProfile={setProfileOpen}
      />

      <InfiniteLoader loadMore={fetchMore} hasMore={hasMore}>
        <MidiasTable items={items} onRatingChange={() => { }}/>
      </InfiniteLoader>
    </div>
  )
}
