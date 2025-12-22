// Sistema de Seleção de Skins
class SkinSelectionManager {
    constructor() {
        this.selectedSkinId = CONFIG.SKINS[0].id;
        this.currentCategory = 'ALL';
        this.unlockedSkins = this.loadUnlockedSkins();
        this.playerStats = this.loadPlayerStats();
    }

    // Carregar skins desbloqueadas do localStorage
    loadUnlockedSkins() {
        // TODAS AS SKINS DESBLOQUEADAS POR PADRÃO
        return CONFIG.SKINS.map(skin => skin.id);

        /* Código original comentado - sistema de desbloqueio por conquistas
        const saved = localStorage.getItem('unlockedSkins');
        if (saved) {
            return JSON.parse(saved);
        }
        // Por padrão, todas as skins básicas estão desbloqueadas
        return CONFIG.SKINS
            .filter(skin => skin.unlocked)
            .map(skin => skin.id);
        */
    }

    // Salvar skins desbloqueadas
    saveUnlockedSkins() {
        localStorage.setItem('unlockedSkins', JSON.stringify(this.unlockedSkins));
    }

    // Carregar estatísticas do jogador
    loadPlayerStats() {
        const saved = localStorage.getItem('playerStats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            highScore: 0,
            totalKills: 0,
            daysPlayed: 0,
            lastPlayDate: null
        };
    }

    // Salvar estatísticas do jogador
    savePlayerStats() {
        localStorage.setItem('playerStats', JSON.stringify(this.playerStats));
    }

    // Verificar se uma skin está desbloqueada
    isSkinUnlocked(skinId) {
        return this.unlockedSkins.includes(skinId);
    }

    // Desbloquear skin
    unlockSkin(skinId) {
        if (!this.isSkinUnlocked(skinId)) {
            this.unlockedSkins.push(skinId);
            this.saveUnlockedSkins();
            return true;
        }
        return false;
    }

    // Verificar e desbloquear skins baseado nas estatísticas
    checkAndUnlockSkins() {
        CONFIG.SKINS.forEach(skin => {
            if (!this.isSkinUnlocked(skin.id) && !skin.unlocked) {
                // Verificar requisitos baseados em pontuação
                if (skin.requirement && skin.requirement.includes('pontos')) {
                    const requiredScore = parseInt(skin.requirement.match(/\d+/)[0]);
                    if (this.playerStats.highScore >= requiredScore) {
                        this.unlockSkin(skin.id);
                        this.showUnlockNotification(skin);
                    }
                }
                // Verificar requisitos baseados em kills
                else if (skin.requirement && skin.requirement.includes('Mate')) {
                    const requiredKills = parseInt(skin.requirement.match(/\d+/)[0]);
                    if (this.playerStats.totalKills >= requiredKills) {
                        this.unlockSkin(skin.id);
                        this.showUnlockNotification(skin);
                    }
                }
            }
        });
    }

    // Mostrar notificação de desbloqueio
    showUnlockNotification(skin) {
        console.log(`🎉 Nova skin desbloqueada: ${skin.name}!`);
        // Aqui você pode adicionar uma notificação visual mais elaborada
    }

    // Inicializar a tela de seleção
    initialize() {
        this.renderSkins();
        this.updateCategoryCounts();
        this.setupEventListeners();
        this.selectSkin(this.selectedSkinId || CONFIG.SKINS[0].id);
    }

    // Renderizar skins no grid
    renderSkins(category = 'ALL') {
        const grid = document.getElementById('skins-display-grid');
        grid.innerHTML = '';

        const filteredSkins = category === 'ALL'
            ? CONFIG.SKINS
            : CONFIG.SKINS.filter(skin => skin.category === category);

        filteredSkins.forEach(skin => {
            const skinCard = this.createSkinCard(skin);
            grid.appendChild(skinCard);
        });
    }

    // Criar card de skin
    createSkinCard(skin) {
        const card = document.createElement('div');
        card.className = 'skin-card';
        card.dataset.skinId = skin.id;

        const isUnlocked = this.isSkinUnlocked(skin.id);

        if (!isUnlocked) {
            card.classList.add('locked');
        }

        if (skin.id === this.selectedSkinId) {
            card.classList.add('selected');
        }

        // Preview da skin (Agora usando Canvas para desenhar detalhes)
        const previewContainer = document.createElement('div');
        previewContainer.className = 'skin-card-preview';

        const canvas = document.createElement('canvas');
        canvas.width = 100; // Resolução interna
        canvas.height = 100;
        canvas.className = 'skin-preview-canvas';

        // Renderizar a skin no canvas
        this.renderSkinOnCanvas(canvas, skin);

        previewContainer.appendChild(canvas);

        // Nome da skin
        const name = document.createElement('div');
        name.className = 'skin-card-name';
        name.textContent = skin.name;

        card.appendChild(previewContainer);
        card.appendChild(name);

        // Event listener
        if (isUnlocked) {
            card.addEventListener('click', () => this.selectSkin(skin.id));
        } else {
            card.addEventListener('click', () => this.showLockInfo(skin));
        }

        return card;
    }

