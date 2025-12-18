// Classe Particle - Efeitos visuais de partículas
class Particle {
    constructor(x, y, color, type = 'default') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.createdAt = Date.now();
        this.lifetime = CONFIG.PARTICLE_LIFETIME;

        // Física
        this.vx = Utils.random(-100, 100);
        this.vy = Utils.random(-100, 100);
        this.friction = 0.95;
        this.gravity = type === 'death' ? 50 : 0;

        // Visual
        this.size = Utils.random(3, 8);
        this.alpha = 1;
        this.rotation = Utils.random(0, Math.PI * 2);
        this.rotationSpeed = Utils.random(-5, 5);
    }

    update(deltaTime) {
        const dt = deltaTime / 1000;

        // Atualizar posição
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Aplicar fricção
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Aplicar gravidade
        this.vy += this.gravity * dt;

        // Atualizar rotação
        this.rotation += this.rotationSpeed * dt;

        // Fade out
        const age = Date.now() - this.createdAt;
        this.alpha = 1 - (age / this.lifetime);
    }

    render(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y);

        if (!camera.isVisible(this.x, this.y, this.size)) {
            return;
        }

        ctx.save();
        ctx.globalAlpha = this.alpha;

        // Desenhar partícula baseada no tipo
        switch (this.type) {
            case 'death':
                this.renderDeathParticle(ctx, screenPos, camera);
                break;
            case 'boost':
                this.renderBoostParticle(ctx, screenPos, camera);
                break;
            case 'eat':
                this.renderEatParticle(ctx, screenPos, camera);
                break;
            default:
                this.renderDefaultParticle(ctx, screenPos, camera);
        }

        ctx.restore();
    }

    renderDefaultParticle(ctx, screenPos, camera) {
        const size = this.size * camera.zoom;

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10 * camera.zoom;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    renderDeathParticle(ctx, screenPos, camera) {
        const size = this.size * camera.zoom;

        ctx.translate(screenPos.x, screenPos.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15 * camera.zoom;
        ctx.shadowColor = this.color;

        // Desenhar quadrado rotacionado
        ctx.fillRect(-size / 2, -size / 2, size, size);
    }

    renderBoostParticle(ctx, screenPos, camera) {
        const size = this.size * camera.zoom;

        // Criar gradiente
        const gradient = ctx.createRadialGradient(
            screenPos.x, screenPos.y, 0,
            screenPos.x, screenPos.y, size
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 20 * camera.zoom;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    renderEatParticle(ctx, screenPos, camera) {
        const size = this.size * camera.zoom;

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 12 * camera.zoom;
        ctx.shadowColor = this.color;

        // Desenhar estrela pequena
        ctx.translate(screenPos.x, screenPos.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    isDead() {
        return Date.now() - this.createdAt > this.lifetime;
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Particle;
}
