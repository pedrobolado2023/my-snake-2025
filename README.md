# 🐍 Snake.io Clone

Um clone do popular jogo multiplayer Snake.io, desenvolvido com HTML5, CSS3 e JavaScript puro.

## 🎮 Como Jogar

### Controles
- **Mouse/Touch**: Direcione sua cobra movendo o mouse ou tocando na tela
- **Espaço/Clique Esquerdo**: Ativar boost (consome segmentos)
- **ESC**: Pausar o jogo

### Objetivo
- Coma pontos de comida para crescer
- Faça outras cobras colidirem com seu corpo para eliminá-las
- Evite colidir com outras cobras ou com as bordas da arena
- Torne-se a maior cobra da arena!

## ✨ Funcionalidades Implementadas

### ✅ Versão Atual (v1.0)
- [x] Sistema de movimento suave da cobra
- [x] Crescimento ao comer comida
- [x] Mecânica de boost/dash
- [x] Sistema de colisão (cobras e bordas)
- [x] IA de bots
- [x] Comida normal e gigante
- [x] Comida de cobras mortas
- [x] Sistema de partículas
- [x] HUD completo (stats, leaderboard, boost)
- [x] Minimapa
- [x] Seleção de skins
- [x] Controles mobile (joystick virtual)
- [x] Tema visual neon/cyberpunk
- [x] Animações e efeitos visuais
- [x] Tela de game over com estatísticas

## 🚀 Como Executar

### Opção 1: Servidor Local Simples
```bash
# Com Python 3
python -m http.server 8000

# Com Node.js (npx)
npx http-server -p 8000

# Com PHP
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

### Opção 2: Abrir Diretamente
Simplesmente abra o arquivo `index.html` no seu navegador.

## 📁 Estrutura do Projeto

```
snake-io-clone/
├── index.html              # HTML principal
├── styles.css              # Estilos CSS
├── js/
│   ├── config.js          # Configurações do jogo
│   ├── utils.js           # Funções utilitárias
│   ├── entities/
│   │   ├── Snake.js       # Classe da cobra
│   │   ├── Food.js        # Classe da comida
│   │   └── Particle.js    # Sistema de partículas
│   ├── systems/
│   │   ├── Camera.js      # Sistema de câmera
│   │   ├── InputManager.js # Gerenciamento de input
│   │   ├── Renderer.js    # Sistema de renderização
│   │   └── CollisionSystem.js # Detecção de colisões
│   ├── Game.js            # Lógica principal do jogo
│   └── main.js            # Inicialização
├── ESPECIFICACOES.md      # Especificações completas
└── README.md              # Este arquivo
```

## 🎨 Skins Disponíveis

1. **Cyan** - Azul ciano vibrante
2. **Purple** - Roxo neon
3. **Pink** - Rosa neon
4. **Green** - Verde neon
5. **Yellow** - Amarelo brilhante
6. **Orange** - Laranja vibrante
7. **Blue** - Azul profundo
8. **Red** - Vermelho intenso
9. **Rainbow** - Arco-íris
10. **Fire** - Fogo

## ⚙️ Configurações

Você pode ajustar as configurações do jogo editando o arquivo `js/config.js`:

- Tamanho da arena
- Velocidade da cobra
- Multiplicador de boost
- Taxa de spawn de comida
- E muito mais!

## 🔮 Próximas Funcionalidades (Roadmap)

### Versão 1.1 - Melhorias
- [ ] Power-ups adicionais (magnético, fantasma)
- [ ] Mais efeitos visuais e animações
- [ ] Sistema de áudio (música e efeitos sonoros)
- [ ] Melhorias na IA dos bots

### Versão 2.0 - Multiplayer Real
- [ ] Servidor WebSocket (Node.js + Socket.io)
- [ ] Sincronização em tempo real
- [ ] Salas de jogo
- [ ] Chat in-game
- [ ] Ranking global

### Versão 3.0 - Features Avançadas
- [ ] Sistema de contas e login
- [ ] Progressão e níveis
- [ ] Skins desbloqueáveis
- [ ] Modos de jogo alternativos
- [ ] Torneios e eventos

## 🛠️ Tecnologias Utilizadas

- **HTML5 Canvas** - Renderização gráfica
- **CSS3** - Estilização e animações
- **JavaScript (ES6+)** - Lógica do jogo
- **Google Fonts** - Tipografia (Orbitron, Rajdhani)

## 📊 Performance

O jogo foi otimizado para rodar a 60 FPS com:
- Até 100 jogadores simultâneos (quando multiplayer)
- Sistema de spatial hashing para colisões
- Culling de objetos fora da tela
- Object pooling para partículas

## 🎯 Dicas de Jogo

1. **Use o boost estrategicamente** - Ele consome seus segmentos!
2. **Cerque oponentes menores** - Force-os a colidir com você
3. **Fique perto do centro** - Evite ser encurralado nas bordas
4. **Comida de cobra morta vale 2x** - Persiga cobras grandes!
5. **Comida gigante dourada** - Vale 10 segmentos, mas é rara

## 📝 Licença

Este projeto é um clone educacional do Snake.io para fins de aprendizado.

## 👨‍💻 Desenvolvimento

Desenvolvido como demonstração de:
- Programação orientada a objetos em JavaScript
- Desenvolvimento de jogos 2D com Canvas
- Sistemas de física e colisão
- UI/UX design moderno
- Arquitetura de código limpa e modular

---

**Divirta-se jogando! 🐍✨**
