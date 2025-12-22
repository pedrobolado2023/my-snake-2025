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

    // Renderizar a skin como um ÍCONE DE APP (Quadrado arredondado preenchido)
    renderSkinOnCanvas(canvas, skin) {
        // Aumentar resolução interna para nitidez
        const resolution = 2;
        const width = canvas.clientWidth || 100;
        const height = canvas.clientHeight || 100;

        canvas.width = width * resolution;
        canvas.height = height * resolution;

        const ctx = canvas.getContext('2d');
        ctx.scale(resolution, resolution);

        const cx = width / 2;
        const cy = height / 2;
        const size = width; // Ocupa largura total

        // Criar uma cobra temporária para usar os métodos de desenho de rosto
        const dummySnake = new Snake('preview', 'Preview', 0, 0, skin);

        // Limpar
        ctx.clearRect(0, 0, width, height);

        // 1. DESENHAR FUNDO (Base da skin preenchendo o card)
        // Usar retângulo arredondado que preenche tudo
        ctx.beginPath();
        // Raio de 18px proporcional ao CSS
        const borderRadius = 18;
        if (ctx.roundRect) {
            ctx.roundRect(0, 0, width, height, borderRadius);
        } else {
            ctx.rect(0, 0, width, height); // Fallback
        }
        ctx.clip(); // Cortar tudo que desenhar fora

        // Criar gradiente do fundo
        let gradient;
        const colors = skin.colors;
        const pattern = skin.pattern || 'solid';

        // Adaptar padrões para preencher quadrado
        if (pattern === 'gradient' || pattern === 'solid') {
            gradient = ctx.createLinearGradient(0, 0, width, height);
        } else {
            // Radial para padrões orgânicos fica melhor no centro
            gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, width);
        }

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
            case 'spots':
            case 'panda':
                // Fundo base
                ctx.fillStyle = colors[0];
                ctx.fillRect(0, 0, width, height);
                // Manchas decorativas
                ctx.fillStyle = colors[1];
                ctx.beginPath();
                ctx.arc(0, 0, width * 0.4, 0, Math.PI * 2); // Canto sup esq
                ctx.fill();
                ctx.beginPath();
                ctx.arc(width, height, width * 0.3, 0, Math.PI * 2); // Canto inf dir
                ctx.fill();
                gradient = null; // Já desenhamos
                break;
            case 'stripes':
                // Fundo base
                ctx.fillStyle = colors[0];
                ctx.fillRect(0, 0, width, height);
                // Listras verticais
                ctx.fillStyle = colors.length > 1 ? colors[1] : 'rgba(0,0,0,0.3)';
                for (let i = 0; i < width; i += 20) {
                    ctx.fillRect(i, 0, 5, height);
                }
                gradient = null;
                break;
            default:
                // Cores padrão
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(1, colors.length > 1 ? colors[1] : Utils.adjustColor(colors[0], -20));
        }

        if (gradient) {
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Adicionar brilho superior (efeito gloss sutil)
        const shine = ctx.createLinearGradient(0, 0, 0, height / 2);
        shine.addColorStop(0, 'rgba(255,255,255,0.2)');
        shine.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = shine;
        ctx.fillRect(0, 0, width, height / 2);

        // 2. DESENHAR ROSTO (Centralizado e Grande)
        ctx.save();
        ctx.translate(cx, cy);

        // Configuração de Rosto
        const faceConfig = skin.face || { type: 'standard', eyeColor: '#ffffff' };

        // Escala do rosto para caber bem no card (0.5 do tamanho do card aprox)
        const faceSize = width * 0.55;

        // Sombra do rosto para destacar do fundo
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        switch (faceConfig.type) {
            case 'cute': dummySnake.drawCuteFace(ctx, faceSize, faceConfig.eyeColor); break;
            case 'angry': dummySnake.drawAngryFace(ctx, faceSize, faceConfig.eyeColor); break;
            case 'happy': dummySnake.drawHappyFace(ctx, faceSize, faceConfig.eyeColor); break;
            case 'cyclops': dummySnake.drawCyclopsFace(ctx, faceSize, faceConfig.eyeColor); break;
            case 'cat': dummySnake.drawCatFace(ctx, faceSize, faceConfig.eyeColor); break;
            case 'panda': dummySnake.drawPandaFace(ctx, faceSize, faceConfig.eyeColor); break;
            case 'cool': dummySnake.drawCoolFace(ctx, faceSize); break;
            case 'alien': dummySnake.drawAlienFace(ctx, faceSize, faceConfig.eyeColor); break;
            case 'lion': dummySnake.drawLionHead(ctx, faceSize); break;
            case 'cow': dummySnake.drawCowHead(ctx, faceSize); break;
            case 'fox': dummySnake.drawFoxHead(ctx, faceSize); break;
            case 'rabbit': dummySnake.drawRabbitHead(ctx, faceSize); break;
            case 'bear': dummySnake.drawBearHead(ctx, faceSize); break;
            default: dummySnake.drawStandardFace(ctx, faceSize, faceConfig.eyeColor); break;
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
