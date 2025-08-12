 // Sistema de Chatbot - Frontend JavaScript

class ChatbotInterface {
    constructor() {
        // AQUI ESTÁ A NOSSA MUDANÇA! Apontando para o nosso servidor local.
        this.apiUrl = 'http://127.0.0.1:5000/api/chatbot'; 
        this.sessaoId = null;
        this.isOpen = false;
        this.isTyping = false;
        this.conversaAtiva = false;
        this.init( );
    }

    init() {
        this.createChatbotHTML();
        this.setupEventListeners();
        // A função iniciarConversa foi removida daqui para evitar chamadas desnecessárias na inicialização.
        // Ela pode ser reativada se precisarmos de um ID de sessão do backend.
    }

    createChatbotHTML() {
        // Verificar se já existe
        if (document.getElementById('chatbot-container')) return;

        const chatbotHTML = `
            <div id="chatbot-container" class="chatbot">
                <div class="chatbot__toggle" id="chatbot-toggle">
                    <i class="fas fa-comments"></i>
                    <span class="chatbot__notification" id="chatbot-notification">1</span>
                </div>
                
                <div class="chatbot__window" id="chatbot-window">
                    <div class="chatbot__header">
                        <div class="chatbot__header-info">
                            <div class="chatbot__avatar">
                                <i class="fas fa-user-tie"></i>
                            </div>
                            <div class="chatbot__header-text">
                                <h4 class="chatbot__title">Assistente Virtual</h4>
                                <span class="chatbot__subtitle">Moura & França Advocacia</span>
                            </div>
                        </div>
                        <button class="chatbot__close" id="chatbot-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="chatbot__messages" id="chatbot-messages">
                        <!-- A mensagem de boas-vindas foi movida para ser adicionada dinamicamente -->
                    </div>
                    
                    <div class="chatbot__quick-actions" id="chatbot-quick-actions">
                        <button class="chatbot__quick-btn" data-message="Quero agendar uma consulta">
                            📅 Agendar Consulta
                        </button>
                        <button class="chatbot__quick-btn" data-message="Quais são as áreas de atuação?">
                            ⚖️ Áreas de Atuação
                        </button>
                        <button class="chatbot__quick-btn" data-message="Qual o valor da consulta?">
                            💰 Valores
                        </button>
                        <button class="chatbot__quick-btn" data-message="Como entrar em contato?">
                            📞 Contato
                        </button>
                    </div>
                    
                    <div class="chatbot__input-area">
                        <div class="chatbot__typing" id="chatbot-typing" style="display: none;">
                            <div class="chatbot__typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span class="chatbot__typing-text">Digitando...</span>
                        </div>
                        
                        <div class="chatbot__input">
                            <input 
                                type="text" 
                                class="chatbot__input-field" 
                                id="chatbot-input" 
                                placeholder="Digite sua mensagem..."
                                maxlength="500"
                            >
                            <button class="chatbot__send" id="chatbot-send">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    setupEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');
        const quickActions = document.getElementById('chatbot-quick-actions');

        toggle.addEventListener('click', () => this.toggleChatbot());
        close.addEventListener('click', () => this.closeChatbot());
        send.addEventListener('click', () => this.enviarMensagem());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.enviarMensagem();
            }
        });

        quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('chatbot__quick-btn')) {
                const message = e.target.getAttribute('data-message');
                this.enviarMensagemAutomatica(message);
            }
        });

        if (!localStorage.getItem('chatbot_visited')) {
            setTimeout(() => {
                this.showNotification();
            }, 5000);
        }
    }

    toggleChatbot() {
        const window = document.getElementById('chatbot-window');
        const notification = document.getElementById('chatbot-notification');
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            window.classList.add('active');
            notification.style.display = 'none';
            
            if (!this.conversaAtiva) {
                this.mostrarMensagemInicial();
                this.conversaAtiva = true;
            }
            
            setTimeout(() => {
                document.getElementById('chatbot-input').focus();
            }, 300);
            
            localStorage.setItem('chatbot_visited', 'true');
        } else {
            window.classList.remove('active');
        }
    }

    closeChatbot() {
        const window = document.getElementById('chatbot-window');
        window.classList.remove('active');
        this.isOpen = false;
    }

    showNotification() {
        const notification = document.getElementById('chatbot-notification');
        notification.style.display = 'block';
        notification.classList.add('pulse');
        setTimeout(() => {
            notification.classList.remove('pulse');
        }, 2000);
    }

    mostrarMensagemInicial() {
        // Agora, a mensagem inicial vem do backend para garantir consistência
        this.enviarMensagemAutomatica("Olá"); 
    }

    async enviarMensagem() {
        const input = document.getElementById('chatbot-input');
        const mensagem = input.value.trim();

        if (!mensagem) return;

        this.adicionarMensagem(mensagem, 'user');
        input.value = '';
        
        const quickActions = document.getElementById('chatbot-quick-actions');
        if (quickActions) quickActions.style.display = 'none';

        this.mostrarDigitando();

        try {
            // A URL agora está completa: http://127.0.0.1:5000/api/chatbot/conversa
            const response = await fetch(`${this.apiUrl}/conversa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mensagem: mensagem
                } )
            });

            const result = await response.json();

            setTimeout(() => {
                this.esconderDigitando();
                this.adicionarMensagem(result.resposta, 'bot');
            }, 1000 + Math.random() * 500);

        } catch (error) {
            this.esconderDigitando();
            this.adicionarMensagem('Desculpe, meu sistema parece estar offline. Tente novamente mais tarde.', 'bot');
            console.error('Erro ao conectar com o backend:', error);
        }
    }

    enviarMensagemAutomatica(mensagem) {
        const input = document.getElementById('chatbot-input');
        input.value = mensagem;
        this.enviarMensagem();
    }

    adicionarMensagem(texto, tipo) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot__message chatbot__message--${tipo}`;

        if (tipo === 'bot') {
            messageDiv.innerHTML = `
                <div class="chatbot__message-avatar">
                    <i class="fas fa-balance-scale"></i>
                </div>
                <div class="chatbot__message-content">
                    <div class="chatbot__message-text">${texto}</div>
                    <div class="chatbot__message-time">${this.getTimeString()}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="chatbot__message-content">
                    <div class="chatbot__message-text">${texto}</div>
                    <div class="chatbot__message-time">${this.getTimeString()}</div>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        setTimeout(() => {
            messageDiv.classList.add('chatbot__message--visible');
        }, 100);
    }

    mostrarDigitando() {
        const typing = document.getElementById('chatbot-typing');
        typing.style.display = 'flex';
        this.isTyping = true;
        this.scrollToBottom();
    }

    esconderDigitando() {
        const typing = document.getElementById('chatbot-typing');
        typing.style.display = 'none';
        this.isTyping = false;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    getTimeString() {
        return new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// O CSS e o resto do código que inicializa podem ser mantidos como estão,
// pois não afetam a lógica de conexão.
// Apenas garantimos que a classe principal está correta.

document.addEventListener('DOMContentLoaded', () => {
    if (!window.chatbotInterface) {
        window.chatbotInterface = new ChatbotInterface();
    }
});

// O código CSS que estava no final do arquivo original não precisa ser colado de novo,
// pois ele já deve estar no seu arquivo. Se não estiver, me avise.
// O importante é a classe 'ChatbotInterface' que corrigimos.
