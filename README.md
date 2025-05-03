# 🎬 MediaBox

**MediaBox** é uma aplicação **full-stack** para você registrar, avaliar e organizar seus filmes e animes favoritos em um acervo pessoal.

👉 [https://Murillo-Strina.github.io/MediaBox/](https://Murillo-Strina.github.io/MediaBox/)

---

## 📋 Sumário

1. [Visão Geral](#visão-geral)  
2. [Funcionalidades](#funcionalidades)  
3. [Tecnologias](#tecnologias)  
4. [Como Usar](#como-usar)  

---

## Visão Geral

MediaBox permite que cada usuário:
- Cadastre filmes e animes com nome, capa, gênero e avaliação.  
- Liste, edite e exclua itens do próprio acervo.  
- Faça login/cadastro seguro e tenha um perfil personalizado.  

Tudo isso de forma **responsiva**, **performática** e com **persistência em Firebase**.

---

## Funcionalidades

- 🎥 **Cadastro de Mídias**  
  - Nome, imagem de capa, gênero e nota.
- 📜 **Listagem Dinâmica**  
  - Exibição em grid ou lista; filtros por gênero e avaliação.
- ⭐ **Avaliação e Comentários**  
  - Sistema de estrelas + campo livre para anotações.
- 🔒 **Autenticação**  
  - Login, cadastro e recuperação de senha via Firebase Auth.
- ☁️ **Banco de Dados em Nuvem**  
  - Cloud Firestore isolando os dados de cada usuário.
- ⚙️ **Perfil do Usuário**  
  - Edição de informações e logout seguro.
- 📱 **Interface Responsiva**  
  - Compatível com desktop, tablet e mobile.

---

## Tecnologias

### Front-end

- **React** (Hooks, React Router v6)  
- **CSS Modules** e **Styled Components**  
- **Axios** para chamadas HTTP

### Back-end / Persistência

- **Firebase Authentication**  
- **Cloud Firestore**  

### Ferramentas de Build & Deploy

- **npm**  
- **GitHub Pages** (frontend)

---

## Como Usar

1. Acesse o **site** no GitHub Pages:  
   [https://Murillo-Strina.github.io/MediaBox/](https://Murillo-Strina.github.io/MediaBox/)

2. Na tela inicial, clique em **“Cadastre-se”** para criar sua conta.  
3. Faça login com seu e-mail e senha.  
4. Na dashboard:
- Use **“+”** para adicionar um filme ou anime (nome, capa, gênero, avaliação).  
- Clique em um item para editar nota, comentário ou remover.  
- Utilize filtros e busca para encontrar rapidamente o que quiser.  
5. Para redefinir sua senha, clique em **“Esqueceu sua senha?”** e siga as instruções por e-mail.  
