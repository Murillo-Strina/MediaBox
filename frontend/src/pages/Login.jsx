import React, { useState } from 'react';
import styles from "../styles/Login.module.css";

function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitch = () => {
    setIsLogin(!isLogin);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLogin) {
      const formData = new FormData(e.target);
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');

      if (password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
      }
    }
    alert(isLogin ? 'Logando...' : 'Cadastrando...');
  };

  return (
    <div className={styles.container}>
      <div className={styles.switchContainer}>
        <input 
          type="checkbox" 
          id="switch" 
          checked={!isLogin} 
          onChange={handleSwitch} 
        />
        <label htmlFor="switch"></label>
      </div>

      <div className={styles.card}>
        <h1>{isLogin ? 'Login' : 'Cadastre-se'}</h1>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Seu Nome"
              required
              className={styles.input}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Seu Email"
            required
            className={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Sua Senha"
            required
            className={styles.input}
          />
          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirme sua Senha"
              required
              className={styles.input}
            />
          )}
          <button
            type="submit"
            className={styles.submitButton}
          >
            {isLogin ? 'Entrar' : 'Registrar'}
          </button>
        </form>
        {isLogin && (
          <a href="#" className={styles.forgotLink}>
            Esqueceu sua senha?
          </a>
        )}
      </div>
    </div>
  );
}

export default Login;
