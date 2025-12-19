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
    // Atualizar contador de jogadores online (simulado)
    updateOnlineCount();
    setInterval(updateOnlineCount, 5000);
}

function updateOnlineCount() {
    // Simular jogadores online (em uma versão multiplayer real, isso viria do servidor)
    const count = Utils.randomInt(150, 500);
    document.getElementById('players-online').textContent = count;
}

function setupEventListeners() {
    // Botão Play - Vai para seleção de skins
    document.getElementById('play-button').addEventListener('click', () => {
        showScreen('skin-selection');
        if (skinSelectionManager) {
            skinSelectionManager.initialize();
        }
    });

    // Botão Play Again - Reinicia o jogo com a skin atual
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
            showScreen('skin-selection');
            if (skinSelectionManager) {
                skinSelectionManager.initialize();
            }
        }
    });
}

function startGame() {
    const playerName = document.getElementById('player-name').value.trim() || 'Player';

    // Obter skin selecionada
    const savedSkin = localStorage.getItem('selectedSkin');
    selectedSkinId = savedSkin || CONFIG.SKINS[0].id;

    // Criar ou reiniciar o jogo
    if (!game) {
        game = new Game();

        // ❌ MULTIPLAYER DESABILITADO (causando erros e lag)
        // Será reativado após correções no servidor
        /*
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
        */
        console.log('🎮 Modo single-player (multiplayer desabilitado)');
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
