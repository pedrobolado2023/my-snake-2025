// Funções Utilitárias

const Utils = {
    /**
     * Gera um número aleatório entre min e max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Gera um inteiro aleatório entre min e max
     */
    randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    },

    /**
     * Escolhe um elemento aleatório de um array
     */
    randomChoice(array) {
        return array[this.randomInt(0, array.length - 1)];
    },

    /**
     * Gera um ID único
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Calcula a distância entre dois pontos
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Calcula o ângulo entre dois pontos
     */
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Interpola linearmente entre dois valores
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    /**
     * Limita um valor entre min e max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Normaliza um ângulo entre -PI e PI
     */
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    },

    /**
     * Interpola entre dois ângulos pelo caminho mais curto
     */
    lerpAngle(start, end, factor) {
        const diff = this.normalizeAngle(end - start);
        return start + diff * factor;
    },

    /**
     * Verifica se um ponto está dentro de um círculo
     */
    isPointInCircle(px, py, cx, cy, radius) {
        return this.distance(px, py, cx, cy) <= radius;
    },

    /**
     * Verifica se dois círculos colidem
     */
    circleCollision(x1, y1, r1, x2, y2, r2) {
        return this.distance(x1, y1, x2, y2) <= (r1 + r2);
    },

    /**
     * Verifica se um ponto está dentro da arena
     */
    isInArena(x, y) {
        if (CONFIG.ARENA_SHAPE === 'circle') {
            const center = CONFIG.ARENA_SIZE / 2;
            const radius = CONFIG.ARENA_SIZE / 2 - CONFIG.ARENA_BORDER_WIDTH;
            return this.distance(x, y, center, center) <= radius;
        } else {
            const margin = CONFIG.ARENA_BORDER_WIDTH;
            return x >= margin &&
                x <= CONFIG.ARENA_SIZE - margin &&
                y >= margin &&
                y <= CONFIG.ARENA_SIZE - margin;
        }
    },

    /**
     * Gera uma posição aleatória dentro da arena
     */
    randomPositionInArena() {
        if (CONFIG.ARENA_SHAPE === 'circle') {
            const center = CONFIG.ARENA_SIZE / 2;
            const maxRadius = CONFIG.ARENA_SIZE / 2 - CONFIG.ARENA_BORDER_WIDTH - 100;

            // Gerar posição aleatória em círculo
            const angle = this.random(0, Math.PI * 2);
            const radius = Math.sqrt(this.random(0, 1)) * maxRadius;

            return {
                x: center + Math.cos(angle) * radius,
                y: center + Math.sin(angle) * radius
            };
        } else {
            const margin = CONFIG.ARENA_BORDER_WIDTH + 100;
            return {
                x: this.random(margin, CONFIG.ARENA_SIZE - margin),
                y: this.random(margin, CONFIG.ARENA_SIZE - margin)
            };
        }
    },

    /**
     * Formata tempo em minutos:segundos
     */
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Formata número com separador de milhares
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    /**
     * Cria um gradiente de cores
     */
    createGradient(ctx, x, y, radius, colors) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

        if (colors.length === 1) {
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[0]);
        } else {
            colors.forEach((color, index) => {
                gradient.addColorStop(index / (colors.length - 1), color);
            });
        }

        return gradient;
    },

    /**
     * Adiciona brilho (glow) a um elemento
     */
    drawGlow(ctx, x, y, radius, color, intensity = 0.5) {
        ctx.save();
        ctx.shadowBlur = radius * intensity;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    /**
     * Desenha texto com brilho
     */
    drawGlowText(ctx, text, x, y, color, fontSize = 16, intensity = 10) {
        ctx.save();
        ctx.font = `${fontSize}px 'Orbitron', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = intensity;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
    },

    /**
     * Converte HSL para RGB
     */
    hslToRgb(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    },

    /**
     * Escurece uma cor hex
     */
    darkenColor(color, percent) {
        let num = parseInt(color.replace("#", ""), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) - amt,
            B = (num >> 8 & 0x00FF) - amt,
            G = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
    },

    /**
     * Gera uma cor aleatória em HSL
     */
    randomColor(saturation = 100, lightness = 50) {
        const hue = this.random(0, 360);
        return this.hslToRgb(hue, saturation, lightness);
    },

    /**
     * Detecta se é dispositivo móvel
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Detecta se é touch device
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