    // Renderizar a skin com detalhes no canvas do menu
    renderSkinOnCanvas(canvas, skin) {
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const size = 35; // Tamanho da cabeça no card

        // Criar uma cobra temporária para usar os métodos de desenho
        // (Não adicionamos ao jogo, é apenas para acessar a lógica de renderização)
        const dummySnake = new Snake('preview', 'Preview', 0, 0, skin);

        ctx.save();
        ctx.translate(cx, cy);

        // Rotacionar para ficar apontando para cima/diagonal para melhor visualização
        ctx.rotate(-Math.PI / 4);

        // 1. Desenhar a base da cabeça (Círculo com padrão)
        // Replicando lógica de createSegmentGradient mas simplificada para o preview (index 0)
        let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        const colors = skin.colors;
        const pattern = skin.pattern || 'solid';

        // Lógica de padrões (Copiada e adaptada de Snake.js para preview estático)
        switch (pattern) {
            case 'solid':
            case 'gradient':
                if (colors.length > 1) {
                    gradient.addColorStop(0, colors[0]);
                    gradient.addColorStop(1, colors[1]);
                } else {
                    gradient.addColorStop(0, colors[0]);
                    gradient.addColorStop(1, colors[0]);
                }
                break;
            case 'spots': // Vaca
            case 'panda':
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(1, colors[0]);
                break;
            case 'stripes':
            case 'scales':
            case 'rainbow':
            case 'fire':
            case 'ice':
            case 'toxic':
            case 'galaxy':
            case 'neon':
            case 'lava':
            case 'electric':
            case 'shadow':
            case 'cosmic':
            case 'rainbow_premium':
            case 'metallic':
            case 'diamond':
            case 'camo':
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(1, colors.length > 1 ? colors[1] : colors[0]);
                break;
            default:
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(1, colors[1] || colors[0]);
        }

        ctx.fillStyle = gradient;

        // Sombra suave para dar profundidade
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // Limpar sombra para os detalhes

        // 2. Desenhar detalhes específicos (Orelhas, etc) ANTES do rosto se necessário
        // Alguns métodos desenham coisas fora da cabeça, então chamamos eles.
        // O método renderHead do Snake espera um contexto transladado mas desenha RELATIVO a posição da tela.
        // Aqui já transladamos o contexto para o centro (0,0 locais).
        // Nossos métodos drawXFace desenham em (0,0) ou offsets relativos ao size.

        const faceConfig = skin.face || { type: 'standard', eyeColor: '#ffffff' };

        // Wrapper para chamar os métodos da dummySnake com o contexto atual
        // Precisamos garantir que 'this' dentro dos métodos seja a dummySnake

        switch (faceConfig.type) {
            case 'cute':
                dummySnake.drawCuteFace(ctx, size, faceConfig.eyeColor);
                break;
            case 'angry':
                dummySnake.drawAngryFace(ctx, size, faceConfig.eyeColor);
                break;
            case 'happy':
                dummySnake.drawHappyFace(ctx, size, faceConfig.eyeColor);
                break;
            case 'cyclops':
                dummySnake.drawCyclopsFace(ctx, size, faceConfig.eyeColor);
                break;
            case 'cat':
                dummySnake.drawCatFace(ctx, size, faceConfig.eyeColor);
                break;
            case 'panda':
                dummySnake.drawPandaFace(ctx, size, faceConfig.eyeColor);
                break;
            case 'cool':
                dummySnake.drawCoolFace(ctx, size);
                break;
            case 'alien':
                dummySnake.drawAlienFace(ctx, size, faceConfig.eyeColor);
                break;
            case 'lion':
                dummySnake.drawLionHead(ctx, size);
                break;
            case 'cow':
                dummySnake.drawCowHead(ctx, size);
                break;
            case 'fox':
                dummySnake.drawFoxHead(ctx, size);
                break;
            case 'rabbit':
                dummySnake.drawRabbitHead(ctx, size);
                break;
            case 'bear':
                dummySnake.drawBearHead(ctx, size);
                break;
            default: // standard
                dummySnake.drawStandardFace(ctx, size, faceConfig.eyeColor);
                break;
        }

        ctx.restore();
    }

