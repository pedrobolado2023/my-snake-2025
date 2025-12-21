// Classe Food - Representa comida no jogo
class Food {
    constructor(x, y, type = 'normal') {
        this.id = Utils.generateId();
        this.x = x;
        this.y = y;
        this.type = type; // 'normal', 'giant', 'dead_snake'
        this.createdAt = Date.now();

        // Propriedades baseadas no tipo
        this.setupType();

        // Animação
        this.pulsePhase = Utils.random(0, Math.PI * 2);
        this.pulseSpeed = Utils.random(2, 4);
    }

    setupType() {
        // Tipos de comida temática com emojis
        const foodTypes = [
            { emoji: '🥪', name: 'sandwich' },
            { emoji: '🍕', name: 'pizza' },
            { emoji: '🌭', name: 'hotdog' },
            { emoji: '🍔', name: 'burger' },
            { emoji: '🍟', name: 'fries' },
            { emoji: '🍗', name: 'chicken' }
        ];

        switch (this.type) {
            case 'giant':
                this.size = CONFIG.FOOD_GIANT_SIZE;
                this.value = CONFIG.FOOD_GIANT_VALUE;
                this.color = CONFIG.FOOD_GIANT_COLOR;
                this.lifetime = CONFIG.FOOD_DESPAWN_TIME * 2;
                this.emoji = '⭐'; // Estrela gigante
                break;

            case 'dead_snake':
                this.size = CONFIG.FOOD_SIZE * 1.2;
                this.value = CONFIG.FOOD_VALUE * 2;
                this.color = this.snakeColor || Utils.randomColor();
                this.lifetime = CONFIG.FOOD_DESPAWN_TIME * 1.5;
                this.emoji = '💀'; // Caveira
                break;

            default: // normal - comida temática
                // Lógica de valores dinâmicos (1 a 100 pontos)
                const rand = Math.random();
                let points = 1;
                let sizeMult = 1;

                if (rand < 0.01) { // 1% de chance de comida LEENDÁRIA (100 pts)
                    points = 100;
                    sizeMult = 2.5;
                    this.emoji = '💎'; // Diamante
                    this.color = '#00ffff'; // Ciano neon
                } else if (rand < 0.05) { // 4% de chance de comida ÉPICA (50 pts)
                    points = 50;
                    sizeMult = 2.0;
                    this.emoji = '👑'; // Coroa
                    this.color = '#ff00ff'; // Magenta neon
                } else if (rand < 0.15) { // 10% de chance de comida RARA (20 pts)
                    points = 20;
                    sizeMult = 1.5;
                    this.emoji = '🌟'; // Estrela
                    this.color = '#ffff00'; // Amarelo
                } else {
                    // Comida normal (1 a 5 pts)
                    points = Utils.randomInt(1, 5);
                    sizeMult = 1.0;
                    const foodType = Utils.randomChoice(foodTypes);
                    this.emoji = foodType.emoji;
                    this.color = this.generateRandomColor();
                }

                this.size = CONFIG.FOOD_SIZE * sizeMult;
                this.value = points;
                this.lifetime = CONFIG.FOOD_DESPAWN_TIME;
                this.foodName = 'food';
        }

        // Propriedades de atração magnética
        this.attractionRadius = 80; // Raio pequeno para atração
        this.isBeingAttracted = false;
        this.attractionSpeed = 150; // Velocidade de atração
    }

    generateRandomColor() {
        const colors = [
            CONFIG.COLORS.NEON_PINK,
            CONFIG.COLORS.NEON_CYAN,
            CONFIG.COLORS.NEON_PURPLE,
            CONFIG.COLORS.NEON_BLUE,
            CONFIG.COLORS.NEON_GREEN,
            CONFIG.COLORS.NEON_YELLOW,
            CONFIG.COLORS.NEON_ORANGE,
        ];
        return Utils.randomChoice(colors);
    }

    update(deltaTime) {
        // Atualizar animação de pulsação
        this.pulsePhase += this.pulseSpeed * deltaTime / 1000;
    }

    // Método para atrair comida em direção à cobra
    attractTowards(snakeX, snakeY, deltaTime) {
        const dx = snakeX - this.x;
        const dy = snakeY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Verificar se está dentro do raio de atração
        if (distance < this.attractionRadius && distance > 0) {
            this.isBeingAttracted = true;

            // Calcular direção normalizada
            const dirX = dx / distance;
            const dirY = dy / distance;

            // Mover comida em direção à cobra
            const moveSpeed = this.attractionSpeed * (deltaTime / 1000);
            this.x += dirX * moveSpeed;
            this.y += dirY * moveSpeed;
        } else {
            this.isBeingAttracted = false;
        }
    }

    render(ctx, camera) {
        // Converter para coordenadas de tela
        const screenPos = camera.worldToScreen(this.x, this.y);

        // Verificar se está visível
        if (!camera.isVisible(this.x, this.y, this.size)) {
            return;
        }

        // Calcular tamanho com pulsação
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
        const renderSize = this.size * pulse * camera.zoom;

        ctx.save();

        // Desenhar brilho de fundo
        if (this.type === 'giant') {
            ctx.shadowBlur = 20 * camera.zoom; // Reduzido (era 30)
            ctx.shadowColor = this.color;
        } else if (this.isBeingAttracted) {
            ctx.shadowBlur = 10 * camera.zoom; // Reduzido (era 20)
            ctx.shadowColor = '#00ffcc';
        } else {
            ctx.shadowBlur = 6 * camera.zoom; // Reduzido (era 15)
            ctx.shadowColor = this.color;
        }

        // Desenhar círculo de fundo
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, renderSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Desenhar emoji de comida
        if (this.emoji) {
            ctx.font = `${renderSize * 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.emoji, screenPos.x, screenPos.y);
        } else {
            // Fallback para círculo se não houver emoji
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, renderSize, 0, Math.PI * 2);
            ctx.fill();

            // Desenhar borda brilhante
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2 * camera.zoom;
            ctx.stroke();
        }

        // Desenhar indicador de atração
        if (this.isBeingAttracted) {
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 2 * camera.zoom;
            ctx.setLineDash([5 * camera.zoom, 5 * camera.zoom]);
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, renderSize * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }

    drawStar(ctx, x, y, radius, points) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();

        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const r = i % 2 === 0 ? radius : radius * 0.5;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    isExpired() {
        return Date.now() - this.createdAt > this.lifetime;
    }

    collidesWith(x, y, radius) {
        return Utils.circleCollision(this.x, this.y, this.size, x, y, radius);
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Food;
}
