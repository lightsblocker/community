const API_URL = "https://script.google.com/macros/s/AKfycby3FNaS-JX1vns28F2cMgsxJ_LZ54lh7DSzYdO0dOB4tsio-pRCWQCHaDs2_xP1JmlibA/exec";

async function callGAS(data) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            mode: "cors", // Mudado para cors com estratégia de envio simples
            header: { "Content-Type": "text/plain" }, 
            body: JSON.stringify(data)
        });
        return await response.json(); 
    } catch (error) {
        console.error("Erro na comunicação:", error);
        return { sucesso: false, erro: "Falha na conexão. Verifique se o Script foi implantado como 'Qualquer Pessoa'." };
    }
}

// ... manter as funções criarNovoPost e carregarFeed como estão ...

/**
 * Função para publicar um novo post
 */
async function criarNovoPost(titulo, texto, categoria) {
    const userStorage = localStorage.getItem('lightsBlockerUser');
    if (!userStorage) return { sucesso: false, erro: "Usuário não logado" };

    const userData = JSON.parse(userStorage);
    const agora = new Date();

    const postData = {
        action: "publicarPost",
        user: userData.user,
        titulo: titulo,
        texto: texto,
        categoria: categoria,
        // Formata data e hora para facilitar a limpeza de 7 dias depois
        data: agora.toLocaleDateString('pt-BR'), 
        hora: agora.toLocaleTimeString('pt-BR')
    };

    return await callGAS(postData);
}

/**
 * Função para buscar todos os posts do feed
 */
async function carregarFeed() {
    return await callGAS({ action: "getPosts" });
}
