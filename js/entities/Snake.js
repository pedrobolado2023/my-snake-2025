// Classe Snake - Representa a cobra do jogador
class Snake {
    constructor(id, name, x, y, skin) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.skin = skin || CONFIG.SKINS[0];

        // Movimento
        this.angle = Utils.random(0, Math.PI * 2);
        this.targetAngle = this.angle;
        this.speed = CONFIG.SNAKE_BASE_SPEED;
        this.isBoosting = false;

        // Segmentos
        this.segments = [];
        this.length = CONFIG.SNAKE_INITIAL_LENGTH;
        this.targetLength = this.length;
        this.initializeSegments();

        // Estatísticas
        this.score = 0;
        this.kills = 0;
        this.foodEaten = 0;

        // Estado
        this.isDead = false;
        this.isPlayer = false;

        // Animação
        this.wavePhase = 0;
        this.waveSpeed = 5;
    }

    initializeSegments() {
        this.segments = [];
        for (let i = 0; i < this.length; i++) {
            this.segments.push({
                x: this.x - i * CONFIG.SNAKE_SEGMENT_SPACING,
                y: this.y,
                angle: this.angle
            });
        }
    }

    setTargetAngle(angle) {
        this.targetAngle = angle;
    }

    boost(active) {
        if (active && this.length >= CONFIG.SNAKE_MIN_LENGTH_TO_BOOST) {
            this.isBoosting = true;
        } else {
            this.isBoosting = false;
        }
    }

    grow(amount = 1) {
        this.targetLength += amount;
        this.foodEaten += amount;
        this.score += amount * 10;
    }

    shrink(amount = 1) {
        this.targetLength = Math.max(3, this.targetLength - amount);
    }

    update(deltaTime) {
        if (this.isDead) return;

        const dt = deltaTime / 1000;

        // Atualizar ângulo suavemente
        const angleDiff = Utils.normalizeAngle(this.targetAngle - this.angle);
        this.angle += angleDiff * CONFIG.SNAKE_TURN_SPEED;
        this.angle = Utils.normalizeAngle(this.angle);

        // Atualizar velocidade baseado no boost
        const targetSpeed = this.isBoosting
            ? CONFIG.SNAKE_BASE_SPEED * CONFIG.SNAKE_BOOST_MULTIPLIER
            : CONFIG.SNAKE_BASE_SPEED;

        this.speed = Utils.lerp(this.speed, targetSpeed, 0.1);

        // Consumir segmentos durante boost
        if (this.isBoosting && this.length > CONFIG.SNAKE_MIN_LENGTH_TO_BOOST) {
            this.targetLength -= CONFIG.SNAKE_BOOST_COST_PER_SECOND * dt;
        }

        // Atualizar comprimento gradualmente
        if (this.length < this.targetLength) {
            this.length += 10 * dt; // Crescer rapidamente
        } else if (this.length > this.targetLength) {
            this.length -= 5 * dt; // Encolher mais devagar
        }
        this.length = Math.max(3, this.length);

        // Mover cabeça
        this.x += Math.cos(this.angle) * this.speed * dt;
        this.y += Math.sin(this.angle) * this.speed * dt;

        // Atualizar segmentos
        this.updateSegments(dt);

        // Atualizar animação de onda
        this.wavePhase += this.waveSpeed * dt;
    }

    updateSegments(dt) {
        // Atualizar primeiro segmento (cabeça)
        if (this.segments.length === 0) {
            this.segments.push({ x: this.x, y: this.y, angle: this.angle });
        } else {
            this.segments[0].x = this.x;
            this.segments[0].y = this.y;
            this.segments[0].angle = this.angle;
        }

        // Atualizar segmentos seguintes
        for (let i = 1; i < Math.ceil(this.length); i++) {
            if (!this.segments[i]) {
                // Criar novo segmento
                const prev = this.segments[i - 1];
                this.segments[i] = {
                    x: prev.x,
                    y: prev.y,
                    angle: prev.angle
                };
            }

            const current = this.segments[i];
            const previous = this.segments[i - 1];

            // Calcular direção para o segmento anterior
            const dx = previous.x - current.x;
            const dy = previous.y - current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Mover segmento em direção ao anterior
            if (distance > CONFIG.SNAKE_SEGMENT_SPACING) {
                const moveX = (dx / distance) * (distance - CONFIG.SNAKE_SEGMENT_SPACING);
                const moveY = (dy / distance) * (distance - CONFIG.SNAKE_SEGMENT_SPACING);

                current.x += moveX;
                current.y += moveY;
            }

            // Atualizar ângulo do segmento
            current.angle = Math.atan2(dy, dx);
        }

        // Remover segmentos extras
        while (this.segments.length > Math.ceil(this.length)) {
            this.segments.pop();
        }
    }

    render(ctx, camera) {
        if (this.isDead || this.segments.length === 0) return;

        ctx.save();

        // Renderizar corpo (do fim para o início)
        for (let i = this.segments.length - 1; i >= 0; i--) {
            const segment = this.segments[i];
            const screenPos = camera.worldToScreen(segment.x, segment.y);

            if (!camera.isVisible(segment.x, segment.y, CONFIG.SNAKE_SEGMENT_SIZE * 2)) {
                continue;
            }

            // Calcular tamanho do segmento (maior na cabeça)
            const sizeRatio = 0.7 + (i / this.segments.length) * 0.3;

            // Crescimento baseado no comprimento total (mesma lógica do getHeadRadius)
            const baseSize = CONFIG.SNAKE_SEGMENT_SIZE;
            const growthFactor = Math.floor(this.segments.length / 10) * 1;
            const maxGrowth = 8;
            const growthSize = baseSize + Math.min(growthFactor, maxGrowth);

            const segmentSize = growthSize * sizeRatio * camera.zoom;

            // Adicionar efeito de onda
            const waveOffset = Math.sin(this.wavePhase + i * 0.3) * 2 * camera.zoom;
            const offsetX = Math.cos(segment.angle + Math.PI / 2) * waveOffset;
            const offsetY = Math.sin(segment.angle + Math.PI / 2) * waveOffset;

            // Desenhar brilho
            if (this.isBoosting) {
                ctx.shadowBlur = 25 * camera.zoom;
                ctx.shadowColor = this.skin.colors[0];
            } else {
                ctx.shadowBlur = 15 * camera.zoom;
                ctx.shadowColor = this.skin.colors[0];
            }

            // Desenhar segmento
            const gradient = this.createSegmentGradient(
                ctx,
                screenPos.x + offsetX,
                screenPos.y + offsetY,
                segmentSize,
                i
            );

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                screenPos.x + offsetX,
                screenPos.y + offsetY,
                segmentSize,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Desenhar borda
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2 * camera.zoom;
            ctx.stroke();
        }

        // Renderizar cabeça (olhos)
        this.renderHead(ctx, camera);

        // Renderizar nome
        if (!this.isPlayer) {
            this.renderName(ctx, camera);
        }

        ctx.restore();
    }

    createSegmentGradient(ctx, x, y, radius, index) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

        if (this.skin.colors.length === 1) {
            gradient.addColorStop(0, this.skin.colors[0]);
            gradient.addColorStop(1, this.skin.colors[0]);
        } else {
            // Alternar cores ao longo do corpo
            const colorIndex = Math.floor((index / 3) % this.skin.colors.length);
            const color1 = this.skin.colors[colorIndex];
            const color2 = this.skin.colors[(colorIndex + 1) % this.skin.colors.length];

            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
        }

        return gradient;
    }

    renderHead(ctx, camera) {
        const head = this.segments[0];
        if (!head) return;

        const screenPos = camera.worldToScreen(head.x, head.y);
        const headSize = CONFIG.SNAKE_SEGMENT_SIZE * camera.zoom;
        const angle = head.angle;

        // Configuração da cara
        const faceConfig = this.skin.face || { type: 'standard', eyeColor: '#ffffff' };

        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        ctx.rotate(angle);

        // Desenhar baseado no tipo
        switch (faceConfig.type) {
            case 'cute':
                this.drawCuteFace(ctx, headSize, faceConfig.eyeColor);
                break;
            case 'angry':
                this.drawAngryFace(ctx, headSize, faceConfig.eyeColor);
                break;
            case 'happy':
                this.drawHappyFace(ctx, headSize, faceConfig.eyeColor);
                break;
            case 'cyclops':
                this.drawCyclopsFace(ctx, headSize, faceConfig.eyeColor);
                break;
            case 'cat':
                this.drawCatFace(ctx, headSize, faceConfig.eyeColor);
                break;
            case 'panda':
                this.drawPandaFace(ctx, headSize, faceConfig.eyeColor);
                break;
            case 'cool':
                this.drawCoolFace(ctx, headSize);
                break;
            case 'alien':
                this.drawAlienFace(ctx, headSize, faceConfig.eyeColor);
                break;
            default: // standard
                this.drawStandardFace(ctx, headSize, faceConfig.eyeColor);
                break;
        }

        ctx.restore();
    }

    drawStandardFace(ctx, size, color) {
        const eyeOffset = size * 0.4;
        const eyeSize = size * 0.25;

        // Olhos
        ctx.fillStyle = color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.arc(eyeOffset, -eyeOffset / 2, eyeSize, 0, Math.PI * 2); // Direito (visão top-down)
        ctx.arc(eyeOffset, eyeOffset / 2, eyeSize, 0, Math.PI * 2);  // Esquerdo
        ctx.fill();

        // Pupilas
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(eyeOffset + 2, -eyeOffset / 2, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.arc(eyeOffset + 2, eyeOffset / 2, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCuteFace(ctx, size, color) {
        const eyeOffset = size * 0.35;
        const eyeSize = size * 0.35; // Olhos maiores

        // Olhos
        ctx.fillStyle = color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.arc(eyeOffset, -eyeOffset / 2, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeOffset, eyeOffset / 2, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupilas grandes
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(eyeOffset + 2, -eyeOffset / 2, eyeSize * 0.7, 0, Math.PI * 2);
        ctx.arc(eyeOffset + 2, eyeOffset / 2, eyeSize * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Brilho nos olhos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeOffset + eyeSize / 2, -eyeOffset / 2 - eyeSize / 4, eyeSize * 0.2, 0, Math.PI * 2);
        ctx.arc(eyeOffset + eyeSize / 2, eyeOffset / 2 - eyeSize / 4, eyeSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawAngryFace(ctx, size, color) {
        const eyeOffset = size * 0.4;
        const eyeSize = size * 0.25;

        // Olhos
        ctx.fillStyle = color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.arc(eyeOffset, -eyeOffset / 2, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeOffset, eyeOffset / 2, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Sobrancelhas "bravas" (corte nos olhos)
        ctx.fillStyle = this.skin.colors[0]; // Cor da pele para cobrir
        ctx.beginPath();
        // Topo olho esquerdo
        ctx.moveTo(eyeOffset - eyeSize, -eyeOffset / 2 - eyeSize);
        ctx.lineTo(eyeOffset + eyeSize, -eyeOffset / 2);
        ctx.lineTo(eyeOffset - eyeSize, -eyeOffset / 2);
        // Topo olho direito
        ctx.moveTo(eyeOffset - eyeSize, eyeOffset / 2 - eyeSize);
        ctx.lineTo(eyeOffset + eyeSize, eyeOffset / 2);
        ctx.lineTo(eyeOffset - eyeSize, eyeOffset / 2);
        ctx.fill();

        // Pupilas pequenas e focadas
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(eyeOffset + 2, -eyeOffset / 2, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.arc(eyeOffset + 2, eyeOffset / 2, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawHappyFace(ctx, size, color) {
        const eyeOffset = size * 0.4;
        const eyeSize = size * 0.25;

        // Olhos fechados felizes (arco)
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 5;
        ctx.shadowColor = color;

        ctx.beginPath();
        // Esquerdo
        ctx.arc(eyeOffset, -eyeOffset / 2, eyeSize, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();

        ctx.beginPath();
        // Direito
        ctx.arc(eyeOffset, eyeOffset / 2, eyeSize, -Math.PI * 0.8, -Math.PI * 0.2); // Espelhado? Não, apenas arco
        // Corrigindo arco feliz (sorrindo)
        // Na verdade olhos '^^' são dois arcos para cima em relação à rotação
        // Vamos fazer olhos abertos mas com expressão feliz

        // Reset path e fazer olhos normais mas brilhantes
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(eyeOffset, -eyeOffset / 2, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeOffset, eyeOffset / 2, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Boca feliz? (Arco simples abaixo dos olhos?)
        // Difícil posicionar sem parecer estranho de cima. Vamos focar nos olhos.
        // Pupilas normais
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(eyeOffset + 2, -eyeOffset / 2, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.arc(eyeOffset + 2, eyeOffset / 2, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCyclopsFace(ctx, size, color) {
        const eyeOffset = size * 0.4;
        const eyeSize = size * 0.5; // Olhão

        // Olho único
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.arc(eyeOffset, 0, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupila
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(eyeOffset + 5, 0, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCatFace(ctx, size, color) {
        const eyeOffset = size * 0.4;
        const eyeSize = size * 0.3;

        // Olhos
        ctx.fillStyle = color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.arc(eyeOffset, -eyeOffset / 2, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeOffset, eyeOffset / 2, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupilas (fenda vertical)
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        // Esquerdo
        ctx.ellipse(eyeOffset + 2, -eyeOffset / 2, eyeSize * 0.8, eyeSize * 0.2, 0, 0, Math.PI * 2);
        // Direito
        ctx.ellipse(eyeOffset + 2, eyeOffset / 2, eyeSize * 0.8, eyeSize * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPandaFace(ctx, size, color) {
        const eyeOffset = size * 0.4;
        const eyeSize = size * 0.25;

        // Manchas pretas
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(eyeOffset, -eyeOffset / 2, eyeSize * 1.5, eyeSize * 1.2, Math.PI / 4, 0, Math.PI * 2);
        ctx.ellipse(eyeOffset, eyeOffset / 2, eyeSize * 1.5, eyeSize * 1.2, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Olhos brancos
        this.drawStandardFace(ctx, size, '#ffffff');
    }

    drawCoolFace(ctx, size) {
        const eyeOffset = size * 0.4;
        const width = size * 0.4;
        const height = size * 0.6;

        // Óculos escuros
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 2;
        ctx.shadowColor = '#000000';

        ctx.beginPath();
        // Lente esquerda
        ctx.rect(eyeOffset - width / 2, -height / 2 - 2, width, height / 2);
        // Lente direita
        ctx.rect(eyeOffset - width / 2, 2, width, height / 2);
        // Haste central
        ctx.rect(eyeOffset - width / 2, -2, width / 2, 4);
        ctx.fill();

        // Brilho no óculos
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(eyeOffset + width / 2, -height / 2);
        ctx.lineTo(eyeOffset - width / 2, -height / 4);
        ctx.lineTo(eyeOffset + width / 2, 0);
        ctx.fill();
    }

    drawAlienFace(ctx, size, color) {
        const eyeOffset = size * 0.3;
        const eyeSize = size * 0.4;

        // Olhos grandes e inclinados
        ctx.fillStyle = color; // Preto ou escuro para alien? Ou cor brilhante? Config diz ciano.
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        ctx.beginPath();
        // Esquerdo
        ctx.ellipse(eyeOffset, -eyeOffset / 2, eyeSize, eyeSize * 0.6, -Math.PI / 6, 0, Math.PI * 2);
        // Direito
        ctx.ellipse(eyeOffset, eyeOffset / 2, eyeSize, eyeSize * 0.6, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
    }

    renderName(ctx, camera) {
        const head = this.segments[0];
        if (!head) return;

        const screenPos = camera.worldToScreen(head.x, head.y);
        const headSize = CONFIG.SNAKE_SEGMENT_SIZE * camera.zoom;

        ctx.save();
        ctx.font = `${14 * camera.zoom}px 'Rajdhani', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5 * camera.zoom;
        ctx.shadowColor = '#000000';
        ctx.fillText(this.name, screenPos.x, screenPos.y - headSize - 10 * camera.zoom);
        ctx.restore();
    }

    getHeadPosition() {
        return { x: this.x, y: this.y };
    }

    getHeadRadius() {
        // Tamanho base + crescimento baseado no comprimento
        // A cada 10 segmentos, aumenta 1 pixel no raio
        const baseSize = CONFIG.SNAKE_SEGMENT_SIZE;
        const growthFactor = Math.floor(this.segments.length / 10) * 1;
        const maxGrowth = 8; // Máximo de 8 pixels adicionais
        return baseSize + Math.min(growthFactor, maxGrowth);
    }

    getSegments() {
        return this.segments;
    }

    collidesWithPoint(x, y, radius) {
        // Verificar colisão com cada segmento (exceto a cabeça para auto-colisão)
        const startIndex = this.isPlayer ? 10 : 0; // Jogador não colide com própria cabeça

        for (let i = startIndex; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (Utils.circleCollision(
                segment.x, segment.y, CONFIG.SNAKE_SEGMENT_SIZE,
                x, y, radius
            )) {
                return true;
            }
        }
        return false;
    }

    die() {
        this.isDead = true;
    }

    getDeathFood() {
        // Retornar array de comida baseado nos segmentos
        const food = [];

        for (let i = 0; i < this.segments.length; i += 2) {
            const segment = this.segments[i];
            const foodItem = new Food(segment.x, segment.y, 'dead_snake');
            foodItem.snakeColor = this.skin.colors[0];
            food.push(foodItem);
        }

        return food;
    }

    getBoostTrail() {
        // Retornar comida do rastro de boost
        if (!this.isBoosting || this.segments.length === 0) {
            return null;
        }

        const tail = this.segments[this.segments.length - 1];
        const food = new Food(tail.x, tail.y, 'dead_snake');
        food.snakeColor = this.skin.colors[0];
        food.size = CONFIG.FOOD_SIZE * 0.8;

        return food;
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Snake;
}
