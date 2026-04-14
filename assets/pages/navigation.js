document.addEventListener("DOMContentLoaded", () => {
    // 1. PRIMEIRO definimos as referências dos elementos
    const views = {
        community: document.getElementById('community-screen'),
        feedback: document.getElementById('feedback-screen'),
        download: document.getElementById('download-screen'),
        privacy: document.getElementById('privacy-screen'),
        blog: document.getElementById('blog-screen') // Adicionado Blog
    };

    // 2. SEGUNDO definimos a função que manipula as telas
    function showView(viewName) {
        // Oculta todas as telas que existem no objeto views
        Object.values(views).forEach(section => {
            if (section) section.classList.add('hidden');
        });
        
        // Mostra a tela desejada
        if (views[viewName]) {
            views[viewName].classList.remove('hidden');
            // Se for a comunidade, opcionalmente esconde a tela de login se estiver aberta
            if(viewName === 'community') {
                document.getElementById('login-screen')?.classList.add('hidden');
            }
        }
    }

    // 3. TERCEIRO verificamos os parâmetros da URL (Link Direto)
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');

    if (page) {
        // Pequeno delay para garantir que outros scripts (como login) não sobreponham
        setTimeout(() => {
            if (page === 'feedback') {
                showView('feedback');
                if (window.preencherDadosFeedback) window.preencherDadosFeedback();
            } else if (page === 'download') {
                showView('download');
            } else if (page === 'blog') {
                showView('blog');
            }
        }, 100); 
    }

    // 4. QUARTO configuramos os ouvintes de clique (Header)
    document.getElementById('nav-community')?.addEventListener('click', () => {
        showView('community');
        if (window.carregarPosts) window.carregarPosts();
    });

    document.getElementById('nav-feedback')?.addEventListener('click', () => {
        showView('feedback');
        if (window.preencherDadosFeedback) window.preencherDadosFeedback();
    });

    document.getElementById('nav-download')?.addEventListener('click', () => {
        showView('download');
    });

    document.getElementById('nav-blog')?.addEventListener('click', () => {
        showView('blog');
    });
});
