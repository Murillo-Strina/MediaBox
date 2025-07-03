import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import styles from "../styles/Login.module.css";
import Checkmark from "../components/Checkmark/Checkmark.jsx";
import { toast, ToastContainer } from 'react-toastify';
import { toastConfig } from '../utils/toastConfig';
import 'react-toastify/dist/ReactToastify.css';

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
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isLogin && password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: name });
        await setDoc(doc(db, 'Usuarios', user.uid), { nome: name, email });
      }
      setIsSuccess(true);
      setTimeout(() => navigate('/home'), 1000);
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-credential':
          toast.error('E-mail ou senha inválidos.');
          break;
        case 'auth/email-already-in-use':
          toast.error('Este e-mail já está cadastrado.');
          break;
        case 'auth/weak-password':
          toast.error('A senha deve ter pelo menos 6 caracteres.');
          break;
        default:
          toast.error('Ocorreu um erro. Tente novamente.');
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor, digite seu e-mail para redefinir a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Link de redefinição enviado! Verifique sua caixa de entrada.');
    } catch {
      toast.error('Não foi possível enviar o e-mail de redefinição.');
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>{isLogin ? 'Login' : 'Cadastre-se'}</h1>
          <form onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <input
                type="text" placeholder="Seu Nome" autoComplete="name" required
                className={styles.input} value={name}
                onChange={e => setName(e.target.value)}
                minLength={2}
              />
            )}
            <input
              ref={emailRef} type="email" placeholder="Seu Email" autoComplete="email" required
              className={styles.input} value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password" placeholder="Sua Senha" autoComplete={isLogin ? 'current-password' : 'new-password'} required
              className={styles.input} value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
            />
            {!isLogin && (
              <input
                type="password" placeholder="Confirme sua Senha" autoComplete="new-password" required
                className={styles.input} value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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
    </>
  );
}

export default Login;