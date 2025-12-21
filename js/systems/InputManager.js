// Sistema de Gerenciamento de Input
class InputManager {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;

        // Mouse
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseWorldX = 0;
        this.mouseWorldY = 0;

        // Teclado
        this.keys = {};

        // Touch/Mobile
        this.touches = {};
        this.joystickActive = false;
        this.joystickAngle = 0;

        // Boost
        this.boostActive = false;

        // Inicializar event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Teclado
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Touch
        if (Utils.isTouchDevice()) {
            this.setupTouchControls();
        }

        // Prevenir menu de contexto
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupTouchControls() {
        const joystickContainer = document.getElementById('joystick-container');
        const joystickStick = document.getElementById('joystick-stick');
        const boostButton = document.getElementById('mobile-boost');
        const mobileControls = document.getElementById('mobile-controls');

        if (joystickContainer && joystickStick && mobileControls) {
            // Ocultar joystick inicialmente
            joystickContainer.style.display = 'none';

            // Joystick Dinâmico: Ouvir toques na tela inteira (camada mobile-controls)
            mobileControls.addEventListener('touchstart', (e) => {
                // Ignorar se tocou no botão de boost
                if (e.target.closest('#mobile-boost')) return;

                e.preventDefault();

                // Reposicionar joystick onde tocou
                const touch = e.touches[0];
                const rect = mobileControls.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;

                // Ajustar posição (centralizar)
                // O container tem 120px, então subtrair 60px
                joystickContainer.style.left = (x - 60) + 'px';
                joystickContainer.style.bottom = 'auto'; // Resetar bottom
                joystickContainer.style.top = (y - 60) + 'px';
                joystickContainer.style.display = 'block';

                this.joystickActive = true;
                this.updateJoystick(touch, joystickContainer, joystickStick);
            });

            mobileControls.addEventListener('touchmove', (e) => {
                if (e.target.closest('#mobile-boost')) return;
                e.preventDefault();

                if (this.joystickActive) {
                    // Encontrar o toque correto se houver múltiplos
                    // Simplificação: usar o primeiro toque que não seja no boost? 
                    // Para MVP, assumir touch[0] ou iterar.
                    // Aqui mantemos simples: update com o primeiro toque
                    this.updateJoystick(e.touches[0], joystickContainer, joystickStick);
                }
            });

            mobileControls.addEventListener('touchend', (e) => {
                if (e.target.closest('#mobile-boost')) return;
                e.preventDefault();

                this.joystickActive = false;
                joystickStick.style.transform = 'translate(-50%, -50%)';
                joystickContainer.style.display = 'none'; // Ocultar ao soltar
            });
        }

        if (boostButton) {
            // Botão de boost
            boostButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Evitar que o toque passe para o controle do joystick
                this.boostActive = true;
                boostButton.style.transform = 'scale(0.95)';
            });

            boostButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.boostActive = false;
                boostButton.style.transform = 'scale(1)';
            });
        }
    }

    updateJoystick(touch, container, stick) {
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = rect.width / 2 - 25;

        // Limitar distância
        const limitedDistance = Math.min(distance, maxDistance);
        const angle = Math.atan2(dy, dx);

        // Atualizar posição visual do stick
        const stickX = Math.cos(angle) * limitedDistance;
        const stickY = Math.sin(angle) * limitedDistance;
        stick.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;

        // Atualizar ângulo do joystick
        this.joystickAngle = angle;
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        // Converter para coordenadas do mundo
        const worldPos = this.camera.screenToWorld(this.mouseX, this.mouseY);
        this.mouseWorldX = worldPos.x;
        this.mouseWorldY = worldPos.y;
    }

    handleMouseDown(e) {
        if (e.button === 0) { // Botão esquerdo
            this.boostActive = true;
        }
    }

    handleMouseUp(e) {
        if (e.button === 0) {
            this.boostActive = false;
        }
    }

    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;

        // Boost com espaço
        if (e.key === ' ') {
            e.preventDefault();
            this.boostActive = true;
        }
    }

    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;

        if (e.key === ' ') {
            this.boostActive = false;
        }
    }

    getTargetAngle(playerX, playerY) {
        if (this.joystickActive) {
            // Usar ângulo do joystick
            return this.joystickAngle;
        } else {
            // Usar posição do mouse
            return Math.atan2(
                this.mouseWorldY - playerY,
                this.mouseWorldX - playerX
            );
        }
    }

    isBoostActive() {
        return this.boostActive;
    }

    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] || false;
    }

    reset() {
        this.keys = {};
        this.boostActive = false;
        this.joystickActive = false;
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputManager;
}
