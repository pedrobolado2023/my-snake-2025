# 📱 Guia de Geração do APK para Play Store

## My Snake 2025 - Aplicativo Android

Este guia mostra como gerar o APK do jogo para publicar na Google Play Store.

---

## 📋 Pré-requisitos

### 1. Instalar Node.js
- Baixe e instale: https://nodejs.org/ (versão LTS recomendada)
- Verifique a instalação: `node --version`

### 2. Instalar Android Studio
- Baixe: https://developer.android.com/studio
- Durante a instalação, certifique-se de instalar:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (opcional, para testes)

### 3. Configurar Variáveis de Ambiente do Android SDK
Adicione ao PATH do Windows:
```
C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk\platform-tools
C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk\tools
```

### 4. Configurar Variável de Ambiente do Java (JDK)
O comando `keytool` pode não ser encontrado se o Java não estiver no PATH do sistema. O Android Studio já inclui um JDK que podemos usar.

1.  **Encontre a pasta do JDK do Android Studio**:
    O caminho geralmente é: `C:\Program Files\Android\Android Studio\jbr`

2.  **Adicione ao PATH do Windows**:
    Adicione a seguinte pasta ao PATH do sistema (além das do Android SDK):
    ```
    C:\Program Files\Android\Android Studio\jbr\bin
    ```

3.  **(Opcional) Crie a variável JAVA_HOME**:
    - Nome da variável: `JAVA_HOME`
    - Valor da variável: `C:\Program Files\Android\Android Studio\jbr`

Após adicionar ao PATH, **reinicie o terminal (ou o computador)** e tente o comando `keytool` novamente.


---

## 🚀 Passo a Passo para Gerar o APK

### Passo 1: Instalar Dependências

Abra o terminal na pasta `mobile-app`:

```bash
cd "c:\Users\pedro.pereira\OneDrive\Documentos\Jogo da cobrinha\mobile-app"
npm install
npm install -g @capacitor/cli
npm install fs-extra
```

### Passo 2: Copiar Arquivos Web

```bash
npm run copy-web
```

Isso copia todos os arquivos do jogo (HTML, CSS, JS) para a pasta `www/`.

### Passo 3: Adicionar Plataforma Android

```bash
npx cap add android
```

Isso cria a pasta `android/` com o projeto Android nativo.

### Passo 4: Sincronizar Arquivos

```bash
npx cap sync android
```

### Passo 5: Personalizar o App

#### 5.1 Ícone do App
Coloque seu ícone em:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`

Tamanhos necessários:
- `mipmap-mdpi`: 48x48
- `mipmap-hdpi`: 72x72
- `mipmap-xhdpi`: 96x96
- `mipmap-xxhdpi`: 144x144
- `mipmap-xxxhdpi`: 192x192

#### 5.2 Splash Screen
Edite `android/app/src/main/res/values/styles.xml` para personalizar a tela de carregamento.

#### 5.3 Nome do App
Edite `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">My Snake 2025</string>
```

### Passo 6: Gerar Keystore (Primeira vez apenas)

Para assinar o APK de release:

```bash
keytool -genkey -v -keystore my-snake-2025.keystore -alias my-snake-key -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANTE**: Guarde a senha em local seguro! Você precisará dela sempre.

### Passo 7: Configurar Assinatura

Edite `android/app/build.gradle` e adicione antes de `android {`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Dentro de `android {`, adicione:

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

Crie `android/keystore.properties`:

```properties
storeFile=../my-snake-2025.keystore
storePassword=SUA_SENHA_AQUI
keyAlias=my-snake-key
keyPassword=SUA_SENHA_AQUI
```

### Passo 8: Gerar APK de Release

```bash
cd android
gradlew assembleRelease
```

Ou use o script npm:

```bash
npm run android:build
```

O APK estará em:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📦 Gerar AAB (Android App Bundle) para Play Store

A Google Play Store prefere AAB ao invés de APK:

```bash
cd android
gradlew bundleRelease
```

O AAB estará em:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🧪 Testar o App

### Testar no Emulador

1. Abra Android Studio
2. Abra o projeto em `mobile-app/android`
3. Clique em "Run" (▶️)

