// Função para renderizar os posts (movida para fora para ser acessível)
function renderizarPosts(posts) {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;

    // LIMPEZA IMEDIATA: Remove qualquer conteúdo estático (post falso)
    feedContainer.innerHTML = ''; 

    if (!posts || posts.length === 0) {
        feedContainer.innerHTML = '<p style="text-align:center; color:#ccc; margin-top: 20px;">Nenhum post encontrado.</p>';
        return;
    }

    posts.forEach(post => {
        const article = document.createElement('article');
        article.className = 'post-card';
        article.style.cursor = 'pointer';

        const textoResumo = post.texto.length > 120 ? post.texto.substring(0, 120) + '...' : post.texto;

        article.innerHTML = `
            <div class="post-header">
                <span class="post-title">${post.titulo || 'Sem título'}</span> 
                <span class="bullet">•</span> 
                <span class="post-author">${post.user}</span>
            </div>
            <div class="post-body">${textoResumo}</div>
            <div class="post-footer">
                <div class="vote-group">
                    <div class="triangle-up"></div>
                    <span class="vote-count up">${post.upvotes || 0}</span>
                </div>
                <div class="vote-group">
                    <div class="triangle-down"></div>
                    <span class="vote-count down">${post.downvotes || 0}</span>
                </div>
            </div>
        `;

        article.addEventListener('click', () => {
            document.getElementById('dialog-post-title').textContent = post.titulo;
            document.getElementById('dialog-post-text').textContent = post.texto;
            document.getElementById('dialog-post-meta').innerHTML = `Por ${post.user} em ${post.data}`;
            document.getElementById('dialog-post').showModal();
        });

        feedContainer.appendChild(article);
    });
}

async function carregarPosts() {
    // Se o container de login estiver visível, não busca posts ainda
    if (!document.getElementById('login-screen').classList.contains('hidden')) return;

    const feedContainer = document.getElementById('feed-container');
    feedContainer.innerHTML = '<p style="text-align:center; color:white;">Carregando posts...</p>';

    const res = await callGAS({ action: "getPosts" });
    
    if (res.sucesso) {
        renderizarPosts(res.posts);
    } else {
        console.error("Erro ao buscar posts:", res.erro);
    }
}

// Escuta o evento de carregamento
document.addEventListener("DOMContentLoaded", () => {
    // Se o usuário já estiver logado (F5 na página), carrega os posts
    if (localStorage.getItem('lightsBlockerUser')) {
        carregarPosts();
    }
});
// --- LÓGICA DE CRIAÇÃO DE POST ---

document.getElementById('btn-open-new-post')?.addEventListener('click', () => {
    document.getElementById('dialog-new-post').showModal();
});

document.getElementById('form-new-post')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Pega o usuário logado no localStorage
    const userLocal = JSON.parse(localStorage.getItem('lightsBlockerUser'));
    if (!userLocal) return alert("Você precisa estar logado!");

    const dados = {
        action: "criarPost", // Deve bater com o switch no seu Google Apps Script
        titulo: document.getElementById('post-title').value,
        texto: document.getElementById('post-content').value,
        user: userLocal.user
    };

    if (window.toggleLoading) window.toggleLoading(true);

    const res = await callGAS(dados);

    if (window.toggleLoading) window.toggleLoading(false);

    if (res.sucesso) {
        document.getElementById('dialog-new-post').close();
        document.getElementById('form-new-post').reset();
        carregarPosts(); // Recarrega o feed para mostrar o post novo
    } else {
        alert("Erro ao publicar: " + res.erro);
    }
});
// Torna global para o auth.js chamar após o login
window.carregarPosts = carregarPosts;
