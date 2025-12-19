// Servidor Multiplayer - My Snake 2025
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configurar CORS
app.use(cors());
app.use(express.json());

// Configurar Socket.io com CORS
const io = socketIO(server, {
    cors: {
        origin: "*", // Em produção, especifique seu domínio
        methods: ["GET", "POST"]
    }
});

// Configurações do jogo
const CONFIG = {
    MAX_PLAYERS_PER_ROOM: 50,
    ARENA_SIZE: 5000,
    BOT_UPDATE_INTERVAL: 100, // ms
    SYNC_INTERVAL: 50, // ms - Sincronizar a cada 50ms
};

// Armazenamento de salas
const rooms = new Map();

// Classe para gerenciar uma sala
class GameRoom {
    constructor(id) {
        this.id = id;
        this.players = new Map();
        this.bots = new Map();
        this.food = [];
        this.lastUpdate = Date.now();

        // Criar bots iniciais
        this.initializeBots();

        // Iniciar loop de atualização dos bots
        this.startBotLoop();
    }

    initializeBots() {
        const botNames = [
            'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Lucas Ferreira',
            'Juliana Lima', 'Rafael Souza', 'Camila Rodrigues', 'Bruno Alves', 'Fernanda Martins',
            'Gabriel Pereira', 'Beatriz Carvalho', 'Matheus Ribeiro', 'Larissa Gomes', 'Felipe Barbosa',
            'Amanda Dias', 'Thiago Rocha', 'Isabela Cardoso', 'Vinicius Araújo', 'Carolina Mendes',
        ];

        // Criar bots para preencher a sala
        for (let i = 0; i < CONFIG.MAX_PLAYERS_PER_ROOM; i++) {
            const botId = `bot-${i}`;
            this.bots.set(botId, this.createBot(botId, botNames[i % botNames.length]));
        }

        console.log(`✅ Sala ${this.id}: ${this.bots.size} bots criados`);
    }

    createBot(id, name) {
        return {
            id: id,
            name: name,
            x: Math.random() * CONFIG.ARENA_SIZE - CONFIG.ARENA_SIZE / 2,
            y: Math.random() * CONFIG.ARENA_SIZE - CONFIG.ARENA_SIZE / 2,
            angle: Math.random() * Math.PI * 2,
            length: 10 + Math.floor(Math.random() * 20),
            score: 0,
            isBot: true
        };
    }

    addPlayer(socketId, playerData) {
        // Adicionar jogador
        this.players.set(socketId, {
            id: socketId,
            name: playerData.name,
            x: playerData.x || 0,
            y: playerData.y || 0,
            angle: playerData.angle || 0,
            length: playerData.length || 10,
            score: 0,
            isBot: false
        });

        // Remover um bot se houver
        if (this.bots.size > 0) {
            const botId = this.bots.keys().next().value;
            this.bots.delete(botId);
            console.log(`🎮 Jogador ${playerData.name} entrou. Bot ${botId} removido.`);
        }

        console.log(`📊 Sala ${this.id}: ${this.players.size} jogadores + ${this.bots.size} bots = ${this.getTotalEntities()}`);
    }

    removePlayer(socketId) {
        const player = this.players.get(socketId);
        if (!player) return;

        this.players.delete(socketId);

        // Adicionar um bot para substituir
        const botId = `bot-${Date.now()}`;
        this.bots.set(botId, this.createBot(botId, 'Bot'));

        console.log(`👋 Jogador ${player.name} saiu. Bot ${botId} adicionado.`);
        console.log(`📊 Sala ${this.id}: ${this.players.size} jogadores + ${this.bots.size} bots = ${this.getTotalEntities()}`);
    }

    updatePlayer(socketId, data) {
        const player = this.players.get(socketId);
        if (!player) return;

        player.x = data.x;
        player.y = data.y;
        player.angle = data.angle;
        player.length = data.length || player.length;
        player.score = data.score || player.score;
    }

    startBotLoop() {
        setInterval(() => {
            this.updateBots();
        }, CONFIG.BOT_UPDATE_INTERVAL);
    }

    updateBots() {
        // Atualizar posição dos bots (IA simples)
        this.bots.forEach(bot => {
            // Movimento aleatório
            bot.angle += (Math.random() - 0.5) * 0.1;
            bot.x += Math.cos(bot.angle) * 2;
            bot.y += Math.sin(bot.angle) * 2;

            // Manter dentro da arena
            const maxPos = CONFIG.ARENA_SIZE / 2;
            bot.x = Math.max(-maxPos, Math.min(maxPos, bot.x));
            bot.y = Math.max(-maxPos, Math.min(maxPos, bot.y));
        });
    }

