document.addEventListener("DOMContentLoaded", () => {
    const views = {
        community: document.getElementById('community-screen'),
        feedback: document.getElementById('feedback-screen'),
        download: document.getElementById('download-screen'),
        privacy: document.getElementById('privacy-screen')
    };

    function showView(viewName) {
        // Oculta todas as telas principais (exceto login se não estiver logado)
        Object.values(views).forEach(section => {
            if (section) section.classList.add('hidden');
        });
        
        // Mostra a selecionada
        if (views[viewName]) {
            views[viewName].classList.remove('hidden');
        }
    }

    // Eventos dos botões do header
    document.getElementById('nav-community')?.addEventListener('click', () => {
        showView('community');
        if (window.carregarPosts) window.carregarPosts(); // Recarrega os posts
    });

    document.getElementById('nav-feedback')?.addEventListener('click', () => {
        showView('feedback');
        // Preenche os dados automaticamente se houver a função
        if (window.preencherDadosFeedback) window.preencherDadosFeedback();
    });

    document.getElementById('nav-download')?.addEventListener('click', () => {
        showView('download');
    });
});