    // Selecionar skin
    selectSkin(skinId) {
        this.selectedSkinId = skinId;

        // Atualizar visual
        document.querySelectorAll('.skin-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.skinId === skinId) {
                card.classList.add('selected');
            }
        });

        // Atualizar painel de informações
        this.updateInfoPanel(skinId);
    }

    // Atualizar painel de informações
    updateInfoPanel(skinId) {
        const skin = CONFIG.SKINS.find(s => s.id === skinId);
        if (!skin) return;

        document.getElementById('selected-skin-name').textContent = skin.name;

        const isUnlocked = this.isSkinUnlocked(skinId);
        const descElement = document.getElementById('selected-skin-description');
        const progressElement = document.getElementById('skin-progress');
        const selectButton = document.getElementById('select-skin-button');

        if (isUnlocked) {
            descElement.textContent = `Categoria: ${CONFIG.SKIN_CATEGORIES[skin.category]}`;
            progressElement.style.display = 'none';
            selectButton.disabled = false;
            selectButton.style.opacity = '1';
        } else {
            descElement.textContent = skin.requirement || 'Skin bloqueada';
            progressElement.style.display = 'block';
            selectButton.disabled = true;
            selectButton.style.opacity = '0.5';

            // Mostrar progresso se aplicável
            this.updateProgress(skin);
        }
    }

    // Atualizar barra de progresso
    updateProgress(skin) {
        if (!skin.requirement) return;

        let current = 0;
        let required = 0;

        if (skin.requirement.includes('pontos')) {
            required = parseInt(skin.requirement.match(/\d+/)[0]);
            current = this.playerStats.highScore;
        } else if (skin.requirement.includes('Mate')) {
            required = parseInt(skin.requirement.match(/\d+/)[0]);
            current = this.playerStats.totalKills;
        }

        const percentage = Math.min((current / required) * 100, 100);
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `${current}/${required}`;
    }

    // Mostrar informações de bloqueio
    showLockInfo(skin) {
        this.updateInfoPanel(skin.id);
    }

    // Atualizar contadores de categorias
    updateCategoryCounts() {
        const counts = {
            ALL: 0,
            BASICO: 0,
            ANIMAIS: 0,
            ESPECIAIS: 0,
            PREMIUM: 0
        };

        CONFIG.SKINS.forEach(skin => {
            if (this.isSkinUnlocked(skin.id)) {
                counts.ALL++;
                counts[skin.category]++;
            }
        });

        document.getElementById('count-all').textContent = `${counts.ALL}/${CONFIG.SKINS.length}`;
        document.getElementById('count-basico').textContent = counts.BASICO;
        document.getElementById('count-animais').textContent = counts.ANIMAIS;
        document.getElementById('count-especiais').textContent = counts.ESPECIAIS;
        document.getElementById('count-premium').textContent = counts.PREMIUM;
    }

    // Configurar event listeners
    setupEventListeners() {
        // Filtros de categoria
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Botão de seleção
        document.getElementById('select-skin-button').addEventListener('click', () => {
            if (this.isSkinUnlocked(this.selectedSkinId)) {
                this.confirmSelection();
            }
        });

        // Botão voltar
        document.getElementById('back-to-menu').addEventListener('click', () => {
            showScreen('menu');
        });
    }

    // Filtrar por categoria
    filterByCategory(category) {
        this.currentCategory = category;

        // Atualizar botões
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        // Renderizar skins filtradas
        this.renderSkins(category);
    }

    // Confirmar seleção
    confirmSelection() {
        localStorage.setItem('selectedSkin', this.selectedSkinId);
        showScreen('game');
        startGame();
    }

    // Atualizar estatísticas após o jogo
    updateStatsAfterGame(score, kills) {
        if (score > this.playerStats.highScore) {
            this.playerStats.highScore = score;
        }
        this.playerStats.totalKills += kills;

        // Atualizar dias jogados
        const today = new Date().toDateString();
        if (this.playerStats.lastPlayDate !== today) {
            this.playerStats.daysPlayed++;
            this.playerStats.lastPlayDate = today;
        }

        this.savePlayerStats();
        this.checkAndUnlockSkins();
    }
}

// Instância global do gerenciador de skins
let skinSelectionManager = null;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    skinSelectionManager = new SkinSelectionManager();
});
