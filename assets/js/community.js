// Renderização dos Posts
function renderizarPosts(posts) {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;
    feedContainer.innerHTML = ''; 

    if (!posts || posts.length === 0) {
        feedContainer.innerHTML = '<p style="text-align:center; color:#ccc; margin-top: 20px;">Nenhum post encontrado.</p>';
        return;
    }

    posts.forEach(post => {
        const article = document.createElement('article');
        article.className = 'post-card';

        const textoResumo = post.texto.length > 120 ? post.texto.substring(0, 120) + '...' : post.texto;

        article.innerHTML = `
            <div class="post-header">
                <span class="post-title">${post.titulo || 'Sem título'}</span> 
                <span class="bullet">•</span> 
                <span class="post-author" data-user="${post.user}" style="color: var(--accent-blue); cursor: pointer; font-weight: bold;">${post.user}</span>
            </div>
            <div class="post-body" style="cursor:pointer;">${textoResumo}</div>
            <div class="post-footer">
                <div class="vote-group" data-type="upvotes" data-code="${post.code}" style="cursor:pointer;">
                    <div class="triangle-up"></div>
                    <span class="vote-count up">${post.upvotes || 0}</span>
                </div>
                <div class="vote-group" data-type="downvotes" data-code="${post.code}" style="cursor:pointer;">
                    <div class="triangle-down"></div>
                    <span class="vote-count down">${post.downvotes || 0}</span>
                </div>
            </div>
        `;

        // Clique no Nome do Usuário -> Abre Perfil
        article.querySelector('.post-author').addEventListener('click', (e) => {
            e.stopPropagation();
            abrirPerfilUsuario(post.user);
        });

        // Clique no Voto (Up/Down)
        article.querySelectorAll('.vote-group').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const type = btn.dataset.type;
                const code = btn.dataset.code;
                const res = await callGAS({ action: "votar", code: code, tipo: type });
                if (res.sucesso) carregarPosts();
            });
        });

        // Clique no corpo do card -> Abre Post
        article.querySelector('.post-body').addEventListener('click', () => {
            abrirPostDetalhado(post);
        });

        feedContainer.appendChild(article);
    });
}

// Abre o Post Detalhado com Comentários
async function abrirPostDetalhado(post) {
    document.getElementById('dialog-post-title').textContent = post.titulo;
    document.getElementById('dialog-post-text').textContent = post.texto;
    document.getElementById('dialog-post-meta').innerHTML = `Por <i>${post.user}</i> em ${post.data} ${post.hora}`;
    document.getElementById('comment-post-code').value = post.code;
    
    // Limpa comentários anteriores e mostra loading
    const commentsDiv = document.getElementById('comments-scroll-view');
    commentsDiv.innerHTML = '<p style="font-size:0.8rem;">Carregando comentários...</p>';
    
    document.getElementById('dialog-post').showModal();

    // Busca comentários reais
    const res = await callGAS({ action: "getComments", postCode: post.code });
    if (res.sucesso) {
        commentsDiv.innerHTML = res.comments.length ? '' : '<p style="font-size:0.8rem; color:#888;">Nenhum comentário ainda.</p>';
        res.comments.forEach(c => {
            const p = document.createElement('p');
            p.style.fontSize = '0.85rem';
            p.style.marginBottom = '8px';
            p.style.borderBottom = '1px solid #333';
            p.style.paddingBottom = '4px';
            p.innerHTML = `<b style="color:var(--accent-blue);">${c.user}:</b> ${c.texto}`;
            commentsDiv.appendChild(p);
        });
    }
}

// Gerencia Perfil (Próprio vs Alheio)
async function abrirPerfilUsuario(username) {
    const userLocal = JSON.parse(localStorage.getItem('lightsBlockerUser'));
    const isMe = userLocal && userLocal.user === username;

    // Busca dados do usuário via GAS para garantir o avatar e data corretos
    if (window.toggleLoading) window.toggleLoading(true);
    const res = await callGAS({ action: "buscarPerfilPublico", user: username });
    if (window.toggleLoading) window.toggleLoading(false);

    if (res.sucesso) {
        document.getElementById('dialog-profile-avatar').src = res.dados.avatar;
        document.getElementById('dialog-profile-name').textContent = res.dados.user;
        document.getElementById('profile-since').textContent = res.dados.data_criacao;

        // Controle de permissão
        document.getElementById('profile-edit-zone').style.display = isMe ? 'block' : 'none';
        document.getElementById('profile-logout-zone').style.display = isMe ? 'block' : 'none';

        document.getElementById('dialog-profile').showModal();
    }
}

// Envio de Comentário
document.getElementById('form-comment')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userLocal = JSON.parse(localStorage.getItem('lightsBlockerUser'));
    if (!userLocal) return alert("Faça login para comentar.");

    const dados = {
        action: "comentar",
        postCode: document.getElementById('comment-post-code').value,
        texto: document.getElementById('comment-text').value,
        user: userLocal.user
    };

    const res = await callGAS(dados);
    if (res.sucesso) {
        document.getElementById('comment-text').value = '';
        // Atualiza a vista do post para mostrar o novo comentário
        const postAtual = { code: dados.postCode, titulo: document.getElementById('dialog-post-title').textContent, texto: document.getElementById('dialog-post-text').textContent, user: '...', data: '...' };
        abrirPostDetalhado(postAtual); 
    }
});

// Funções de Carga Existentes
async function carregarPosts() {
    if (!document.getElementById('login-screen').classList.contains('hidden')) return;
    const res = await callGAS({ action: "getPosts" });
    if (res.sucesso) renderizarPosts(res.posts);
}

document.getElementById('btn-open-new-post')?.addEventListener('click', () => {
    document.getElementById('dialog-new-post').showModal();
});

document.getElementById('form-new-post')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userLocal = JSON.parse(localStorage.getItem('lightsBlockerUser'));
    const dados = {
        action: "publicarPost",
        titulo: document.getElementById('post-title').value,
        texto: document.getElementById('post-content').value,
        user: userLocal.user,
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}),
        categoria: "Geral"
    };
    const res = await callGAS(dados);
    if (res.sucesso) {
        document.getElementById('dialog-new-post').close();
        document.getElementById('form-new-post').reset();
        carregarPosts();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('lightsBlockerUser')) carregarPosts();
});

window.carregarPosts = carregarPosts;
