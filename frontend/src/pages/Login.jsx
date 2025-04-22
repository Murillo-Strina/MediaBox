import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import styles from "../styles/Login.module.css";
import Checkmark from "../components/Checkmark/Checkmark.jsx";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const emailRef = useRef(null);

  const handleSwitch = () => {
    setIsLogin(!isLogin);
    setEmail(''); setPassword(''); setName(''); setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!isLogin && password !== confirmPassword) {
      const confirmInput = form.querySelector('input[placeholder="Confirme sua Senha"]');
      confirmInput.setCustomValidity('Senhas diferentes');
      confirmInput.reportValidity();
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        // Login existente
        await signInWithEmailAndPassword(auth, email, password);
        // Buscar perfil no Firestore
        const user = auth.currentUser;
        const snap = await getDoc(doc(db, 'Usuarios', user.uid));
        if (snap.exists()) {
          sessionStorage.setItem('userProfile', JSON.stringify(snap.data()));
        }
      } else {
        // Novo cadastro
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        // Gravar perfil no Firestore
        await setDoc(doc(db, 'Usuarios', user.uid), { nome: name, email });
        // Armazenar em sessão para uso imediato
        sessionStorage.setItem('userProfile', JSON.stringify({ nome: name, email }));
      }
      setIsSuccess(true);
      setTimeout(() => navigate('/home'), 1000);
    } catch (error) {
      console.error('Erro Firebase:', error);
      const formEl = document.querySelector('form');
      const emailInput = formEl.querySelector('input[type="email"]');
      const passwordInput = formEl.querySelector('input[type="password"]');
      switch (error.code) {
        case 'auth/user-not-found':
          emailInput.setCustomValidity('Usuário não encontrado'); emailInput.reportValidity();
          break;
        case 'auth/wrong-password':
          passwordInput.setCustomValidity('Senha incorreta'); passwordInput.reportValidity();
          break;
        case 'auth/email-already-in-use':
          emailInput.setCustomValidity('E-mail já cadastrado'); emailInput.reportValidity();
          break;
        default:
          passwordInput.setCustomValidity('Erro na autenticação'); passwordInput.reportValidity();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const input = emailRef.current;
    if (!input.checkValidity()) { input.reportValidity(); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Link de redefinição enviado! Verifique sua caixa de entrada.');
    } catch {
      input.setCustomValidity('Não foi possível enviar o e‑mail'); input.reportValidity();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>{isLogin ? 'Login' : 'Cadastre-se'}</h1>
        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <input
              type="text" placeholder="Seu Nome" autoComplete="name" required
              className={styles.input} value={name}
              onChange={e => { e.target.setCustomValidity(''); setName(e.target.value); }}
              minLength={2}
            />
          )}
          <input
            ref={emailRef} type="email" placeholder="Seu Email" autoComplete="email" required
            className={styles.input} value={email}
            onChange={e => { e.target.setCustomValidity(''); setEmail(e.target.value); }}
          />
          <input
            type="password" placeholder="Sua Senha" autoComplete={isLogin ? 'current-password' : 'new-password'} required
            className={styles.input} value={password}
            onChange={e => { e.target.setCustomValidity(''); setPassword(e.target.value); }}
            minLength={6}
          />
          {!isLogin && (
            <input
              type="password" placeholder="Confirme sua Senha" autoComplete="new-password" required
              className={styles.input} value={confirmPassword}
              onChange={e => { e.target.setCustomValidity(''); setConfirmPassword(e.target.value); }}
              minLength={6}
            />
          )}
          {!isSuccess ? (
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? (isLogin ? 'Entrando...' : 'Registrando...') : (isLogin ? 'Entrar' : 'Registrar')}
            </button>
          ) : (
            <Checkmark />
          )}

          {isLogin && (
            <button type="button" className={styles.forgotLink} onClick={handleForgotPassword}>
              Esqueceu sua senha?
            </button>
          )}
        </form>

        <div className={styles.switchContainer}>
          <span className={styles.switchText}>
            {isLogin ? 'Novo por aqui? Deslize para se inscrever!' : 'Já é cadastrado? Faça o login!'}
          </span>
          <input type="checkbox" id="switch" checked={!isLogin} onChange={handleSwitch} />
          <label htmlFor="switch"></label>
        </div>
      </div>
    </div>
  );
}

export default Login;
