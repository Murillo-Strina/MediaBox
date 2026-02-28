import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/crop-image.js';
import { auth, db } from '../../firebase/firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../styles/AddMidiaModal.module.css';
import { GENRE_LIST } from '../../utils/genres.js';

const initialFormState = {
  capa: '',
  titulo: '',
  tipo: 'Filme',
  progresso: '',
  dataInclusao: '',
  genero: [],
  comentario: '',
  nota: ''
};

const ConfirmToast = ({ onConfirm }) => {
  const toastId = 'confirm-close-toast';
  const handleConfirm = () => { onConfirm(); toast.dismiss(toastId); };
  const handleCancel = () => { toast.dismiss(toastId); };
  return (
    <div className={styles.confirmToast}>
      <p>Você tem alterações não salvas. Deseja realmente fechar?</p>
      <div className={styles.confirmToastButtons}>
        <button className={styles.cancelButton} onClick={handleCancel}>Não</button>
        <button className={styles.confirmButton} onClick={handleConfirm}>Sim</button>
      </div>
    </div>
  );
};

export default function AddMidiaModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(initialFormState);
  const commentRef = useRef(null);
  const backdropRef = useRef();
  const today = new Date().toISOString().split('T')[0];
  const [cropping, setCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCloseAttempt = () => {
    const isDirty = JSON.stringify(form) !== JSON.stringify(initialFormState);
    if (isDirty) {
      toast(<ConfirmToast onConfirm={onClose} />, {
        position: "top-center", autoClose: false, closeOnClick: false,
        closeButton: false, draggable: false, toastId: 'confirm-close-toast'
      });
    } else {
      onClose();
    }
  };

  const handleBackdropClick = e => {
    if (e.target === backdropRef.current) handleCloseAttempt();
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageSrc(URL.createObjectURL(file));
    setCropping(true);
  };

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const applyCrop = async () => {
    try {
      const croppedUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      setForm(f => ({ ...f, capa: croppedUrl }));
      setCropping(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleGenreClick = (genre) => {
    setForm(prevForm => {
      const currentGenres = prevForm.genero || [];
      const newGenres = currentGenres.includes(genre)
        ? currentGenres.filter(g => g !== genre)
        : [...currentGenres, genre];
      return { ...prevForm, genero: newGenres };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.capa) {
      toast.error('Por favor, faça upload da capa antes de salvar.');
      return;
    }
    const payload = {
      titulo: form.titulo,
      tipo: form.tipo,
      progresso: form.progresso,
      dataInclusao: form.dataInclusao || serverTimestamp(),
      genero: form.genero || [],
      comentario: form.comentario,
      nota: form.nota === '' ? 0 : Number(form.nota),
      capa: form.capa,
      createdAt: serverTimestamp()
    };
    try {
      const userId = auth.currentUser.uid;
      const colRef = collection(db, 'Usuarios', userId, 'midias');
      const docRef = await addDoc(colRef, payload);
      toast.success('Mídia adicionada com sucesso!');
      onSuccess({ id: docRef.id, ...payload });
      onClose();
    } catch (err) {
      toast.error('Erro ao adicionar mídia: ' + err.message);
    }
  };

  return (
    <div ref={backdropRef} className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Adicionar Mídia</h2>
          <button className={styles.closeButton} onClick={handleCloseAttempt} aria-label="Fechar">×</button>
        </div>
        {cropping && imageSrc ? (
          <>
            <div className={styles.cropContainer}>
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={2 / 3}
                onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <div className={styles.cropActions}>
              <button type="button" onClick={() => setCropping(false)}>Cancelar</button>
              <button type="button" onClick={applyCrop}>Aplicar Corte</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formColumn}>
                <label className={styles.fileInputLabel}>
                  {form.capa ? 'Alterar Capa' : 'Upload da Capa'}
                  <input name="capa" type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
                </label>
                {form.capa && (<img src={form.capa} alt="Preview Capa" className={styles.preview} />)}
                <input name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} required />
                <select name="tipo" value={form.tipo} onChange={handleChange}>
                  {['Filme', 'Série', 'Anime', 'Livro', 'Mangá', 'Manhwa', 'Light Novel'].map(t => (<option key={t}>{t}</option>))}
                </select>
                <input name="progresso" placeholder="Progresso" value={form.progresso} onChange={handleChange} />
                <input name="dataInclusao" type="date" value={form.dataInclusao} min="1800-01-01" max={today} onChange={handleChange} />
              </div>

              <div className={styles.formColumn}>
                <div className={styles.genrePickerContainer}>
                  {GENRE_LIST.map(genre => (
                    <button key={genre} type="button"
                      className={`${styles.genreButton} ${form.genero.includes(genre) ? styles.selected : ''}`}
                      onClick={() => handleGenreClick(genre)}>
                      {genre}
                    </button>
                  ))}
                </div>
                <textarea name="comentario" placeholder="Comentário" minLength={5}
                  ref={commentRef} value={form.comentario} onChange={handleChange} />
                <input name="nota" type="number" min="0" max="5" placeholder="Nota (0–5)" value={form.nota} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.buttons}>
              <button type="button" onClick={handleCloseAttempt} className={styles.cancelButton}>Cancelar</button>
              <button type="submit" className={styles.saveButton}>Salvar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}