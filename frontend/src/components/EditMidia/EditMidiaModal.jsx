import React, { useState, useRef, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../../utils/cropImage'
import { auth, db } from '../../firebase/firebase.js'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import styles from '../../styles/AddMidiaModal.module.css'

export default function EditMidiaModal({ media, onClose, onSuccess }) {
    const [form, setForm] = useState({ ...media })
    const backdropRef = useRef()
    const [cropping, setCropping] = useState(false)
    const [imageSrc, setImageSrc] = useState(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    useEffect(() => {
        setForm({ ...media })
    }, [media])

    const handleBackdropClick = e => {
        if (e.target === backdropRef.current) onClose()
    }

    const handleFileChange = e => {
        const file = e.target.files[0]
        if (!file) return
        setImageSrc(URL.createObjectURL(file))
        setCropping(true)
    }

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels)
    }, [])

    const applyCrop = async () => {
        const url = await getCroppedImg(imageSrc, croppedAreaPixels)
        setForm(f => ({ ...f, capa: url }))
        setCropping(false)
    }

    const handleChange = e => {
        const { name, value } = e.target
        setForm(f => ({ ...f, [name]: value }))
    }

    const handleSubmit = async e => {
        e.preventDefault()
        const raw = Array.isArray(form.genero)
            ? form.genero.join(' ')
            : form.genero || ''

        const tags = raw
            .split(/[;\s]+/)
            .map(t => t.trim())
            .filter(Boolean)

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
        }

        const userId = auth.currentUser.uid
        const ref = doc(db, 'Usuarios', userId, 'midias', media.id)
        await updateDoc(ref, payload)

        onSuccess({ id: media.id, ...payload })
        onClose()

    }

    return (
        <div ref={backdropRef} className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <h2>Editar Mídia</h2>
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
                            <button type="button" onClick={() => setCropping(false)}>Cancelar</button>
                            <button type="button" onClick={applyCrop}>Aplicar Corte</button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <label className={styles.fileInputLabel}>
                            Upload da Capa
                            <input type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
                        </label>
                        {form.capa && <img src={form.capa} alt="Preview" className={styles.preview} />}
                        <input name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} required />
                        <select name="tipo" value={form.tipo} onChange={handleChange}>
                            {['Filme', 'Série', 'Anime', 'Livro', 'Mangá', 'Manhwa', 'Outro'].map(t => <option key={t}>{t}</option>)}
                        </select>
                        <input name="progresso" placeholder="Progresso" value={form.progresso} onChange={handleChange} />
                        <input name="dataInclusao" type="date" value={form.dataInclusao} onChange={handleChange} />
                        <input name="genero" placeholder="Gêneros" value={form.genero} onChange={handleChange} />
                        <textarea name="comentario" placeholder="Comentário" minLength={5} value={form.comentario} onChange={handleChange} />
                        <input name="nota" type="number" min="0" max="10" placeholder="Nota" value={form.nota} onChange={handleChange} />
                        <div className={styles.buttons}>
                            <button type="button" onClick={onClose}>Cancelar</button>
                            <button type="submit" className={styles.saveButton}>Salvar</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
