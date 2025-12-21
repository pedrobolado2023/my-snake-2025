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

        // Calcular tamanho base da cobra (Cálculo otimizado fora do loop)
        const baseSize = CONFIG.SNAKE_SEGMENT_SIZE;
        const growthFactor = Math.floor(this.segments.length / 15) * 1;
        const maxGrowth = 100;
        const growthSize = baseSize + Math.min(growthFactor, maxGrowth);

        // Otimização Dinâmica de Renderização (LOD)
        // Quanto maior a cobra, maior o passo entre segmentos desenhados
        // Mantemos sobreposição visual (~40% do raio) para parecer contínua
        // Step base é 1. Se raio for 50px, step pode ser maior.
        // step = (radius * factor) / spacing
        const minRadius = growthSize * 0.7; // Tamanho na cauda (pior caso)
        const step = Math.max(1, Math.floor((minRadius * 0.4) / CONFIG.SNAKE_SEGMENT_SPACING));

        // Renderizar corpo (do fim para o início)
        // Loop pula 'step' segmentos, mas garante que desenha segmentos suficientes
        for (let i = this.segments.length - 1; i >= 0; i -= step) {
            // Garantir que desenhamos a cabeça (i=0) se o loop pular ela por pouco
            // Mas renderizamos o 0 explicitamente no final do loop se precisar? 
            // Melhor: se estivermos muito perto do 0, forçamos 0 na próxima iteração
            // Simplificação: Deixar o loop correr e desenhar o 0 explicitamente depois se não cair nele.
            // Para consistência visual, desenhamos o 0 separadamente ou garantimos inclusão.

            // Ajuste: Vamos forçar o desenho do índice 0 se passarmos por ele
            let segmentIndex = i;
            if (segmentIndex < step && segmentIndex > 0) {
                // Se o próximo passo passaria do 0, não desenha agora, deixa o loop acabar
                // e desenhamos o 0 no final? Não, o 0 é o último (topo).
                // Vamos apenas desenhar o i atual.
            }

            const segment = this.segments[segmentIndex];
            const screenPos = camera.worldToScreen(segment.x, segment.y);

            if (!camera.isVisible(segment.x, segment.y, growthSize * 2 * camera.zoom)) {
                continue;
            }

            // Calcular tamanho do segmento (maior na cabeça)
            const sizeRatio = 0.7 + (segmentIndex / this.segments.length) * 0.3;
            // growthSize já calculado fora

            const segmentSize = growthSize * sizeRatio * camera.zoom;

            // Adicionar efeito de onda
            const waveOffset = Math.sin(this.wavePhase + segmentIndex * 0.3) * 2 * camera.zoom;
            const offsetX = Math.cos(segment.angle + Math.PI / 2) * waveOffset;
            const offsetY = Math.sin(segment.angle + Math.PI / 2) * waveOffset;

            // Desenhar brilho (reduzido)
            if (this.isBoosting) {
                ctx.shadowBlur = 10 * camera.zoom;
                ctx.shadowColor = this.skin.colors[0];
            } else {
                ctx.shadowBlur = 5 * camera.zoom;
                ctx.shadowColor = this.skin.colors[0];
            }

            // Desenhar segmento
            const gradient = this.createSegmentGradient(
                ctx,
                screenPos.x + offsetX,
                screenPos.y + offsetY,
                segmentSize,
                segmentIndex
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

        // Garantir renderização do segmento 0 (Cabeça base) se o loop pulou ele
        // O loop i-- vai até 0. Se step > 1, pode parar no 1, 2... e pular o 0.
        // Verificamos se (this.segments.length - 1) % step !== 0? 
        // Mais fácil apenas desenhar o 0 sempre, mas com verificação de não sobrepor excessivamente?
        // O Painter's algorithm diz que o último desenhado fica no topo. 0 deve ser o topo.
        // Se desenharmos o 0 de novo, sem problemas. Mal não faz, e garante o topo.
        if (this.segments.length > 0) {
            const headBase = this.segments[0];
            const headScreenPos = camera.worldToScreen(headBase.x, headBase.y);
            // ... repetimos lógica de render para o 0? 
            // Melhor refatorar em renderSegment? Não, inline é mais rápido. 
            // Vamos copiar a lógica brevemente apenas para o 0, sem brilho extra pois já tem ou terá.

            // Na verdade, a cabeça tem renderHead desenhando olhos.
            // O corpo precisa desenhar o CÍRCULO BASE da cabeça.
            // Vamos desenhar SEMPRE o 0 aqui no final para garantir.

            const headSize = growthSize * 1.0 * camera.zoom; // Ratio 1.0
            // ... desenha ...
            // Para não duplicar muito código, vou assumir que o passo dinâmico é visualmente aceitável
            // e adicionar renderização explícita do segmento 0 APENAS SE step > 1
            if (step > 1) {
                const waveOffsetHead = Math.sin(this.wavePhase + 0) * 2 * camera.zoom;
                // ... (recriando contexto mínimo para cabeça base)
                // Simplificação: O loop acima desenha "do fundo para a frente".
                // Se eu desenhar o 0 aqui, ele fica por cima de tudo (correto para cabeça).
                // Vou incluir o desenho do segmento 0 aqui.

                // Copia da lógica de desenho apenas para index 0
                const offsetX = Math.cos(headBase.angle + Math.PI / 2) * waveOffsetHead;
                const offsetY = Math.sin(headBase.angle + Math.PI / 2) * waveOffsetHead;

                const grad = this.createSegmentGradient(ctx, headScreenPos.x + offsetX, headScreenPos.y + offsetY, headSize, 0);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(headScreenPos.x + offsetX, headScreenPos.y + offsetY, headSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
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
        // Padrão base
        const pattern = this.skin.pattern || 'solid';
        const colors = this.skin.colors;
        let gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

        switch (pattern) {
            case 'solid':
            case 'gradient':
                if (colors.length === 1) {
                    gradient.addColorStop(0, colors[0]);
                    gradient.addColorStop(1, colors[0]);
                } else {
                    // Gradiente suave entre as cores
                    const colorIndex = Math.floor((index / 5) % colors.length);
                    const nextColorIndex = (colorIndex + 1) % colors.length;
                    gradient.addColorStop(0, colors[colorIndex]);
                    gradient.addColorStop(1, colors[nextColorIndex]);
                }
                break;

            case 'spots': // Vaca (Manchas)
                // Usar índice para criar "manchas" aleatórias mas consistentes
                // Se (index % 4 === 0) ou algo assim, muda a cor
                const isSpot = (index % 4 === 0) || (index % 7 === 0);
                // Vaca: Cores[0] = branco, Cores[1] = preto
                if (isSpot && colors.length > 1) {
                    gradient.addColorStop(0, colors[1]); // Preto
                    gradient.addColorStop(1, colors[1]);
                } else {
                    gradient.addColorStop(0, colors[0]); // Branco
                    gradient.addColorStop(1, colors[0]);
                }
                break;

            case 'stripes': // Tigre / Gato (Listras)
                // Alternar a cada X segmentos
                const stripeWidth = 3;
                const isStripe = Math.floor(index / stripeWidth) % 2 === 0;

                if (isStripe && colors.length > 1) {
                    gradient.addColorStop(0, colors[1]);
                    gradient.addColorStop(1, colors[1]);
                } else {
                    gradient.addColorStop(0, colors[0]);
                    gradient.addColorStop(1, colors[0]);
                }
                break;

            case 'panda': // Panda (Blocos)
                // Cabeça branca, corpo preto/branco alternado em blocos grandes
                // O segmento 0 é a cabeça (tratado no renderHead, mas aqui é corpo)
                const blockSize = 5;
                const isBlock = Math.floor(index / blockSize) % 2 === 0;

                if (isBlock && colors.length > 1) {
                    gradient.addColorStop(0, colors[1]); // Preto
                    gradient.addColorStop(1, colors[1]);
                } else {
                    gradient.addColorStop(0, colors[0]); // Branco
                    gradient.addColorStop(1, colors[0]);
                }
                break;

            case 'scales': // Dragão / Cobra
            case 'rainbow':
                // Cores alternando rapidamente
                const scaleIndex = index % colors.length;
                gradient.addColorStop(0, colors[scaleIndex]);
                // Adicionar um pouco de brilho para parecer escama
                gradient.addColorStop(1, Utils.adjustColor(colors[scaleIndex], -20));
                break;

            case 'fire':
            case 'ice':
            case 'toxic':
            case 'galaxy':
            case 'neon':
                // Padrões animados ou complexos
                // Para simplificar: usar as cores disponíveis em ciclo rápido
                const complexIndex = index % colors.length;
                gradient.addColorStop(0, colors[complexIndex]);
                gradient.addColorStop(1, colors[(complexIndex + 1) % colors.length]);
                break;

            default:
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(1, colors[0]);
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
            case 'bear': // NOVO
                this.drawBearHead(ctx, headSize);
                break;
            case 'cool':
                this.drawCoolFace(ctx, headSize);
                break;
            case 'alien':
                this.drawAlienFace(ctx, headSize, faceConfig.eyeColor);
                break;
            case 'lion': // NOVO
                this.drawLionHead(ctx, headSize);
                break;
            case 'cow': // NOVO
                this.drawCowHead(ctx, headSize);
                break;
            case 'fox': // NOVO
                this.drawFoxHead(ctx, headSize);
                break;
            case 'rabbit': // NOVO
                this.drawRabbitHead(ctx, headSize);
                break;
            default: // standard
                this.drawStandardFace(ctx, headSize, faceConfig.eyeColor);
                break;
        }

        ctx.restore();
    }

    // --- NOVOS MÉTODOS DE ANIMAIS ---

    drawBearHead(ctx, size) {
        // Orelhas redondas
        ctx.fillStyle = this.skin.colors[1] || this.skin.colors[0];
        ctx.beginPath();
        const earSize = size * 0.35;
        // Orelha esquerda
        ctx.arc(size * 0.4, -size * 0.6, earSize, 0, Math.PI * 2);
        // Orelha direita
        ctx.arc(size * 0.4, size * 0.6, earSize, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça base (já desenhada ou podemos reforçar)
        // O corpo da cobra já desenha a cabeça, aqui focamos nos detalhes da cara

        // Focinho
        ctx.fillStyle = '#D2B48C'; // Tan
        ctx.beginPath();
        ctx.ellipse(size * 0.6, 0, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nariz
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(size * 0.8, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
        this.drawStandardFace(ctx, size, '#000000');
    }

    drawLionHead(ctx, size) {
        // Juba
        ctx.fillStyle = '#8B4513'; // SaddleBrown
        ctx.beginPath();
        // Juba ao redor da cabeça
        ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Orelhas (escondidas na juba, mas podemos destacar)

        // Rosto (cobre o centro da juba)
        ctx.fillStyle = this.skin.colors[0]; // Dourado
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Focinho
        ctx.fillStyle = '#F4A460'; // SandyBrown
        ctx.beginPath();
        ctx.ellipse(size * 0.5, 0, size * 0.35, size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nariz
        ctx.fillStyle = '#000000'; // Rosa escuro ou preto
        ctx.beginPath();
        ctx.moveTo(size * 0.7, -size * 0.1);
        ctx.lineTo(size * 0.85, 0);
        ctx.lineTo(size * 0.7, size * 0.1);
        ctx.fill();

        // Olhos felinos
        this.drawCatFace(ctx, size, '#FFFF00'); // Reutiliza olhos de gato mas amarelos
    }

    drawCowHead(ctx, size) {
        // Chifres
        ctx.fillStyle = '#D3D3D3'; // Cinza claro
        ctx.beginPath();
        // Chifre esquerdo
        ctx.moveTo(size * 0.2, -size * 0.5);
        ctx.quadraticCurveTo(size * 0.4, -size * 1.0, size * 0.8, -size * 0.8);
        ctx.lineTo(size * 0.6, -size * 0.5);
        ctx.fill();
        // Chifre direito
        ctx.beginPath();
        ctx.moveTo(size * 0.2, size * 0.5);
        ctx.quadraticCurveTo(size * 0.4, size * 1.0, size * 0.8, size * 0.8);
        ctx.lineTo(size * 0.6, size * 0.5);
        ctx.fill();

        // Orelhas de vaca (caídas)
        ctx.fillStyle = this.skin.colors[1] || '#000000';
        ctx.beginPath();
        ctx.ellipse(size * 0.2, -size * 0.7, size * 0.3, size * 0.15, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(size * 0.2, size * 0.7, size * 0.3, size * 0.15, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Focinho largo
        ctx.fillStyle = '#FFB6C1'; // Rosa claro
        ctx.beginPath();
        ctx.ellipse(size * 0.6, 0, size * 0.4, size * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Narinas
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(size * 0.8, -size * 0.15, size * 0.08, 0, Math.PI * 2);
        ctx.arc(size * 0.8, size * 0.15, size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
        this.drawStandardFace(ctx, size, '#000000');
    }

    drawFoxHead(ctx, size) {
        // Orelhas grandes e pontudas
        ctx.fillStyle = this.skin.colors[0];
        ctx.beginPath();
        // Esquerda
        ctx.moveTo(size * 0.1, -size * 0.4);
        ctx.lineTo(size * 0.3, -size * 1.2);
        ctx.lineTo(size * 0.6, -size * 0.3);
        ctx.fill();
        // Direita
        ctx.moveTo(size * 0.1, size * 0.4);
        ctx.lineTo(size * 0.3, size * 1.2);
        ctx.lineTo(size * 0.6, size * 0.3);
        ctx.fill();

        // Detalhe branco nas bochechas/focinho
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(size * 0.2, -size * 0.5);
        ctx.quadraticCurveTo(size * 0.8, -size * 0.3, size * 1.1, 0);
        ctx.quadraticCurveTo(size * 0.8, size * 0.3, size * 0.2, size * 0.5);
        ctx.fill();

        // Nariz pontudo preto
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(size * 1.0, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Olhos espertos
        this.drawStandardFace(ctx, size * 0.9, '#000000');
    }

    drawRabbitHead(ctx, size) {
        // Orelhas longas
        ctx.fillStyle = this.skin.colors[0];
        const earLength = size * 1.5;
        const earWidth = size * 0.3;

        ctx.beginPath();
        // Esquerda
        ctx.ellipse(size * 0, -size * 0.8, earLength, earWidth, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        // Direita
        ctx.beginPath();
        ctx.ellipse(size * 0, size * 0.8, earLength, earWidth, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Interior das orelhas
        ctx.fillStyle = '#FFC0CB';
        ctx.beginPath();
        ctx.ellipse(size * 0, -size * 0.8, earLength * 0.7, earWidth * 0.6, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(size * 0, size * 0.8, earLength * 0.7, earWidth * 0.6, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Narizinho
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(size * 0.9, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
        this.drawCuteFace(ctx, size, '#000000');
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
        // Orelhas Pontudas
        ctx.fillStyle = this.skin.colors[0]; // Cor do corpo
        ctx.beginPath();
        ctx.moveTo(size * 0.2, -size * 0.5); ctx.lineTo(size * 0.6, -size * 1.3); ctx.lineTo(size * 0.9, -size * 0.4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size * 0.2, size * 0.5); ctx.lineTo(size * 0.6, size * 1.3); ctx.lineTo(size * 0.9, size * 0.4);
        ctx.fill();

        // Interior Orelhas
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(size * 0.3, -size * 0.6); ctx.lineTo(size * 0.6, -size * 1.1); ctx.lineTo(size * 0.8, -size * 0.5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size * 0.3, size * 0.6); ctx.lineTo(size * 0.6, size * 1.1); ctx.lineTo(size * 0.8, size * 0.5);
        ctx.fill();

        // Rosto
        ctx.fillStyle = this.skin.colors[0];
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
        ctx.fillStyle = color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.arc(size * 0.5, -size * 0.35, size * 0.3, 0, Math.PI * 2);
        ctx.arc(size * 0.5, size * 0.35, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Pupilas (fenda vertical)
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(size * 0.55, -size * 0.35, size * 0.25, size * 0.08, 0, 0, Math.PI * 2);
        ctx.ellipse(size * 0.55, size * 0.35, size * 0.25, size * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nariz
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(size * 0.9, -size * 0.15);
        ctx.lineTo(size * 1.1, 0);
        ctx.lineTo(size * 0.9, size * 0.15);
        ctx.fill();

        // Bigodes
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(size * 0.9, -size * 0.1); ctx.lineTo(size * 1.4, -size * 0.4);
        ctx.moveTo(size * 0.9, size * 0.1); ctx.lineTo(size * 1.4, size * 0.4);
        ctx.moveTo(size * 0.9, -size * 0.05); ctx.lineTo(size * 1.4, -size * 0.15);
        ctx.moveTo(size * 0.9, size * 0.05); ctx.lineTo(size * 1.4, size * 0.15);
        ctx.stroke();
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
        const baseSize = CONFIG.SNAKE_SEGMENT_SIZE;
        const growthFactor = Math.floor(this.segments.length / 15) * 1; // Ajustado para novo espaçamento
        const maxGrowth = 100;
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
