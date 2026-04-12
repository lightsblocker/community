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

    // 2. Lógica de Login REAL conectada ao banco de dados (Apps Script)
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const credencialInput = document.getElementById('login-user').value;
        const senhaInput = document.getElementById('login-pass').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Feedback visual de carregamento
        const textoOriginal = submitBtn.textContent;
        submitBtn.textContent = 'Carregando...';
        submitBtn.disabled = true;

        try {
            // Chama a função genérica que está no api.js
            const resposta = await callGAS({
                action: "login",
                credencial: credencialInput,
                senha: senhaInput
            });

            if (resposta.sucesso) {
                // Salva os dados retornados da planilha no cache
                localStorage.setItem('lightsBlockerUser', JSON.stringify(resposta.dados));
                
                // Limpa os campos após o sucesso
                document.getElementById('login-user').value = '';
                document.getElementById('login-pass').value = '';
                
                // Atualiza a tela
                checkAuth();
            } else {
                alert("Atenção: " + (resposta.erro || "Não foi possível fazer login."));
            }
        } catch (error) {
            console.error("Erro na tentativa de login:", error);
            alert("Erro de conexão. Verifique sua internet ou tente novamente mais tarde.");
        } finally {
            // Restaura o botão independente de sucesso ou erro
            submitBtn.textContent = textoOriginal;
            submitBtn.disabled = false;
        }
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
