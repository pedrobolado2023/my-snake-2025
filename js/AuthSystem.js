// Sistema de Autenticação com Firebase
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.userStats = null;

        // Verificar se Firebase está disponível
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase não carregado. Autenticação desabilitada.');
            return;
        }

        // Listener para mudanças de autenticação
        auth.onAuthStateChanged((user) => {
            this.handleAuthStateChanged(user);
        });
    }

    async handleAuthStateChanged(user) {
        if (user) {
            // Usuário logado
            this.currentUser = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photo: user.photoURL
            };
            this.isAuthenticated = true;

            console.log('✅ Usuário logado:', this.currentUser.name);

            // Carregar estatísticas do usuário
            await this.loadUserStats();

            // Atualizar UI
            this.updateUI();
        } else {
            // Usuário deslogado
            this.currentUser = null;
            this.isAuthenticated = false;
            this.userStats = null;

            console.log('👋 Usuário deslogado');

            // Atualizar UI
            this.updateUI();
        }
    }

    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            const result = await auth.signInWithPopup(provider);
            const user = result.user;

            console.log('🎉 Login bem-sucedido!', user.displayName);

            // Criar/atualizar documento do usuário
            await this.createOrUpdateUser(user);

            return true;
        } catch (error) {
            console.error('❌ Erro no login:', error);

            if (error.code === 'auth/popup-blocked') {
                alert('Por favor, permita pop-ups para fazer login com Google.');
            } else if (error.code === 'auth/popup-closed-by-user') {
                console.log('Login cancelado pelo usuário');
            } else {
                alert('Erro ao fazer login. Tente novamente.');
            }

            return false;
        }
    }

    async signOut() {
        try {
            await auth.signOut();
            console.log('👋 Logout realizado');
            return true;
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            return false;
        }
    }

    async createOrUpdateUser(user) {
        try {
            const userRef = db.collection('users').doc(user.uid);
            const userDoc = await userRef.get();

            const userData = {
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (!userDoc.exists) {
                // Novo usuário
                userData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                userData.totalGames = 0;
                userData.totalKills = 0;
                userData.highScore = 0;
                userData.totalPlayTime = 0;

                await userRef.set(userData);
                console.log('✨ Novo usuário criado no banco de dados');
            } else {
                // Usuário existente - atualizar apenas dados básicos
                await userRef.update(userData);
                console.log('🔄 Dados do usuário atualizados');
            }
        } catch (error) {
            console.error('❌ Erro ao criar/atualizar usuário:', error);
        }
    }

    async loadUserStats() {
        if (!this.currentUser) return;

        try {
            const userRef = db.collection('users').doc(this.currentUser.uid);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                this.userStats = userDoc.data();
                console.log('📊 Estatísticas carregadas:', this.userStats);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
        }
    }

    async saveGameStats(score, length, kills, playTime) {
        if (!this.currentUser) return;

        try {
            const userRef = db.collection('users').doc(this.currentUser.uid);

            // Atualizar estatísticas
            const updates = {
                totalGames: firebase.firestore.FieldValue.increment(1),
                totalKills: firebase.firestore.FieldValue.increment(kills),
                totalPlayTime: firebase.firestore.FieldValue.increment(playTime)
            };

            // Atualizar high score se for maior
            if (!this.userStats || score > this.userStats.highScore) {
                updates.highScore = score;
                updates.highScoreDate = firebase.firestore.FieldValue.serverTimestamp();
            }

            await userRef.update(updates);

            // Atualizar leaderboard
            await this.updateLeaderboard(score, length);

            console.log('💾 Estatísticas salvas!');
        } catch (error) {
            console.error('❌ Erro ao salvar estatísticas:', error);
        }
    }

    async updateLeaderboard(score, length) {
        if (!this.currentUser) return;

        try {
            const leaderboardRef = db.collection('leaderboard').doc(this.currentUser.uid);

            await leaderboardRef.set({
                uid: this.currentUser.uid,
                name: this.currentUser.name,
                photo: this.currentUser.photo,
                score: score,
                length: length,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log('🏆 Leaderboard atualizado!');
        } catch (error) {
            console.error('❌ Erro ao atualizar leaderboard:', error);
        }
    }

    async getGlobalLeaderboard(limit = 100) {
        try {
            const snapshot = await db.collection('leaderboard')
                .orderBy('score', 'desc')
                .limit(limit)
                .get();

            const leaderboard = [];
            snapshot.forEach(doc => {
                leaderboard.push(doc.data());
            });

            return leaderboard;
        } catch (error) {
            console.error('❌ Erro ao carregar leaderboard:', error);
            return [];
        }
    }

    updateUI() {
        const authButton = document.getElementById('auth-button');
        const userInfo = document.getElementById('user-info');
        const playerNameInput = document.getElementById('player-name');

        if (!authButton) return;

        if (this.isAuthenticated) {
            // Usuário logado
            authButton.innerHTML = `
                <span class="btn-icon">👤</span>
                <span class="btn-text">SAIR (${this.currentUser.name})</span>
            `;
            authButton.onclick = () => this.signOut();

            // Preencher nome automaticamente
            if (playerNameInput) {
                playerNameInput.value = this.currentUser.name;
                playerNameInput.disabled = true;
            }

            // Mostrar foto do usuário
            if (userInfo && this.currentUser.photo) {
                userInfo.innerHTML = `
                    <img src="${this.currentUser.photo}" 
                         alt="${this.currentUser.name}" 
                         class="user-photo">
                `;
                userInfo.style.display = 'block';
            }
        } else {
            // Usuário não logado
            authButton.innerHTML = `
                <span class="btn-icon">🔐</span>
                <span class="btn-text">ENTRAR COM GOOGLE</span>
            `;
            authButton.onclick = () => this.signInWithGoogle();

            // Habilitar edição do nome
            if (playerNameInput) {
                playerNameInput.disabled = false;
            }

            // Esconder foto
            if (userInfo) {
                userInfo.style.display = 'none';
            }
        }
    }

    getUserName() {
        return this.isAuthenticated ? this.currentUser.name : null;
    }

    getHighScore() {
        return this.userStats ? this.userStats.highScore : 0;
    }

    getTotalGames() {
        return this.userStats ? this.userStats.totalGames : 0;
    }

    getTotalKills() {
        return this.userStats ? this.userStats.totalKills : 0;
    }
}

// Criar instância global
const authSystem = new AuthSystem();

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}
