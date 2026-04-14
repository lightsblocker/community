async function carregarBlog() {
    const grid = document.getElementById('blog-grid');
    const path = "assets/pages/blog/posts/";
    
    try {
        // 1. Busca a lista de arquivos (você deve criar esse index.json)
        const response = await fetch(path + "index.json");
        const arquivos = await response.json();
        
        grid.innerHTML = ""; // Limpa a grade

        for (const nomeArquivo of arquivos) {
            const resPost = await fetch(path + nomeArquivo);
            const htmlBruto = await resPost.text();
            
            // 2. Extrair dados usando Regex baseado no seu formato
            const tituloMatch = htmlBruto.match(/<h1[^>]*>(.*?)<\/h1>/i);
            const imgMatch = htmlBruto.match(/img="(.*?)"/i);
            
            const titulo = tituloMatch ? tituloMatch[1] : "Sem título";
            const imgUrl = imgMatch ? imgMatch[1] : "https://via.placeholder.com/300x400?text=Sem+Imagem";

            // 3. Criar o Card
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.innerHTML = `
                <img src="${imgUrl}" class="blog-card-img" alt="${titulo}">
                <div class="blog-card-info">
                    <span class="blog-card-title">${titulo}</span>
                </div>
            `;
            
            // 4. Evento de clique para abrir o post completo
            card.onclick = () => abrirPostBlog(htmlBruto);
            
            grid.appendChild(card);
        }
    } catch (error) {
        console.error("Erro ao carregar blog:", error);
        grid.innerHTML = "<p>Erro ao carregar os posts do blog.</p>";
    }
}

function abrirPostBlog(conteúdoCompleto) {
    const container = document.getElementById('blog-post-full-content');
    
    // Limpar tags inframe customizadas para exibição real
    let htmlFinal = conteúdoCompleto.replace(/<inframe\s+img="(.*?)"\s*><\/inframe>/gi, '<img src="$1">');
    htmlFinal = htmlFinal.replace(/<inframe\s+img="(.*?)"\s*\/>/gi, '<img src="$1">');

    container.innerHTML = htmlFinal;
    document.getElementById('dialog-blog-post').showModal();
}
