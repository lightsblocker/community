// Substitua pela URL que o Google gera quando você clica em "Implantar" -> "Novo app da Web"
const API_URL = "https://script.google.com/macros/s/AKfycbxl5DrvwAgpzHI6WGYVOPP-oF6qoHdzXQSKcIiATSClkFUzGvaI9eD-8pTq4IWb7xL82w/exec";

// Função genérica para enviar dados ao Apps Script
async function callGAS(data) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            mode: "no-cors", // Necessário para o GAS em alguns casos
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        
        // Nota: no-cors não permite ler a resposta. 
        // Se precisar ler o retorno (como no login), usaremos um método diferente (JSONP ou CORS)
        return response;
    } catch (error) {
        console.error("Erro na chamada API:", error);
    }
}
