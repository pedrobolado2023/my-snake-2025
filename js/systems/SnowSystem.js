// Sistema de Neve para Tema de Natal - OTIMIZADO ⚡
class SnowSystem {
    constructor() {
        this.snowflakes = [];
        // Reduzido de 100 para 30 (70% menos) para melhor performance
        this.maxSnowflakes = Utils.isTouchDevice() ? 20 : 30;
        this.enabled = true;

        // Criar flocos iniciais
        this.initSnowflakes();
    }

    initSnowflakes() {
        for (let i = 0; i < this.maxSnowflakes; i++) {
            this.snowflakes.push(this.createSnowflake());
        }
    }

    createSnowflake() {
        return {
            x: Math.random() * CONFIG.ARENA_SIZE - CONFIG.ARENA_SIZE / 2,
            y: Math.random() * CONFIG.ARENA_SIZE - CONFIG.ARENA_SIZE / 2,
            size: Math.random() * 3 + 1, // Tamanho entre 1 e 4
            speed: Math.random() * 0.5 + 0.2, // Velocidade de queda
            drift: Math.random() * 0.3 - 0.15, // Movimento horizontal
            opacity: Math.random() * 0.5 + 0.3 // Opacidade entre 0.3 e 0.8
        };
    }

    update(deltaTime) {
        if (!this.enabled) return;

        // Limitar deltaTime para evitar saltos grandes
        const dt = Math.min(deltaTime, 50);

        this.snowflakes.forEach(flake => {
            // Mover para baixo
            flake.y += flake.speed * dt * 0.1;

            // Movimento horizontal (drift)
            flake.x += flake.drift * dt * 0.1;

            // Resetar quando sair da tela
            const maxPos = CONFIG.ARENA_SIZE / 2;
            if (flake.y > maxPos) {
                flake.y = -maxPos;
                flake.x = Math.random() * CONFIG.ARENA_SIZE - CONFIG.ARENA_SIZE / 2;
            }

            // Manter dentro dos limites horizontais
            if (flake.x > maxPos) flake.x = -maxPos;
            if (flake.x < -maxPos) flake.x = maxPos;
        });
    }

    render(ctx, camera) {
        if (!this.enabled) return;

        ctx.save();

        // Otimização: calcular bounds visíveis uma vez
        const bounds = camera.getVisibleBounds();
        const margin = 50;

        let rendered = 0;
        const maxRender = Utils.isTouchDevice() ? 15 : 30;

        this.snowflakes.forEach(flake => {
            // Otimização: renderizar apenas flocos visíveis
            if (flake.x < bounds.left - margin || flake.x > bounds.right + margin ||
                flake.y < bounds.top - margin || flake.y > bounds.bottom + margin) {
                return;
            }

            // Limitar quantidade renderizada no mobile
            if (rendered >= maxRender) return;
            rendered++;
            // Converter para coordenadas da tela
            const screenX = (flake.x - camera.x) * camera.zoom + ctx.canvas.width / 2;
            const screenY = (flake.y - camera.y) * camera.zoom + ctx.canvas.height / 2;

            // Só renderizar se estiver visível
            if (screenX < -10 || screenX > ctx.canvas.width + 10 ||
                screenY < -10 || screenY > ctx.canvas.height + 10) {
                return;
            }

            // Desenhar floco de neve
            ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, flake.size * camera.zoom, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    toggle() {
        this.enabled = !this.enabled;
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnowSystem;
}
