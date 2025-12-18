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

        if (joystickContainer && joystickStick) {
            // Joystick
            joystickContainer.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.joystickActive = true;
                this.updateJoystick(e.touches[0], joystickContainer, joystickStick);
            });

            joystickContainer.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (this.joystickActive) {
                    this.updateJoystick(e.touches[0], joystickContainer, joystickStick);
                }
            });

            joystickContainer.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.joystickActive = false;
                joystickStick.style.transform = 'translate(-50%, -50%)';
            });
        }

        if (boostButton) {
            // Botão de boost
            boostButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.boostActive = true;
                boostButton.style.transform = 'scale(0.95)';
            });

            boostButton.addEventListener('touchend', (e) => {
                e.preventDefault();
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
