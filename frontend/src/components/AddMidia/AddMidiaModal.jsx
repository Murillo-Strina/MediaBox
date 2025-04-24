import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../Utils/cropImage';
import styles from '../../styles/AddMidiaModal.module.css';

export default function AddMidiaModal({ onClose, onSubmit }) {
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
  const backdropRef = useRef();

  // Cropping state
  const [cropping, setCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleBackdropClick = e => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setCropping(true);
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
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

  const handleSubmit = e => {
    e.preventDefault();
    const raw = form.genero || '';
    const tags = raw.split(/[;\s]+/).map(t => t.trim()).filter(Boolean);
    onSubmit({
      ...form,
      nota: form.nota === '' ? 0 : Number(form.nota),
      genero: tags
    });
    onClose();
  };

  return (
    <div ref={backdropRef} className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <h2>Adicionar Mídia</h2>
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
              <button onClick={() => setCropping(false)}>Cancelar</button>
              <button onClick={applyCrop}>Aplicar Corte</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className={styles.fileInputLabel}>
              {form.capa ? 'Alterar Capa' : 'Upload da Capa'}
              <input type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput} required />
            </label>
            {form.capa && <img src={form.capa} alt="Preview Capa" className={styles.preview} />}

            <input name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} required />

            <select name="tipo" value={form.tipo} onChange={handleChange}>
              <option>Filme</option>
              <option>Série</option>
              <option>Anime</option>
              <option>Livro</option>
              <option>Mangá</option>
              <option>Manhwa</option>
              <option>Outro</option>
            </select>

            <input name="progresso" placeholder="Progresso" value={form.progresso} onChange={handleChange} />

            <input name="dataInclusao" type="date" value={form.dataInclusao} onChange={handleChange} />

            <input name="genero" placeholder="Gênero (tags ; ou espaço)" value={form.genero} onChange={handleChange} />

            <textarea name="comentario" placeholder="Comentário (mínimo 5 chars)" minLength={5} value={form.comentario} onChange={handleChange} />

            <input name="nota" type="number" min="0" max="10" placeholder="Nota (0–10)" value={form.nota} onChange={handleChange} />

            <div className={styles.buttons}>
              <button type="button" onClick={onClose}>Cancelar</button>
              <button type="submit" className={styles.saveButton}>Salvar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
