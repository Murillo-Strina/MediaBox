import React, { useState, useRef, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { auth, db } from '../../firebase/firebase.js';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

import { toast, ToastContainer } from 'react-toastify';
import { toastConfig, toastConfirm } from '../../utils/toastConfig';
import 'react-toastify/dist/ReactToastify.css';

import styles from '../../styles/AddMidiaModal.module.css';

export default function EditMidiaModal({ media, onClose, onSuccess }) {
  const [form, setForm] = useState({ ...media });
  const backdropRef = useRef();
  const [cropping, setCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setForm({ ...media });
  }, [media]);

  const handleBackdropClick = e => {
    if (e.target === backdropRef.current) onClose();
  };

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

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

  const doDelete = async () => {
    try {
      const userId = auth.currentUser.uid;
      const ref = doc(db, 'Usuarios', userId, 'midias', media.id);
      setIsDeleted(true);
      await deleteDoc(ref);
      toast.success('Mídia excluída com sucesso!');
      onSuccess(null);
    } catch (err) {
      console.error('Erro ao excluir mídia:', err);
      toast.error('Ocorreu um erro ao excluir. Tente novamente.');
    }
  };

  const handleDelete = () => {
    toastConfirm(
      'Tem certeza que deseja excluir esta mídia?',
      doDelete,
      () => {}  
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isDeleted) return;

    const raw = Array.isArray(form.genero)
      ? form.genero.join(' ')
      : form.genero || '';
    const tags = raw
      .split(/\s*,\s*/)
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      titulo: form.titulo,
      tipo: form.tipo,
      progresso: form.progresso,
      dataInclusao: form.dataInclusao || serverTimestamp(),
      genero: tags,
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
      console.error('Erro ao atualizar mídia:', err);
      toast.error('Erro ao atualizar mídia: ' + err.message);
    }
  };

  return (
    <>
      <div ref={backdropRef} className={styles.backdrop} onClick={handleBackdropClick}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2>Editar Mídia</h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">×</button>
          </div>

          {cropping && imageSrc ? (
            <>
              <div className={styles.cropContainer}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={2 / 3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid={false}
                />
              </div>
              <div className={styles.cropActions}>
                <button type="button" onClick={() => setCropping(false)}>Cancelar</button>
                <button type="button" onClick={applyCrop}>Aplicar Corte</button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className={styles.fileInputLabel}>
                Upload da Capa
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
              </label>

              {form.capa && (
                <img src={form.capa} alt="Preview" className={styles.preview} />
              )}

              <input
                name="titulo"
                placeholder="Título"
                value={form.titulo}
                onChange={handleChange}
                required
              />
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                {['Filme', 'Série', 'Anime', 'Livro', 'Mangá', 'Manhwa', 'Outro'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input
                name="progresso"
                placeholder="Progresso"
                value={form.progresso}
                onChange={handleChange}
              />
              <input
                name="dataInclusao"
                type="date"
                min="1800-01-01"
                max={today}
                value={form.dataInclusao}
                onChange={handleChange}
              />
              <input
                name="genero"
                placeholder="Gêneros"
                value={form.genero}
                onChange={handleChange}
              />
              <textarea
                name="comentario"
                placeholder="Comentário"
                minLength={5}
                value={form.comentario}
                onChange={handleChange}
                rows={4}
                style={{ minHeight: '6rem', resize: 'vertical' }}
              />
              <input
                name="nota"
                type="number"
                min="0"
                max="5"
                placeholder="Nota"
                value={form.nota}
                onChange={handleChange}
              />

              <div className={styles.buttons}>
                <button type="button" onClick={onClose}>Cancelar</button>
                <button type="button" onClick={handleDelete}>Excluir</button>
                <button type="submit" className={styles.saveButton}>Salvar</button>
              </div>
            </form>
          )}
        </div>
      </div>
      <ToastContainer {...toastConfig} />
    </>
  );
}
