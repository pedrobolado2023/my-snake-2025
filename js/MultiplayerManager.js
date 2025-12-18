// Gerenciador de Multiplayer
class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.isConnected = false;
        this.roomId = 'global';
        this.serverUrl = 'https://snake-server.q-aura.com.br'; // URL correta do servidor
        this.remotePlayers = new Map();
        this.updateInterval = null;
    }

    connect() {
        console.log('🔌 Conectando ao servidor multiplayer...');

        // Carregar Socket.io
        if (typeof io === 'undefined') {
            console.error('❌ Socket.io não carregado!');
            return false;
        }

        try {
            this.socket = io(this.serverUrl, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            this.setupSocketListeners();
            return true;
        } catch (error) {
            console.error('❌ Erro ao conectar:', error);
            return false;
        }
    }

    setupSocketListeners() {
        // Conectado
        this.socket.on('connect', () => {
            console.log('✅ Conectado ao servidor!');
            this.isConnected = true;
            this.joinRoom();
        });

        // Desconectado
        this.socket.on('disconnect', () => {
            console.log('🔌 Desconectado do servidor');
            this.isConnected = false;
            this.remotePlayers.clear();
        });

        // Estado do jogo
        this.socket.on('gameState', (state) => {
            this.updateGameState(state);
        });

        // Jogador se moveu
        this.socket.on('playerMoved', (data) => {
            this.updateRemotePlayer(data);
        });

        // Jogador entrou
        this.socket.on('playerJoined', (data) => {
            console.log(`👤 ${data.name} entrou no jogo`);
        });

        // Jogador saiu
        this.socket.on('playerLeft', (data) => {
            console.log(`👋 Jogador ${data.id} saiu`);
            this.remotePlayers.delete(data.id);
        });

        // Jogador morreu
        this.socket.on('playerDied', (data) => {
            console.log(`💀 Jogador ${data.id} morreu`);
        });

        // Erro
        this.socket.on('error', (error) => {
            console.error('❌ Erro no socket:', error);
        });
    }

    joinRoom() {
        if (!this.socket || !this.isConnected) {
            console.log('⚠️ Socket não conectado, aguardando...');
            return;
        }

        const playerData = {
            name: this.game.playerName || 'Player',
            x: this.game.player ? this.game.player.x : 0,
            y: this.game.player ? this.game.player.y : 0,
            angle: this.game.player ? this.game.player.angle : 0,
            length: this.game.player ? this.game.player.length : 10
        };

        this.socket.emit('joinRoom', {
            roomId: this.roomId,
            player: playerData
        });

        console.log(`🎮 Entrando na sala: ${this.roomId} como ${playerData.name}`);

        // Iniciar envio de posição
        this.startPositionUpdates();
    }

    startPositionUpdates() {
        // OTIMIZAÇÃO ⚡: Reduzir frequência no mobile
        const updateRate = Utils.isTouchDevice() ? 200 : 100; // 200ms mobile, 100ms desktop

        this.updateInterval = setInterval(() => {
            if (this.isConnected && this.game.player && !this.game.player.isDead) {
                this.sendPosition();
            }
        }, updateRate);
    }

    sendPosition() {
        if (!this.socket || !this.isConnected) return;

        this.socket.emit('updatePosition', {
            x: this.game.player.x,
            y: this.game.player.y,
            angle: this.game.player.angle,
            length: this.game.player.length,
            score: this.game.player.score
        });
    }

    updateGameState(state) {
        // OTIMIZAÇÃO ⚡: Limitar atualizações no mobile
        if (Utils.isTouchDevice() && Math.random() > 0.3) {
            return; // Atualizar apenas 30% das vezes no mobile
        }

        // Atualizar jogadores remotos (limitado)
        const maxPlayers = Utils.isTouchDevice() ? 5 : 20;
        const playersToUpdate = state.players.slice(0, maxPlayers);

        playersToUpdate.forEach(player => {
            if (player.id !== this.socket.id) {
                this.remotePlayers.set(player.id, player);
            }
        });

        // Atualizar bots (com otimização)
        if (this.game && state.bots) {
            this.game.updateServerBots(state.bots);
        }

        // Limpar jogadores antigos (evitar vazamento de memória)
        if (this.remotePlayers.size > maxPlayers) {
            const toDelete = Array.from(this.remotePlayers.keys()).slice(maxPlayers);
            toDelete.forEach(id => this.remotePlayers.delete(id));
        }
    }

    updateRemotePlayer(data) {
        this.remotePlayers.set(data.id, data);
    }

    getRemotePlayers() {
        return Array.from(this.remotePlayers.values());
    }

    disconnect() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        if (this.socket) {
            this.socket.disconnect();
        }

        this.isConnected = false;
        this.remotePlayers.clear();
        console.log('👋 Desconectado do servidor multiplayer');
    }

    notifyDeath(x, y) {
        if (!this.socket || !this.isConnected) return;

        this.socket.emit('playerDied', { x, y });
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiplayerManager;
}
