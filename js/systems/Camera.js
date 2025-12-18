// Sistema de Câmera
class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.targetX = 0;
        this.targetY = 0;
        this.targetZoom = 1;
    }

    follow(snake) {
        if (!snake || snake.isDead) return;

        // Definir posição alvo
        this.targetX = snake.x;
        this.targetY = snake.y;

        // Calcular zoom baseado no comprimento da cobra
        const baseZoom = 1;
        const zoomReduction = snake.length * CONFIG.ZOOM_FACTOR;
        this.targetZoom = Utils.clamp(
            baseZoom - zoomReduction,
            CONFIG.ZOOM_MIN,
            CONFIG.ZOOM_MAX
        );
    }

    update() {
        // Interpolar posição suavemente
        this.x = Utils.lerp(this.x, this.targetX, CONFIG.CAMERA_LERP_FACTOR);
        this.y = Utils.lerp(this.y, this.targetY, CONFIG.CAMERA_LERP_FACTOR);

        // Interpolar zoom suavemente
        this.zoom = Utils.lerp(this.zoom, this.targetZoom, CONFIG.CAMERA_LERP_FACTOR);
    }

    worldToScreen(worldX, worldY) {
        const screenX = (worldX - this.x) * this.zoom + this.canvas.width / 2;
        const screenY = (worldY - this.y) * this.zoom + this.canvas.height / 2;
        return { x: screenX, y: screenY };
    }

    screenToWorld(screenX, screenY) {
        const worldX = (screenX - this.canvas.width / 2) / this.zoom + this.x;
        const worldY = (screenY - this.canvas.height / 2) / this.zoom + this.y;
        return { x: worldX, y: worldY };
    }

    isVisible(worldX, worldY, margin = 0) {
        const screenPos = this.worldToScreen(worldX, worldY);
        const buffer = margin * this.zoom + 100; // Buffer extra

        return screenPos.x >= -buffer &&
            screenPos.x <= this.canvas.width + buffer &&
            screenPos.y >= -buffer &&
            screenPos.y <= this.canvas.height + buffer;
    }

    getVisibleBounds() {
        const topLeft = this.screenToWorld(0, 0);
        const bottomRight = this.screenToWorld(this.canvas.width, this.canvas.height);

        return {
            left: topLeft.x,
            top: topLeft.y,
            right: bottomRight.x,
            bottom: bottomRight.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };
    }

    shake(intensity = 5, duration = 200) {
        // Efeito de tremor (pode ser implementado depois)
        // Por enquanto, apenas um placeholder
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Camera;
}
