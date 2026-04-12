document.addEventListener("DOMContentLoaded", () => {
    // Seleção de elementos
    const loadingOverlay = document.getElementById('loading-overlay');
    const loginScreen = document.getElementById('login-screen');
    const communityScreen = document.getElementById('community-screen');
    const welcomeText = document.getElementById('welcome-text');
    const avatarImg = document.getElementById('user-avatar-img');
    const dialogRegister = document.getElementById('dialog-register');
    const regUserDisplay = document.getElementById('reg-username-display');
    const regAvatarDisplay = document.getElementById('reg-avatar-preview');

    let currentTempUser = "";
    let currentTempAvatar = "";

    function toggleLoading(show) {
        if (show) loadingOverlay.classList.remove('loading-hidden');
        else loadingOverlay.classList.add('loading-hidden');
    }

    // 1. Geradores de dados para Criação de Conta
    async function gerarDadosIniciais() {
        toggleLoading(true);
        const resUser = await callGAS({ action: "gerarUsername" });
        const resAvatar = await callGAS({ action: "getAvatarAleatorio" });
        
        if (resUser.sucesso) {
            currentTempUser = resUser.user;
            regUserDisplay.textContent = currentTempUser;
        }
        if (resAvatar.sucesso) {
            currentTempAvatar = resAvatar.url;
            regAvatarDisplay.src = currentTempAvatar;
        }
        toggleLoading(false);
    }

    // Abrir Modal de Registro
    document.getElementById('btn-create-account')?.addEventListener('click', () => {
        dialogRegister.showModal();
        gerarDadosIniciais();
    });

    // Botões de "Alterar" no Registro
    document.getElementById('btn-change-user')?.addEventListener('click', async () => {
        toggleLoading(true);
        const res = await callGAS({ action: "gerarUsername" });
        if(res.sucesso) regUserDisplay.textContent = currentTempUser = res.user;
        toggleLoading(false);
    });

    document.getElementById('btn-change-avatar')?.addEventListener('click', async () => {
        toggleLoading(true);
        const res = await callGAS({ action: "getAvatarAleatorio" });
        if(res.sucesso) regAvatarDisplay.src = currentTempAvatar = res.url;
        toggleLoading(false);
    });

    // 2. Lógica de Registro Final
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        toggleLoading(true);
        const res = await callGAS({
            action: "registrar",
            email: document.getElementById('reg-email').value,
            numero_telefone: document.getElementById('reg-tel').value,
            idade: document.getElementById('reg-age').value,
            senha: document.getElementById('reg-pass').value,
            user: currentTempUser, // O nome que o usuário viu
            avatar: currentTempAvatar // O avatar que o usuário viu
        });
        toggleLoading(false);
        if(res.sucesso) {
            alert("Conta criada!");
            location.reload();
        } else { alert("Erro: " + res.erro); }
    });

    // 3. Alterar Avatar no Perfil (Depois de logado)
    document.getElementById('btn-edit-profile-avatar')?.addEventListener('click', async () => {
        toggleLoading(true);
        const resAvatar = await callGAS({ action: "getAvatarAleatorio" });
        if (resAvatar.sucesso) {
            const user = JSON.parse(localStorage.getItem('lightsBlockerUser'));
            const resUpdate = await callGAS({
                action: "atualizarAvatar",
                user: user.user,
                novoAvatar: resAvatar.url
            });
            if (resUpdate.sucesso) {
                user.avatar = resAvatar.url;
                localStorage.setItem('lightsBlockerUser', JSON.stringify(user));
                document.getElementById('dialog-profile-avatar').src = resAvatar.url;
                avatarImg.src = resAvatar.url;
            }
        }
        toggleLoading(false);
    });

    // ... Manter funções de checkAuth, Login e Logout ...
    checkAuth();
});

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
