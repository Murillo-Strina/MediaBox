import React, { useState, useRef, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { auth, db } from '../../firebase/firebase.js';
import {
  updateProfile,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import { toastConfig, toastConfirm } from '../../utils/toastConfig';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../styles/ProfileConfig.module.css';

export default function ProfileConfig({ onClose }) {
  const backdropRef = useRef();
  const user = auth.currentUser;
  const [activeTab, setActiveTab] = useState('profile');

  const [form, setForm] = useState({
    displayName: user.displayName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatarBase64: '',
    email: user.email || '',
  });

  const [imageSrc, setImageSrc] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      const ref = doc(db, 'Usuarios', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setForm(f => ({ ...f, avatarBase64: data.avatarBase64 || '' }));
      }
    };
    loadUserData();
  }, [user.uid]);

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
    const url = await getCroppedImg(imageSrc, croppedAreaPixels);
    setForm(f => ({ ...f, avatarBase64: url }));
    setCropping(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(user, { displayName: form.displayName });
      const ref = doc(db, 'Usuarios', user.uid);
      await updateDoc(ref, {
        avatarBase64: form.avatarBase64,
        displayName: form.displayName
      });
      toast.success('Perfil atualizado com sucesso!');
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 500);        
    } catch (err) {
      toast.error('Erro ao atualizar perfil: ' + err.message);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (form.newPassword !== form.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }
      const credential = EmailAuthProvider.credential(user.email, form.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, form.newPassword);
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
      toast.success('Senha atualizada com sucesso!');
      onClose();
    } catch (err) {
      toast.error('Erro ao atualizar senha: ' + err.message);
    }
  };

  const doDelete = async () => {
    try {
      await deleteDoc(doc(db, 'Usuarios', user.uid));
      await deleteUser(user);
      toast.success('Conta excluída com sucesso!');
      onClose();
    } catch (err) {
      toast.error('Erro ao excluir conta: ' + err.message);
    }
  };

  const handleDelete = () => {
    toastConfirm(
      'Tem certeza que deseja excluir sua conta?',
      doDelete,
      () => {} 
    );
  };

  return (
    <>
      <div ref={backdropRef} className={styles.backdrop} onClick={handleBackdropClick}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2>Configurações</h2>
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
          <div className={styles.tabs}>
            <button className={activeTab=== 'profile' ? styles.active : ''} onClick={()=>setActiveTab('profile')}>Editar Usuário</button>
            <button className={activeTab=== 'security'? styles.active : ''} onClick={()=>setActiveTab('security')}>Segurança</button>
            <button className={activeTab=== 'account'? styles.active : ''} onClick={()=>setActiveTab('account')}>Conta</button>
          </div>
          {cropping && imageSrc ? (
            <>
              <div className={styles.cropContainer}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid={false}
                />
              </div>
              <div className={styles.cropActions}>
                <button type="button" onClick={()=>setCropping(false)}>Cancelar</button>
                <button type="button" onClick={applyCrop}>Salvar Foto</button>
              </div>
            </>
          ) : activeTab === 'profile' ? (
            <form onSubmit={e=>e.preventDefault()}>
              <label className={styles.fileInputLabel}>
                {form.avatarBase64 ? 'Alterar Foto' : 'Upload da Foto'}
                <input type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput}/>
              </label>
              {form.avatarBase64 && <img src={form.avatarBase64} alt="Preview" className={styles.previewCircle}/>}
              <input name="displayName" placeholder="Nome de Usuário" value={form.displayName} onChange={handleChange}/>
              <div className={styles.buttons}>
                <button type="button" onClick={onClose}>Cancelar</button>
                <button type="button" className={styles.saveButton} onClick={handleSave}>Salvar</button>
              </div>
            </form>
          ) : activeTab === 'security' ? (
            <form onSubmit={e=>e.preventDefault()}>
              <input type="password" name="currentPassword" placeholder="Senha Atual" value={form.currentPassword} onChange={handleChange}/>
              <input type="password" name="newPassword" placeholder="Nova Senha" value={form.newPassword} onChange={handleChange}/>
              <input type="password" name="confirmPassword" placeholder="Confirmar Nova Senha" value={form.confirmPassword} onChange={handleChange}/>
              <div className={styles.buttons}>
                <button type="button" onClick={onClose}>Cancelar</button>
                <button type="button" className={styles.saveButton} onClick={handlePasswordChange}>Salvar Alterações</button>
              </div>
            </form>
          ) : (
            <form onSubmit={e=>e.preventDefault()}>
              <button type="button" className={styles.deleteAccountButton} onClick={handleDelete}>
                Excluir Conta
              </button>
            </form>
          )}
        </div>
      </div>
      <ToastContainer {...toastConfig} />
    </>
  );
}
