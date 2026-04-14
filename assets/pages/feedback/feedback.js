window.preencherDadosFeedback = function() {
    const userLocal = JSON.parse(localStorage.getItem('lightsBlockerUser'));
    if (userLocal) {
        document.getElementById('fb-user').value = userLocal.user || '';
        document.getElementById('fb-email').value = userLocal.email || '';
        document.getElementById('fb-tel').value = userLocal.telefone || '';
        
        const agora = new Date();
        document.getElementById('fb-data').value = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
    }
};
document.getElementById('form-feedback')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnSubmit = e.target.querySelector('button');
    const originalText = btnSubmit.textContent;

    // Captura os dados dos campos
    const dadosFeedback = {
        action: "enviarFeedback",
        user: document.getElementById('fb-user').value,
        email: document.getElementById('fb-email').value,
        telefone: document.getElementById('fb-tel').value,
        data: document.getElementById('fb-data').value,
        appVersion: document.getElementById('fb-app-version').value,
        androidVersion: document.getElementById('fb-android-version').value,
        device: document.getElementById('fb-device').value,
        texto: document.getElementById('fb-text').value,
        links: document.getElementById('fb-links').value
    };

    // Ativa o loading
    if (window.toggleLoading) window.toggleLoading(true);
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviando...";

    try {
        // Envia para o callGAS (que usa o seu novo link da web no api.js)
        const res = await callGAS(dadosFeedback);

        if (res.sucesso) {
            alert("✅ Feedback enviado com sucesso! A equipe LightsBlocker agradece.");
            document.getElementById('form-feedback').reset();
            // Volta para a tela da comunidade ou limpa os campos automáticos
            if (window.preencherDadosFeedback) window.preencherDadosFeedback();
        } else {
            alert("❌ Erro ao enviar: " + (res.erro || "Erro desconhecido no servidor."));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("❌ Falha de conexão. Verifique se o script foi publicado como 'Qualquer pessoa'.");
    } finally {
        if (window.toggleLoading) window.toggleLoading(false);
        btnSubmit.disabled = false;
        btnSubmit.textContent = originalText;
    }
});
