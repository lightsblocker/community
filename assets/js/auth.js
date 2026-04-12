document.addEventListener("DOMContentLoaded", () => {
    // 1. Mapeamento de Elementos HTML
    const loadingOverlay = document.getElementById('loading-overlay');
    const loginScreen = document.getElementById('login-screen');
    const communityScreen = document.getElementById('community-screen');
    const welcomeText = document.getElementById('welcome-text');
    const avatarImg = document.getElementById('user-avatar-img');
    
    // Modais
    const dialogRegister = document.getElementById('dialog-register');
    const dialogForgot = document.getElementById('dialog-forgot');
    const dialogProfile = document.getElementById('dialog-profile');
    
    // Exibições de Criação de Conta
    const regUserDisplay = document.getElementById('reg-username-display');
    const regAvatarDisplay = document.getElementById('reg-avatar-preview');

    // Variáveis temporárias para o registro
    let currentTempUser = "";
    let currentTempAvatar = "";

    // 2. Função de Loading
    function toggleLoading(show) {
        if (show) loadingOverlay.classList.remove('loading-hidden');
        else loadingOverlay.classList.add('loading-hidden');
    }

    // 3. Verificação de Cache (Sessão Logada)
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

    // 4. Lógica de Login
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede a página de recarregar
        const credencialInput = document.getElementById('login-user').value;
        const senhaInput = document.getElementById('login-pass').value;
        
        toggleLoading(true);

        try {
            if (typeof callGAS === 'undefined') throw new Error("API não carregada (api.js faltando)");

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
            alert("Erro de conexão. Verifique sua internet ou a URL do Apps Script.");
        } finally {
            toggleLoading(false);
        }
    });

    // 5. Lógica de Criação de Conta (Gerar Dados Iniciais)
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

    // Abrir Janela de Registro
    document.getElementById('btn-create-account')?.addEventListener('click', (e) => {
        e.preventDefault();
        dialogRegister.showModal();
        gerarDadosIniciais();
    });

    // Botões "Trocar" no Registro
    document.getElementById('btn-change-user')?.addEventListener('click', async (e) => {
        e.preventDefault();
        toggleLoading(true);
        const res = await callGAS({ action: "gerarUsername" });
        if(res.sucesso) regUserDisplay.textContent = currentTempUser = res.user;
        toggleLoading(false);
    });

    document.getElementById('btn-change-avatar')?.addEventListener('click', async (e) => {
        e.preventDefault();
        toggleLoading(true);
        const res = await callGAS({ action: "getAvatarAleatorio" });
        if(res.sucesso) regAvatarDisplay.src = currentTempAvatar = res.url;
        toggleLoading(false);
    });

    // Enviar Cadastro Final
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        toggleLoading(true);
        const res = await callGAS({
            action: "registrar",
            user: currentTempUser,
            avatar: currentTempAvatar,
            email: document.getElementById('reg-email').value,
            numero_telefone: document.getElementById('reg-tel').value,
            idade: document.getElementById('reg-age').value,
            senha: document.getElementById('reg-pass').value
        });
        toggleLoading(false);
        
        if(res.sucesso) {
            alert("Conta criada com sucesso! Você já pode fazer login.");
            dialogRegister.close();
            location.reload();
        } else {
            alert("Erro ao criar conta: " + res.erro);
        }
    });

    // 6. Recuperação de Senha
    document.getElementById('btn-forgot-pass')?.addEventListener('click', (e) => {
        e.preventDefault();
        dialogForgot.showModal();
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
            dialogForgot.close();
            document.getElementById('forgot-form').reset();
        } else {
            alert("Erro: " + res.erro);
        }
    });

    // 7. Perfil e Logout
    document.getElementById('my-profile-btn')?.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('lightsBlockerUser'));
        document.getElementById('dialog-profile-name').textContent = user.user;
        document.getElementById('dialog-profile-avatar').src = user.avatar;
        document.getElementById('profile-since').textContent = user.data_criacao || "Recente";
        dialogProfile.showModal();
    });

    document.getElementById('btn-logout')?.addEventListener('click', () => {
        localStorage.removeItem('lightsBlockerUser');
        dialogProfile.close();
        checkAuth();
    });

    // 8. Botões Globais de Fechar Janelas
    document.querySelectorAll('.close-dialog').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            this.closest('dialog').close();
        });
    });

    // Inicia verificando se já está logado
    checkAuth();
});
