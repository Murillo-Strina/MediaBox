import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { auth, db } from '../../firebase/firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import styles from '../../styles/AddMidiaModal.module.css';

export default function AddMidiaModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    capa: '',
    titulo: '',
    tipo: 'Filme',
    progresso: '',
    dataInclusao: '',
    genero: '',
    comentario: '',
    nota: ''
  });
  const commentRef = useRef(null);
  const backdropRef = useRef();
  const today = new Date().toISOString().split('T')[0];
  const [cropping, setCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleBackdropClick = e => {
    if (e.target === backdropRef.current) onClose();
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
    if (name === 'comentario' && commentRef.current) {
      commentRef.current.style.height = 'auto';
      commentRef.current.style.height = commentRef.current.scrollHeight + 'px';
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.capa) {
      alert('Por favor, faça upload da capa antes de salvar.');
      return;
    }
    const tags = (form.genero || '')
      .split(/[;\s]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      titulo: form.titulo,
      tipo: form.tipo,
      progresso: form.progresso,
      dataInclusao: form.dataInclusao || serverTimestamp(),
      genero: tags,
      comentario: form.comentario,
      nota: form.nota === '' ? 0 : Number(form.nota),
      capa: form.capa,
      createdAt: serverTimestamp()
    };

    const userId = auth.currentUser.uid;
    const colRef = collection(db, 'Usuarios', userId, 'midias');
    const docRef = await addDoc(colRef, payload);

    onSuccess({ id: docRef.id, ...payload });
    onClose();
  };

  return (
    <div
      ref={backdropRef}
      className={styles.backdrop}
      onClick={handleBackdropClick}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Adicionar Mídia</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar"
          >×</button>
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
              />
            </div>
            <div className={styles.cropActions}>
              <button
                type="button"
                onClick={() => setCropping(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={applyCrop}
              >
                Aplicar Corte
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className={styles.fileInputLabel}>
              {form.capa ? 'Alterar Capa' : 'Upload da Capa'}
              <input
                name="capa"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
            </label>

            {form.capa && (
              <img
                src={form.capa}
                alt="Preview Capa"
                className={styles.preview}
              />
            )}

            <input
              name="titulo"
              placeholder="Título"
              value={form.titulo}
              onChange={handleChange}
              required
            />

            <select name="tipo" value={form.tipo} onChange={handleChange}>
              {['Filme', 'Série', 'Anime', 'Livro', 'Mangá', 'Manhwa', 'Light Novel', 'Outro'].map(t => (
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
              value={form.dataInclusao}
              min="1800-01-01"
              max={today}
              onChange={handleChange}
            />

            <input
              name="genero"
              placeholder="Gêneros (separe por ; ou espaço)"
              value={form.genero}
              onChange={handleChange}
            />

            <textarea
              name="comentario"
              placeholder="Comentário"
              minLength={5}
              ref={commentRef}
              value={form.comentario}
              onChange={handleChange}
              onInput={handleChange}
            />

            <input
              name="nota"
              type="number"
              min="0"
              max="5"
              placeholder="Nota (0–5)"
              value={form.nota}
              onChange={handleChange}
            />

            <div className={styles.buttons}>
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className={styles.saveButton}>
                Salvar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
