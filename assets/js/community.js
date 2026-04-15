function toggleLoading(show) {
    const loader = document.getElementById('loading-overlay');
    if (!loader) return;
    if (show) {
        loader.showModal();
    } else {
        loader.close();
    }
}

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
                <span class="post-category-badge" style="font-size: 0.65rem; background: #444; padding: 2px 6px; border-radius: 10px; margin-left: 8px; color: #eee; vertical-align: middle;">${post.categoria || 'Geral'}</span>
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

        article.querySelector('.post-author').addEventListener('click', (e) => {
            e.stopPropagation();
            abrirPerfilUsuario(post.user);
        });

        article.querySelectorAll('.vote-group').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const type = btn.dataset.type;
                const code = btn.dataset.code;
                const res = await callGAS({ action: "votar", code: code, tipo: type });
                if (res.sucesso) carregarPosts();
            });
        });

        article.querySelector('.post-body').addEventListener('click', () => {
            abrirPostDetalhado(post);
        });

        feedContainer.appendChild(article);
    });
}

// Busca categorias e preenche o select
async function carregarCategorias() {
    const res = await callGAS({ action: "getCategorias" });
    const select = document.getElementById('post-category');
    if (res.sucesso && select) {
        select.innerHTML = '';
        res.categorias.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            select.appendChild(opt);
        });
    }
}

async function abrirPostDetalhado(post) {
    document.getElementById('dialog-post-title').textContent = post.titulo;
    document.getElementById('dialog-post-text').textContent = post.texto;
    document.getElementById('dialog-post-meta').innerHTML = `Em <b>${post.categoria}</b> • Por <i>${post.user}</i> em ${post.data} ${post.hora}`;
    document.getElementById('comment-post-code').value = post.code;
    
    const commentsDiv = document.getElementById('comments-scroll-view');
    commentsDiv.innerHTML = '<p style="font-size:0.8rem;">Carregando comentários...</p>';
    
    document.getElementById('dialog-post').showModal();

    toggleLoading(true); // Abre o loading enquanto busca comentários
    const res = await callGAS({ action: "getComments", postCode: post.code });
    toggleLoading(false); // Fecha o loading
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

// FUNÇÃO ATUALIZADA: Agora separa perfil próprio de perfil de terceiros
async function abrirPerfilUsuario(username) {
    const userLocal = JSON.parse(localStorage.getItem('lightsBlockerUser'));
    
    // Se o perfil clicado for o meu, aciona o botão de perfil do auth.js que já tem a lógica de edição
    if (userLocal && userLocal.user === username) {
        document.getElementById('my-profile-btn').click();
        return;
    }

    // Se for outro usuário, busca os dados e abre a dialog de visualização (sem edição)
    toggleLoading(true); 
    const res = await callGAS({ action: "buscarPerfilPublico", user: username });
    toggleLoading(false);

    if (res.sucesso && res.dados) {
        const dados = res.dados;
        
        // Preenche os elementos da dialog-profile-other (criada no HTML)
        document.getElementById('dialog-profile-avatar-other').src = dados.avatar || 'assets/default-avatar.png';
        document.getElementById('dialog-profile-name-other').textContent = dados.user;
        
        // Formata a data se necessário (se não houver a função formatarData global, usamos o valor bruto ou processamos aqui)
        let dataMembro = dados.data_criacao;
        if(dataMembro && dataMembro.includes('T')) dataMembro = new Date(dataMembro).toLocaleDateString('pt-BR');
        
        document.getElementById('profile-since-other').textContent = dataMembro;
        document.getElementById('display-recado-other').textContent = dados.recado || "Sem recado disponível.";

        document.getElementById('dialog-profile-other').showModal();
    } else {
        alert("Erro ao carregar perfil do usuário.");
    }
}

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
        const postAtual = { 
            code: dados.postCode, 
            titulo: document.getElementById('dialog-post-title').textContent, 
            texto: document.getElementById('dialog-post-text').textContent, 
            categoria: '', user: '', data: '' 
        };
        abrirPostDetalhado(postAtual); 
    }
});

async function carregarPosts() {
    if (!document.getElementById('login-screen').classList.contains('hidden')) return;
  toggleLoading(true); // Abre o loading
    const res = await callGAS({ action: "getPosts" });
    toggleLoading(false); // Fecha o loading
    if (res.sucesso) renderizarPosts(res.posts);
}

document.getElementById('btn-open-new-post')?.addEventListener('click', () => {
    carregarCategorias(); // Carrega as categorias antes de abrir
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
        categoria: document.getElementById('post-category').value // Pega do dropdown
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
