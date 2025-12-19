# 🎮 My Snake 2025 - Servidor Multiplayer

Servidor Node.js + Socket.io para o jogo My Snake 2025.

## ✨ Funcionalidades

- ✅ **Multiplayer em tempo real** via WebSocket
- ✅ **Sistema de salas** (até 50 jogadores por sala)
- ✅ **Matchmaking inteligente** (prioriza encher salas com jogadores reais)
- ✅ **Bots automáticos** (preenchem vagas vazias)
- ✅ **Sincronização** a cada 50ms
- ✅ **Sistema de entrada/saída** (jogador entra → remove bot, jogador sai → adiciona bot)
- ✅ **Health check** e estatísticas

## 🚀 Como Usar

### **Desenvolvimento Local:**

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Ou com auto-reload
npm run dev
```

Servidor rodará em: `http://localhost:3000`

### **Deploy no Easypanel:**

Veja o guia completo: [DEPLOY_EASYPANEL.md](DEPLOY_EASYPANEL.md)

## 📡 Endpoints

### **Health Check:**
```
GET /health
```

Resposta:
```json
{
  "status": "ok",
  "rooms": 1,
  "totalPlayers": 5,
  "totalBots": 45,
  "uptime": 3600
}
```

### **Estatísticas:**
```
GET /stats
```

Resposta:
```json
{
  "totalRooms": 1,
  "rooms": [
    {
      "id": "room-1734634567890",
      "players": 5,
      "bots": 45,
      "total": 50,
      "playerNames": ["João", "Maria", "Pedro", "Ana", "Lucas"]
    }
  ]
}
```

## 🔌 Eventos Socket.io

### **Cliente → Servidor:**

| Evento | Dados | Descrição |
|--------|-------|-----------|
| `joinRoom` | `{ roomId, player }` | Entrar em uma sala |
| `updatePosition` | `{ x, y, angle, length, score }` | Atualizar posição |
| `playerDied` | `{ x, y }` | Notificar morte |

### **Servidor → Cliente:**

| Evento | Dados | Descrição |
|--------|-------|-----------|
| `gameState` | `{ players, bots, food }` | Estado completo do jogo |
| `playerMoved` | `{ id, x, y, angle, length, score }` | Jogador se moveu |
| `playerJoined` | `{ id, name }` | Jogador entrou |
| `playerLeft` | `{ id }` | Jogador saiu |
| `playerDied` | `{ id, x, y }` | Jogador morreu |

## 🎯 Sistema de Matchmaking

O servidor implementa um **matchmaking inteligente** que prioriza encher salas existentes com jogadores reais antes de criar novas salas.

### **Como Funciona:**

1. **Jogador conecta** → Servidor procura salas com espaço disponível
2. **Prioriza salas mais cheias** → Ordena por número de jogadores reais (maior para menor)
3. **Entra na sala mais cheia** → Maximiza interação entre jogadores reais
4. **Remove um bot** → Mantém sempre 50 entidades por sala
5. **Cria nova sala** → Apenas quando todas as salas estiverem com 50 jogadores

### **Exemplo:**

```
Jogador 1 → Sala A (1 real + 49 bots)
Jogador 2 → Sala A (2 reais + 48 bots) ✅ Mesma sala!
Jogador 3 → Sala A (3 reais + 47 bots) ✅ Mesma sala!
...
Jogador 50 → Sala A (50 reais + 0 bots) ✅ Sala cheia!
Jogador 51 → Sala B (1 real + 49 bots) ✅ Nova sala criada
```

### **Benefícios:**

- ✅ Jogadores reais jogam juntos
- ✅ Melhor experiência multiplayer
- ✅ Uso eficiente de recursos do servidor
- ✅ Transição suave de bots para jogadores reais

## ⚙️ Configuração

Edite as constantes em `server.js`:

```javascript
const CONFIG = {
    MAX_PLAYERS_PER_ROOM: 50,  // Máximo de entidades por sala
    ARENA_SIZE: 5000,          // Tamanho da arena
    BOT_UPDATE_INTERVAL: 100,  // Atualização dos bots (ms)
    SYNC_INTERVAL: 50,         // Sincronização (ms)
};
```

## 🐳 Docker

### **Build:**
```bash
docker build -t my-snake-server .
```

### **Run:**
```bash
docker run -p 3000:3000 my-snake-server
```

## 📊 Monitoramento

### **Logs:**
```bash
# Ver logs em tempo real
docker logs -f <container_id>
```

### **Métricas:**
- Acesse `/health` para status
- Acesse `/stats` para estatísticas detalhadas

## 🔒 Segurança

### **Produção:**

1. Configure CORS adequadamente:
```javascript
cors: {
    origin: "https://seu-dominio.com",
    methods: ["GET", "POST"]
}
```

2. Use variáveis de ambiente:
```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://seu-dominio.com
```

3. Implemente rate limiting
4. Valide dados do cliente
5. Use HTTPS

## 🧪 Testes

### **Testar conexão:**
```bash
curl http://localhost:3000/health
```

### **Testar com Socket.io:**
```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Conectado!');
    
    socket.emit('joinRoom', {
        roomId: 'test',
        player: { name: 'Test Player', x: 0, y: 0 }
    });
});
```

## 📝 Licença

MIT

## 🤝 Contribuindo

Pull requests são bem-vindos!

---

**Desenvolvido com ❤️ para My Snake 2025**
