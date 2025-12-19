// Script para copiar arquivos web para a pasta www do app mobile
const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '..');
const destDir = path.join(__dirname, 'www');

// Arquivos e pastas para copiar
const itemsToCopy = [
    'index.html',
    'styles.css',
    'skin-selection.css',
    'skin-selection-responsive.css',
    'mobile-optimizations.css',
    'js'
];

// Limpar pasta www
if (fs.existsSync(destDir)) {
    fs.removeSync(destDir);
}
fs.mkdirSync(destDir);

console.log('📱 Copiando arquivos web para o app mobile...\n');

// Copiar cada item
itemsToCopy.forEach(item => {
    const sourcePath = path.join(sourceDir, item);
    const destPath = path.join(destDir, item);

    if (fs.existsSync(sourcePath)) {
        fs.copySync(sourcePath, destPath);
        console.log(`✅ Copiado: ${item}`);
    } else {
        console.log(`⚠️  Não encontrado: ${item}`);
    }
});

// Criar arquivo de configuração mobile
const mobileConfig = `
<!-- Configuração específica para mobile -->
<script>
    // Forçar modo mobile
    window.IS_MOBILE_APP = true;
    
    // Desabilitar zoom
    document.addEventListener('DOMContentLoaded', function() {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
    });
</script>
`;

// Adicionar configuração mobile ao index.html
const indexPath = path.join(destDir, 'index.html');
if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    indexContent = indexContent.replace('</head>', mobileConfig + '</head>');
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Configuração mobile adicionada ao index.html');
}

console.log('\n✨ Arquivos copiados com sucesso!');
console.log('📂 Destino:', destDir);
