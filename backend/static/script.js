function addMessage(text, isUser) {
    // ... código existente ...
    
    // Scroll automático garantido
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight + 100;
    
    // Forçar redesenho da tela
    void chatMessages.offsetHeight;
}