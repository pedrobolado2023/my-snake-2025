# Correção do Sistema de Matchmaking

## Problema Identificado

Cada jogador real estava caindo em um servidor separado com 50 bots, em vez de se juntarem no mesmo servidor para jogar juntos.

## Causa

O sistema anterior usava um `roomId` fixo ('global') no cliente, mas não havia lógica de matchmaking no servidor. Isso resultava em:
- Cada conexão potencialmente criando uma nova sala
- Jogadores não sendo distribuídos de forma inteligente
- Salas com apenas 1 jogador real + 49 bots

## Solução Implementada

### 1. Sistema de Matchmaking Inteligente

Criamos a função `findBestAvailableRoom()` que:

```javascript
function findBestAvailableRoom() {
    // 1. Procura salas existentes com espaço disponível
    const availableRooms = Array.from(rooms.values())
        .filter(room => room.players.size < CONFIG.MAX_PLAYERS_PER_ROOM)
        .sort((a, b) => {
            // 2. Prioriza salas com MAIS jogadores reais
            return b.players.size - a.players.size;
        });

    // 3. Retorna a sala mais cheia (para encher primeiro)
    if (availableRooms.length > 0) {
        return availableRooms[0];
    }

    // 4. Só cria nova sala se todas estiverem cheias
    const newRoomId = `room-${Date.now()}`;
    const newRoom = new GameRoom(newRoomId);
    rooms.set(newRoomId, newRoom);
    return newRoom;
}
```

### 2. Comportamento Esperado

**Antes:**
- Jogador 1 entra → Sala A (1 real + 49 bots)
- Jogador 2 entra → Sala B (1 real + 49 bots)
- Jogador 3 entra → Sala C (1 real + 49 bots)

**Depois:**
- Jogador 1 entra → Sala A (1 real + 49 bots)
- Jogador 2 entra → Sala A (2 reais + 48 bots) ✅
- Jogador 3 entra → Sala A (3 reais + 47 bots) ✅
- ...
- Jogador 50 entra → Sala A (50 reais + 0 bots) ✅
- Jogador 51 entra → Sala B (1 real + 49 bots) ✅

### 3. Lógica de Substituição de Bots

Quando um jogador real entra:
```javascript
addPlayer(socketId, playerData) {
    // Adiciona o jogador
    this.players.set(socketId, {...});
    
    // Remove um bot automaticamente
    if (this.bots.size > 0) {
        const botId = this.bots.keys().next().value;
        this.bots.delete(botId);
    }
}
```

Quando um jogador real sai:
```javascript
removePlayer(socketId) {
    // Remove o jogador
    this.players.delete(socketId);
    
    // Adiciona um bot para manter sempre 50 entidades
    const botId = `bot-${Date.now()}`;
    this.bots.set(botId, this.createBot(botId, 'Bot'));
}
```

## Como Testar

### 1. Deploy do Servidor Atualizado

```bash
cd server
git add .
git commit -m "feat: implementa matchmaking inteligente para priorizar jogadores reais"
git push
```

Depois faça o deploy no Easypanel.

### 2. Monitorar Estatísticas

Acesse a rota de estatísticas para ver as salas em tempo real:

```
https://snake-server.q-aura.com.br/stats
```

Você verá algo como:

```json
{
  "totalRooms": 1,
  "rooms": [
    {
      "id": "room-1734634567890",
      "players": 3,
      "bots": 47,
      "total": 50,
      "playerNames": ["João", "Maria", "Pedro"]
    }
  ]
}
```

### 3. Teste com Múltiplas Abas

1. Abra o jogo em 3 abas diferentes do navegador
2. Use nomes diferentes em cada aba
3. Verifique em `/stats` que todos estão na mesma sala
4. No console do navegador, você verá outros jogadores aparecendo

### 4. Verificar Logs do Servidor

No Easypanel, verifique os logs do servidor. Você deve ver:

```
✅ João entrou na sala room-1734634567890 (1 jogadores)
✅ Maria entrou na sala room-1734634567890 (2 jogadores)
✅ Pedro entrou na sala room-1734634567890 (3 jogadores)
```

**Importante:** Todos devem estar na MESMA sala!

## Configurações

O limite de jogadores por sala está em:

```javascript
const CONFIG = {
    MAX_PLAYERS_PER_ROOM: 50,
    // ...
};
```

Você pode ajustar esse valor se quiser salas menores ou maiores.

## Próximos Passos (Opcional)

### Melhorias Futuras

1. **Salas por Região**: Criar salas baseadas em latência/região
2. **Salas Privadas**: Permitir criar salas privadas com código
3. **Balanceamento de Skill**: Agrupar jogadores por nível
4. **Limite de Bots**: Configurar número mínimo/máximo de bots por sala

### Exemplo de Salas Privadas

```javascript
// Cliente
socket.emit('joinRoom', {
    roomId: 'sala-dos-amigos', // Sala específica
    player: playerData
});

// Servidor - adicionar opção de sala customizada
socket.on('joinRoom', (data) => {
    if (data.roomId && data.roomId !== 'auto') {
        // Sala específica
        currentRoom = getOrCreateRoom(data.roomId);
    } else {
        // Matchmaking automático
        currentRoom = findBestAvailableRoom();
    }
    // ...
});
```

## Arquivos Modificados

- ✅ `server/server.js` - Adicionado sistema de matchmaking
  - Nova função `findBestAvailableRoom()`
  - Atualizado handler `joinRoom` para usar matchmaking
  - Melhorada rota `/stats` com mais detalhes
