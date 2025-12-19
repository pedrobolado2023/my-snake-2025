# 📱 My Snake 2025 - Aplicativo Mobile

Aplicativo Android do jogo My Snake 2025 para publicação na Google Play Store.

## 🎯 Objetivo

Este projeto converte o jogo web em um aplicativo Android nativo usando **Capacitor**, mantendo os arquivos web originais intactos.

## 📂 Estrutura

```
mobile-app/
├── capacitor.config.json    # Configuração do Capacitor
├── package.json             # Dependências do projeto
├── copy-web-files.js        # Script para copiar arquivos web
├── GUIA_APK.md             # Guia completo de geração do APK
├── www/                     # Arquivos web (gerados automaticamente)
└── android/                 # Projeto Android (gerado automaticamente)
```

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
npm install -g @capacitor/cli
npm install fs-extra
```

### 2. Copiar Arquivos Web

```bash
npm run copy-web
```

### 3. Adicionar Plataforma Android

```bash
npx cap add android
```

### 4. Abrir no Android Studio

```bash
npx cap open android
```

## 📖 Documentação Completa

Veja o arquivo **[GUIA_APK.md](./GUIA_APK.md)** para instruções detalhadas sobre:
- Como gerar o APK
- Como assinar o app
- Como publicar na Play Store
- Solução de problemas

## 🔄 Workflow de Desenvolvimento

1. **Desenvolva** no projeto web principal (pasta raiz)
2. **Teste** no navegador normalmente
3. **Copie** para o app mobile: `npm run copy-web`
4. **Sincronize**: `npx cap sync android`
5. **Teste** no emulador ou dispositivo
6. **Gere** o APK/AAB para publicação

## ⚙️ Scripts Disponíveis

- `npm run copy-web` - Copia arquivos web para www/
- `npm run build` - Alias para copy-web
- `npm run android:run` - Abre o projeto no Android Studio
- `npm run android:build` - Gera APK de release

## 🎨 Personalização

### Ícone do App
Substitua os ícones em `android/app/src/main/res/mipmap-*/`

### Nome do App
Edite `android/app/src/main/res/values/strings.xml`

### Splash Screen
Configure em `capacitor.config.json` → `plugins.SplashScreen`

## 🌐 Multiplayer

O app se conecta ao mesmo servidor que a versão web, permitindo que jogadores mobile e desktop joguem juntos!

## 📦 Publicação

1. Gere o AAB: `cd android && gradlew bundleRelease`
2. Acesse [Google Play Console](https://play.google.com/console)
3. Crie um novo app
4. Faça upload do AAB
5. Preencha as informações necessárias
6. Envie para revisão

## 🔐 Segurança

**IMPORTANTE**: Nunca commite:
- Arquivos `.keystore`
- Arquivo `keystore.properties`
- Senhas ou chaves privadas

Estes arquivos já estão no `.gitignore`.

## 📱 Requisitos do Sistema

- **Node.js**: 16.x ou superior
- **Android Studio**: Última versão
- **JDK**: 11 ou superior
- **Gradle**: 7.x ou superior (incluído no Android Studio)

## 🐛 Problemas Comuns

### "SDK not found"
Instale o Android SDK via Android Studio e configure ANDROID_HOME.

### "Gradle build failed"
Abra o projeto no Android Studio e deixe ele baixar as dependências.

### App não conecta ao servidor
Verifique as permissões de INTERNET no AndroidManifest.xml.

## 📞 Suporte

- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Documentação Android](https://developer.android.com/docs)
- [Google Play Console](https://support.google.com/googleplay/android-developer)

## 📄 Licença

MIT - Veja LICENSE no diretório raiz do projeto.

---

**Desenvolvido com ❤️ para a comunidade de jogadores!**
