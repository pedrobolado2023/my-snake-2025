# 🔧 Guia de Teste do Multiplayer

## ✅ Problema Resolvido

O multiplayer estava **desabilitado** no código do cliente (`js/main.js`). Agora foi **reativado** e está funcionando com o sistema de matchmaking inteligente.

## 🧪 Como Testar

### 1. **Limpar Cache do Navegador**

Antes de testar, limpe o cache para garantir que está usando a versão mais recente:

**Chrome/Edge:**
- Pressione `Ctrl + Shift + Delete`
- Selecione "Imagens e arquivos em cache"
- Clique em "Limpar dados"

**Ou force reload:**
- `Ctrl + F5` (Windows)
- `Cmd + Shift + R` (Mac)

### 2. **Abrir o Console do Navegador**

1. Pressione `F12` para abrir as ferramentas de desenvolvedor
2. Vá para a aba **Console**
3. Você deve ver mensagens como:

```
🐍 My Snake 2025
Jogo carregado com sucesso!
🔌 Conectando ao servidor multiplayer...
✅ Conectado ao servidor!
🎮 Entrando na sala: global como [SEU_NOME]
🌐 Modo multiplayer ativado!
🎯 Matchmaking inteligente: você será conectado com outros jogadores reais
```

### 3. **Teste com Múltiplas Abas**

1. **Aba 1**: Abra o jogo, use o nome "Jogador1", clique em JOGAR
2. **Aba 2**: Abra o jogo em uma nova aba, use o nome "Jogador2", clique em JOGAR
3. **Aba 3**: Abra o jogo em uma nova aba, use o nome "Jogador3", clique em JOGAR

### 4. **Verificar Estatísticas do Servidor**

Abra em uma nova aba:
```
https://snake-server.q-aura.com.br/stats
```

Você deve ver algo como:

```json
{
  "totalRooms": 1,
  "rooms": [
    {
      "id": "room-1734634567890",
      "players": 3,
      "bots": 47,
      "total": 50,
      "playerNames": ["Jogador1", "Jogador2", "Jogador3"]
    }
  ]
}
```

**✅ Se todos os 3 jogadores estiverem na mesma sala, o matchmaking está funcionando!**

### 5. **Verificar no Console**

No console de cada aba, você deve ver mensagens de outros jogadores:

```
👤 Jogador2 entrou no jogo
👤 Jogador3 entrou no jogo
```

### 6. **Verificar Visualmente no Jogo**

- Você deve ver outras cobras se movendo no mapa
- Essas cobras devem ter nomes diferentes dos bots
- Elas devem se mover de forma mais "humana" (não como bots)

## 🐛 Troubleshooting

### Problema: "Socket.io não carregado!"

**Solução:** Verifique se você tem conexão com a internet. O Socket.io é carregado via CDN.

### Problema: Não conecta ao servidor

**Solução:**
1. Verifique se o servidor está rodando: `https://snake-server.q-aura.com.br/health`
2. Verifique o console do navegador para erros de CORS
3. Verifique se o firewall não está bloqueando WebSocket

### Problema: Conecta mas não vê outros jogadores

**Solução:**
1. Abra `/stats` e verifique se os jogadores estão na mesma sala
2. Verifique o console para mensagens de erro
3. Tente recarregar a página com `Ctrl + F5`

### Problema: Vê apenas bots, não jogadores reais

**Solução:**
1. Certifique-se de que abriu múltiplas abas/janelas
2. Verifique em `/stats` se há mais de 1 jogador real
3. Os bots têm nomes brasileiros genéricos (João Silva, Maria Santos, etc.)

## 📊 Monitoramento em Tempo Real

### Health Check
```
https://snake-server.q-aura.com.br/health
```

Retorna:
```json
{
  "status": "ok",
  "rooms": 1,
  "totalPlayers": 3,
  "totalBots": 47,
  "uptime": 3600
}
```

### Estatísticas Detalhadas
```
https://snake-server.q-aura.com.br/stats
```

Retorna informações detalhadas de cada sala, incluindo nomes dos jogadores.

## ✅ Checklist de Sucesso

- [ ] Console mostra "✅ Conectado ao servidor!"
- [ ] Console mostra "🌐 Modo multiplayer ativado!"
- [ ] `/health` retorna `"status": "ok"`
- [ ] `/stats` mostra `totalPlayers > 0`
- [ ] Múltiplas abas aparecem na mesma sala em `/stats`
- [ ] Vejo outras cobras se movendo no jogo
- [ ] Console mostra mensagens de outros jogadores entrando

## 🎮 Próximos Passos

Se tudo estiver funcionando:

1. **Teste com amigos**: Compartilhe o link do jogo
2. **Monitore o servidor**: Acompanhe `/stats` para ver quantos jogadores estão online
3. **Verifique a performance**: O jogo deve rodar suavemente mesmo com vários jogadores

## 📝 Notas Importantes

- **Limite por sala**: 50 jogadores/bots por sala
- **Matchmaking**: Jogadores são automaticamente colocados na sala mais cheia
- **Bots**: São removidos automaticamente quando jogadores reais entram
- **Sincronização**: Estado do jogo é sincronizado a cada 50ms

## 🚀 Deploy

As mudanças já foram enviadas para o GitHub:

```bash
✅ Commit 1: feat: implementa matchmaking inteligente para priorizar jogadores reais
✅ Commit 2: fix: reativa multiplayer com matchmaking inteligente
```

Se você tem deploy automático configurado, o site já deve estar atualizado.
Caso contrário, faça o deploy manual do frontend.
