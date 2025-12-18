# 🎮 My Snake 2025 - Guia de Teste Multiplayer

## ✅ **STATUS DO PROJETO**

### **Servidor Multiplayer:**
- ✅ **Deployado**: https://snake-server-q-aura.com.br
- ✅ **Status**: Funcionando (uptime: 65s+)
- ✅ **Health Check**: https://snake-server-q-aura.com.br/health
- ✅ **Stats**: https://snake-server-q-aura.com.br/stats

### **Cliente (Jogo):**
- ✅ **Código**: Atualizado no GitHub
- ✅ **URL do Servidor**: Configurada
- ⚠️ **Pendente**: Adicionar Socket.io ao HTML

---

## 🔧 **ÚLTIMA ETAPA - ADICIONAR SOCKET.IO**

### **Edite o arquivo `index.html`:**

Procure a linha que contém:
```html
<!-- Firebase SDK -->
```

**ADICIONE ANTES** dela:
```html
<!-- Socket.io Client (para multiplayer) -->
<script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>

```

Depois procure a linha:
```html
<!-- Scripts do Jogo -->
```

**ADICIONE ANTES** dela:
```html
<!-- Multiplayer Manager -->
<script src="js/MultiplayerManager.js"></script>

```

### **Exemplo de como deve ficar:**

```html
    </div>

    <!-- Socket.io Client (para multiplayer) -->
    <script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>

    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.15.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore-compat.js"></script>
    
    <!-- Firebase Config e Auth System -->
    <script src="js/firebase-config.js"></script>
    <script src="js/AuthSystem.js"></script>
    
    <!-- Multiplayer Manager -->
    <script src="js/MultiplayerManager.js"></script>
    
    <!-- Scripts do Jogo -->
    <script src="js/config.js"></script>
    <!-- ... resto dos scripts ... -->
```

### **Fazer commit e push:**

```bash
git add index.html
git commit -m "Adicionar Socket.io para multiplayer"
git push
```

---

## 🧪 **COMO TESTAR**

### **1. Testar Servidor (Health Check)**

Acesse no navegador:
```
https://snake-server-q-aura.com.br/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "rooms": 0,
  "totalPlayers": 0,
  "totalBots": 0,
  "uptime": 123.45
}
```

---

### **2. Testar Jogo Localmente**

1. Abra `index.html` no navegador
2. Abra o **Console do Navegador** (F12)
3. Procure por mensagens:
   ```
   🔌 Conectando ao servidor multiplayer...
   ✅ Conectado ao servidor!
   🎮 Entrando na sala: global
   ```

4. Se aparecer erro:
   ```
   ❌ Socket.io não carregado!
   ```
   Significa que você precisa adicionar o Socket.io ao HTML (passo acima)

---

### **3. Testar Multiplayer com 2 Jogadores**

#### **Opção A: 2 Abas do Navegador**
1. Abra o jogo em 2 abas diferentes
2. Jogue em ambas
3. Você deve ver os outros jogadores se movendo

#### **Opção B: 2 Dispositivos**
1. Abra o jogo no PC
2. Abra o jogo no celular
3. Ambos devem se conectar ao mesmo servidor

---

### **4. Verificar Logs do Servidor**

No **Easypanel**:
1. Vá em **Projects** → **dados** → **game-server**
2. Clique em **Logs**
3. Você deve ver:
   ```
   🔌 Cliente conectado: abc123
   ✅ Jogador entrou na sala global
   🎮 Jogador Player entrou. Bot bot-0 removido.
   📊 Sala global: 1 jogadores + 49 bots = 50
   ```

---

## 📊 **VERIFICAR ESTATÍSTICAS**

Acesse:
```
https://snake-server-q-aura.com.br/stats
```

**Resposta:**
```json
{
  "rooms": [
    {
      "id": "global",
      "players": 2,
      "bots": 48,
      "total": 50
    }
  ]
}
```

---

## 🎯 **COMO FUNCIONA O SISTEMA DE BOTS**

### **Cenário 1: Nenhum Jogador**
```
Sala: 0 jogadores + 50 bots = 50 entidades
```

### **Cenário 2: 1 Jogador Entra**
```
Jogador 1 entra → Remove 1 bot
Sala: 1 jogador + 49 bots = 50 entidades
```

### **Cenário 3: 5 Jogadores**
```
5 jogadores entram → Remove 5 bots
Sala: 5 jogadores + 45 bots = 50 entidades
```

### **Cenário 4: Jogador Sai**
```
Jogador 1 sai → Adiciona 1 bot
Sala: 4 jogadores + 46 bots = 50 entidades
```

**Sempre mantém 50 entidades na arena!**

---

## 🐛 **TROUBLESHOOTING**

### **Problema: "Socket.io is not defined"**
**Solução:** Adicione o script do Socket.io ao HTML

### **Problema: "Failed to connect"**
**Solução:** Verifique se o servidor está rodando (health check)

### **Problema: "CORS error"**
**Solução:** Servidor já está configurado com CORS `*`

### **Problema: Não vejo outros jogadores**
**Solução:** 
1. Verifique console do navegador
2. Verifique logs do servidor no Easypanel
3. Confirme que Socket.io está carregado

---

## 📈 **PRÓXIMAS MELHORIAS**

### **Curto Prazo:**
- [ ] Adicionar indicador visual de conexão
- [ ] Mostrar número de jogadores online
- [ ] Adicionar chat (opcional)

### **Médio Prazo:**
- [ ] Otimizar sincronização
- [ ] Adicionar interpolação de movimento
- [ ] Sistema de salas privadas

### **Longo Prazo:**
- [ ] Ranking global persistente
- [ ] Torneios
- [ ] Power-ups multiplayer

---

## 🎉 **CHECKLIST FINAL**

- [x] Servidor criado e deployado
- [x] Health check funcionando
- [x] URL configurada no cliente
- [x] MultiplayerManager criado
- [ ] Socket.io adicionado ao HTML
- [ ] Teste com 2+ jogadores
- [ ] Verificar logs do servidor

---

## 📚 **DOCUMENTAÇÃO**

- **Servidor**: `server/README.md`
- **Deploy**: `server/DEPLOY_EASYPANEL.md`
- **Multiplayer**: `MULTIPLAYER_GUIA.md`
- **Firebase**: `FIREBASE_SETUP.md`

---

**Servidor está funcionando perfeitamente! Agora é só adicionar o Socket.io ao HTML e testar! 🚀**
