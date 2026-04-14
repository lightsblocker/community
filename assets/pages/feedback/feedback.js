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
    
    // Captura os dados
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

    // Aqui você vai precisar criar a função "enviarFeedback" no code.gs depois
    if (window.toggleLoading) window.toggleLoading(true);
    const res = await callGAS(dadosFeedback);
    if (window.toggleLoading) window.toggleLoading(false);

    if (res.sucesso) {
        alert("Feedback enviado com sucesso! Obrigado.");
        document.getElementById('form-feedback').reset();
    } else {
        alert("Apenas testando a interface. (Você precisará criar a função no Google Apps Script para salvar isso na planilha).");
    }
});
