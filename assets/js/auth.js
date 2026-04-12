document.addEventListener("DOMContentLoaded", () => {
    const loginScreen = document.getElementById('login-screen');
    const communityScreen = document.getElementById('community-screen');
    const welcomeText = document.getElementById('welcome-text');
    const avatarImg = document.getElementById('user-avatar-img');
    const btnLogout = document.getElementById('btn-logout');
    const dialogProfile = document.getElementById('dialog-profile');
    const myProfileBtn = document.getElementById('my-profile-btn');

    // 1. Verifica Cache
    function checkAuth() {
        const user = localStorage.getItem('lightsBlockerUser');
        if (user) {
            const userData = JSON.parse(user);
            loginScreen.classList.add('hidden');
            communityScreen.classList.remove('hidden');
            welcomeText.textContent = `Bem-vindo, ${userData.user}`;
            avatarImg.src = userData.avatar || 'assets/default-avatar.png';
        } else {
            loginScreen.classList.remove('hidden');
            communityScreen.classList.add('hidden');
        }
    }

    // 2. Simulação de Login (Aqui você conectará com seu Apps Script depois)
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        // Exemplo de como salvar no cache após o Apps Script retornar sucesso:
        const mockUser = {
            user: "PandaFofo123",
            avatar: "https://via.placeholder.com/150",
            data_criacao: "12/04/2026"
        };
        localStorage.setItem('lightsBlockerUser', JSON.stringify(mockUser));
        checkAuth();
    });

    // 3. Abrir Perfil
    myProfileBtn.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('lightsBlockerUser'));
        document.getElementById('dialog-profile-name').textContent = user.user;
        document.getElementById('dialog-profile-avatar').src = user.avatar;
        document.getElementById('profile-since').textContent = user.data_criacao;
        dialogProfile.showModal();
    });

    // 4. Fechar Modais
    document.querySelectorAll('.close-dialog').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('dialog').close();
        });
    });

    // 5. Sair
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('lightsBlockerUser');
        dialogProfile.close();
        checkAuth();
    });

    // Inicializa
    checkAuth();
});
