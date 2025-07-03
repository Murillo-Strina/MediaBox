import React, { useState, useRef, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { auth, db } from '../../firebase/firebase.js';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { toastConfirm } from '../../utils/toastConfig';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../styles/AddMidiaModal.module.css';
import { GENRE_LIST } from '../../utils/genres.js';

const getInitialFormState = (media) => {
  if (!media) return { genero: [] };
  return {
    ...media,
    genero: Array.isArray(media.genero) ? media.genero : [],
  };
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

export default function EditMidiaModal({ media, onClose, onSuccess }) {
  const [initialState, setInitialState] = useState(() => getInitialFormState(media));
  const [form, setForm] = useState(initialState);
  const backdropRef = useRef();
  const [cropping, setCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const newInitialState = getInitialFormState(media);
    setInitialState(newInitialState);
    setForm(newInitialState);
  }, [media]);

  const handleCloseAttempt = () => {
    const isDirty = JSON.stringify(form) !== JSON.stringify(initialState);
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

  const onCropComplete = useCallback((_, pixels) => { setCroppedAreaPixels(pixels); }, []);

  const applyCrop = async () => {
    const url = await getCroppedImg(imageSrc, croppedAreaPixels);
    setForm(f => ({ ...f, capa: url }));
    setCropping(false);
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageSrc(URL.createObjectURL(file));
    setCropping(true);
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

  const doDelete = async () => {
    try {
      const userId = auth.currentUser.uid;
      const ref = doc(db, 'Usuarios', userId, 'midias', media.id);
      setIsDeleted(true);
      await deleteDoc(ref);
      toast.success('Mídia excluída com sucesso!');
      onSuccess(null);
    } catch (err) {
      toast.error('Ocorreu um erro ao excluir. Tente novamente.');
    }
  };

  const handleDelete = () => {
    toastConfirm('Tem certeza que deseja excluir esta mídia?', doDelete, () => { });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isDeleted) return;
    const payload = {
      titulo: form.titulo,
      tipo: form.tipo,
      progresso: form.progresso,
      dataInclusao: form.dataInclusao || serverTimestamp(),
      genero: form.genero || [],
      comentario: form.comentario,
      nota: Number(form.nota),
      capa: form.capa,
      updatedAt: serverTimestamp()
    };
    try {
      const userId = auth.currentUser.uid;
      const ref = doc(db, 'Usuarios', userId, 'midias', media.id);
      await updateDoc(ref, payload);
      toast.success('Mídia atualizada com sucesso!');
      onSuccess({ id: media.id, ...payload });
      onClose();
    } catch (err) {
      toast.error('Erro ao atualizar mídia: ' + err.message);
    }
  };

  return (
    <div ref={backdropRef} className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Editar Mídia</h2>
          <button className={styles.closeButton} onClick={handleCloseAttempt} aria-label="Fechar">×</button>
        </div>
        {cropping && imageSrc ? (
          <>
            <div className={styles.cropContainer}>
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={2 / 3}
                onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} showGrid={false} />
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
                  Upload da Capa
                  <input type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
                </label>
                {form.capa && (<img src={form.capa} alt="Preview" className={styles.preview} />)}
                <input name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} required />
                <select name="tipo" value={form.tipo} onChange={handleChange}>
                  {['Filme', 'Série', 'Anime', 'Livro', 'Mangá', 'Manhwa'].map(t => (<option key={t}>{t}</option>))}
                </select>
                <input name="progresso" placeholder="Progresso" value={form.progresso} onChange={handleChange} />
                <input name="dataInclusao" type="date" min="1800-01-01" max={today} value={form.dataInclusao} onChange={handleChange} />
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
                <textarea name="comentario" placeholder="Comentário" minLength={5} value={form.comentario}
                  onChange={handleChange} rows={4} style={{ minHeight: '6rem', resize: 'vertical' }} />
                <input name="nota" type="number" min="0" max="5" placeholder="Nota" value={form.nota} onChange={handleChange} />
              </div>
            </div>
            <div className={styles.buttons}>
              <button type="button" onClick={handleCloseAttempt} className={styles.cancelButton}>Cancelar</button>
              <div className={styles.buttonGroupEnd}>
                <button type="button" onClick={handleDelete} className={styles.deleteButton}>Excluir</button>
                <button type="submit" className={styles.saveButton}>Salvar</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}