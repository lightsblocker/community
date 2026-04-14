document.addEventListener("DOMContentLoaded", () => {
    // Mapeamento de Elementos
    const loadingOverlay = document.getElementById('loading-overlay');
    const loginScreen = document.getElementById('login-screen');
    const communityScreen = document.getElementById('community-screen');
    const welcomeText = document.getElementById('welcome-text');
    const avatarImg = document.getElementById('user-avatar-img');
    
    const dialogRegister = document.getElementById('dialog-register');
    const dialogForgot = document.getElementById('dialog-forgot');
    const dialogProfile = document.getElementById('dialog-profile');
    
    const regUserDisplay = document.getElementById('reg-username-display');
    const regAvatarDisplay = document.getElementById('reg-avatar-preview');

    let currentTempUser = "";
    let currentTempAvatar = "";

    // --- FUNÇÕES DE INTERFACE PARA O RECADO ---

    async function atualizarInterfaceRecado(userLogado, recadoOriginal) {
        const display = document.getElementById('display-recado');
        const btnEdit = document.getElementById('btn-edit-recado');
        const textarea = document.getElementById('edit-recado');
        const btnSave = document.getElementById('btn-save-recado');

        if (display) display.textContent = recadoOriginal || "Sem recado disponível.";

        // Evento de Editar
        if (btnEdit) {
            btnEdit.onclick = () => {
                display.classList.add('hidden');
                btnEdit.classList.add('hidden');
                textarea.classList.remove('hidden');
                btnSave.classList.remove('hidden');
                textarea.value = (display.textContent === "Sem recado disponível.") ? "" : display.textContent;
            };
        }

        // Evento de Salvar
        if (btnSave) {
            btnSave.onclick = async () => {
                const novoTexto = textarea.value;
                toggleLoading(true);
                
                const res = await callGAS({ 
                    action: "atualizarRecado", 
                    user: userLogado, 
                    novoRecado: novoTexto 
                });

                toggleLoading(false);

                if (res.sucesso) {
                    display.textContent = novoTexto || "Sem recado disponível.";
                    display.classList.remove('hidden');
                    btnEdit.classList.remove('hidden');
                    textarea.classList.add('hidden');
                    btnSave.classList.add('hidden');
                    
                    // Atualiza o cache local
                    const u = JSON.parse(localStorage.getItem('lightsBlockerUser'));
                    u.recado = novoTexto;
                    localStorage.setItem('lightsBlockerUser', JSON.stringify(u));
                } else {
                    alert("Erro ao salvar recado!");
                }
            };
        }
    }

    // Função Auxiliar para Formatar Data
    function formatarData(dataRaw) {
        if (!dataRaw) return "N/A";
        const d = new Date(dataRaw);
        if (isNaN(d.getTime())) return dataRaw; 
        
        const dia = String(d.getUTCDate()).padStart(2, '0');
        const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
        const ano = d.getUTCFullYear();
        return `${dia}/${mes}/${ano}`;
    }

    function toggleLoading(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (!loadingOverlay) return;

        if (show) {
            if (!loadingOverlay.open) {
                loadingOverlay.showModal();
            }
        } else {
            if (loadingOverlay.open) {
                loadingOverlay.close();
            }
        }
    }

    // --- GERADORES DINÂMICOS ---

    async function atualizarSugestaoUsername() {
        toggleLoading(true);
        const res = await callGAS({ action: "gerarUsername" });
        if (res.sucesso) {
            currentTempUser = res.user;
            regUserDisplay.textContent = currentTempUser;
        }
        toggleLoading(false);
    }

    async function atualizarSugestaoAvatar() {
        toggleLoading(true);
        const res = await callGAS({ action: "getAvatarAleatorio" });
        if (res.sucesso) {
            currentTempAvatar = res.url;
            regAvatarDisplay.src = currentTempAvatar;
        }
        toggleLoading(false);
    }

    // --- LOGICA DE REGISTRO ---

    document.getElementById('btn-create-account')?.addEventListener('click', async () => {
        dialogRegister.showModal();
        await atualizarSugestaoUsername();
        await atualizarSugestaoAvatar();
    });

    document.getElementById('btn-change-user')?.addEventListener('click', (e) => {
        e.preventDefault();
        atualizarSugestaoUsername();
    });

    document.getElementById('btn-change-avatar')?.addEventListener('click', (e) => {
        e.preventDefault();
        atualizarSugestaoAvatar();
    });

    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        toggleLoading(true);

        const dadosCadastro = {
            action: "registrar",
            user: currentTempUser,
            avatar: currentTempAvatar,
            email: document.getElementById('reg-email').value,
            numero_telefone: document.getElementById('reg-tel').value,
            idade: document.getElementById('reg-age').value,
            senha: document.getElementById('reg-pass').value
        };

        const res = await callGAS(dadosCadastro);
        toggleLoading(false);

        if(res.sucesso) {
            alert("Conta criada com sucesso!");
            location.reload();
        } else {
            alert("Erro: " + res.erro);
        }
    });

    // --- LOGIN E SESSÃO ---

    function checkAuth() {
        const user = localStorage.getItem('lightsBlockerUser');
        if (user) {
            const u = JSON.parse(user);
            loginScreen.classList.add('hidden');
            communityScreen.classList.remove('hidden');
            welcomeText.textContent = `Bem-vindo, ${u.user}`;
            avatarImg.src = u.avatar || 'assets/default-avatar.png';
            
            if (window.carregarPosts) {
                window.carregarPosts();
            }
        }
    }

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        toggleLoading(true);
        const resposta = await callGAS({
            action: "login",
            credencial: document.getElementById('login-user').value,
            senha: document.getElementById('login-pass').value
        });
        toggleLoading(false);

        if (resposta.sucesso) {
            localStorage.setItem('lightsBlockerUser', JSON.stringify(resposta.dados));
            checkAuth();
        } else {
            alert(resposta.erro || "Falha no login");
        }
    });

    // --- PERFIL E EDIÇÃO ---

    document.getElementById('my-profile-btn')?.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('lightsBlockerUser'));
        document.getElementById('dialog-profile-name').textContent = user.user;
        document.getElementById('dialog-profile-avatar').src = user.avatar;
        document.getElementById('profile-since').textContent = formatarData(user.data_criacao);
        
        // Inicializa a interface de recado ao abrir o perfil
        atualizarInterfaceRecado(user.user, user.recado);
        
        dialogProfile.showModal();
    });

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
                alert("Avatar atualizado!");
            }
        }
        toggleLoading(false);
    });

    // --- AUXILIARES ---

    document.querySelectorAll('.close-dialog').forEach(btn => {
        btn.addEventListener('click', () => btn.closest('dialog').close());
    });

    document.getElementById('btn-logout')?.addEventListener('click', () => {
        localStorage.removeItem('lightsBlockerUser');
        location.reload();
    });

    document.getElementById('btn-forgot-pass')?.addEventListener('click', () => dialogForgot.showModal());

    checkAuth();
});
