import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import Topbar from '../components/Topbar/Topbar';
import InfiniteLoader from '../components/InfiniteLoader/InfiniteLoader';
import MidiasTable from '../components/MidiasTable/MidiasTable';
import AddMidiaModal from '../components/AddMidia/AddMidiaModal';
import EditMidiaModal from '../components/EditMidia/EditMidiaModal';
import ProfileConfig from '../components/ProfileConfig/ProfileConfig';
import styles from '../styles/Home.module.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const normalizeText = (text = '') => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mediaEdit, setMediaEdit] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileConfig, setShowProfileConfig] = useState(false);
  const navigate = useNavigate();
  const firstLoadRef = useRef(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [avatar, setAvatar] = useState(null);

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

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user) return;
      const ref = doc(db, 'Usuarios', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().avatarBase64) {
        setAvatar(snap.data().avatarBase64);
      }
    };
    if (user) fetchAvatar();
  }, [user]);

  const mediaCol = user && collection(db, 'Usuarios', user.uid, 'midias');

  const fetchMore = async () => {
    if (!mediaCol) return;
    let q = query(mediaCol, orderBy('dataInclusao', 'desc'), limit(20));
    if (lastDoc) {
      q = query(mediaCol, orderBy('dataInclusao', 'desc'), startAfter(lastDoc), limit(20));
    }
    const snap = await getDocs(q);
    const docsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (firstLoadRef.current) {
      firstLoadRef.current = false;

      let userName = user.displayName;
      if (!userName) {
        try {
          const userDocRef = doc(db, 'Usuarios', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().nome) {
            userName = userDoc.data().nome;
          }
        } catch (error) {
          userName = null;
        }
      }

      if (docsData.length === 0) {
        const welcomeName = userName ? `, ${userName}` : '';
        toast.info(`Bem-vindo(a)${welcomeName}! Seu acervo está vazio — adicione algo incrível clicando no “+”.`);
      } else {
        if (userName) {
          toast.success(`Bem-vindo de volta, ${userName}!`);
        } else {
          toast.success('Bem-vindo de volta!');
        }
      }
    }

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

  const handleRowClick = media => {
    setMediaEdit(media);
  };

  const handleEditClick = () => {
    if (!mediaEdit) {
      toast.error('Selecione uma mídia');
      return;
    }
    setShowEditModal(true);
  };

  const handleEditSuccess = updated => {
    if (updated === null) {
      setItems(prev => prev.filter(i => i.id !== mediaEdit?.id));
      setMediaEdit(null);
      setShowEditModal(false);
    } else {
      setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      setMediaEdit(updated);
      setShowEditModal(false);
    }
  };

  const handleRatingChange = async (itemId, newRating) => {
    setItems(prev => prev.map(i => (i.id === itemId ? { ...i, nota: newRating } : i)));
    try {
      const itemRef = doc(db, 'Usuarios', user.uid, 'midias', itemId);
      await updateDoc(itemRef, { nota: newRating });
    } catch (error) {
      toast.error("Não foi possível salvar sua avaliação.");
    }
  };

  const handleProfileUpdateSuccess = (updatedData) => {
    if (updatedData.displayName) {
      setUser(prevUser => ({ ...prevUser, displayName: updatedData.displayName }));
    }
    if (updatedData.avatarBase64) {
      setAvatar(updatedData.avatarBase64);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return items;
    }
    const normalizedTerm = normalizeText(searchTerm);
    return items.filter(item => {
      const titleMatch = normalizeText(item.titulo).includes(normalizedTerm);
      const typeMatch = normalizeText(item.tipo).includes(normalizedTerm);
      const genreMatch = Array.isArray(item.genero) &&
        item.genero.some(genre => normalizeText(genre).includes(normalizedTerm));
      return titleMatch || typeMatch || genreMatch;
    });
  }, [items, searchTerm]);

  if (authLoading) return null;

  return (
    <>
      <div className={styles.container}>
        <Topbar
          onAdd={() => setShowAddModal(true)}
          onEdit={handleEditClick}
          profileOpen={profileOpen}
          onToggleProfile={setProfileOpen}
          onOpenConfig={() => setShowProfileConfig(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          avatar={avatar}
        />

        <main className={styles.mainContent}>
          {showAddModal && (
            <AddMidiaModal onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} />
          )}

          {showEditModal && (
            <EditMidiaModal
              media={mediaEdit}
              onClose={() => setShowEditModal(false)}
              onSuccess={handleEditSuccess}
            />
          )}

          {showProfileConfig &&
            <ProfileConfig
              onClose={() => setShowProfileConfig(false)}
              onUpdateSuccess={handleProfileUpdateSuccess}
            />
          }

          <InfiniteLoader loadMore={fetchMore} hasMore={hasMore}>
            <MidiasTable
              items={filteredItems}
              selectedId={mediaEdit?.id}
              onSelect={handleRowClick}
              onRatingChange={handleRatingChange}
            />
          </InfiniteLoader>
        </main>
      </div>
    </>
  );
}