### Testar em Dispositivo Real

1. Ative "Opções do desenvolvedor" no seu Android
2. Ative "Depuração USB"
3. Conecte o celular via USB
4. Execute:

```bash
npm run android:run
```

---

## 📤 Publicar na Play Store

### 1. Criar Conta de Desenvolvedor
- Acesse: https://play.google.com/console
- Taxa única: $25 USD

### 2. Criar Novo App
- Clique em "Criar app"
- Preencha informações básicas

### 3. Upload do AAB
- Vá em "Produção" → "Criar nova versão"
- Faça upload do arquivo `app-release.aab`

### 4. Preencher Informações
- **Descrição curta**: "Jogo da cobrinha multiplayer online com skins personalizadas!"
- **Descrição completa**: Descreva as funcionalidades
- **Screenshots**: Tire prints do jogo (mínimo 2)
- **Ícone**: 512x512 PNG
- **Banner**: 1024x500 PNG
- **Categoria**: Jogos → Casual
- **Classificação de conteúdo**: Preencha o questionário

### 5. Política de Privacidade
Crie uma página web com sua política de privacidade e adicione o link.

### 6. Enviar para Revisão
Após preencher tudo, clique em "Enviar para revisão".

A revisão pode levar de 1 a 7 dias.

---

## 🔄 Atualizar o App

Quando fizer mudanças no jogo:

1. Atualize os arquivos web normalmente
2. Execute:
```bash
cd mobile-app
npm run copy-web
npx cap sync android
```
3. Incremente a versão em `android/app/build.gradle`:
```gradle
versionCode 2  // Incrementar
versionName "1.1"  // Atualizar
```
4. Gere novo AAB:
```bash
cd android
gradlew bundleRelease
```
5. Faça upload na Play Store

---

## 🎨 Recursos Gráficos Necessários

### Para a Play Store:

1. **Ícone do App**: 512x512 PNG (sem transparência)
2. **Banner**: 1024x500 PNG
3. **Screenshots**: 
   - Mínimo 2, máximo 8
   - Tamanho recomendado: 1080x1920 (vertical) ou 1920x1080 (horizontal)
4. **Vídeo Promocional** (opcional): Link do YouTube

---

## ⚙️ Configurações Importantes

### Permissões (AndroidManifest.xml)

O app já vem com permissões básicas:
- INTERNET (para multiplayer)
- ACCESS_NETWORK_STATE

### Orientação da Tela

Para forçar modo paisagem, edite `android/app/src/main/AndroidManifest.xml`:

```xml
<activity
    android:screenOrientation="landscape"
    ...>
```

Para permitir ambas orientações:
```xml
android:screenOrientation="fullSensor"
```

---

## 🐛 Solução de Problemas

### Erro: "SDK not found"
- Instale Android SDK via Android Studio
- Configure ANDROID_HOME nas variáveis de ambiente

### Erro: "Gradle build failed"
- Abra o projeto no Android Studio
- Deixe ele baixar as dependências
- Tente novamente

### App não conecta ao servidor
- Verifique se o servidor está rodando
- Adicione permissão de INTERNET no AndroidManifest.xml
- Configure `cleartext: true` no capacitor.config.json

### Ícone não aparece
- Certifique-se de ter ícones em todos os tamanhos
- Limpe o build: `cd android && gradlew clean`

---

## 📞 Suporte

Para dúvidas:
- Documentação Capacitor: https://capacitorjs.com/docs
- Documentação Android: https://developer.android.com/docs

---

## ✅ Checklist Final

Antes de publicar:

- [ ] Testei o app em dispositivo real
- [ ] Ícones estão corretos em todos os tamanhos
- [ ] Nome do app está correto
- [ ] Versão está correta (versionCode e versionName)
- [ ] AAB foi gerado com sucesso
- [ ] Tenho todos os recursos gráficos (ícone 512x512, screenshots, etc)
- [ ] Política de privacidade está publicada
- [ ] Descrição do app está completa
- [ ] Classificação de conteúdo foi preenchida

---

**Boa sorte com a publicação! 🚀**
