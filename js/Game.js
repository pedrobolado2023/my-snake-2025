// Classe principal do jogo
class Game {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('game-canvas');
        this.minimapCanvas = document.getElementById('minimap-canvas');

        // Sistemas
        this.camera = new Camera(this.canvas);
        this.renderer = new Renderer(this.canvas, this.minimapCanvas);
        this.inputManager = new InputManager(this.canvas, this.camera);
        this.collisionSystem = new CollisionSystem();

        // Entidades
        this.player = null;
        this.snakes = [];
        this.food = [];
        this.particles = [];

        // Estado do jogo
        this.isRunning = false;
        this.isPaused = false;
        this.gameStartTime = 0;
        this.lastGiantFoodSpawn = 0;
        this.lastBoostTrailSpawn = 0;

        // Performance
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;

        // Configuração do jogador
        this.playerName = 'Player';
        this.playerSkin = CONFIG.SKINS[0];
    }

    init(playerName, skinId) {
        this.playerName = playerName || 'Player';
        this.playerSkin = CONFIG.SKINS.find(s => s.id === skinId) || CONFIG.SKINS[0];

        // Resetar estado
        this.snakes = [];
        this.food = [];
        this.particles = [];
        this.gameStartTime = Date.now();
        this.lastGiantFoodSpawn = Date.now();
        this.lastBoostTrailSpawn = Date.now();

        // Criar jogador
        const spawnPos = Utils.randomPositionInArena();
        this.player = new Snake(
            'player',
            this.playerName,
            spawnPos.x,
            spawnPos.y,
            this.playerSkin
        );
        this.player.isPlayer = true;
        this.snakes.push(this.player);

        // Detectar mobile e aplicar otimizações
        const isMobile = Utils.isTouchDevice();
        const botsCount = isMobile && CONFIG.MOBILE_OPTIMIZATIONS.REDUCE_BOTS
            ? CONFIG.MOBILE_OPTIMIZATIONS.BOTS_COUNT
            : 5;
        const foodCount = isMobile && CONFIG.MOBILE_OPTIMIZATIONS.REDUCE_FOOD
            ? CONFIG.MOBILE_OPTIMIZATIONS.FOOD_MIN_COUNT
            : CONFIG.FOOD_MIN_COUNT;

        // Criar cobras IA (bots)
        this.spawnBots(botsCount);

        // Gerar comida inicial
        this.spawnFood(foodCount);

        // Configurar câmera
        this.camera.x = this.player.x;
        this.camera.y = this.player.y;
        this.camera.targetX = this.player.x;
        this.camera.targetY = this.player.y;

        // Resetar input
        this.inputManager.reset();

        // Atualizar UI
        this.updateHUD();
    }

    spawnBots(count) {
        const botNames = [
            'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Lucas Ferreira',
            'Juliana Lima', 'Rafael Souza', 'Camila Rodrigues', 'Bruno Alves', 'Fernanda Martins',
            'Gabriel Pereira', 'Beatriz Carvalho', 'Matheus Ribeiro', 'Larissa Gomes', 'Felipe Barbosa',
            'Amanda Dias', 'Thiago Rocha', 'Isabela Cardoso', 'Vinicius Araújo', 'Carolina Mendes',
            'Gustavo Correia', 'Letícia Monteiro', 'Rodrigo Castro', 'Mariana Freitas', 'Daniel Pinto',
            'Natália Moura', 'Leonardo Teixeira', 'Bianca Nunes', 'Henrique Barros', 'Sophia Ramos',
            'André Vieira', 'Gabriela Cunha', 'Marcelo Duarte', 'Aline Campos', 'Paulo Moreira',
            'Renata Azevedo', 'Diego Farias', 'Vanessa Lopes', 'Ricardo Melo', 'Patrícia Nogueira',
            'Fábio Rezende', 'Tatiane Macedo', 'Caio Santana', 'Priscila Batista', 'Leandro Pires',
            'Jéssica Viana', 'Marcio Guimarães', 'Adriana Fonseca', 'Alex Nascimento', 'Cristina Borges'
        ];

        for (let i = 0; i < count; i++) {
            const spawnPos = Utils.randomPositionInArena();
            const name = Utils.randomChoice(botNames);
            const skin = Utils.randomChoice(CONFIG.SKINS);

            const bot = new Snake(
                Utils.generateId(),
                name,
                spawnPos.x,
                spawnPos.y,
                skin
            );

            // Dar tamanho aleatório aos bots
            bot.grow(Utils.randomInt(0, 30));

            this.snakes.push(bot);
        }
    }

    spawnFood(count) {
        for (let i = 0; i < count; i++) {
            const pos = Utils.randomPositionInArena();
            this.food.push(new Food(pos.x, pos.y, 'normal'));
        }
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
    }

    pause() {
        this.isPaused = !this.isPaused;
    }

    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning) return;

        // Calcular delta time
        const deltaTime = Math.min(currentTime - this.lastFrameTime, CONFIG.MAX_DELTA_TIME);
        this.lastFrameTime = currentTime;

        // Atualizar FPS
        this.updateFPS(currentTime);

        if (!this.isPaused) {
            // Atualizar jogo
            this.update(deltaTime);
        }

        // Renderizar
        this.render();

        // Próximo frame
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Atualizar input do jogador
        if (this.player && !this.player.isDead) {
            const targetAngle = this.inputManager.getTargetAngle(this.player.x, this.player.y);
            this.player.setTargetAngle(targetAngle);
            this.player.boost(this.inputManager.isBoostActive());
        }

        // Atualizar IA dos bots
        this.updateBots(deltaTime);

        // Atualizar todas as cobras
        this.snakes.forEach(snake => snake.update(deltaTime));

        // Verificar colisões
        this.checkCollisions();

        // Atualizar comida
        this.updateFood(deltaTime);

        // Atualizar partículas
        this.updateParticles(deltaTime);

        // Gerar comida
        this.manageFood();

        // Gerar rastro de boost
        this.manageBoostTrail();

        // Atualizar câmera
        if (this.player && !this.player.isDead) {
            this.camera.follow(this.player);
        }
        this.camera.update();

        // Atualizar HUD
        this.updateHUD();

        // Verificar game over
        if (this.player && this.player.isDead) {
            this.handleGameOver();
        }
    }

    updateBots(deltaTime) {
        this.snakes.forEach(snake => {
            if (snake.isPlayer || snake.isDead) return;

            // IA simples: mover em direção à comida mais próxima
            const nearestFood = this.findNearestFood(snake.x, snake.y);

            if (nearestFood) {
                const angle = Utils.angle(snake.x, snake.y, nearestFood.x, nearestFood.y);
                snake.setTargetAngle(angle);
            }

            // Boost aleatório
            if (Math.random() < 0.01 && snake.length > CONFIG.SNAKE_MIN_LENGTH_TO_BOOST) {
                snake.boost(true);
            } else if (Math.random() < 0.05) {
                snake.boost(false);
            }
        });
    }

    findNearestFood(x, y) {
        let nearest = null;
        let minDistance = Infinity;

        this.food.forEach(food => {
            const distance = Utils.distance(x, y, food.x, food.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = food;
            }
        });

        return nearest;
    }

    checkCollisions() {
        // Construir spatial grid
        this.collisionSystem.buildSpatialGrid(this.snakes);

        // Verificar colisões de cada cobra
        this.snakes.forEach(snake => {
            if (snake.isDead) return;

            // Colisão com outras cobras e bordas
            const collision = this.collisionSystem.checkSnakeCollisions(snake, this.snakes);
            if (collision) {
                this.handleSnakeDeath(snake, collision.snake);
                return;
            }

            // Colisão com comida
            const collectedFood = this.collisionSystem.checkFoodCollisions(snake, this.food);
            collectedFood.forEach(food => {
                snake.grow(food.value);
                this.createParticles(food.x, food.y, food.color, 'eat', CONFIG.PARTICLE_COUNT_ON_EAT);

                // Incrementar kills se for comida de cobra morta
                if (food.type === 'dead_snake' && snake.isPlayer) {
                    // (kills são incrementados quando a cobra morre)
                }
            });
        });
    }

    handleSnakeDeath(snake, killer) {
        snake.die();

        // Criar comida do corpo
        const deathFood = snake.getDeathFood();
        this.food.push(...deathFood);

        // Criar partículas
        this.createParticles(
            snake.x,
            snake.y,
            snake.skin.colors[0],
            'death',
            CONFIG.PARTICLE_COUNT_ON_DEATH
        );

        // Incrementar kills do assassino
        if (killer && killer.isPlayer) {
            killer.kills++;
        }

        // Se for o jogador, game over
        if (snake.isPlayer) {
            // Game over será tratado no próximo update
        } else {
            // Remover bot e spawnar um novo
            setTimeout(() => {
                this.snakes = this.snakes.filter(s => s.id !== snake.id);
                this.spawnBots(1);
            }, 100);
        }
    }

    updateFood(deltaTime) {
        this.food.forEach(food => food.update(deltaTime));

        // Remover comida expirada
        this.food = this.food.filter(food => !food.isExpired());
    }

    updateParticles(deltaTime) {
        this.particles.forEach(particle => particle.update(deltaTime));

        // Remover partículas mortas
        this.particles = this.particles.filter(particle => !particle.isDead());
    }

    manageFood() {
        // Manter quantidade mínima de comida
        const foodNeeded = CONFIG.FOOD_MIN_COUNT - this.food.length;
        if (foodNeeded > 0) {
            this.spawnFood(Math.min(foodNeeded, CONFIG.FOOD_SPAWN_RATE));
        }

        // Spawnar comida gigante periodicamente
        const now = Date.now();
        if (now - this.lastGiantFoodSpawn > CONFIG.FOOD_GIANT_SPAWN_INTERVAL) {
            const pos = Utils.randomPositionInArena();
            this.food.push(new Food(pos.x, pos.y, 'giant'));
            this.lastGiantFoodSpawn = now;
        }
    }

    manageBoostTrail() {
        const now = Date.now();
        if (now - this.lastBoostTrailSpawn < 100) return;

        this.snakes.forEach(snake => {
            if (snake.isDead || !snake.isBoosting) return;

            const trailFood = snake.getBoostTrail();
            if (trailFood) {
                this.food.push(trailFood);

                // Partículas de boost desabilitadas para melhor performance
                // this.createParticles(
                //     trailFood.x,
                //     trailFood.y,
                //     snake.skin.colors[0],
                //     'boost',
                //     2
                // );
            }
        });

        this.lastBoostTrailSpawn = now;
    }

    createParticles(x, y, color, type, count) {
        // Reduzir partículas no mobile
        const isMobile = Utils.isTouchDevice();
        let particleCount = count;

        if (isMobile && CONFIG.MOBILE_OPTIMIZATIONS.REDUCE_PARTICLES) {
            if (type === 'death') {
                particleCount = CONFIG.MOBILE_OPTIMIZATIONS.PARTICLE_COUNT_ON_DEATH;
            } else if (type === 'eat') {
                particleCount = CONFIG.MOBILE_OPTIMIZATIONS.PARTICLE_COUNT_ON_EAT;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(x, y, color, type));
        }
    }

    render() {
        // Renderizar background
        this.renderer.renderBackground(this.camera);

        // Renderizar comida
        this.renderer.renderFood(this.food, this.camera);

        // Renderizar cobras
        this.renderer.renderSnakes(this.snakes, this.camera);

        // Renderizar partículas
        this.renderer.renderParticles(this.particles, this.camera);

        // Renderizar minimapa
        const otherSnakes = this.snakes.filter(s => s.id !== this.player?.id);
        this.renderer.renderMinimap(this.player, otherSnakes, this.camera);

        // Debug info (opcional)
        // this.renderer.renderDebugInfo(this.fps, this.snakes.length + this.food.length);
    }

    updateHUD() {
        if (!this.player) return;

        // Nome do jogador
        document.getElementById('hud-player-name').textContent = this.player.name;

        // Estatísticas
        document.getElementById('hud-length').textContent = Math.floor(this.player.length);
        document.getElementById('hud-score').textContent = Utils.formatNumber(this.player.score);
        document.getElementById('hud-kills').textContent = this.player.kills;

        // Boost
        const boostSegments = Math.floor(this.player.length);
        const boostPercent = (boostSegments / CONFIG.SNAKE_MIN_LENGTH_TO_BOOST) * 100;
        document.getElementById('boost-segments').textContent = boostSegments;

        const boostBar = document.getElementById('boost-bar');
        boostBar.style.width = Math.min(100, boostPercent) + '%';

        // Mudar cor baseado no nível
        boostBar.classList.remove('low', 'critical');
        if (boostSegments < CONFIG.SNAKE_MIN_LENGTH_TO_BOOST) {
            boostBar.classList.add('critical');
        } else if (boostSegments < CONFIG.SNAKE_MIN_LENGTH_TO_BOOST * 1.5) {
            boostBar.classList.add('low');
        }

        // Leaderboard
        this.updateLeaderboard();
    }

    updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');

        // Ordenar cobras por pontuação
        const sortedSnakes = [...this.snakes]
            .filter(s => !s.isDead)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        // Limpar e reconstruir
        leaderboardList.innerHTML = '';

        sortedSnakes.forEach((snake, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            if (snake.isPlayer) {
                item.classList.add('current-player');
            }

            const rank = document.createElement('div');
            rank.className = 'leaderboard-rank';
            if (index === 0) rank.classList.add('top-1');
            else if (index === 1) rank.classList.add('top-2');
            else if (index === 2) rank.classList.add('top-3');
            rank.textContent = `#${index + 1}`;

            const name = document.createElement('div');
            name.className = 'leaderboard-name';
            name.textContent = snake.name;

            const score = document.createElement('div');
            score.className = 'leaderboard-score';
            score.textContent = Utils.formatNumber(snake.score);

            item.appendChild(rank);
            item.appendChild(name);
            item.appendChild(score);
            leaderboardList.appendChild(item);
        });
    }

    handleGameOver() {
        this.stop();

        // Calcular estatísticas finais
        const gameTime = Date.now() - this.gameStartTime;
        const finalPosition = this.snakes
            .filter(s => !s.isDead)
            .sort((a, b) => b.score - a.score)
            .findIndex(s => s.id === this.player.id) + 1;

        // Salvar estatísticas no Firebase (se estiver logado)
        if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated) {
            authSystem.saveGameStats(
                this.player.score,
                Math.floor(this.player.length),
                this.player.kills,
                gameTime
            ).then(() => {
                console.log('📊 Estatísticas salvas no Firebase!');
            }).catch(error => {
                console.error('❌ Erro ao salvar estatísticas:', error);
            });
        }

        // Atualizar tela de game over
        document.getElementById('final-score').textContent = Utils.formatNumber(this.player.score);
        document.getElementById('final-position').textContent = `#${finalPosition}`;
        document.getElementById('final-length').textContent = Math.floor(this.player.length);
        document.getElementById('final-kills').textContent = this.player.kills;
        document.getElementById('final-time').textContent = Utils.formatTime(gameTime);

        // Mostrar tela de game over
        setTimeout(() => {
            this.showScreen('gameover');
        }, 1000);
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}-screen`).classList.add('active');
    }

    updateFPS(currentTime) {
        this.frameCount++;

        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
