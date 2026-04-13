document.addEventListener("DOMContentLoaded", () => {
    const feedContainer = document.getElementById('feed-container');
    const dialogPost = document.getElementById('dialog-post');
    const dialogTitle = document.getElementById('dialog-post-title');
    const dialogMeta = document.getElementById('dialog-post-meta');
    const dialogText = document.getElementById('dialog-post-text');

    // Função local de loading para manter o feedback visual enquanto busca os posts
    function toggleLoading(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (!loadingOverlay) return;
        if (show) {
            if (!loadingOverlay.open) loadingOverlay.showModal();
        } else {
            if (loadingOverlay.open) loadingOverlay.close();
        }
    }

    async function carregarPosts() {
        // Verifica se o usuário está logado antes de tentar buscar os posts
        const user = localStorage.getItem('lightsBlockerUser');
        if (!user) return;

        toggleLoading(true);
        const res = await callGAS({ action: "getPosts" });
        toggleLoading(false);

        if (res.sucesso) {
            renderizarPosts(res.posts);
        } else {
            feedContainer.innerHTML = `<p style="text-align:center; color:white;">Erro ao carregar posts: ${res.erro}</p>`;
        }
    }

    function renderizarPosts(posts) {
        // Limpa o post estático de exemplo do HTML
        feedContainer.innerHTML = ''; 

        if (!posts || posts.length === 0) {
            feedContainer.innerHTML = '<p style="text-align:center; color:#ccc; margin-top: 20px;">Nenhum post encontrado. Seja o primeiro a publicar!</p>';
            return;
        }

        posts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post-card';
            article.style.cursor = 'pointer'; // Mostra pro usuário que é clicável

            // Limita o texto para criar um "resumo" no feed (ex: 120 caracteres)
            const textoResumo = post.texto.length > 120 ? post.texto.substring(0, 120) + '...' : post.texto;

            article.innerHTML = `
                <div class="post-header">
                    <span class="post-title">${post.titulo || 'Sem título'}</span> 
                    <span class="bullet">•</span> 
                    <span class="post-author">${post.user}</span>
                </div>
                <div class="post-body">
                    ${textoResumo}
                </div>
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

            // Abre o dialog com o texto completo ao clicar no card
            article.addEventListener('click', () => abrirPostCompleto(post));

            feedContainer.appendChild(article);
        });
    }

    function abrirPostCompleto(post) {
        dialogTitle.textContent = post.titulo || 'Sem título';
        
        // Formata a data e hora. Lida com casos em que a hora pode não ter sido registrada
        let dataHora = post.data || "Data desconhecida";
        if (post.data && post.hora) {
            dataHora = `${post.data} às ${post.hora}`;
        }
        
        dialogMeta.innerHTML = `Por <span class="post-author">${post.user}</span> em <span id="dialog-post-date">${dataHora}</span>`;
        
        // Usar textContent no lugar de innerHTML para o corpo do texto evita problemas de quebra de layout ou injeção de código
        dialogText.textContent = post.texto; 
        
        dialogPost.showModal();
    }

    // Tornamos a função global para que, futuramente, ao publicar um novo post, 
    // você possa chamar window.carregarPosts() e atualizar o feed na hora
    window.carregarPosts = carregarPosts;

    // Dispara a busca assim que a página carrega
    carregarPosts();
});
