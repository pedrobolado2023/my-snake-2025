# 🚀 Guia Rápido - Snake.io Clone

## ⚡ Início Rápido (3 passos)

### 1️⃣ Abrir o Jogo
```
Clique duas vezes em: index.html
```
OU abra no navegador de sua preferência.

### 2️⃣ Configurar
- Digite seu nome (ou deixe "Player")
- Escolha uma skin clicando nela
- Clique em **"JOGAR AGORA"**

### 3️⃣ Jogar!
- **Mova o mouse** para direcionar sua cobra
- **Espaço ou Clique** para dar boost
- **Coma comida** para crescer
- **Evite colidir** com outras cobras ou bordas

---

## 🎮 Controles Completos

### 🖱️ Desktop
| Ação | Controle |
|------|----------|
| Direcionar | Mover mouse |
| Boost | Espaço ou Clique Esquerdo |
| Pausar | ESC |

### 📱 Mobile
| Ação | Controle |
|------|----------|
| Direcionar | Joystick virtual (canto inferior esquerdo) |
| Boost | Botão verde (canto inferior direito) |

---

## 🎯 Dicas para Iniciantes

### 🌟 Básico
1. **Comida colorida** = +1 segmento
2. **Comida dourada** = +10 segmentos (rara!)
3. **Comida brilhante** = +2 segmentos (de cobras mortas)

### ⚡ Boost
- Consome seus segmentos
- Use para escapar ou atacar
- Deixa rastro de comida atrás

### 💀 Como Morrer
- Colidir com outra cobra
- Colidir com a borda da arena
- Ficar sem segmentos (usando boost demais)

### 🏆 Como Vencer
- Cresça o máximo possível
- Fique no Top 1 do leaderboard
- Elimine outras cobras fazendo-as colidir com você

---

## 📊 Interface (HUD)

### Canto Superior Esquerdo
```
👤 Seu Nome
📏 Comprimento: XX
⭐ Pontos: XXXX
💀 Kills: X
```

### Canto Superior Direito
```
🏆 TOP 10
#1 Nome - Pontos
#2 Nome - Pontos
...
```

### Canto Inferior Esquerdo
```
BOOST [ESPAÇO ou CLIQUE]
[████████░░] 80%
Segmentos: 25
```

### Canto Inferior Direito
```
[Minimapa]
• Você (ponto brilhante)
• Outros (pontos brancos)
```

---

## 🎨 Skins Disponíveis

1. **Cyan** - Azul ciano clássico
2. **Purple** - Roxo místico
3. **Pink** - Rosa vibrante
4. **Green** - Verde neon
5. **Yellow** - Amarelo elétrico
6. **Orange** - Laranja ardente
7. **Blue** - Azul profundo
8. **Red** - Vermelho intenso
9. **Rainbow** - Arco-íris mágico ✨
10. **Fire** - Chamas ardentes 🔥

---

## 🏅 Sistema de Pontuação

### Como Ganhar Pontos
- Comida normal: **+10 pontos**
- Comida gigante: **+100 pontos**
- Comida de cobra: **+20 pontos**

### Leaderboard
- Atualiza em **tempo real**
- Mostra **Top 10** jogadores
- **Sua posição** sempre destacada
- Cores especiais:
  - 🥇 #1 = Dourado
  - 🥈 #2 = Prata
  - 🥉 #3 = Bronze

---

## 🎬 Tela de Game Over

Quando você morrer, verá:

```
💀 VOCÊ MORREU!

📊 Estatísticas:
┌─────────────────────────┐
│ Pontuação Final: XXXX   │
│ Posição Final: #X       │
│ Comprimento Máximo: XX  │
│ Kills: X                │
│ Tempo de Jogo: X:XX     │
└─────────────────────────┘

[🔄 JOGAR NOVAMENTE]
[🏠 MENU PRINCIPAL]
```

---

## ⚙️ Configurações Avançadas

### Editar Configurações
Abra `js/config.js` e modifique:

```javascript
// Exemplo: Fazer cobras mais rápidas
SNAKE_BASE_SPEED: 250  // (padrão: 180)

// Exemplo: Arena maior
ARENA_SIZE: 7000  // (padrão: 5000)

// Exemplo: Mais comida
FOOD_MIN_COUNT: 500  // (padrão: 200)
```

---

## 🐛 Solução de Problemas

### Jogo não abre?
- ✅ Use um navegador moderno (Chrome, Firefox, Edge)
- ✅ Verifique se JavaScript está habilitado
- ✅ Tente abrir em modo anônimo

### Controles não funcionam?
- ✅ Clique no canvas do jogo primeiro
- ✅ Verifique se não há extensões bloqueando
- ✅ Recarregue a página (F5)

### Performance ruim?
- ✅ Feche outras abas do navegador
- ✅ Reduza o zoom do navegador
- ✅ Atualize seus drivers gráficos

### Mobile não funciona?
- ✅ Use Chrome ou Safari mobile
- ✅ Ative JavaScript
- ✅ Toque no joystick para começar

---

## 📱 Compatibilidade

### ✅ Navegadores Suportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

### ✅ Dispositivos
- 💻 Desktop (Windows, Mac, Linux)
- 📱 Mobile (Android, iOS)
- 📱 Tablet (Android, iOS)

### ⚠️ Requisitos Mínimos
- JavaScript habilitado
- Canvas HTML5 suportado
- Tela mínima: 320×480

---

## 🎓 Aprendendo com o Código

### Para Estudantes
Este projeto é ótimo para aprender:
- ✅ JavaScript orientado a objetos
- ✅ HTML5 Canvas
- ✅ Física de jogos 2D
- ✅ Sistemas de colisão
- ✅ Gerenciamento de estado
- ✅ UI/UX design

### Arquivos para Estudar
1. **Iniciantes**: `js/main.js`, `js/config.js`
2. **Intermediário**: `js/entities/Snake.js`, `js/systems/Camera.js`
3. **Avançado**: `js/Game.js`, `js/systems/CollisionSystem.js`

---

## 🎉 Divirta-se!

**Objetivo**: Torne-se a maior cobra da arena! 🐍👑

**Boa sorte e bom jogo!** ✨

---

*Desenvolvido com ❤️ usando HTML5, CSS3 e JavaScript*
