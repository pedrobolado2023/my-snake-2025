# 🔥 Guia de Configuração do Firebase

## 📋 Passo a Passo para Configurar

### 1️⃣ Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Nome do projeto: **"My Snake 2025"** (ou o nome que preferir)
4. Aceite os termos e clique em **"Continuar"**
5. **Google Analytics**: Pode desabilitar (não é necessário para começar)
6. Clique em **"Criar projeto"**
7. Aguarde a criação (leva ~30 segundos)

---

### 2️⃣ Adicionar App Web ao Projeto

1. No painel do Firebase, clique no ícone **"</>"** (Web)
2. Apelido do app: **"My Snake 2025 Web"**
3. **NÃO** marque "Firebase Hosting" (por enquanto)
4. Clique em **"Registrar app"**
5. **COPIE** o código de configuração que aparece (você vai precisar!)

Vai aparecer algo assim:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "my-snake-2025.firebaseapp.com",
  projectId: "my-snake-2025",
  storageBucket: "my-snake-2025.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

6. Clique em **"Continuar no console"**

---

### 3️⃣ Ativar Autenticação com Google

1. No menu lateral, clique em **"Authentication"** (🔐)
2. Clique em **"Começar"** ou **"Get started"**
3. Na aba **"Sign-in method"**, clique em **"Google"**
4. **Ative** o toggle (deixe azul)
5. **Email de suporte do projeto**: Use seu email do Google
6. Clique em **"Salvar"**

---

### 4️⃣ Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"** ou **"Create database"**
3. **Modo**: Selecione **"Começar no modo de teste"** (test mode)
   - Isso permite leitura/escrita por 30 dias
   - Vamos configurar regras de segurança depois
4. **Localização**: Escolha **"southamerica-east1 (São Paulo)"** para melhor latência
5. Clique em **"Ativar"**
6. Aguarde a criação do banco de dados

---

### 5️⃣ Configurar Regras de Segurança do Firestore

1. Ainda no **Firestore Database**, clique na aba **"Regras"** (Rules)
2. Substitua o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura do ranking para todos
    match /leaderboard/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == document;
    }
    
    // Permitir leitura/escrita de dados do usuário apenas para o próprio usuário
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permitir leitura de estatísticas globais para todos
    match /stats/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Clique em **"Publicar"**

---

### 6️⃣ Copiar Configuração para o Jogo

1. Volte para **"Configurações do projeto"** (⚙️ no menu lateral)
2. Role até **"Seus apps"**
3. Você verá o código de configuração do Firebase
4. **COPIE** todo o objeto `firebaseConfig`

---

### 7️⃣ Adicionar Configuração ao Jogo

1. Abra o arquivo: `js/firebase-config.js`
2. Cole suas credenciais do Firebase no lugar indicado
3. Salve o arquivo

**IMPORTANTE:** 
- ⚠️ **NÃO compartilhe** suas credenciais publicamente
- ⚠️ Se for colocar no GitHub, adicione `firebase-config.js` ao `.gitignore`

---

## ✅ Verificação

Após configurar tudo, você deve ter:

- ✅ Projeto criado no Firebase
- ✅ App Web registrado
- ✅ Autenticação com Google ativada
- ✅ Firestore Database criado
- ✅ Regras de segurança configuradas
- ✅ Credenciais copiadas para `firebase-config.js`

---

## 🎮 Testando

1. Abra o jogo no navegador
2. Clique em **"Entrar com Google"**
3. Escolha sua conta Google
4. Autorize o acesso
5. Pronto! Você está logado! 🎉

---

## 📊 Visualizando Dados

### Ver usuários autenticados:
1. Firebase Console → **Authentication** → Aba **"Users"**

### Ver dados salvos:
1. Firebase Console → **Firestore Database** → Aba **"Data"**

### Ver ranking:
1. Firestore Database → Coleção **"leaderboard"**

---

## 🔒 Segurança (Importante!)

### Depois dos 30 dias de teste:

Atualize as regras do Firestore para:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{document} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == document;
    }
    
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /stats/{document} {
      allow read: if true;
      allow write: if false; // Apenas via Cloud Functions
    }
  }
}
```

---

## 💰 Custos

### Plano Gratuito (Spark):
- ✅ **Authentication**: 10.000 usuários ativos/mês
- ✅ **Firestore**: 1 GB armazenamento, 50.000 leituras/dia, 20.000 escritas/dia
- ✅ **Hosting**: 10 GB armazenamento, 360 MB/dia de transferência

**Isso é mais que suficiente para começar!**

Se crescer muito, o plano pago (Blaze) cobra apenas pelo uso excedente.

---

## 🆘 Problemas Comuns

### "Firebase: Error (auth/popup-blocked)"
- **Solução**: Permita pop-ups no navegador

### "Firebase: Error (auth/unauthorized-domain)"
- **Solução**: 
  1. Firebase Console → Authentication → Settings
  2. Adicione seu domínio em "Authorized domains"

### "Missing or insufficient permissions"
- **Solução**: Verifique as regras do Firestore

---

## 📚 Documentação Oficial

- Firebase: https://firebase.google.com/docs
- Authentication: https://firebase.google.com/docs/auth
- Firestore: https://firebase.google.com/docs/firestore

---

**Pronto! Agora você tem um sistema completo de autenticação e banco de dados! 🎉**
