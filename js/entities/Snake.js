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
        this.path = [];
        // Inicializar path e segmentos na posição inicial
        for (let i = 0; i < this.length; i++) {
            const px = this.x - i * CONFIG.SNAKE_SEGMENT_SPACING;
            const py = this.y;
            this.segments.push({
                x: px,
                y: py,
                angle: this.angle
            });
            // Adicionar pontos iniciais ao path para garantir que haja histórico suficiente
            this.path.push({ x: px, y: py });
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
        // Otimização: Crescer 10x mais devagar em comprimento do que em pontos
        // Antes: 1 ponto = 1 segmento
        // Agora: 10 pontos = 1 segmento
        this.targetLength += amount * 0.1;
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

        // Adicionar nova posição ao histórico do caminho
        // OTIMIZAÇÃO: Só adicionar se moveu uma distância mínima para evitar array gigante
        // Antes: Adicionava todo frame
        // Agora: Só se dist > 3 (quase o tamanho do espaçamento, mantém resolução boa mas usa menos memória)
        const lastP = this.path[0];
        if (!lastP || Utils.distance(this.x, this.y, lastP.x, lastP.y) > 3) {
            this.path.unshift({ x: this.x, y: this.y });
        }

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

        let pathInd = 0;
        let currentDist = 0;

        // Percorrer segmentos e posicionar no path
        for (let i = 1; i < Math.ceil(this.length); i++) {
            // Criar segmento se não existir
            if (!this.segments[i]) {
                // Inicializa na posição do anterior ou da cauda atual
                const prev = this.segments[i - 1] || this.segments[0];
                this.segments[i] = { x: prev.x, y: prev.y, angle: prev.angle };
            }

            const targetDist = i * CONFIG.SNAKE_SEGMENT_SPACING;

            // Navegar pelo path até encontrar a distância alvo acumulada
            while (pathInd < this.path.length - 1) {
                const p1 = this.path[pathInd];
                const p2 = this.path[pathInd + 1];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSeg = Math.sqrt(dx * dx + dy * dy);

                if (currentDist + distSeg >= targetDist) {
                    // Interpolação exata
                    const remain = targetDist - currentDist;
                    const ratio = remain / distSeg; // Quanto falta dentro deste segmento de path

                    this.segments[i].x = p1.x - (dx * ratio);
                    this.segments[i].y = p1.y - (dy * ratio);

                    // Ângulo segue o path (de p2 para p1, pois estamos indo para trás no tempo/path)
                    // O corpo aponta para a cabeça.
                    this.segments[i].angle = Math.atan2(dy, dx);

                    break; // Segmento posicionado, ir para o próximo 'i' (mantendo loop while onde está)
                } else {
                    currentDist += distSeg;
                    pathInd++;
                }
            }
        }

        // Remover segmentos extras
        while (this.segments.length > Math.ceil(this.length)) {
            this.segments.pop();
        }

        // Limpar path antigo (otimização de memória)
        // Manter histórico suficiente para cobrir todo o comprimento + um pouco de folga
        // Se pathInd (onde o último segmento ficou) for menor que path.length
        // podemos cortar tudo depois de pathInd + buffer
        if (pathInd < this.path.length - 20) {
            this.path.splice(pathInd + 20); // Manter buffer de 20 pontos
        }
    }

    render(ctx, camera) {
        if (this.isDead || this.segments.length === 0) return;

        // Proteção: Garantir que a skin tem cores válidas
        const skinColors = (this.skin && this.skin.colors && this.skin.colors.length > 0)
            ? this.skin.colors
            : ['#ffffff', '#cccccc'];
        const skinPattern = (this.skin && this.skin.pattern) ? this.skin.pattern : 'solid';

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Calcular LOD e tamanhos fora do loop
        // Calcular LOD e tamanhos fora do loop
        const baseSize = CONFIG.SNAKE_SEGMENT_SIZE;
        // Crescimento linear suave (sem Math.floor) para evitar "piscar" ao crescer
        const growthFactor = (this.segments.length / 20) * 0.8;
        const maxGrowth = 80; // Limite menor para não ficar muito gorda
        const growthSize = baseSize + Math.min(growthFactor, maxGrowth);

        // OTIMIZAÇÃO DE RENDERIZAÇÃO ⚡
        // Calcular "step" (pulo) baseado no zoom e comprimento
        // Se a cobra for muito longa, aumentamos o step para desenhar menos círculos
        // Isso evita desenhar 5000 segmentos num loop
        let step = Math.max(1, Math.floor((growthSize * 0.5) / CONFIG.SNAKE_SEGMENT_SPACING));

        // Se estiver muito longe (zoom baixo) ou cobra muito grande, pular mais
        if (camera.zoom < 0.5 || this.segments.length > 500) {
            step = Math.ceil(step * 1.5);
        }
        if (this.segments.length > 1000) {
            step = Math.ceil(step * 2); // Desenha metade dos segmentos
        }

        // Renderizar brilho (glow) intenso se for player ou estiver perto
        if (this.isPlayer || camera.zoom > 0.6) {
            // Glow reduzido para menos ofuscação
            const glowBlur = this.isBoosting ? 20 * camera.zoom : 8 * camera.zoom;
            ctx.shadowBlur = glowBlur;
            ctx.shadowColor = skinColors[0];

            // Desenha linha de fundo para o glow
            ctx.beginPath();
            const headPos = camera.worldToScreen(this.segments[0].x, this.segments[0].y);
            ctx.moveTo(headPos.x, headPos.y);
            let glowStep = Math.max(1, Math.floor(this.segments.length / 40));
            for (let i = 1; i < this.segments.length; i += glowStep) {
                const p = camera.worldToScreen(this.segments[i].x, this.segments[i].y);
                ctx.lineTo(p.x, p.y);
            }
            ctx.strokeStyle = skinColors[0];
            ctx.lineWidth = growthSize * camera.zoom;
            ctx.globalAlpha = 0.4;
            ctx.stroke();

            // Limpar shadow para desenhar segmentos
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // Renderizar Segmentos 3D
        // const step = Math.max(1, Math.floor((growthSize * 0.5) / CONFIG.SNAKE_SEGMENT_SPACING)); (Usando o step otimizado acima)

        for (let i = this.segments.length - 1; i >= 0; i -= step) {
            const segment = this.segments[i];
            if (!camera.isVisible(segment.x, segment.y, growthSize * 2 * camera.zoom)) continue;

            const screenPos = camera.worldToScreen(segment.x, segment.y);
            const currentSize = growthSize * camera.zoom;

            // Gradiente 3D com proteção
            const grad = ctx.createRadialGradient(
                screenPos.x - currentSize * 0.2, screenPos.y - currentSize * 0.2, currentSize * 0.1,
                screenPos.x, screenPos.y, currentSize
            );

            // Escolha de cor segura
            let c1 = skinColors[0];
            let c2;

            try {
                c2 = skinColors[1] || Utils.darkenColor(c1, 40);
            } catch (e) { c2 = c1; }

            if (['stripes', 'rainbow', 'scales'].includes(skinPattern)) {
                const idx = Math.floor(i / 8) % skinColors.length;
                c1 = skinColors[idx];
                try {
                    c2 = Utils.darkenColor(c1, 40);
                } catch (e) { c2 = c1; }
            }

            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, c1);
            grad.addColorStop(1, c2);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, currentSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
        this.renderHead(ctx, camera);

        if (!this.isPlayer) {
            this.renderName(ctx, camera);
        }
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

            case 'camo': // Camuflagem
                // Padrão irregular de camuflagem
                const camoPattern = (index % 3 === 0) ? 0 : (index % 5 === 0) ? 1 : 2;
                const camoColor = colors[camoPattern % colors.length];
                gradient.addColorStop(0, camoColor);
                gradient.addColorStop(1, Utils.adjustColor(camoColor, -15));
                break;

            case 'metallic': // Metálico (Ouro)
            case 'diamond': // Diamante
                // Efeito brilhante com reflexos
                const metalIndex = index % colors.length;
                gradient.addColorStop(0, '#ffffff'); // Brilho
                gradient.addColorStop(0.3, colors[metalIndex]);
                gradient.addColorStop(0.7, colors[(metalIndex + 1) % colors.length]);
                gradient.addColorStop(1, Utils.adjustColor(colors[metalIndex], -30));
                break;

            case 'lava': // Lava
                // Vermelho/laranja com preto
                const lavaIndex = index % colors.length;
                gradient.addColorStop(0, colors[lavaIndex]);
                gradient.addColorStop(0.5, colors[(lavaIndex + 1) % colors.length]);
                gradient.addColorStop(1, '#000000');
                break;

            case 'electric': // Elétrico
                // Amarelo/ciano com branco brilhante
                const electricIndex = index % colors.length;
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.4, colors[electricIndex]);
                gradient.addColorStop(1, colors[(electricIndex + 1) % colors.length]);
                break;

            case 'shadow': // Sombra
                // Tons escuros com variação sutil
                const shadowIndex = index % colors.length;
                gradient.addColorStop(0, colors[shadowIndex]);
                gradient.addColorStop(1, '#000000');
                break;

            case 'cosmic': // Cósmico
            case 'rainbow_premium': // Arco-íris Premium
                // Todas as cores do arco-íris
                const cosmicIndex = index % colors.length;
                gradient.addColorStop(0, colors[cosmicIndex]);
                gradient.addColorStop(0.5, colors[(cosmicIndex + 1) % colors.length]);
                gradient.addColorStop(1, colors[(cosmicIndex + 2) % colors.length]);
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

        // CORREÇÃO DE ROTAÇÃO:
        // Os desenhos são feitos em "Retrato" (Topo em -Y).
        // Para alinhar com o movimento (Direita = 0), precisamos que o Topo (-Y) aponte para Trás (Esquerda = PI).
        // Rotação normal (0) leva X+ para X+. Y- continua Y-.
        // Queremos que Y- (Topo) vá para X- (Trás).
        // Rotate(-PI/2): Y- vira X-. Perfeito.
        ctx.rotate(angle - Math.PI / 2);

        // Desenhar baseado no tipo
        switch (faceConfig.type) {
            case 'cute': this.drawCuteFace(ctx, headSize, faceConfig.eyeColor); break;
            case 'angry': this.drawAngryFace(ctx, headSize, faceConfig.eyeColor); break;
            case 'happy': this.drawHappyFace(ctx, headSize, faceConfig.eyeColor); break;
            case 'cyclops': this.drawCyclopsFace(ctx, headSize, faceConfig.eyeColor); break;
            case 'cat': this.drawCatFace(ctx, headSize, faceConfig.eyeColor); break;
            case 'panda': this.drawPandaFace(ctx, headSize, faceConfig.eyeColor); break;
            case 'bear': // NOVO
                this.drawBearHead(ctx, headSize);
                break;
            case 'cool': this.drawCoolFace(ctx, headSize); break;
            case 'alien': this.drawAlienFace(ctx, headSize, faceConfig.eyeColor); break;
            case 'lion': this.drawLionHead(ctx, headSize); break;
            case 'cow': this.drawCowHead(ctx, headSize); break;
            case 'fox': this.drawFoxHead(ctx, headSize); break;
            case 'rabbit': this.drawRabbitHead(ctx, headSize); break;
            default: this.drawStandardFace(ctx, headSize, faceConfig.eyeColor); break;
        }

        ctx.restore();
    }

    // --- NOVOS MÉTODOS DE ANIMAIS ---

    // === SISTEMA DE DESIGN DE ROSTOS (ESTILO CARTOON/KAWAII) ===

    // Utilitário para desenhar olhos expressivos
    drawCartoonEye(ctx, x, y, size, eyeColor, expression = 'normal') {
        const eyeRadius = size * 0.5;

        ctx.save();
        ctx.translate(x, y);

        // 1. Esclera (Parte branca do olho)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (expression === 'angry') {
            // Olho meio fechado em cima
            ctx.arc(0, 0, eyeRadius, Math.PI, 0); // Semicírculo inferior
            ctx.lineTo(eyeRadius, -eyeRadius * 0.2);
            ctx.lineTo(-eyeRadius, -eyeRadius * 0.2);
        } else if (expression === 'happy') {
            // Olho sorrindo (arco)
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = size * 0.15;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(0, 0, eyeRadius * 0.8, Math.PI * 1.1, Math.PI * 1.9);
            ctx.stroke();
            ctx.restore();
            return; // Olho feliz não tem pupila desenhada aqui
        } else {
            // Normal (redondo)
            ctx.arc(0, 0, eyeRadius, 0, Math.PI * 2);
        }
        ctx.fill();

        // 2. Íris (Cor do olho)
        if (expression !== 'angry') {
            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            ctx.arc(0, 0, eyeRadius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Íris menor para raiva
            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            ctx.arc(0, 0, eyeRadius * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }

        // 3. Pupila (Preto)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, eyeRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // 4. Brilho (Reflexo branco - Essencial para "fofura")
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        // Brilho principal
        ctx.arc(-eyeRadius * 0.3, -eyeRadius * 0.3, eyeRadius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        // Brilho secundário menor
        ctx.beginPath();
        ctx.arc(eyeRadius * 0.2, eyeRadius * 0.2, eyeRadius * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Rosto Padrão (Olhos grandes e fofos)
    drawStandardFace(ctx, size, color) {
        const eyeSpacing = size * 0.35;
        this.drawCartoonEye(ctx, -eyeSpacing, -size * 0.1, size * 0.6, color || '#000000');
        this.drawCartoonEye(ctx, eyeSpacing, -size * 0.1, size * 0.6, color || '#000000');
    }

    // Rosto Fofo (Cute)
    drawCuteFace(ctx, size, color) {
        const eyeSpacing = size * 0.35;
        this.drawCartoonEye(ctx, -eyeSpacing, -size * 0.1, size * 0.7, color || '#00bfff');
        this.drawCartoonEye(ctx, eyeSpacing, -size * 0.1, size * 0.7, color || '#00bfff');

        // Bochechas rosadas
        ctx.fillStyle = 'rgba(255, 182, 193, 0.6)'; // Rosa transparente
        ctx.beginPath();
        ctx.arc(-size * 0.6, size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.6, size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Boca pequena sorrindo
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = size * 0.05;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, size * 0.3, size * 0.15, 0, Math.PI);
        ctx.stroke();
    }

    // Rosto Bravo (Angry)
    drawAngryFace(ctx, size, color) {
        const eyeSpacing = size * 0.35;
        this.drawCartoonEye(ctx, -eyeSpacing, 0, size * 0.55, color || '#ff0000', 'angry');
        this.drawCartoonEye(ctx, eyeSpacing, 0, size * 0.55, color || '#ff0000', 'angry');

        // Sobrancelhas franzidas
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        // Esq
        ctx.moveTo(-eyeSpacing - size * 0.4, -size * 0.3);
        ctx.lineTo(-eyeSpacing + size * 0.1, -size * 0.1);
        ctx.lineTo(-eyeSpacing - size * 0.4, -size * 0.2);
        ctx.fill();
        // Dir
        ctx.beginPath();
        ctx.moveTo(eyeSpacing + size * 0.4, -size * 0.3);
        ctx.lineTo(eyeSpacing - size * 0.1, -size * 0.1);
        ctx.lineTo(eyeSpacing + size * 0.4, -size * 0.2);
        ctx.fill();
    }

    drawHappyFace(ctx, size, color) {
        const eyeSpacing = size * 0.35;
        this.drawCartoonEye(ctx, -eyeSpacing, -size * 0.1, size * 0.6, color, 'happy');
        this.drawCartoonEye(ctx, eyeSpacing, -size * 0.1, size * 0.6, color, 'happy');

        // Boca grande sorrindo
        ctx.fillStyle = '#330000';
        ctx.beginPath();
        ctx.arc(0, size * 0.2, size * 0.3, 0, Math.PI);
        ctx.fill();
        // Língua
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(0, size * 0.4, size * 0.15, 0, Math.PI);
        ctx.fill();
    }

    drawCyclopsFace(ctx, size, color) {
        // Olho único gigante
        this.drawCartoonEye(ctx, 0, 0, size * 1.0, color || '#ffff00');
    }

    drawCatFace(ctx, size, color) {
        // Orelhas Pontudas (Topo Y-)
        ctx.fillStyle = this.skin.colors[0]; // Cor do corpo
        ctx.beginPath();
        // Esq
        ctx.moveTo(-size * 0.5, -size * 0.5);
        ctx.lineTo(-size * 0.8, -size * 1.2);
        ctx.lineTo(-size * 0.2, -size * 0.8);
        ctx.fill();
        // Dir
        ctx.beginPath();
        ctx.moveTo(size * 0.5, -size * 0.5);
        ctx.lineTo(size * 0.8, -size * 1.2);
        ctx.lineTo(size * 0.2, -size * 0.8);
        ctx.fill();

        // Interior Orelhas
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        // Esq
        ctx.moveTo(-size * 0.5, -size * 0.6); ctx.lineTo(-size * 0.7, -size * 1.0); ctx.lineTo(-size * 0.3, -size * 0.7);
        ctx.fill();
        // Dir
        ctx.beginPath();
        ctx.moveTo(size * 0.5, -size * 0.6); ctx.lineTo(size * 0.7, -size * 1.0); ctx.lineTo(size * 0.3, -size * 0.7);
        ctx.fill();

        // Olhos de Gato (Fendidos)
        const eyeSpacing = size * 0.35;
        const eyeSize = size * 0.25;

        // Esclera
        ctx.fillStyle = color || '#FFFF00';
        ctx.beginPath();
        ctx.arc(-eyeSpacing, -size * 0.1, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, -size * 0.1, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupila Fendida Vertical
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing, -size * 0.1, eyeSize * 0.3, eyeSize * 0.8, 0, 0, Math.PI * 2);
        ctx.ellipse(eyeSpacing, -size * 0.1, eyeSize * 0.3, eyeSize * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Focinho (Nariz Y+)
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(-size * 0.15, size * 0.3);
        ctx.lineTo(size * 0.15, size * 0.3);
        ctx.lineTo(0, size * 0.45);
        ctx.fill();

        // Bigodes
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Esq
        ctx.moveTo(-size * 0.2, size * 0.35); ctx.lineTo(-size * 1.0, size * 0.25);
        ctx.moveTo(-size * 0.2, size * 0.4); ctx.lineTo(-size * 1.0, size * 0.45);
        // Dir
        ctx.moveTo(size * 0.2, size * 0.35); ctx.lineTo(size * 1.0, size * 0.25);
        ctx.moveTo(size * 0.2, size * 0.4); ctx.lineTo(size * 1.0, size * 0.45);
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

    drawCowHead(ctx, size) {
        // Chifres
        ctx.fillStyle = '#D3D3D3'; // Cinza claro
        ctx.beginPath();
        // Chifre esquerdo
        ctx.moveTo(-size * 0.4, -size * 0.6);
        ctx.quadraticCurveTo(-size * 0.8, -size * 1.0, -size * 0.9, -size * 0.4); // Curva pra fora e cima
        ctx.lineTo(-size * 0.6, -size * 0.4);
        ctx.fill();
        // Chifre direito
        ctx.beginPath();
        ctx.moveTo(size * 0.4, -size * 0.6);
        ctx.quadraticCurveTo(size * 0.8, -size * 1.0, size * 0.9, -size * 0.4);
        ctx.lineTo(size * 0.6, -size * 0.4);
        ctx.fill();

        // Orelhas de vaca (Laterais)
        ctx.fillStyle = this.skin.colors[1] || '#000000';
        ctx.beginPath();
        ctx.ellipse(-size * 0.8, -size * 0.2, size * 0.3, size * 0.2, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(size * 0.8, -size * 0.2, size * 0.3, size * 0.2, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Focinho largo (Baixo)
        ctx.fillStyle = '#FFB6C1'; // Rosa claro
        ctx.beginPath();
        ctx.ellipse(0, size * 0.4, size * 0.5, size * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Narinas
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-size * 0.2, size * 0.4, size * 0.08, 0, Math.PI * 2);
        ctx.arc(size * 0.2, size * 0.4, size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
        this.drawStandardFace(ctx, size, '#000000');
    }

    drawFoxHead(ctx, size) {
        // Cores baseadas na imagem (ou na skin)
        const furColor = '#FF6B00'; // Laranja vibrante da imagem
        const whiteColor = '#FFFFFF';
        const blackColor = '#1a1a1a'; // Preto suave

        // Contorno Branco estilo Sticker (Opcional, mas fiel à imagem)
        ctx.lineJoin = 'round';
        ctx.lineWidth = size * 0.15;
        ctx.strokeStyle = whiteColor;

        ctx.save();

        // 1. BASE DA CABEÇA (Formato largo nas bochechas)
        ctx.beginPath();
        // Topo da cabeça
        ctx.moveTo(-size * 0.5, -size * 0.4);
        ctx.quadraticCurveTo(0, -size * 0.5, size * 0.5, -size * 0.4);
        // Lado direito (Bochecha larga)
        ctx.quadraticCurveTo(size * 0.9, -size * 0.1, size * 0.9, size * 0.2);
        // Queixo
        ctx.quadraticCurveTo(size * 0.5, size * 0.6, 0, size * 0.7);
        // Lado esquerdo
        ctx.quadraticCurveTo(-size * 0.5, size * 0.6, -size * 0.9, size * 0.2);
        ctx.quadraticCurveTo(-size * 0.9, -size * 0.1, -size * 0.5, -size * 0.4);

        // Desenhar contorno branco externo primeiro
        ctx.stroke();

        // Preencher com laranja
        ctx.fillStyle = furColor;
        ctx.fill();

        // 2. ORELHAS (Grandes e pontudas)
        ctx.save();
        // Orelha Esquerda
        ctx.translate(-size * 0.55, -size * 0.45);
        ctx.rotate(-Math.PI / 8);
        this.drawDetailedFoxEar(ctx, size, furColor, blackColor, whiteColor);
        ctx.restore();

        // Orelha Direita
        ctx.save();
        ctx.translate(size * 0.55, -size * 0.45);
        ctx.rotate(Math.PI / 8);
        ctx.scale(-1, 1); // Espelhar
        this.drawDetailedFoxEar(ctx, size, furColor, blackColor, whiteColor);
        ctx.restore();

        // 3. MÁSCARA BRANCA (Parte inferior do rosto)
        ctx.fillStyle = whiteColor;
        ctx.beginPath();
        // Começa na lateral da bochecha esquerda
        ctx.moveTo(-size * 0.9, size * 0.2);
        // Curva suave para baixo dos olhos
        ctx.quadraticCurveTo(-size * 0.5, size * 0.1, 0, size * 0.35); // Ponto central acima do nariz
        // Curva simétrica para direita
        ctx.quadraticCurveTo(size * 0.5, size * 0.1, size * 0.9, size * 0.2);
        // Fecha o formato seguindo o queixo
        ctx.quadraticCurveTo(size * 0.5, size * 0.6, 0, size * 0.7);
        ctx.quadraticCurveTo(-size * 0.5, size * 0.6, -size * 0.9, size * 0.2);
        ctx.fill();

        // 4. SOBRANCELHAS (Manchas brancas ovais)
        ctx.fillStyle = whiteColor;
        // Esq
        ctx.beginPath();
        ctx.ellipse(-size * 0.25, -size * 0.25, size * 0.08, size * 0.12, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        // Dir
        ctx.beginPath();
        ctx.ellipse(size * 0.25, -size * 0.25, size * 0.08, size * 0.12, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // 5. OLHOS (Grandes, Pretos, Brilhantes)
        const eyeY = 0; // Posição vertical
        const eyeX = size * 0.35;
        const eyeSize = size * 0.22; // Olhos bem grandes

        ctx.fillStyle = blackColor;
        ctx.beginPath();
        ctx.arc(-eyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Brilhos nos Olhos (Essencial para o look da imagem)
        ctx.fillStyle = whiteColor;
        // Brilho Grande (Canto superior)
        ctx.beginPath();
        ctx.arc(-eyeX + eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.35, 0, Math.PI * 2);
        ctx.arc(eyeX + eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.35, 0, Math.PI * 2);
        ctx.fill();
        // Brilho Pequeno (Canto inferior oposto - opcional, mas dá profundidade)
        ctx.beginPath();
        ctx.arc(-eyeX - eyeSize * 0.2, eyeY + eyeSize * 0.3, eyeSize * 0.15, 0, Math.PI * 2);
        ctx.arc(eyeX - eyeSize * 0.2, eyeY + eyeSize * 0.3, eyeSize * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // 6. NARIZ (Triângulo arredondado preto)
        ctx.fillStyle = blackColor;
        ctx.beginPath();
        const noseY = size * 0.45;
        ctx.moveTo(-size * 0.12, noseY - size * 0.05);
        ctx.quadraticCurveTo(0, noseY - size * 0.08, size * 0.12, noseY - size * 0.05); // Topo curvo
        ctx.quadraticCurveTo(0, noseY + size * 0.15, -size * 0.12, noseY - size * 0.05); // Ponta baixo
        ctx.fill();
        // Brilho no nariz
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, noseY - size * 0.02, size * 0.06, size * 0.03, 0, 0, Math.PI * 2);
        ctx.fill();

        // 7. BOCA (Pequeno 'w' ou '3' deitado)
        ctx.strokeStyle = blackColor;
        ctx.lineWidth = size * 0.05;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-size * 0.1, noseY + size * 0.1);
        ctx.quadraticCurveTo(0, noseY + size * 0.2, size * 0.1, noseY + size * 0.1);
        ctx.stroke();

        ctx.restore();
    }

    // Helper para desenhar orelha detalhada da raposa
    drawDetailedFoxEar(ctx, size, furColor, blackColor, whiteColor) {
        // Base Laranja
        ctx.fillStyle = furColor;
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, 0); // Base esq
        ctx.quadraticCurveTo(0, -size * 0.8, size * 0.3, 0); // Base dir
        ctx.fill(); // Preencher base para não vazar

        // Formato da orelha completa
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, 0);
        // Curva externa até a ponta
        ctx.quadraticCurveTo(-size * 0.1, -size * 1.0, 0, -size * 1.2);
        // Curva interna descendo
        ctx.quadraticCurveTo(size * 0.1, -size * 1.0, size * 0.3, 0);
        ctx.fill();

        // Ponta Preta
        ctx.fillStyle = blackColor;
        ctx.beginPath();
        ctx.moveTo(-size * 0.15, -size * 0.7); // Começo do preto
        ctx.quadraticCurveTo(0, -size * 1.2, 0, -size * 1.2); // Ponta
        ctx.quadraticCurveTo(0.05 * size, -size * 0.8, size * 0.15, -size * 0.7);
        // Fechar forma irregularmente para parecer pelo
        ctx.lineTo(0, -size * 0.5);
        ctx.fill();

        // Interior Peludo Branco
        ctx.fillStyle = whiteColor;
        ctx.beginPath();
        ctx.moveTo(-size * 0.15, -size * 0.1);
        ctx.quadraticCurveTo(0, -size * 0.6, size * 0.15, -size * 0.1);
        // base peluda (ziguezague simplificado)
        ctx.lineTo(0, -size * 0.05);
        ctx.fill();
    }

    drawRabbitHead(ctx, size) {
        // Orelhas longas para Cima
        ctx.fillStyle = this.skin.colors[0];
        const earLength = size * 1.5;
        const earWidth = size * 0.3;

        ctx.beginPath();
        // Esquerda
        ctx.ellipse(-size * 0.4, -size * 0.8, earWidth, earLength, -Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();
        // Direita
        ctx.beginPath();
        ctx.ellipse(size * 0.4, -size * 0.8, earWidth, earLength, Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();

        // Interior das orelhas
        ctx.fillStyle = '#FFC0CB';
        ctx.beginPath();
        ctx.ellipse(-size * 0.4, -size * 0.8, earWidth * 0.6, earLength * 0.7, -Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(size * 0.4, -size * 0.8, earWidth * 0.6, earLength * 0.7, Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();

        // Narizinho (Centro/Baixo)
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(0, size * 0.3, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
        this.drawCuteFace(ctx, size, '#000000');
    }

    drawBearHead(ctx, size) {
        // Orelhas redondas (Topo cantos)
        ctx.fillStyle = this.skin.colors[1] || this.skin.colors[0];
        const earSize = size * 0.35;
        ctx.beginPath();
        ctx.arc(-size * 0.6, -size * 0.6, earSize, 0, Math.PI * 2); // Esq
        ctx.arc(size * 0.6, -size * 0.6, earSize, 0, Math.PI * 2); // Dir
        ctx.fill();

        // Focinho (Baixo)
        ctx.fillStyle = '#D2B48C'; // Tan
        ctx.beginPath();
        ctx.ellipse(0, size * 0.3, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nariz
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, size * 0.25, size * 0.15, 0, Math.PI * 2);
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

        // Rosto (Centro)
        ctx.fillStyle = this.skin.colors[0]; // Dourado
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Focinho
        ctx.fillStyle = '#F4A460'; // SandyBrown
        ctx.beginPath();
        ctx.ellipse(0, size * 0.3, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nariz
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(-size * 0.15, size * 0.2);
        ctx.lineTo(size * 0.15, size * 0.2);
        ctx.lineTo(0, size * 0.4);
        ctx.fill();

        // Olhos felinos
        const eyeSpacing = size * 0.35;
        const eyeSize = size * 0.25;
        // Esclera
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(-eyeSpacing, -size * 0.1, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, -size * 0.1, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Pupila
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing, -size * 0.1, eyeSize * 0.3, eyeSize * 0.8, 0, 0, Math.PI * 2);
        ctx.ellipse(eyeSpacing, -size * 0.1, eyeSize * 0.3, eyeSize * 0.8, 0, 0, Math.PI * 2);
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
        // Limpar segmentos imediatamente para evitar corpo "fantasma"
        // Os segmentos já foram salvos em getDeathFood() antes de chamar die()
        this.segments = [];
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