    getGameState() {
        return {
            players: Array.from(this.players.values()),
            bots: Array.from(this.bots.values()),
            food: this.food
        };
    }

    getTotalEntities() {
        return this.players.size + this.bots.size;
    }
}

// Encontrar a melhor sala disponível (matchmaking)
function findBestAvailableRoom() {
    // Procurar salas existentes com espaço disponível
    const availableRooms = Array.from(rooms.values())
        .filter(room => room.players.size < CONFIG.MAX_PLAYERS_PER_ROOM)
        .sort((a, b) => {
            // Priorizar salas com mais jogadores reais (para encher primeiro)
            return b.players.size - a.players.size;
        });

    // Se encontrou uma sala disponível, retornar ela
    if (availableRooms.length > 0) {
        return availableRooms[0];
    }

    // Se não há salas disponíveis, criar uma nova
    const newRoomId = `room-${Date.now()}`;
    const newRoom = new GameRoom(newRoomId);
    rooms.set(newRoomId, newRoom);
    console.log(`🆕 Nova sala criada: ${newRoomId}`);
    return newRoom;
}

// Obter ou criar sala (mantido para compatibilidade, mas não usado no matchmaking)
function getOrCreateRoom(roomId) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new GameRoom(roomId));
    }
    return rooms.get(roomId);
}

// Socket.io - Gerenciar conexões
io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    let currentRoom = null;
    let currentRoomId = null;

    // Entrar em uma sala
    socket.on('joinRoom', (data) => {
        const playerData = data.player || {};

        // MATCHMAKING: Encontrar a melhor sala disponível
        currentRoom = findBestAvailableRoom();
        currentRoomId = currentRoom.id;

        // Adicionar jogador à sala
        currentRoom.addPlayer(socket.id, playerData);

        // Entrar no room do Socket.io
        socket.join(currentRoomId);

        // Enviar estado inicial
        socket.emit('gameState', currentRoom.getGameState());

        // Notificar outros jogadores
        socket.to(currentRoomId).emit('playerJoined', {
            id: socket.id,
            name: playerData.name
        });

        console.log(`✅ ${playerData.name} entrou na sala ${currentRoomId} (${currentRoom.players.size} jogadores)`);
    });

    // Atualizar posição do jogador
    socket.on('updatePosition', (data) => {
        if (!currentRoom) return;

        currentRoom.updatePlayer(socket.id, data);

        // Transmitir para outros jogadores na mesma sala
        socket.to(currentRoomId).emit('playerMoved', {
            id: socket.id,
            x: data.x,
            y: data.y,
            angle: data.angle,
            length: data.length,
            score: data.score
        });
    });

    // Jogador morreu
    socket.on('playerDied', (data) => {
        if (!currentRoom) return;

        socket.to(currentRoomId).emit('playerDied', {
            id: socket.id,
            x: data.x,
            y: data.y
        });
    });

    // Desconectar
    socket.on('disconnect', () => {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);

        if (currentRoom) {
            currentRoom.removePlayer(socket.id);

            // Notificar outros jogadores
            socket.to(currentRoomId).emit('playerLeft', {
                id: socket.id
            });
        }
    });
});

// Sincronização periódica do estado do jogo
setInterval(() => {
    rooms.forEach((room, roomId) => {
        if (room.players.size > 0) {
            io.to(roomId).emit('gameState', room.getGameState());
        }
    });
}, CONFIG.SYNC_INTERVAL);

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        rooms: rooms.size,
        totalPlayers: Array.from(rooms.values()).reduce((sum, room) => sum + room.players.size, 0),
        totalBots: Array.from(rooms.values()).reduce((sum, room) => sum + room.bots.size, 0),
        uptime: process.uptime()
    });
});

// Rota de estatísticas
app.get('/stats', (req, res) => {
    const stats = {
        totalRooms: rooms.size,
        rooms: Array.from(rooms.entries()).map(([id, room]) => ({
            id: id,
            players: room.players.size,
            bots: room.bots.size,
            total: room.getTotalEntities(),
            playerNames: Array.from(room.players.values()).map(p => p.name)
        }))
    };
    res.json(stats);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📈 Stats: http://localhost:${PORT}/stats`);
});
