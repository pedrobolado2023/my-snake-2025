// Papai Noel decorativo no centro do mapa
class SantaClaus {
    constructor() {
        this.x = 0; // Centro do mapa
        this.y = 0;
        this.size = 80; // Tamanho do Papai Noel
        this.rotation = 0;
        this.rotationSpeed = 0.001; // Rotação lenta
    }

    update(deltaTime) {
        // Rotação suave
        this.rotation += this.rotationSpeed * deltaTime;
    }

    render(ctx, camera) {
        ctx.save();

        // Converter para coordenadas da tela
        const screenX = (this.x - camera.x) * camera.zoom + ctx.canvas.width / 2;
        const screenY = (this.y - camera.y) * camera.zoom + ctx.canvas.height / 2;

        // Só renderizar se estiver visível
        if (screenX < -this.size * 2 || screenX > ctx.canvas.width + this.size * 2 ||
            screenY < -this.size * 2 || screenY > ctx.canvas.height + this.size * 2) {
            ctx.restore();
            return;
        }

        ctx.translate(screenX, screenY);
        ctx.rotate(this.rotation);
        ctx.scale(camera.zoom, camera.zoom);

        // Desenhar Papai Noel simplificado
        this.drawSanta(ctx);

        ctx.restore();
    }

    drawSanta(ctx) {
        const size = this.size;

        // Corpo (vermelho)
        ctx.fillStyle = '#DC143C'; // Vermelho Natal
        ctx.beginPath();
        ctx.ellipse(0, 10, size * 0.4, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça (bege/pele)
        ctx.fillStyle = '#FFD4A3';
        ctx.beginPath();
        ctx.arc(0, -size * 0.3, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Gorro (vermelho)
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, -size * 0.3);
        ctx.lineTo(size * 0.3, -size * 0.3);
        ctx.lineTo(size * 0.1, -size * 0.7);
        ctx.closePath();
        ctx.fill();

        // Pompom do gorro (branco)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(size * 0.1, -size * 0.7, size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Borda do gorro (branca)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-size * 0.3, -size * 0.35, size * 0.6, size * 0.1);

        // Barba (branca)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.1, size * 0.25, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cinto (preto)
        ctx.fillStyle = '#000000';
        ctx.fillRect(-size * 0.4, size * 0.1, size * 0.8, size * 0.15);

        // Fivela do cinto (dourada)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-size * 0.1, size * 0.1, size * 0.2, size * 0.15);

        // Olhos
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-size * 0.1, -size * 0.35, size * 0.04, 0, Math.PI * 2);
        ctx.arc(size * 0.1, -size * 0.35, size * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // Brilho nos olhos
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-size * 0.08, -size * 0.37, size * 0.02, 0, Math.PI * 2);
        ctx.arc(size * 0.12, -size * 0.37, size * 0.02, 0, Math.PI * 2);
        ctx.fill();

        // Nariz (vermelho)
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(0, -size * 0.25, size * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // Botões (dourados)
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, -size * 0.1 + i * size * 0.2, size * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sombra/contorno para destaque
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 10, size * 0.4, size * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SantaClaus;
}
