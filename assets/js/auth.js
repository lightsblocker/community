document.addEventListener("DOMContentLoaded", () => {
    const loginScreen = document.getElementById('login-screen');
    const communityScreen = document.getElementById('community-screen');
    const welcomeText = document.getElementById('welcome-text');
    const avatarImg = document.getElementById('user-avatar-img');
    const btnLogout = document.getElementById('btn-logout');
    const dialogProfile = document.getElementById('dialog-profile');
    const myProfileBtn = document.getElementById('my-profile-btn');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Funções Auxiliares
    function toggleLoading(show) {
        if (show) loadingOverlay.classList.remove('loading-hidden');
        else loadingOverlay.classList.add('loading-hidden');
    }

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

    // 2. Lógica de Login REAL
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const credencialInput = document.getElementById('login-user').value;
        const senhaInput = document.getElementById('login-pass').value;
        
        toggleLoading(true);

        try {
            // Verifica se a função existe antes de chamar
            if (typeof callGAS === 'undefined') throw new Error("API não carregada");

            const resposta = await callGAS({
                action: "login",
                credencial: credencialInput,
                senha: senhaInput
            });

            if (resposta.sucesso) {
                localStorage.setItem('lightsBlockerUser', JSON.stringify(resposta.dados));
                document.getElementById('login-user').value = '';
                document.getElementById('login-pass').value = '';
                checkAuth();
            } else {
                alert("Atenção: " + (resposta.erro || "Credenciais inválidas."));
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão. Verifique se o api.js está carregado e se a URL do GAS está correta.");
        } finally {
            toggleLoading(false);
        }
    });

    // --- GERENCIAMENTO DE REGISTRO ---

    let tempUsername = "";

    async function atualizarSugestaoUsername() {
        toggleLoading(true);
        const res = await callGAS({ action: "gerarUsername" });
        if (res.sucesso) {
            tempUsername = res.user;
            document.getElementById('reg-username-display').textContent = tempUsername;
        }
        toggleLoading(false);
    }

    // Abrir Criar Conta
    document.getElementById('btn-create-account')?.addEventListener('click', () => {
        document.getElementById('dialog-register').showModal();
        atualizarSugestaoUsername(); // Gera o primeiro nome
    });

    // Botão Alterar Username dentro do modal
    document.getElementById('btn-change-username')?.addEventListener('click', (e) => {
        e.preventDefault();
        atualizarSugestaoUsername();
    });

    // Lógica de Registro Final
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        toggleLoading(true);

        const res = await callGAS({
            action: "registrar",
            usernameManual: tempUsername, // Enviamos o nome que está na tela
            email: document.getElementById('reg-email').value,
            numero_telefone: document.getElementById('reg-tel').value,
            idade: document.getElementById('reg-age').value,
            senha: document.getElementById('reg-pass').value,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${tempUsername}`
        });
        
        toggleLoading(false);
        if(res.sucesso) {
            alert("Conta criada com sucesso!");
            location.reload();
        } else { alert("Erro: " + res.erro); }
    });

    // --- RECUPERAÇÃO E PERFIL ---

    // Abrir Esqueci Senha
    document.getElementById('btn-forgot-pass')?.addEventListener('click', () => {
        document.getElementById('dialog-forgot').showModal();
    });

    document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        toggleLoading(true);
        const res = await callGAS({
            action: "recuperarSenha",
            email: document.getElementById('forgot-email').value,
            telefone: document.getElementById('forgot-tel').value,
            novaSenha: document.getElementById('forgot-new-pass').value
        });
        toggleLoading(false);
        if(res.sucesso) {
            alert("Senha alterada com sucesso!");
            document.getElementById('dialog-forgot').close();
        } else { alert("Erro: " + res.erro); }
    });

    myProfileBtn.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('lightsBlockerUser'));
        document.getElementById('dialog-profile-name').textContent = user.user;
        document.getElementById('dialog-profile-avatar').src = user.avatar;
        document.getElementById('profile-since').textContent = user.data_criacao;
        dialogProfile.showModal();
    });

    document.querySelectorAll('.close-dialog').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('dialog').close();
        });
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('lightsBlockerUser');
        dialogProfile.close();
        checkAuth();
    });

    checkAuth();
});
