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

    // 2. Lógica de Login REAL
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const credencialInput = document.getElementById('login-user').value;
        const senhaInput = document.getElementById('login-pass').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        const textoOriginal = submitBtn.textContent;
        submitBtn.textContent = 'Carregando...';
        submitBtn.disabled = true;

        try {
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
                alert("Atenção: " + (resposta.erro || "Não foi possível fazer login."));
            }
        } catch (error) {
            alert("Erro de conexão. Verifique sua internet.");
        } finally {
            submitBtn.textContent = textoOriginal;
            submitBtn.disabled = false;
        }
    });

    // --- NOVAS FUNÇÕES ADICIONADAS ---

    // Abrir Criar Conta
    document.getElementById('btn-create-account')?.addEventListener('click', () => {
        document.getElementById('dialog-register').showModal();
    });

    // Lógica de Registro
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const res = await callGAS({
            action: "registrar",
            email: document.getElementById('reg-email').value,
            numero_telefone: document.getElementById('reg-tel').value,
            idade: document.getElementById('reg-age').value,
            senha: document.getElementById('reg-pass').value,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + Math.random()
        });
        
        if(res.sucesso) {
            alert("Conta criada! Seu usuário é: " + res.user);
            location.reload();
        } else { alert("Erro: " + res.erro); }
    });

    // Abrir Esqueci Senha
    document.getElementById('btn-forgot-pass')?.addEventListener('click', () => {
        document.getElementById('dialog-forgot').showModal();
    });

    // Lógica de Recuperação
    document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const res = await callGAS({
            action: "recuperarSenha",
            email: document.getElementById('forgot-email').value,
            telefone: document.getElementById('forgot-tel').value,
            novaSenha: document.getElementById('forgot-new-pass').value
        });
        
        if(res.sucesso) {
            alert("Senha alterada com sucesso!");
            document.getElementById('dialog-forgot').close();
        } else { alert("Erro: " + res.erro); }
    });

    // --- FIM DAS NOVAS FUNÇÕES ---

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

    checkAuth();
});
