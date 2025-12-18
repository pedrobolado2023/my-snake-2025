// Configuração do Firebase
// IMPORTANTE: Substitua com suas próprias credenciais do Firebase Console

const firebaseConfig = {
    apiKey: "AIzaSyC_D3-30R1lvr1UHWBPiGrpu_d9JyfDHNY",
    authDomain: "my-snake-2025.firebaseapp.com",
    projectId: "my-snake-2025",
    storageBucket: "my-snake-2025.firebasestorage.app",
    messagingSenderId: "486349489836",
    appId: "1:486349489836:web:c0da9e4e251f92e0a50109",
    measurementId: "G-W4X6HLR191"
};

// Inicializar Firebase
let app, auth, db;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();

    console.log('✅ Firebase inicializado com sucesso!');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { app, auth, db };
}
