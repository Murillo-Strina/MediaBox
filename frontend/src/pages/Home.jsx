import React, { useState, useEffect, useRef } from 'react';
import styles from "../styles/home.module.css";

function Home() {
  const [search, setSearch] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const [items, setItems] = useState([   {
    id: 1,
    capa: '/capa1.jpg',
    titulo: 'My Photo',
    tipo: 'Imagem',
    progresso: '100%',
    dataInclusao: '20/04/25',
    genero: 'Viagem',
    comentario: 'Foto incrível!',
    nota: 5
  },
  {
    id: 2,
    capa: '/capa2.jpg',
    titulo: 'Cool Podcast Ep.',
    tipo: 'Áudio',
    progresso: 'Ep. 3/10',
    dataInclusao: '18/04/25',
    genero: 'Tech',
    comentario: 'Entrevista muito boa',
    nota: 4
  },
  {
    id: 3,
    capa: '/capa3.jpg',
    titulo: 'Filme XYZ',
    tipo: 'Vídeo',
    progresso: 'Ainda não visto',
    dataInclusao: '15/04/25',
    genero: 'Drama',
    comentario: 'Quero assistir em breve',
    nota: 0
  }, ]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRatingChange = (id, newRating) => {
    setItems(items.map(it => 
      it.id === id ? { ...it, nota: newRating } : it
    ));
  };

  const filtered = items.filter(item => {
    const s = search.toLowerCase();
    return (
      item.titulo.toLowerCase().includes(s) ||
      item.genero.toLowerCase().includes(s) ||
      item.comentario.toLowerCase().includes(s)
    );
  });

  return (
    <div className={styles.container}>
      <nav className={styles.topbar}>
        <div className={styles.logo}>
          <img src="/MediaBoxLogo.png" alt="MediaBox Logo" />
        </div>

        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por título ou tag…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className={styles.actions}>
          <button className={styles.addButton}>＋</button>
          <div ref={profileRef} className={styles.profile}>
            <span
              className={styles.icon}
              onClick={() => setIsProfileOpen(open => !open)}
            >👤</span>
            {isProfileOpen && (
              <div className={styles.dropdown}>
                <button>Configurações</button>
                <button>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className={styles.content}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Capa</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Progresso</th>
                <th>Data de Inclusão</th>
                <th>Gênero</th>
                <th>Comentário</th>
                <th className={styles.fixedNoteColumn}>Nota</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={item.capa}
                      alt={item.titulo}
                      className={styles.capaImg}
                    />
                  </td>
                  <td>{item.titulo}</td>
                  <td>{item.tipo}</td>
                  <td>{item.progresso}</td>
                  <td>{item.dataInclusao}</td>
                  <td>{item.genero}</td>
                  <td title={item.comentario}>{item.comentario}</td>
                  <td>
                    {item.nota}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Home;