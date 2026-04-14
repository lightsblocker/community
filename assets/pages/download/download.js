document.addEventListener("DOMContentLoaded", () => {
    const LINK_DO_APK = "https://github.com/lightsblocker/community/raw/5a6f70898f287d9940f8221b4714a3875143814d/assets/pages/download/LightsBlocker.apk"; // Insira seu link direto aqui

    // Abre a tela de privacidade
    document.getElementById('btn-pre-download')?.addEventListener('click', () => {
        document.getElementById('download-screen').classList.add('hidden');
        document.getElementById('privacy-screen').classList.remove('hidden');
    });

    // Cancela e volta pra tela de download
    document.getElementById('btn-cancel-download')?.addEventListener('click', () => {
        document.getElementById('privacy-screen').classList.add('hidden');
        document.getElementById('download-screen').classList.remove('hidden');
    });

    // Aceita, faz o download e volta pra tela de download
    document.getElementById('btn-accept-download')?.addEventListener('click', () => {
        // Dispara o download em nova aba/janela
        window.open(LINK_DO_APK, '_blank');
        
        // Retorna a interface
        document.getElementById('privacy-screen').classList.add('hidden');
        document.getElementById('download-screen').classList.remove('hidden');
    });
});
