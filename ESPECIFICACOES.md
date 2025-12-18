# 🐍 Snake.io Clone - Especificações Completas de Design e Desenvolvimento

## 📋 Índice
1. [Visão Geral e Objetivo](#visão-geral-e-objetivo)
2. [Mecânicas de Jogabilidade](#mecânicas-de-jogabilidade)
3. [Arena e Multiplayer](#arena-e-multiplayer)
4. [Estética e Interface](#estética-e-interface)
5. [Arquitetura Técnica](#arquitetura-técnica)
6. [Especificações de Desenvolvimento](#especificações-de-desenvolvimento)
7. [Roadmap de Implementação](#roadmap-de-implementação)

---

## 1. ⚙️ Visão Geral e Objetivo

### 1.1 Descrição do Projeto
**Gênero:** Multiplayer Online Massivo (MMO) / Arena Competitiva / Snake  
**Plataforma Alvo:** Web (HTML5/JavaScript) com suporte Mobile opcional  
**Objetivo do Jogador:** Controlar uma cobra que cresce ao comer pontos de comida, eliminar outros jogadores fazendo-os colidir com seu corpo, e evitar colisões com paredes ou outras cobras.  
**Perspectiva:** Visão de cima (top-down 2D)

### 1.2 Pilares de Design
- **Acessibilidade:** Controles simples e intuitivos
- **Competitividade:** Sistema de ranking em tempo real
- **Retenção:** Partidas rápidas e viciantes
- **Escalabilidade:** Suporte para 50-100 jogadores simultâneos

---

## 2. 🎮 Mecânicas de Jogabilidade

### 2.1 A Cobra (Entidade do Jogador)

#### 2.1.1 Sistema de Controle
- **Método de Controle:**
  - **Desktop:** Mouse (a cobra segue a direção do cursor)
  - **Mobile:** Touch (a cobra segue o dedo do jogador)
  - **Alternativo:** Teclado (WASD ou setas direcionais)

- **Movimento:**
  - Velocidade base: 150-200 pixels/segundo
  - Movimento contínuo e suave
  - Rotação gradual (não instantânea) para evitar mudanças bruscas
  - Raio mínimo de curva proporcional à velocidade

#### 2.1.2 Sistema de Crescimento
- **Mecânica de Crescimento:**
  - Cada ponto de comida padrão adiciona 1 segmento à cobra
  - Comprimento inicial: 10 segmentos
  - Comprimento máximo: Ilimitado (limitado apenas pela performance)
  - Distância entre segmentos: 8-10 pixels

- **Cálculo de Pontuação:**
  ```
  Pontuação = (Comprimento Atual - Comprimento Inicial) × 10
  ```

#### 2.1.3 Mecânica de Boost/Dash
- **Ativação:**
  - Desktop: Clique esquerdo do mouse ou Barra de Espaço
  - Mobile: Toque duplo ou botão dedicado na tela

- **Efeitos do Boost:**
  - Velocidade aumenta em 100% (300-400 pixels/segundo)
  - Consumo: 0.5 segmentos por segundo de boost
  - Cooldown: Nenhum (limitado apenas pelo comprimento da cobra)
  - Mínimo para usar: 15 segmentos

- **Mecânica de Rastro:**
  - Segmentos consumidos se transformam em pontos de comida
  - Valor: 1.5× o valor de comida padrão
  - Duração na arena: 30 segundos antes de desaparecer

#### 2.1.4 Sistema de Colisão e Morte
- **Condições de Morte:**
  1. Cabeça colide com o corpo de outra cobra
  2. Cabeça colide com as bordas da arena
  3. Comprimento reduz a menos de 3 segmentos (por uso excessivo de boost)

- **Ao Morrer:**
  - Corpo inteiro se transforma em pontos de comida
  - Quantidade de pontos = Comprimento da cobra
  - Valor total distribuído entre os pontos
  - Efeito visual de "explosão" com partículas
  - Respawn após 2 segundos

### 2.2 Sistema de Alimentação

#### 2.2.1 Pontos de Comida Padrão
- **Geração:**
  - Taxa de spawn: 5-10 pontos por segundo (ajustável baseado no número de jogadores)
  - Distribuição: Aleatória pela arena
  - Densidade mínima: 200 pontos sempre presentes na arena

- **Propriedades:**
  - Tamanho: 6-8 pixels de diâmetro
  - Valor: +1 segmento
  - Cores: Variadas (arco-íris)
  - Efeito visual: Leve pulsação/brilho

#### 2.2.2 Comida Bônus/Power-ups
- **Tipos de Power-ups:**

  1. **Comida Gigante (Rara)**
     - Spawn rate: 1 a cada 30 segundos
     - Valor: +10 segmentos
     - Tamanho: 3× maior que comida padrão
     - Cor: Dourada com brilho intenso

  2. **Comida Magnética (Épica)**
     - Spawn rate: 1 a cada 60 segundos
     - Efeito: Atrai comida próxima por 10 segundos
     - Raio de atração: 100 pixels
     - Cor: Azul elétrico

  3. **Comida Fantasma (Lendária)**
     - Spawn rate: 1 a cada 120 segundos
     - Efeito: 5 segundos de invencibilidade (pode atravessar cobras)
     - Cor: Branca translúcida

#### 2.2.3 Comida de Cobras Mortas
- **Propriedades:**
  - Valor: 2× comida padrão
  - Cor: Mesma cor da cobra que morreu
  - Efeito visual: Brilho mais intenso
  - Duração: 45 segundos antes de desaparecer

---

## 3. 🗺️ Arena e Multiplayer

### 3.1 Design da Arena

#### 3.1.1 Dimensões e Formato
- **Formato:** Circular ou quadrado com cantos arredondados
- **Tamanho:** 
  - Pequena (50 jogadores): 4000×4000 pixels
  - Média (75 jogadores): 5000×5000 pixels
  - Grande (100 jogadores): 6000×6000 pixels

#### 3.1.2 Bordas e Limites
- **Visual das Bordas:**
  - Parede neon brilhante
  - Efeito de "campo de força" com partículas
  - Cor: Vermelho/laranja para indicar perigo
  - Espessura visual: 20 pixels

- **Avisos de Proximidade:**
  - Tela treme levemente quando a 100 pixels da borda
  - Indicador visual na direção da borda mais próxima

#### 3.1.3 Background e Ambiente
- **Estilo Visual:**
  - Fundo escuro (grid de circuito ou espaço estrelado)
  - Grid sutil para senso de profundidade
  - Partículas ambientes flutuantes
  - Gradiente radial centrado no jogador

### 3.2 Sistema Multiplayer

#### 3.2.1 Capacidade e Salas
- **Configuração de Salas:**
  - Capacidade: 50-100 jogadores simultâneos
  - Auto-balanceamento: Jogadores distribuídos em salas disponíveis
  - Criação dinâmica: Novas salas criadas quando necessário
  - Mínimo para iniciar: 10 jogadores

#### 3.2.2 Sistema de Matchmaking
- **Critérios:**
  - Latência (prioridade máxima)
  - Região geográfica
  - Nível de habilidade (opcional, baseado em partidas anteriores)

#### 3.2.3 Placar (Leaderboard)
- **Informações Exibidas:**
  - Top 10 jogadores da sala
  - Posição do jogador atual (sempre visível)
  - Nome do jogador
  - Pontuação/Comprimento
  - Ícone da skin

- **Atualização:**
  - Tempo real (a cada 1 segundo)
  - Animação suave de mudanças de posição

### 3.3 Sistema de Câmera

#### 3.3.1 Comportamento da Câmera
- **Centralização:**
  - Sempre centrada na cabeça da cobra do jogador
  - Suavização de movimento (lerp) para evitar tremores

- **Zoom Dinâmico:**
  - Zoom out gradual conforme a cobra cresce
  - Fórmula: `Zoom = 1.0 - (Comprimento / 1000) × 0.3`
  - Zoom mínimo: 0.5× (para cobras muito grandes)
  - Zoom máximo: 1.2× (para cobras pequenas)

#### 3.3.2 Visibilidade
- **Campo de Visão:**
  - Raio de renderização: 1.5× o tamanho da tela
  - Culling de objetos fora do campo de visão
  - Fade in/out suave para objetos entrando/saindo da visão

---

## 4. ✨ Estética e Interface

### 4.1 Estilo Visual

#### 4.1.1 Paleta de Cores
- **Tema Principal:** Neon/Cyberpunk
- **Cores Base:**
  - Background: `#0a0e27` (azul escuro profundo)
  - Grid: `#1a1f3a` (azul escuro médio)
  - Bordas: `#ff3366` (rosa neon)
  - UI: `#00ffcc` (ciano neon)

#### 4.1.2 Efeitos Visuais
- **Efeitos de Partículas:**
  - Rastro de boost: Partículas coloridas seguindo a cobra
  - Morte: Explosão de partículas na cor da cobra
  - Comida coletada: Pequeno burst de partículas
  - Ambiente: Partículas flutuantes sutis

- **Efeitos de Iluminação:**
  - Glow nas cobras (bloom effect)
  - Sombras suaves sob as cobras
  - Brilho pulsante na comida
  - Reflexos no grid

### 4.2 Sistema de Skins

#### 4.2.1 Categorias de Skins
1. **Skins Básicas (Gratuitas):**
   - Cores sólidas (10 opções)
   - Padrões simples (listras, pontos)

2. **Skins Premium:**
   - Gradientes complexos
   - Padrões animados
   - Efeitos especiais (fogo, gelo, elétrico)

3. **Skins Temáticas:**
   - Bandeiras de países
   - Temas sazonais (Natal, Halloween)
   - Colaborações especiais

#### 4.2.2 Customização
- **Elementos Customizáveis:**
  - Cor primária
  - Cor secundária
  - Padrão
  - Efeito de rastro
  - Olhos/face (opcional)

### 4.3 Interface do Usuário (UI)

#### 4.3.1 HUD (Head-Up Display)
- **Elementos Principais:**

  1. **Painel de Estatísticas (Canto Superior Esquerdo):**
     - Nome do jogador
     - Pontuação atual
     - Comprimento da cobra
     - Kills (cobras eliminadas)

  2. **Leaderboard (Canto Superior Direito):**
     - Top 10 jogadores
     - Posição atual destacada
     - Animação de entrada/saída

  3. **Minimapa (Canto Inferior Direito):**
     - Visão geral da arena
     - Posição do jogador (ponto brilhante)
     - Densidade de jogadores (heat map)
     - Bordas da arena

  4. **Indicador de Boost (Canto Inferior Esquerdo):**
     - Barra visual mostrando comprimento disponível
     - Cor: Verde (seguro) → Amarelo (cuidado) → Vermelho (crítico)
     - Texto: "Segmentos: X"

#### 4.3.2 Tela de Menu Principal
- **Elementos:**
  - Logo do jogo (animado)
  - Botão "Jogar" (grande e destacado)
  - Seletor de skin
  - Campo de nome do jogador
  - Configurações
  - Leaderboard global
  - Créditos

#### 4.3.3 Tela de Game Over
- **Informações Exibidas:**
  - "Você morreu!"
  - Estatísticas da partida:
    - Pontuação final
    - Posição final
    - Tempo de jogo
    - Kills
    - Comida coletada
  - Botão "Jogar Novamente"
  - Botão "Menu Principal"

### 4.4 Animações e Transições

#### 4.4.1 Animações de Gameplay
- **Movimento da Cobra:**
  - Ondulação suave do corpo
  - Rotação gradual da cabeça
  - Escala sutil ao coletar comida

- **Boost:**
  - Esticamento da cobra (stretch effect)
  - Intensificação do brilho
  - Rastro de partículas

#### 4.4.2 Animações de UI
- **Transições de Tela:**
  - Fade in/out (300ms)
  - Slide animations para painéis
  - Bounce effect em botões

- **Feedback Visual:**
  - Hover effects em botões
  - Pulse animation em elementos importantes
  - Shake effect em erros

---

## 5. 🧑‍💻 Arquitetura Técnica

### 5.1 Stack Tecnológico

#### 5.1.1 Frontend
- **Core:**
  - HTML5 Canvas para renderização
  - JavaScript (ES6+) ou TypeScript
  - Framework: Vanilla JS ou Phaser.js

- **Bibliotecas:**
  - Socket.io-client (comunicação WebSocket)
  - GSAP (animações avançadas)
  - Howler.js (áudio, se implementado)

#### 5.1.2 Backend
- **Servidor:**
  - Node.js com Express
  - Socket.io (WebSocket server)
  - TypeScript (recomendado)

- **Banco de Dados:**
  - Redis (sessões e cache)
  - MongoDB ou PostgreSQL (dados persistentes: skins, estatísticas)

#### 5.1.3 Infraestrutura
- **Hospedagem:**
  - Frontend: Vercel, Netlify ou CloudFlare Pages
  - Backend: AWS EC2, DigitalOcean ou Heroku
  - CDN: CloudFlare para assets estáticos

- **Escalabilidade:**
  - Load balancer para múltiplos servidores de jogo
  - Instâncias de servidor por região geográfica

### 5.2 Arquitetura de Comunicação

#### 5.2.1 Protocolo WebSocket
- **Eventos Cliente → Servidor:**
  ```javascript
  // Conexão inicial
  'player:join' { name, skin }
  
  // Movimento
  'player:move' { angle, boost }
  
  // Desconexão
  'player:leave'
  ```

- **Eventos Servidor → Cliente:**
  ```javascript
  // Estado inicial
  'game:init' { playerId, arena, players, food }
  
  // Atualizações de estado
  'game:update' { players, food, leaderboard }
  
  // Eventos específicos
  'player:died' { playerId, killerId }
  'player:ate' { playerId, foodId }
  'food:spawn' { food[] }
  ```

#### 5.2.2 Otimização de Rede
- **Taxa de Atualização:**
  - Servidor → Cliente: 20-30 updates/segundo
  - Cliente → Servidor: 10-15 updates/segundo

- **Compressão de Dados:**
  - Enviar apenas deltas (mudanças) ao invés do estado completo
  - Usar IDs curtos para jogadores e objetos
  - Comprimir coordenadas (arredondar para inteiros)

- **Interpolação:**
  - Cliente interpola posições entre updates
  - Suaviza movimento de outras cobras
  - Reduz percepção de lag

### 5.3 Lógica de Servidor Autoritário

#### 5.3.1 Validação de Movimento
- **Servidor valida:**
  - Velocidade máxima não excedida
  - Boost só usado se comprimento suficiente
  - Posição dentro dos limites da arena

#### 5.3.2 Detecção de Colisão
- **Algoritmo:**
  - Spatial hashing para otimização
  - Verificação de colisão cabeça-corpo
  - Verificação de colisão cabeça-borda

- **Resolução:**
  - Servidor determina morte
  - Notifica todos os clientes
  - Gera comida da cobra morta

#### 5.3.3 Sincronização de Estado
- **Estado do Jogo:**
  ```javascript
  {
    players: Map<playerId, PlayerState>,
    food: Map<foodId, FoodState>,
    leaderboard: PlayerScore[],
    timestamp: number
  }
  ```

- **Reconciliação:**
  - Cliente prediz movimento local
  - Servidor envia correções quando necessário
  - Cliente ajusta suavemente para estado correto

### 5.4 Otimização de Performance

#### 5.4.1 Renderização
- **Técnicas:**
  - Object pooling para segmentos de cobra e comida
  - Culling de objetos fora da tela
  - Renderização em camadas (background, comida, cobras, UI)
  - RequestAnimationFrame para loop de jogo

#### 5.4.2 Memória
- **Gerenciamento:**
  - Limite de objetos simultâneos
  - Garbage collection consciente
  - Reutilização de objetos ao invés de criar novos

#### 5.4.3 Rede
- **Otimizações:**
  - Binary protocol ao invés de JSON (opcional)
  - Throttling de eventos de movimento
  - Priorização de updates (jogadores próximos > distantes)

---

## 6. 📐 Especificações de Desenvolvimento

### 6.1 Estrutura de Arquivos

```
snake-io-clone/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── sounds/
│   │   │   └── fonts/
│   │   ├── game/
│   │   │   ├── entities/
│   │   │   │   ├── Snake.js
│   │   │   │   ├── Food.js
│   │   │   │   └── Particle.js
│   │   │   ├── systems/
│   │   │   │   ├── InputManager.js
│   │   │   │   ├── Renderer.js
│   │   │   │   ├── Camera.js
│   │   │   │   └── CollisionDetector.js
│   │   │   ├── scenes/
│   │   │   │   ├── MenuScene.js
│   │   │   │   ├── GameScene.js
│   │   │   │   └── GameOverScene.js
│   │   │   └── Game.js
│   │   ├── network/
│   │   │   ├── SocketManager.js
│   │   │   └── NetworkInterpolator.js
│   │   ├── ui/
│   │   │   ├── HUD.js
│   │   │   ├── Leaderboard.js
│   │   │   └── Menu.js
│   │   ├── utils/
│   │   │   ├── Math.js
│   │   │   ├── Config.js
│   │   │   └── Constants.js
│   │   └── main.js
│   ├── public/
│   │   ├── index.html
│   │   └── styles.css
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── game/
│   │   │   ├── GameRoom.js
│   │   │   ├── Player.js
│   │   │   ├── Food.js
│   │   │   └── CollisionSystem.js
│   │   ├── network/
│   │   │   ├── SocketHandler.js
│   │   │   └── RoomManager.js
│   │   ├── utils/
│   │   │   ├── SpatialHash.js
│   │   │   ├── Config.js
│   │   │   └── Logger.js
│   │   └── server.js
│   ├── package.json
│   └── tsconfig.json (se usar TypeScript)
│
├── shared/
│   ├── Constants.js
│   ├── Types.js
│   └── Utils.js
│
└── README.md
```

### 6.2 Classes Principais

#### 6.2.1 Cliente - Snake.js
```javascript
class Snake {
  constructor(id, name, x, y, color) {
    this.id = id;
    this.name = name;
    this.segments = []; // Array de {x, y}
    this.color = color;
    this.angle = 0;
    this.speed = 150;
    this.isBoosting = false;
    this.length = 10;
  }
  
  update(deltaTime) {
    // Atualizar posição baseado em angle e speed
    // Atualizar segmentos
    // Aplicar boost se ativo
  }
  
  render(ctx, camera) {
    // Renderizar todos os segmentos
    // Aplicar efeitos visuais
  }
  
  boost(active) {
    // Ativar/desativar boost
    // Reduzir comprimento se boosting
  }
  
  grow(amount) {
    // Adicionar segmentos
  }
}
```

#### 6.2.2 Servidor - GameRoom.js
```javascript
class GameRoom {
  constructor(id, maxPlayers) {
    this.id = id;
    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.food = new Map();
    this.spatialHash = new SpatialHash();
    this.lastUpdate = Date.now();
  }
  
  addPlayer(socket, playerData) {
    // Adicionar jogador à sala
    // Enviar estado inicial
  }
  
  removePlayer(playerId) {
    // Remover jogador
    // Gerar comida do corpo
  }
  
  update() {
    // Atualizar todos os jogadores
    // Detectar colisões
    // Gerar comida
    // Enviar updates para clientes
  }
  
  checkCollisions(player) {
    // Verificar colisão com bordas
    // Verificar colisão com outras cobras
    // Verificar coleta de comida
  }
  
  spawnFood(count) {
    // Gerar comida aleatória
  }
}
```

### 6.3 Configurações e Constantes

#### 6.3.1 Config.js (Compartilhado)
```javascript
export const CONFIG = {
  // Arena
  ARENA_SIZE: 5000,
  ARENA_SHAPE: 'circle', // ou 'square'
  
  // Snake
  SNAKE_INITIAL_LENGTH: 10,
  SNAKE_SEGMENT_SIZE: 10,
  SNAKE_BASE_SPEED: 150,
  SNAKE_BOOST_MULTIPLIER: 2,
  SNAKE_BOOST_COST: 0.5, // segmentos/segundo
  SNAKE_MIN_LENGTH_TO_BOOST: 15,
  
  // Food
  FOOD_SIZE: 8,
  FOOD_VALUE: 1,
  FOOD_SPAWN_RATE: 5, // por segundo
  FOOD_MIN_COUNT: 200,
  FOOD_GIANT_VALUE: 10,
  FOOD_GIANT_SPAWN_INTERVAL: 30000, // ms
  
  // Multiplayer
  MAX_PLAYERS_PER_ROOM: 100,
  SERVER_TICK_RATE: 30, // updates/segundo
  CLIENT_SEND_RATE: 15, // updates/segundo
  
  // Rendering
  CAMERA_LERP_FACTOR: 0.1,
  ZOOM_MIN: 0.5,
  ZOOM_MAX: 1.2,
  
  // Network
  INTERPOLATION_DELAY: 100, // ms
};
```

### 6.4 Protocolo de Rede Detalhado

#### 6.4.1 Estrutura de Mensagens
```javascript
// Cliente → Servidor
{
  type: 'player:move',
  data: {
    angle: 1.57, // radianos
    boost: true,
    timestamp: 1234567890
  }
}

// Servidor → Cliente
{
  type: 'game:update',
  data: {
    players: [
      {
        id: 'abc123',
        x: 2500,
        y: 2500,
        angle: 1.57,
        length: 25,
        boost: false
      },
      // ... outros jogadores
    ],
    food: [
      { id: 'f1', x: 2600, y: 2400, type: 'normal' },
      // ... outras comidas
    ],
    leaderboard: [
      { id: 'abc123', name: 'Player1', score: 150 },
      // ... top 10
    ],
    timestamp: 1234567890
  }
}
```

---

## 7. 🗓️ Roadmap de Implementação

### Fase 1: Fundação (Semana 1-2)
- [ ] Configurar estrutura do projeto (cliente e servidor)
- [ ] Implementar servidor WebSocket básico
- [ ] Criar canvas e loop de renderização
- [ ] Implementar classe Snake básica (movimento e renderização)
- [ ] Sistema de input (mouse/teclado)
- [ ] Câmera que segue o jogador

### Fase 2: Mecânicas Core (Semana 3-4)
- [ ] Sistema de comida (spawn e coleta)
- [ ] Crescimento da cobra
- [ ] Detecção de colisão (bordas e outras cobras)
- [ ] Sistema de morte e respawn
- [ ] Mecânica de boost/dash
- [ ] Geração de comida ao morrer

### Fase 3: Multiplayer (Semana 5-6)
- [ ] Sincronização de múltiplos jogadores
- [ ] Sistema de salas (GameRoom)
- [ ] Interpolação de movimento
- [ ] Lógica de servidor autoritário
- [ ] Otimização de rede (delta updates)
- [ ] Sistema de spatial hashing para colisões

### Fase 4: UI e Polimento Visual (Semana 7-8)
- [ ] HUD completo (stats, leaderboard, minimapa)
- [ ] Menu principal
- [ ] Tela de game over
- [ ] Sistema de skins
- [ ] Efeitos de partículas
- [ ] Animações e transições
- [ ] Tema visual neon/cyberpunk

### Fase 5: Features Avançadas (Semana 9-10)
- [ ] Power-ups (comida gigante, magnética, fantasma)
- [ ] Sistema de ranking global
- [ ] Estatísticas de jogador
- [ ] Áudio (música e efeitos sonoros)
- [ ] Suporte mobile (touch controls)
- [ ] Otimizações de performance

### Fase 6: Testes e Deploy (Semana 11-12)
- [ ] Testes de carga (100 jogadores simultâneos)
- [ ] Balanceamento de gameplay
- [ ] Correção de bugs
- [ ] Otimização final
- [ ] Deploy em produção
- [ ] Monitoramento e analytics

---

## 📊 Métricas de Sucesso

### Métricas Técnicas
- **Performance:**
  - 60 FPS consistente no cliente
  - Latência < 100ms
  - Suporte para 100 jogadores simultâneos por sala

- **Disponibilidade:**
  - Uptime > 99%
  - Tempo de resposta do servidor < 50ms

### Métricas de Engajamento
- **Retenção:**
  - Sessão média > 10 minutos
  - Taxa de retorno (D1) > 40%

- **Gameplay:**
  - Tempo médio de vida por partida: 3-5 minutos
  - Média de kills por partida: 2-3

---

## 🔒 Considerações de Segurança

### Prevenção de Trapaça
- [ ] Validação de movimento no servidor
- [ ] Rate limiting de ações
- [ ] Detecção de velocidade anormal
- [ ] Validação de colisões server-side
- [ ] Anti-bot measures

### Segurança de Rede
- [ ] HTTPS/WSS em produção
- [ ] Validação de input
- [ ] Proteção contra DDoS
- [ ] Sanitização de nomes de jogador

---

## 📝 Notas Adicionais

### Possíveis Expansões Futuras
1. **Modos de Jogo:**
   - Battle Royale (arena encolhendo)
   - Team Mode (equipes de cobras)
   - Capture the Flag

2. **Progressão:**
   - Sistema de níveis
   - Unlockables (skins, efeitos)
   - Achievements

3. **Social:**
   - Sistema de amigos
   - Clãs/Guilds
   - Chat in-game

4. **Monetização:**
   - Skins premium
   - Battle Pass
   - Anúncios (rewarded ads)

---

**Documento criado em:** 16 de Dezembro de 2025  
**Versão:** 1.0  
**Status:** Especificações Completas - Pronto para Desenvolvimento
