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

        // Proteção: Garantir cores válidas
        const skinColors = (this.skin && this.skin.colors && this.skin.colors.length > 0)
            ? this.skin.colors
            : ['#ffffff', '#cccccc'];
        const skinPattern = (this.skin && this.skin.pattern) ? this.skin.pattern : 'solid';

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Cálculos de tamanho e LOD
        const baseSize = CONFIG.SNAKE_SEGMENT_SIZE;
        const growthFactor = (this.segments.length / 20) * 0.8;
        const maxGrowth = 80;
        const growthSize = baseSize + Math.min(growthFactor, maxGrowth);
        const currentSize = growthSize * camera.zoom; // Tamanho visual na tela

        // Step (pulo) para não desenhar todos os segmentos
        let step = Math.max(1, Math.floor((growthSize * 0.5) / CONFIG.SNAKE_SEGMENT_SPACING));
        if (camera.zoom < 0.5 || this.segments.length > 500) step = Math.ceil(step * 1.5);
        if (this.segments.length > 1000) step = Math.ceil(step * 2);

        // 1. OTIMIZAÇÃO: Pré-calcular Gradientes (Cache de Frame)
        // Em vez de criar gradientes no loop, cria um mapa de gradientes para as cores da skin.
        // Gradientes são criados em (0,0) com raio 'currentSize'.

        const gradientCache = [];

        // Identificar se precisamos de múltiplas cores ou só a primeira
        const isMultiColor = ['stripes', 'rainbow', 'scales', 'camo', 'metallic', 'lava', 'electric', 'neon', 'shadow', 'cosmic', 'rainbow_premium'].includes(skinPattern);

        // Quantas variações criar? Se for sólido, 1. Se multi, colors.length.
        const numVariations = isMultiColor ? skinColors.length : 1;

        for (let i = 0; i < numVariations; i++) {
            const c1 = skinColors[i];
            let c2;
            try {
                // Tenta pegar a próxima cor para degradê ou escurece a atual
                if (skinColors.length > 1 && !isMultiColor) {
                    c2 = skinColors[1]; // Gradiente simples de 2 cores
                } else {
                    c2 = Utils.darkenColor(c1, 40);
                }
            } catch (e) { c2 = c1; }

            const grad = ctx.createRadialGradient(
                -currentSize * 0.2, -currentSize * 0.2, currentSize * 0.1, // Luz deslocada
                0, 0, currentSize
            );
            grad.addColorStop(0, '#ffffff'); // Brilho especular
            grad.addColorStop(0.3, c1);
            grad.addColorStop(1, c2);      // Sombra

            gradientCache.push(grad);
        }

        // 2. Renderizar GLOW (Opcional, apenas se for player ou perto)
        // Otimização: Só desenhar glow se não tiver muitos segmentos visíveis ou qualidade alta
        if ((this.isPlayer || camera.zoom > 0.6) && this.segments.length < 800) {
            const glowBlur = this.isBoosting ? 20 * camera.zoom : 8 * camera.zoom;
            ctx.shadowBlur = glowBlur;
            ctx.shadowColor = skinColors[0];

            ctx.beginPath();
            const headPos = camera.worldToScreen(this.segments[0].x, this.segments[0].y);
            ctx.moveTo(headPos.x, headPos.y);

            // Simplificar linha do glow (menos pontos que os segmentos reais)
            const glowStep = Math.max(1, Math.floor(this.segments.length / 30));

            for (let i = 1; i < this.segments.length; i += glowStep) {
                const p = camera.worldToScreen(this.segments[i].x, this.segments[i].y);
                ctx.lineTo(p.x, p.y);
            }

            ctx.strokeStyle = skinColors[0];
            ctx.lineWidth = growthSize * camera.zoom;
            ctx.globalAlpha = 0.4;
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // 3. Renderizar Segmentos (Usando cache)
        const renderRadius = growthSize * 2 * camera.zoom; // Margem de culling

        // Loop reverso (desenha cauda primeiro)
        for (let i = this.segments.length - 1; i >= 0; i -= step) {
            const segment = this.segments[i];

            // Culling (só desenha se visível na tela)
            if (!camera.isVisible(segment.x, segment.y, renderRadius)) continue;

            const screenPos = camera.worldToScreen(segment.x, segment.y);

            // Selecionar gradiente do cache
            let gradIndex = 0;
            if (isMultiColor) {
                // Lógica de padrão simplificada para performance
                // Usa o índice do segmento para ciclar as cores
                gradIndex = Math.floor(i / 8) % gradientCache.length;
            }

            // Desenhar usando Translate + Gradiente Cacheado
            ctx.translate(screenPos.x, screenPos.y);
            ctx.fillStyle = gradientCache[gradIndex];
            ctx.beginPath();
            ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.translate(-screenPos.x, -screenPos.y); // Reset translate (mais rápido que save/restore)
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

    drawDragonHead(ctx, size) {
        // Cores da imagem
        const scaleDark = '#4a148c';   // Roxo profundo (sombra)
        const scaleMid = '#7b1fa2';    // Roxo médio (base)
        const scaleLight = '#ae52d4';  // Roxo claro (luz)
        const energyColor = '#00ffff'; // Ciano neon (rachaduras)
        const hornGold = '#ffd700';    // Dourado
        const hornShadow = '#b8860b';  // Sombra dourada

        // Contorno Branco (Sticker)
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = size * 0.18;
        ctx.strokeStyle = '#ffffff';

        // PATH DO CONTORNO GERAL (Para o stroke branco ficar por baixo)
        ctx.beginPath();
        // Topo com pontas
        ctx.moveTo(-size * 0.5, -size * 0.4);
        ctx.lineTo(-size * 0.2, -size * 0.6); // Ponta centro esq
        ctx.lineTo(0, -size * 0.5);           // Centro
        ctx.lineTo(size * 0.2, -size * 0.6);  // Ponta centro dir
        ctx.lineTo(size * 0.5, -size * 0.4);
        // Lateral Dir (Cristas)
        ctx.quadraticCurveTo(size * 1.1, -size * 0.2, size * 0.9, size * 0.2);
        ctx.quadraticCurveTo(size * 1.0, size * 0.5, size * 0.4, size * 0.7);
        // Queixo
        ctx.quadraticCurveTo(0, size * 0.9, -size * 0.4, size * 0.7);
        // Lateral Esq
        ctx.quadraticCurveTo(-size * 1.0, size * 0.5, -size * 0.9, size * 0.2);
        ctx.quadraticCurveTo(-size * 1.1, -size * 0.2, -size * 0.5, -size * 0.4);
        ctx.closePath();

        ctx.stroke(); // Desenha o contorno branco

        // 1. FUNDO ENERGIA (Base que vai brilhar nas frestas)
        ctx.fillStyle = energyColor;
        ctx.shadowColor = energyColor;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Função auxiliar para desenhar uma "Placa de Escama" com volume
        const drawScale = (x, y, scaleW, scaleH, rotation = 0) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            ctx.beginPath();
            // Formato irregular de pedra
            ctx.moveTo(-scaleW / 2, -scaleH / 3);
            ctx.lineTo(0, -scaleH / 2);
            ctx.lineTo(scaleW / 2, -scaleH / 3);
            ctx.lineTo(scaleW / 2, scaleH / 3);
            ctx.lineTo(0, scaleH / 2);
            ctx.lineTo(-scaleW / 2, scaleH / 3);
            ctx.closePath();

            // Sombra interna (Bevel)
            ctx.fillStyle = scaleDark;
            ctx.fill();

            // Parte superior (Luz)
            ctx.fillStyle = scaleMid;
            ctx.beginPath();
            ctx.ellipse(0, 0, scaleW * 0.35, scaleH * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();

            // Reflexo de aresta
            ctx.strokeStyle = scaleLight;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        };

        // 2. DESENHAR AS PLACAS (Deixando gaps para a energia aparecer)
        // Testa Central
        drawScale(0, -size * 0.35, size * 0.4, size * 0.4);

        // Testa Esquerda/Direita
        drawScale(-size * 0.35, -size * 0.25, size * 0.35, size * 0.35, -0.2);
        drawScale(size * 0.35, -size * 0.25, size * 0.35, size * 0.35, 0.2);

        // Bochechas Centro
        drawScale(-size * 0.6, size * 0.1, size * 0.3, size * 0.4, -0.4);
        drawScale(size * 0.6, size * 0.1, size * 0.3, size * 0.4, 0.4);

        // Bochechas Baixo
        drawScale(-size * 0.45, size * 0.45, size * 0.3, size * 0.35, -0.2);
        drawScale(size * 0.45, size * 0.45, size * 0.3, size * 0.35, 0.2);

        // Queixo
        drawScale(0, size * 0.6, size * 0.4, size * 0.3);

        // Nariz (Centro)
        ctx.save();
        ctx.translate(0, size * 0.2);
        ctx.fillStyle = scaleMid;
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, -size * 0.1);
        ctx.lineTo(size * 0.2, -size * 0.1);
        ctx.lineTo(0, size * 0.2);
        ctx.fill();
        // Narinas
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.arc(-size * 0.08, 0, size * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.08, 0, size * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // 3. CHIFRES (Sobrepostos atrás ou na frente)
        // Desenhar chifres AGORA para ficarem nítidos
        const drawHorn = (mx, my, rot) => {
            ctx.save();
            ctx.translate(mx, my);
            ctx.rotate(rot);
            // Gradiente Dourado
            const grad = ctx.createLinearGradient(-size * 0.1, 0, size * 0.1, 0);
            grad.addColorStop(0, hornShadow);
            grad.addColorStop(0.5, hornGold);
            grad.addColorStop(1, hornShadow);
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(-size * 0.2, 0);
            ctx.quadraticCurveTo(0, -size * 0.6, 0, -size * 0.8); // Ponta
            ctx.quadraticCurveTo(size * 0.1, -size * 0.6, size * 0.2, 0);
            ctx.fill();

            // Anéis
            ctx.strokeStyle = hornShadow;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-size * 0.18, -size * 0.2); ctx.lineTo(size * 0.18, -size * 0.2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-size * 0.12, -size * 0.4); ctx.lineTo(size * 0.12, -size * 0.4); ctx.stroke();

            ctx.restore();
        };

        drawHorn(-size * 0.4, -size * 0.5, -0.4);
        drawHorn(size * 0.4, -size * 0.5, 0.4);


        // 4. OLHOS KAWAII (Sobrepor tudo)
        const eyeX = size * 0.35;
        const eyeY = -size * 0.05;
        const eyeRadius = size * 0.28;

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Brilho Principal (Grande)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-eyeX + eyeRadius * 0.3, eyeY - eyeRadius * 0.3, eyeRadius * 0.35, 0, Math.PI * 2);
        ctx.arc(eyeX + eyeRadius * 0.3, eyeY - eyeRadius * 0.3, eyeRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Brilho Secundário (Pequeno)
        ctx.beginPath();
        ctx.arc(-eyeX - eyeRadius * 0.2, eyeY + eyeRadius * 0.3, eyeRadius * 0.15, 0, Math.PI * 2);
        ctx.arc(eyeX - eyeRadius * 0.2, eyeY + eyeRadius * 0.3, eyeRadius * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPizzaHead(ctx, size) {
        const crustColor = '#e3a15c'; // Cor da borda/massa assada
        const cheeseColor = '#ffcc33'; // Amarelo queijo vibrante
        const cheeseDark = '#fbb117'; // Sombra do queijo
        const pepperoniColor = '#cc3333'; // Vermelho pepperoni
        const pepperoniLight = '#ff6666'; // Brilho pepperoni
        const outlineColor = '#FFFFFF'; // Stroke estilo sticker

        // Contorno Branco Externo (Sticker)
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = size * 0.18;
        ctx.strokeStyle = outlineColor;

        // PATH GERAL (Triângulo arredondado com gotas)
        ctx.beginPath();
        // Canto Superior Esquerdo (Crosta)
        ctx.moveTo(-size * 0.8, -size * 0.6);
        // Topo Curvo (Crosta)
        ctx.quadraticCurveTo(0, -size * 0.8, size * 0.8, -size * 0.6);
        // Lado Direito descendo com queijo derretido
        ctx.quadraticCurveTo(size * 0.9, -size * 0.2, size * 0.6, size * 0.2);
        // Gota de queijo direita
        ctx.quadraticCurveTo(size * 0.7, size * 0.5, size * 0.5, size * 0.4);
        // Ponta de baixo (Queixo)
        ctx.quadraticCurveTo(0, size * 1.1, -size * 0.5, size * 0.4);
        // Gota de queijo esquerda
        ctx.quadraticCurveTo(-size * 0.7, size * 0.5, -size * 0.6, size * 0.2);
        // Lado Esquerdo subindo
        ctx.quadraticCurveTo(-size * 0.9, -size * 0.2, -size * 0.8, -size * 0.6);
        ctx.closePath();

        ctx.stroke(); // Contorno branco

        // 1. MASSA/CROSTA (Base)
        ctx.fillStyle = crustColor;
        ctx.fill();

        // 2. QUEIJO (Camada interna)
        ctx.fillStyle = cheeseColor;
        ctx.beginPath();
        // Margem da crosta
        const crustMargin = size * 0.2;
        ctx.moveTo(-size * 0.7 + crustMargin / 2, -size * 0.6 + crustMargin);
        // Topo do queijo (acompanha crosta mas mais baixo)
        ctx.quadraticCurveTo(0, -size * 0.7 + crustMargin, size * 0.7 - crustMargin / 2, -size * 0.6 + crustMargin);
        // Lado Dir (Derretendo)
        ctx.quadraticCurveTo(size * 0.8, -size * 0.1, size * 0.55, size * 0.25);
        ctx.quadraticCurveTo(size * 0.7, size * 0.55, size * 0.45, size * 0.45); // Gota
        // Ponta
        ctx.quadraticCurveTo(0, size * 0.9, -size * 0.45, size * 0.45);
        // Lado Esq (Derretendo)
        ctx.quadraticCurveTo(-size * 0.7, size * 0.55, -size * 0.55, size * 0.25);
        ctx.quadraticCurveTo(-size * 0.8, -size * 0.1, -size * 0.7 + crustMargin / 2, -size * 0.6 + crustMargin);
        ctx.fill();

        // Sombra suave no queijo
        ctx.fillStyle = cheeseDark;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
        ctx.globalCompositeOperation = 'source-atop'; // Só desenha onde já tem queijo
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over'; // Reset

        // 3. PEPPERONIS (Círculos vermelhos)
        const drawPepperoni = (x, y, r) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.fillStyle = pepperoniColor;
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
            // Detalhes internos (textura de carne)
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.2, r * 0.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(r * 0.2, r * 0.3, r * 0.15, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(r * 0.4, -r * 0.1, r * 0.1, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        };

        drawPepperoni(-size * 0.4, -size * 0.4, size * 0.18); // Esq Topo
        drawPepperoni(size * 0.4, -size * 0.4, size * 0.18);  // Dir Topo
        drawPepperoni(0, -size * 0.1, size * 0.15);           // Centro
        drawPepperoni(-size * 0.3, size * 0.5, size * 0.16);  // Esq Baixo
        drawPepperoni(size * 0.3, size * 0.5, size * 0.16);   // Dir Baixo

        // 4. ROSTO (Kawaii)
        const eyeX = size * 0.35;
        const eyeY = 0; // Centro
        const eyeSize = size * 0.22;

        // Olhos Pretos
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-eyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Brilhos
        ctx.fillStyle = '#FFFFFF';
        // Grandes
        ctx.beginPath(); ctx.arc(-eyeX + eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(eyeX + eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.35, 0, Math.PI * 2); ctx.fill();
        // Pequenos
        ctx.beginPath(); ctx.arc(-eyeX - eyeSize * 0.2, eyeY + eyeSize * 0.3, eyeSize * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(eyeX - eyeSize * 0.2, eyeY + eyeSize * 0.3, eyeSize * 0.15, 0, Math.PI * 2); ctx.fill();

        // Boca (Sorriso pequeno)
        ctx.strokeStyle = '#4a2c0f'; // Marrom escuro
        ctx.lineWidth = size * 0.06;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, size * 0.25, size * 0.15, 0, Math.PI); // Meio círculo
        ctx.stroke();
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
            case 'pizza': this.drawPizzaHead(ctx, headSize); break; // NOVA PIZZA
            case 'bear': // NOVO
                this.drawBearHead(ctx, headSize);
                break;
            case 'cool': this.drawCoolFace(ctx, headSize); break;
            case 'alien': this.drawAlienFace(ctx, headSize, faceConfig.eyeColor); break;
            case 'lion': this.drawLionHead(ctx, headSize); break;
            case 'dragon': this.drawDragonHead(ctx, headSize); break; // NOVO DRAGÃO
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

        // 1. Base do Olho (Preto ou Cor escura)
        ctx.fillStyle = '#000000';

        ctx.beginPath();
        if (expression === 'angry') {
            // Semicírculo truncado em cima
            ctx.arc(0, 0, eyeRadius, Math.PI, 0);
            ctx.lineTo(eyeRadius, -eyeRadius * 0.3);
            ctx.lineTo(-eyeRadius, -eyeRadius * 0.3);
        } else if (expression === 'happy') {
            // Arco sorrindo
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = size * 0.2;
            ctx.lineCap = 'round';
            ctx.moveTo(-eyeRadius * 0.8, 0);
            ctx.quadraticCurveTo(0, -eyeRadius, eyeRadius * 0.8, 0);
            ctx.stroke();
            ctx.restore();
            return;
        } else {
            // Normal (Redondo)
            ctx.arc(0, 0, eyeRadius, 0, Math.PI * 2);
        }
        ctx.fill();

        // 2. Íris (Se cor for diferente de preto/branco e não for angry)
        if (expression !== 'angry' && eyeColor !== '#000000' && eyeColor !== '#ffffff') {
            ctx.fillStyle = eyeColor;
            ctx.globalAlpha = 0.6; // Íris sutil
            ctx.beginPath();
            ctx.arc(0, size * 0.2, eyeRadius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        // 3. Brilhos (Essencial!)
        ctx.fillStyle = '#ffffff';
        // Brilho Grande
        ctx.beginPath();
        ctx.arc(-eyeRadius * 0.3, -eyeRadius * 0.3, eyeRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        // Brilho Pequeno
        ctx.beginPath();
        ctx.arc(eyeRadius * 0.2, eyeRadius * 0.3, eyeRadius * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Rosto Padrão (Olhos grandes e fofos)
    drawStandardFace(ctx, size, color) {
        // Contorno Branco Sticker
        ctx.lineWidth = size * 0.18;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2); ctx.stroke();

        const eyeSpacing = size * 0.35;
        this.drawCartoonEye(ctx, -eyeSpacing, -size * 0.1, size * 0.7, color || '#000000');
        this.drawCartoonEye(ctx, eyeSpacing, -size * 0.1, size * 0.7, color || '#000000');
    }

    // Rosto Fofo (Cute)
    drawCuteFace(ctx, size, color) {
        this.drawStandardFace(ctx, size, color);

        // Bochechas rosadas
        ctx.fillStyle = 'rgba(255, 105, 180, 0.6)'; // Rosa transparente
        ctx.beginPath();
        ctx.arc(-size * 0.6, size * 0.25, size * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.6, size * 0.25, size * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Boca pequena sorrindo
        ctx.strokeStyle = '#4a2c0f';
        ctx.lineWidth = size * 0.05;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, size * 0.2, size * 0.1, 0, Math.PI);
        ctx.stroke();
    }

    // Rosto Bravo (Angry)
    drawAngryFace(ctx, size, color) {
        // Contorno Branco
        ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2); ctx.stroke();

        const eyeSpacing = size * 0.35;
        this.drawCartoonEye(ctx, -eyeSpacing, 0, size * 0.65, color || '#ff0000', 'angry');
        this.drawCartoonEye(ctx, eyeSpacing, 0, size * 0.65, color || '#ff0000', 'angry');

        // Sobrancelhas franzidas
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(-size * 0.8, -size * 0.4); ctx.lineTo(-size * 0.2, -size * 0.1); ctx.lineTo(-size * 0.8, -size * 0.2); ctx.fill();
        ctx.moveTo(size * 0.8, -size * 0.4); ctx.lineTo(size * 0.2, -size * 0.1); ctx.lineTo(size * 0.8, -size * 0.2); ctx.fill();
    }

    drawHappyFace(ctx, size, color) {
        // Contorno Branco
        ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2); ctx.stroke();

        const eyeSpacing = size * 0.35;
        this.drawCartoonEye(ctx, -eyeSpacing, -size * 0.15, size * 0.65, color, 'happy');
        this.drawCartoonEye(ctx, eyeSpacing, -size * 0.15, size * 0.65, color, 'happy');

        // Boca Aberta Rindo
        ctx.fillStyle = '#4a2c0f';
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, size * 0.3);
        ctx.quadraticCurveTo(0, size * 0.7, size * 0.3, size * 0.3);
        ctx.fill();

        // Lingua
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath(); ctx.arc(0, size * 0.5, size * 0.1, 0, Math.PI * 2); ctx.fill();
    }

    drawCyclopsFace(ctx, size, color) {
        ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2); ctx.stroke();
        // Olho único gigante
        this.drawCartoonEye(ctx, 0, -size * 0.1, size * 1.3, color || '#ffff00');
    }

    drawCatFace(ctx, size, color) {
        const furColor = this.skin.colors[0];

        ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#FFFFFF';

        // Cabeça com Orelhas Sticke
        ctx.beginPath();
        ctx.moveTo(-size * 0.4, -size * 0.4);
        ctx.lineTo(-size * 0.7, -size * 0.9); ctx.lineTo(-size * 0.2, -size * 0.6); // Orelha Esq
        ctx.quadraticCurveTo(0, -size * 0.6, size * 0.2, -size * 0.6); // Topo
        ctx.lineTo(size * 0.7, -size * 0.9); ctx.lineTo(size * 0.4, -size * 0.4); // Orelha Dir
        ctx.quadraticCurveTo(size * 0.9, 0, size * 0.8, size * 0.5); // Lado Dir
        ctx.quadraticCurveTo(0, size * 0.9, -size * 0.8, size * 0.5); // Queixo
        ctx.quadraticCurveTo(-size * 0.9, 0, -size * 0.4, -size * 0.4); // Lado Esq
        ctx.closePath();

        ctx.stroke();
        ctx.fillStyle = furColor;
        ctx.fill();

        // Interior Orelhas
        ctx.fillStyle = '#ff99cc';
        ctx.beginPath(); ctx.moveTo(-size * 0.4, -size * 0.5); ctx.lineTo(-size * 0.6, -size * 0.8); ctx.lineTo(-size * 0.3, -size * 0.6); ctx.fill();
        ctx.beginPath(); ctx.moveTo(size * 0.4, -size * 0.5); ctx.lineTo(size * 0.6, -size * 0.8); ctx.lineTo(size * 0.3, -size * 0.6); ctx.fill();

        // Olhos Kawaii
        this.drawCartoonEye(ctx, -size * 0.35, 0, size * 0.65, '#000000');
        this.drawCartoonEye(ctx, size * 0.35, 0, size * 0.65, '#000000');

        // Focinho
        ctx.fillStyle = '#ff99cc';
        ctx.beginPath(); ctx.ellipse(0, size * 0.3, size * 0.1, size * 0.06, 0, 0, Math.PI * 2); ctx.fill();

        // Bigodes
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, size * 0.35); ctx.lineTo(-size * 0.6, size * 0.3);
        ctx.moveTo(-size * 0.2, size * 0.4); ctx.lineTo(-size * 0.6, size * 0.45);
        ctx.moveTo(size * 0.2, size * 0.35); ctx.lineTo(size * 0.6, size * 0.3);
        ctx.moveTo(size * 0.2, size * 0.4); ctx.lineTo(size * 0.6, size * 0.45);
        ctx.stroke();
    }

    drawPandaFace(ctx, size, color) {
        const whiteFur = '#FFFFFF';
        const blackFur = '#000000';

        // Orelhas Pretas (Atrás)
        ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#FFFFFF';
        ctx.save();
        ctx.fillStyle = blackFur;
        ctx.beginPath(); ctx.arc(-size * 0.7, -size * 0.6, size * 0.25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(size * 0.7, -size * 0.6, size * 0.25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();

        // Cabeça Branca (Frente)
        ctx.beginPath(); ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = whiteFur; ctx.fill();

        // Manchas
        ctx.fillStyle = blackFur;
        ctx.beginPath(); ctx.ellipse(-size * 0.35, 0, size * 0.25, size * 0.2, -Math.PI / 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(size * 0.35, 0, size * 0.25, size * 0.2, Math.PI / 6, 0, Math.PI * 2); ctx.fill();

        // Olhos Brilhantes (sobre o preto)
        const eyeY = -size * 0.05;
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(-size * 0.3, eyeY - size * 0.05, size * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-size * 0.4, eyeY + size * 0.05, size * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.3, eyeY - size * 0.05, size * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.4, eyeY + size * 0.05, size * 0.04, 0, Math.PI * 2); ctx.fill();

        // Nariz
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.ellipse(0, size * 0.4, size * 0.1, size * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    }

    drawCoolFace(ctx, size) {
        ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2); ctx.stroke();

        // Óculos Aviador
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        // Lente Esq
        ctx.moveTo(-size * 0.05, -size * 0.2);
        ctx.quadraticCurveTo(-size * 0.4, -size * 0.2, -size * 0.4, size * 0.1);
        ctx.quadraticCurveTo(-size * 0.2, size * 0.4, -size * 0.05, size * 0.1);
        // Lente Dir
        ctx.moveTo(size * 0.05, -size * 0.2);
        ctx.quadraticCurveTo(size * 0.4, -size * 0.2, size * 0.4, size * 0.1);
        ctx.quadraticCurveTo(size * 0.2, size * 0.4, size * 0.05, size * 0.1);
        ctx.fill();

        // Haste
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-size * 0.05, -size * 0.2); ctx.lineTo(size * 0.05, -size * 0.2); ctx.stroke();

        // Reflexo
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, -size * 0.1); ctx.lineTo(-size * 0.1, -size * 0.1); ctx.lineTo(-size * 0.3, size * 0.1); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size * 0.1, -size * 0.1); ctx.lineTo(size * 0.3, -size * 0.1); ctx.lineTo(size * 0.1, size * 0.1); ctx.fill();

        // Sorriso
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-size * 0.2, size * 0.5); ctx.quadraticCurveTo(0, size * 0.6, size * 0.2, size * 0.45); ctx.stroke();
    }

    drawAlienFace(ctx, size, color) {
        const alienColor = '#66ff66';
        ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#FFFFFF';
        ctx.lineJoin = 'round';

        // Cabeça Pera
        ctx.beginPath();
        ctx.moveTo(0, size * 0.8);
        ctx.quadraticCurveTo(size * 0.7, size * 0.3, size * 0.8, -size * 0.5);
        ctx.quadraticCurveTo(0, -size * 1.0, -size * 0.8, -size * 0.5);
        ctx.quadraticCurveTo(-size * 0.7, size * 0.3, 0, size * 0.8);
        ctx.closePath();

        ctx.stroke();
        ctx.fillStyle = color || alienColor; ctx.fill();

        // Olhos Alien
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.ellipse(-size * 0.35, -size * 0.1, size * 0.25, size * 0.4, -Math.PI / 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(size * 0.35, -size * 0.1, size * 0.25, size * 0.4, Math.PI / 6, 0, Math.PI * 2); ctx.fill();

        // Brilho
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(-size * 0.4, -size * 0.2, size * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.4, -size * 0.2, size * 0.05, 0, Math.PI * 2); ctx.fill();
    }

    drawCowHead(ctx, size) {
        ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#FFFFFF';

        // Cabeça quadrada arredondada
        ctx.beginPath();
        ctx.moveTo(-size * 0.7, -size * 0.6);
        ctx.lineTo(size * 0.7, -size * 0.6); // Topo
        ctx.quadraticCurveTo(size * 0.9, -size * 0.6, size * 0.9, 0); // Dir
        ctx.quadraticCurveTo(size * 0.9, size * 0.8, size * 0.5, size * 0.8); // Baixo Dir
        ctx.lineTo(-size * 0.5, size * 0.8); // Baixo Esq
        ctx.quadraticCurveTo(-size * 0.9, size * 0.8, -size * 0.9, 0); // Esq
        ctx.quadraticCurveTo(-size * 0.9, -size * 0.6, -size * 0.7, -size * 0.6);
        ctx.closePath();

        ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; // Branca
        ctx.fill();

        // Manchas Pretas
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.moveTo(size * 0.9, -size * 0.4); ctx.arc(size * 0.9, -size * 0.4, size * 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-size * 0.9, 0.2); ctx.arc(-size * 0.8, size * 0.2, size * 0.3, 0, Math.PI * 2); ctx.fill();

        // Chifres
        ctx.fillStyle = '#e0e0e0';
        ctx.beginPath(); ctx.moveTo(-size * 0.7, -size * 0.6); ctx.lineTo(-size * 0.9, -size * 0.9); ctx.lineTo(-size * 0.5, -size * 0.7); ctx.fill();
        ctx.beginPath(); ctx.moveTo(size * 0.7, -size * 0.6); ctx.lineTo(size * 0.9, -size * 0.9); ctx.lineTo(size * 0.5, -size * 0.7); ctx.fill();

        // Orelhas
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.ellipse(-size * 0.95, -size * 0.3, size * 0.25, size * 0.15, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(size * 0.95, -size * 0.3, size * 0.25, size * 0.15, Math.PI / 4, 0, Math.PI * 2); ctx.fill();

        // Focinho Rosa
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.moveTo(-size * 0.6, size * 0.3);
        ctx.lineTo(size * 0.6, size * 0.3);
        ctx.quadraticCurveTo(size * 0.6, size * 0.8, 0, size * 0.8);
        ctx.quadraticCurveTo(-size * 0.6, size * 0.8, -size * 0.6, size * 0.3);
        ctx.fill();

        // Narinas
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.arc(-size * 0.3, size * 0.55, size * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.3, size * 0.55, size * 0.06, 0, Math.PI * 2); ctx.fill();

        // Olhos Sticker
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
        ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#FFFFFF';

        // Orelhas Longas (Devem fazer parte do stroke)
        ctx.beginPath();
        // Orelha Esq
        ctx.moveTo(-size * 0.3, -size * 0.5);
        ctx.lineTo(-size * 0.4, -size * 1.3); // Ponta
        ctx.quadraticCurveTo(-size * 0.1, -size * 1.3, -size * 0.1, -size * 0.5);
        // Topo cabeça
        ctx.lineTo(size * 0.1, -size * 0.5);
        // Orelha Dir
        ctx.lineTo(size * 0.1, -size * 1.3);
        ctx.quadraticCurveTo(size * 0.4, -size * 1.3, size * 0.3, -size * 0.5);
        // Cabeça Lados
        ctx.quadraticCurveTo(size * 0.8, -size * 0.3, size * 0.8, size * 0.3);
        ctx.quadraticCurveTo(0, size * 1.0, -size * 0.8, size * 0.3);
        ctx.quadraticCurveTo(-size * 0.8, -size * 0.3, -size * 0.3, -size * 0.5);
        ctx.closePath();

        ctx.stroke();
        ctx.fillStyle = this.skin.colors[0]; // Cor do coelho
        ctx.fill();

        // Interior Orelhas
        ctx.fillStyle = '#ffccdd';
        ctx.beginPath(); ctx.ellipse(-size * 0.25, -size * 0.9, size * 0.08, size * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(size * 0.25, -size * 0.9, size * 0.08, size * 0.2, 0, 0, Math.PI * 2); ctx.fill();

        // Nariz
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath(); ctx.arc(0, size * 0.3, size * 0.1, 0, Math.PI * 2); ctx.fill();

        // Dentes
        ctx.fillStyle = 'white';
        ctx.fillRect(-size * 0.1, size * 0.4, size * 0.08, size * 0.12);
        ctx.fillRect(size * 0.02, size * 0.4, size * 0.08, size * 0.12);

        // Olhos
        this.drawStandardFace(ctx, size, '#000000');
    }

    drawBearHead(ctx, size) {
        const furColor = this.skin.colors[1] || this.skin.colors[0];
        const muzzleColor = '#e3c6a0';

        ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#FFFFFF';

        // Cabeça redonda com orelhas arredondadas (Path contínuo para stroke perfeito)
        ctx.beginPath();
        ctx.moveTo(-size * 0.4, -size * 0.5); // Base orelha esq
        ctx.quadraticCurveTo(-size * 0.8, -size * 0.9, -size * 0.9, -size * 0.4); // Orelha esq
        ctx.quadraticCurveTo(-size * 0.9, 0, -size * 0.7, size * 0.5); // Lado esq
        ctx.quadraticCurveTo(0, size * 0.9, size * 0.7, size * 0.5); // Queixo
        ctx.quadraticCurveTo(size * 0.9, 0, size * 0.9, -size * 0.4); // Lado dir
        ctx.quadraticCurveTo(size * 0.8, -size * 0.9, size * 0.4, -size * 0.5); // Orelha dir
        ctx.quadraticCurveTo(0, -size * 0.6, -size * 0.4, -size * 0.5); // Topo
        ctx.closePath();

        ctx.stroke();
        ctx.fillStyle = furColor;
        ctx.fill();

        // Orelhas internas (redondas)
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; // Sombra escura
        ctx.beginPath(); ctx.arc(-size * 0.65, -size * 0.6, size * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.65, -size * 0.6, size * 0.1, 0, Math.PI * 2); ctx.fill();

        // Focinho
        ctx.fillStyle = muzzleColor;
        ctx.beginPath(); ctx.ellipse(0, size * 0.35, size * 0.35, size * 0.25, 0, 0, Math.PI * 2); ctx.fill();

        // Nariz
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.ellipse(0, size * 0.25, size * 0.12, size * 0.08, 0, 0, Math.PI * 2); ctx.fill();

        // Olhos Kawaii
        this.drawStandardFace(ctx, size, '#000000');
    }

    drawLionHead(ctx, size) {
        const maneColor = '#c65102'; // Marrom avermelhado
        const faceColor = '#fecb4e'; // Dourado

        ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#FFFFFF';

        // Juba (Círculo irregular ou flor - simplificado para sticker como círculo grande)
        ctx.beginPath();
        // Juba ondulada
        const segments = 12;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const r = size * 1.15;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else {
                // Ponto de controle para curva (mais para dentro)
                const prevAngle = ((i - 0.5) / segments) * Math.PI * 2;
                const cr = size * 1.0;
                const cx = Math.cos(prevAngle) * cr;
                const cy = Math.sin(prevAngle) * cr;
                ctx.quadraticCurveTo(cx, cy, px, py);
            }
        }
        ctx.closePath();

        ctx.stroke();
        ctx.fillStyle = maneColor;
        ctx.fill();

        // Rosto
        ctx.beginPath(); ctx.arc(0, size * 0.1, size * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = faceColor;
        ctx.fill();

        // Orelhas
        ctx.fillStyle = faceColor;
        ctx.beginPath(); ctx.arc(-size * 0.5, -size * 0.4, size * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * 0.5, -size * 0.4, size * 0.18, 0, Math.PI * 2); ctx.fill();

        // Focinho branco
        ctx.fillStyle = '#fff4e6';
        ctx.beginPath(); ctx.ellipse(0, size * 0.45, size * 0.25, size * 0.2, 0, 0, Math.PI * 2); ctx.fill();

        // Nariz
        ctx.fillStyle = '#5c3a21';
        ctx.beginPath();
        // Triângulo invertido arredondado
        ctx.moveTo(-size * 0.15, size * 0.35);
        ctx.quadraticCurveTo(0, size * 0.3, size * 0.15, size * 0.35);
        ctx.quadraticCurveTo(0, size * 0.6, -size * 0.15, size * 0.35);
        ctx.fill();

        // Olhos Kawaii
        this.drawStandardFace(ctx, size * 0.9, '#000000'); // Olhos levemente menores
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
