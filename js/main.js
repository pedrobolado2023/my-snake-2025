// Arquivo principal - Inicialização do jogo
let game = null;
let selectedSkinId = CONFIG.SKINS[0].id;
let multiplayerManager = null; // Gerenciador de multiplayer

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
    setupEventListeners();

    // Mostrar controles mobile se for dispositivo touch
    if (Utils.isTouchDevice()) {
        document.getElementById('mobile-controls').style.display = 'block';
    }
});

function initializeMenu() {
    // Gerar skins no menu
    const skinGrid = document.getElementById('skin-grid');

    CONFIG.SKINS.forEach((skin, index) => {
        const skinOption = document.createElement('div');
        skinOption.className = 'skin-option';
        skinOption.dataset.skinId = skin.id;

        // Criar gradiente para a skin
        if (skin.colors.length === 1) {
            skinOption.style.background = skin.colors[0];
        } else {
            const gradient = `linear-gradient(135deg, ${skin.colors.join(', ')})`;
            skinOption.style.background = gradient;
        }

        // Selecionar primeira skin por padrão
        if (index === 0) {
            skinOption.classList.add('selected');
        }

        skinOption.addEventListener('click', () => selectSkin(skin.id));
        skinGrid.appendChild(skinOption);
    });

    // Atualizar contador de jogadores online (simulado)
    updateOnlineCount();
    setInterval(updateOnlineCount, 5000);
}

function selectSkin(skinId) {
    selectedSkinId = skinId;

    // Atualizar visual
    document.querySelectorAll('.skin-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.skinId === skinId) {
            option.classList.add('selected');
        }
    });
}

function updateOnlineCount() {
    // Simular jogadores online (em uma versão multiplayer real, isso viria do servidor)
    const count = Utils.randomInt(150, 500);
    document.getElementById('players-online').textContent = count;
}

function setupEventListeners() {
    // Botão Play
    document.getElementById('play-button').addEventListener('click', startGame);

    // Botão Play Again
    document.getElementById('play-again-button').addEventListener('click', startGame);

    // Botão Menu
    document.getElementById('menu-button').addEventListener('click', () => {
        if (game) {
            game.stop();
        }
        showScreen('menu');
    });

    // Enter no campo de nome
    document.getElementById('player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGame();
        }
    });
}

function startGame() {
    const playerName = document.getElementById('player-name').value.trim() || 'Player';

    // Criar ou reiniciar o jogo
    if (!game) {
        game = new Game();

        // Inicializar multiplayer (se disponível)
        if (typeof MultiplayerManager !== 'undefined') {
            multiplayerManager = new MultiplayerManager(game);
            const connected = multiplayerManager.connect();

            if (connected) {
                console.log('🌐 Modo multiplayer ativado!');
            } else {
                console.log('🎮 Modo single-player (multiplayer não disponível)');
            }
        } else {
            console.log('🎮 Modo single-player');
        }
    }

    // Inicializar jogo
    game.init(playerName, selectedSkinId);

    // Mostrar tela de jogo
    showScreen('game');

    // Iniciar loop do jogo
    game.start();
}

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(`${screenName}-screen`).classList.add('active');
}

// Prevenir zoom no mobile
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

// Prevenir scroll no mobile quando tocando no canvas
document.addEventListener('touchmove', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
}, { passive: false });

// Log de inicialização
console.log('%c🐍 My Snake 2025', 'font-size: 24px; color: #00ffcc; font-weight: bold;');
console.log('%cJogo carregado com sucesso!', 'font-size: 14px; color: #9d4edd;');
console.log('%cControles:', 'font-size: 12px; color: #00b4d8; font-weight: bold;');
console.log('  • Mouse/Touch: Direcionar cobra');
console.log('  • Espaço/Clique: Boost');
