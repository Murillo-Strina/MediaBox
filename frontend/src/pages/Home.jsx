import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs
} from 'firebase/firestore';

import Topbar from '../components/Topbar/Topbar';
import InfiniteLoader from '../components/InfiniteLoader/InfiniteLoader';
import MidiasTable from '../components/MidiasTable/MidiasTable';
import AddMidiaModal from '../components/AddMidia/AddMidiaModal';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [items, setItems]             = useState([]);
  const [lastDoc, setLastDoc]         = useState(null);
  const [hasMore, setHasMore]         = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) {
        setUser(u);
      } else {
        navigate('/login', { replace: true });
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const mediaCol = user
    ? collection(db, 'Usuarios', user.uid, 'midias')
    : null;

  const fetchMore = async () => {
    if (!mediaCol) return;
    let q = query(
      mediaCol,
      orderBy('dataInclusao', 'desc'),
      limit(20)
    );
    if (lastDoc) {
      q = query(
        mediaCol,
        orderBy('dataInclusao', 'desc'),
        startAfter(lastDoc),
        limit(20)
      );
    }

    const snap = await getDocs(q);
    const docsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    setItems(prev => {
      const seen = new Set(prev.map(i => i.id));
      const unique = docsData.filter(d => !seen.has(d.id));
      return [...prev, ...unique];
    });

    const last = snap.docs[snap.docs.length - 1];
    setLastDoc(last);
    setHasMore(snap.docs.length === 20);
  };

  useEffect(() => {
    if (!authLoading && user) {
      setItems([]);
      setLastDoc(null);
      setHasMore(true);
      fetchMore();
    }
  }, [authLoading, user]);

  const handleAddSuccess = newDoc => {
    setItems(prev => [newDoc, ...prev]);
  };

  if (authLoading) {
    return <div className={styles.loading}>Carregando usuário…</div>;
  }

  return (
    <div className={styles.container}>
      <Topbar
        onAdd={() => setShowAddModal(true)}
        profileOpen={profileOpen}
        onToggleProfile={setProfileOpen}
      />

      {showAddModal && (
        <AddMidiaModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      <InfiniteLoader loadMore={fetchMore} hasMore={hasMore}>
        <MidiasTable
          items={items}
          onRatingChange={(id, nota) =>
            setItems(prev =>
              prev.map(i => (i.id === id ? { ...i, nota } : i))
            )
          }
        />
      </InfiniteLoader>
    </div>
  );
}
