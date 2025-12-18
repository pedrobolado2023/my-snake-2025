# 🚀 Deploy no Easypanel - Guia Completo

## 📋 **PRÉ-REQUISITOS**

- ✅ VPS com Easypanel instalado
- ✅ Acesso ao painel do Easypanel
- ✅ Código do servidor na pasta `server/`

---

## 🔧 **PASSO A PASSO**

### **1. Preparar Repositório Git**

```bash
# Na pasta do projeto
cd "c:\Users\pedro.pereira\OneDrive\Documentos\Jogo da cobrinha"

# Inicializar Git (se ainda não tiver)
git init

# Adicionar arquivos
git add server/
git commit -m "Adicionar servidor multiplayer"

# Criar repositório no GitHub
# (Faça isso manualmente no GitHub)

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/my-snake-2025.git

# Push
git push -u origin main
```

---

### **2. Configurar no Easypanel**

#### **A. Criar Novo Projeto**

1. Acesse seu Easypanel
2. Clique em **"New Project"** ou **"Novo Projeto"**
3. Nome: **my-snake-2025-server**
4. Clique em **"Create"**

#### **B. Adicionar Serviço**

1. Dentro do projeto, clique em **"Add Service"**
2. Escolha **"App"** (não Database)
3. Nome do serviço: **game-server**

#### **C. Configurar Source**

1. **Source Type**: GitHub
2. **Repository**: Selecione seu repositório
3. **Branch**: main
4. **Build Path**: `/server` ⚠️ **IMPORTANTE!**

#### **D. Configurar Build**

1. **Build Method**: Dockerfile
2. **Dockerfile Path**: `/server/Dockerfile`
3. **Port**: 3000

#### **E. Configurar Domínio**

1. Clique em **"Domains"**
2. Adicione um domínio ou use o subdomínio do Easypanel
3. Exemplo: `snake-server.seu-dominio.com`
4. Ou: `snake-server.easypanel.host`

#### **F. Deploy**

1. Clique em **"Deploy"**
2. Aguarde o build (~2-3 minutos)
3. Verifique os logs

---

### **3. Verificar se Funcionou**

#### **Health Check:**
```
https://seu-dominio.com/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "rooms": 1,
  "totalPlayers": 0,
  "totalBots": 50,
  "uptime": 123.45
}
```

#### **Stats:**
```
https://seu-dominio.com/stats
```

---

### **4. Configurar Cliente (Jogo)**

Edite o arquivo `js/MultiplayerManager.js`:

```javascript
// LINHA 8 - Altere para seu domínio
this.serverUrl = 'https://snake-server.seu-dominio.com';
```

---

### **5. Adicionar Socket.io ao HTML**

Edite `index.html`, adicione ANTES dos outros scripts:

```html
<!-- Socket.io Client -->
<script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>

<!-- Multiplayer Manager -->
<script src="js/MultiplayerManager.js"></script>
```

---

### **6. Ativar Multiplayer no Jogo**

Edite `js/main.js`, adicione no início:

```javascript
// Inicializar multiplayer
let multiplayerManager = null;

function startGame() {
    const playerName = document.getElementById('player-name').value.trim() || 'Player';

    // Criar ou reiniciar o jogo
    if (!game) {
        game = new Game();
        
        // Conectar ao multiplayer
        multiplayerManager = new MultiplayerManager(game);
        multiplayerManager.connect();
    }

    // ... resto do código
}
```

---

## 🧪 **TESTAR LOCALMENTE PRIMEIRO**

### **Opção 1: Testar Servidor Localmente**

```bash
# Entrar na pasta do servidor
cd server

# Instalar dependências
npm install

# Iniciar servidor
npm start
```

Servidor rodará em: `http://localhost:3000`

### **Opção 2: Testar com Docker**

```bash
# Build da imagem
docker build -t my-snake-server ./server

# Rodar container
docker run -p 3000:3000 my-snake-server
```

---

## 🔒 **CONFIGURAÇÕES DE SEGURANÇA**

### **Variáveis de Ambiente (Easypanel)**

No Easypanel, adicione:

```
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://seu-jogo.com
```

### **Atualizar CORS no servidor**

Edite `server/server.js`:

```javascript
const io = socketIO(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
    }
});
```

---

## 📊 **MONITORAMENTO**

### **Logs no Easypanel:**
1. Acesse o serviço
2. Clique em **"Logs"**
3. Veja em tempo real

### **Métricas:**
- CPU usage
- Memory usage
- Network traffic

---

## 🔄 **ATUALIZAR SERVIDOR**

### **Método 1: Git Push (Automático)**

```bash
# Fazer mudanças no código
git add .
git commit -m "Atualizar servidor"
git push

# Easypanel faz deploy automático!
```

### **Método 2: Manual**

1. Easypanel → Seu projeto
2. Clique em **"Redeploy"**

---

## 🆘 **PROBLEMAS COMUNS**

### **Erro: "Cannot find module"**
**Solução:** Verifique se `package.json` está na pasta `/server`

### **Erro: "Port already in use"**
**Solução:** Mude a porta no Easypanel ou no código

### **Erro: "CORS blocked"**
**Solução:** Configure CORS_ORIGIN corretamente

### **Servidor não inicia**
**Solução:** Verifique logs no Easypanel

---

## ✅ **CHECKLIST FINAL**

- [ ] Servidor criado em `/server`
- [ ] Dockerfile configurado
- [ ] Código no GitHub
- [ ] Projeto criado no Easypanel
- [ ] Build Path: `/server`
- [ ] Domínio configurado
- [ ] Deploy realizado
- [ ] Health check funcionando
- [ ] Cliente configurado com URL do servidor
- [ ] Socket.io adicionado ao HTML
- [ ] Multiplayer ativado no jogo
- [ ] Testado com 2+ jogadores

---

## 🎉 **PRONTO!**

Agora você tem:
- ✅ Servidor multiplayer rodando
- ✅ Bots automáticos
- ✅ Sistema de salas
- ✅ Sincronização em tempo real
- ✅ Deploy automatizado

**Próximo passo:** Testar com amigos! 🎮

---

## 📞 **SUPORTE**

Se tiver problemas:
1. Verifique os logs no Easypanel
2. Teste o health check
3. Verifique o console do navegador
4. Confirme que Socket.io está carregado

---

**Boa sorte com o deploy! 🚀**
