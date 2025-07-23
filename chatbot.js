// Sistema de Chatbot - Frontend JavaScript

class ChatbotInterface {
    constructor() {
        this.apiUrl = '/api/chatbot';
        this.sessaoId = null;
        this.isOpen = false;
        this.isTyping = false;
        this.conversaAtiva = false;
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.setupEventListeners();
        this.iniciarConversa();
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
                        <div class="chatbot__welcome">
                            <div class="chatbot__avatar-large">
                                <i class="fas fa-balance-scale"></i>
                            </div>
                            <h3>Bem-vinda!</h3>
                            <p>Sou sua assistente virtual. Como posso ajudá-la hoje?</p>
                        </div>
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

        // Ações rápidas
        quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('chatbot__quick-btn')) {
                const message = e.target.getAttribute('data-message');
                this.enviarMensagemAutomatica(message);
            }
        });

        // Auto-abrir após alguns segundos (primeira visita)
        if (!localStorage.getItem('chatbot_visited')) {
            setTimeout(() => {
                this.showNotification();
            }, 5000);
        }
    }

    async iniciarConversa() {
        try {
            const response = await fetch(`${this.apiUrl}/iniciar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                this.sessaoId = result.sessao_id;
                // A mensagem inicial será mostrada quando o chat for aberto
            }
        } catch (error) {
            console.error('Erro ao iniciar conversa:', error);
        }
    }

    toggleChatbot() {
        const window = document.getElementById('chatbot-window');
        const notification = document.getElementById('chatbot-notification');
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            window.classList.add('active');
            notification.style.display = 'none';
            
            // Mostrar mensagem inicial se for a primeira vez
            if (!this.conversaAtiva) {
                this.mostrarMensagemInicial();
                this.conversaAtiva = true;
            }
            
            // Focar no input
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
        
        // Animação de pulso
        notification.classList.add('pulse');
        setTimeout(() => {
            notification.classList.remove('pulse');
        }, 2000);
    }

    mostrarMensagemInicial() {
        const mensagemInicial = "Olá! Sou a assistente virtual do escritório Moura & França Advocacia. Estou aqui para esclarecer suas dúvidas jurídicas e ajudá-la com informações sobre nossos serviços. Como posso ajudá-la hoje?";
        
        setTimeout(() => {
            this.adicionarMensagem(mensagemInicial, 'bot');
        }, 500);
    }

    async enviarMensagem() {
        const input = document.getElementById('chatbot-input');
        const mensagem = input.value.trim();

        if (!mensagem) return;

        // Adicionar mensagem do usuário
        this.adicionarMensagem(mensagem, 'user');
        input.value = '';

        // Mostrar indicador de digitação
        this.mostrarDigitando();

        try {
            const response = await fetch(`${this.apiUrl}/mensagem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mensagem: mensagem,
                    sessao_id: this.sessaoId
                })
            });

            const result = await response.json();

            // Simular tempo de resposta
            setTimeout(() => {
                this.esconderDigitando();
                
                if (result.success) {
                    this.adicionarMensagem(result.resposta, 'bot');
                    this.processarAcoes(result.acoes || []);
                } else {
                    this.adicionarMensagem('Desculpe, ocorreu um erro. Tente novamente.', 'bot');
                }
            }, 1000 + Math.random() * 1000); // 1-2 segundos

        } catch (error) {
            this.esconderDigitando();
            this.adicionarMensagem('Erro de conexão. Verifique sua internet e tente novamente.', 'bot');
            console.error('Erro:', error);
        }
    }

    enviarMensagemAutomatica(mensagem) {
        const input = document.getElementById('chatbot-input');
        input.value = mensagem;
        this.enviarMensagem();
        
        // Esconder ações rápidas após primeira interação
        const quickActions = document.getElementById('chatbot-quick-actions');
        quickActions.style.display = 'none';
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

        // Animação de entrada
        setTimeout(() => {
            messageDiv.classList.add('chatbot__message--visible');
        }, 100);
    }

    processarAcoes(acoes) {
        acoes.forEach(acao => {
            switch (acao) {
                case 'botao_agendar_consulta':
                    this.adicionarBotaoAcao('📅 Agendar Consulta', '/agendamento');
                    break;
                case 'mostrar_formulario_contato':
                    this.adicionarBotaoAcao('📞 Deixar Contato', '#contato');
                    break;
                case 'botao_newsletter':
                    this.adicionarBotaoAcao('📧 Receber Novidades', '#newsletter');
                    break;
                case 'mostrar_contato':
                    this.mostrarInformacoesContato();
                    break;
            }
        });
    }

    adicionarBotaoAcao(texto, link) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const actionDiv = document.createElement('div');
        actionDiv.className = 'chatbot__action';
        actionDiv.innerHTML = `
            <a href="${link}" class="chatbot__action-btn" target="_blank">
                ${texto}
            </a>
        `;
        messagesContainer.appendChild(actionDiv);
        this.scrollToBottom();
    }

    mostrarInformacoesContato() {
        const infoContato = `
            <div class="chatbot__contact-info">
                <h4>📍 Informações de Contato</h4>
                <p><strong>Horário:</strong> Segunda a Sexta, 9h às 17h</p>
                <p><strong>Atendimento:</strong> Presencial e Online</p>
                <p><strong>Consulta:</strong> R$ 200,00 (descontado dos honorários)</p>
            </div>
        `;
        
        const messagesContainer = document.getElementById('chatbot-messages');
        const infoDiv = document.createElement('div');
        infoDiv.className = 'chatbot__message chatbot__message--bot';
        infoDiv.innerHTML = `
            <div class="chatbot__message-avatar">
                <i class="fas fa-balance-scale"></i>
            </div>
            <div class="chatbot__message-content">
                ${infoContato}
                <div class="chatbot__message-time">${this.getTimeString()}</div>
            </div>
        `;
        
        messagesContainer.appendChild(infoDiv);
        this.scrollToBottom();
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

    // Método para feedback (opcional)
    mostrarFeedback() {
        const feedbackHTML = `
            <div class="chatbot__feedback">
                <p>Como foi nossa conversa?</p>
                <div class="chatbot__rating">
                    <button class="chatbot__star" data-rating="1">⭐</button>
                    <button class="chatbot__star" data-rating="2">⭐</button>
                    <button class="chatbot__star" data-rating="3">⭐</button>
                    <button class="chatbot__star" data-rating="4">⭐</button>
                    <button class="chatbot__star" data-rating="5">⭐</button>
                </div>
            </div>
        `;
        
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.insertAdjacentHTML('beforeend', feedbackHTML);
        
        // Event listeners para as estrelas
        document.querySelectorAll('.chatbot__star').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.getAttribute('data-rating'));
                this.enviarFeedback(rating);
            });
        });
    }

    async enviarFeedback(rating) {
        try {
            await fetch(`${this.apiUrl}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessao_id: this.sessaoId,
                    rating: rating
                })
            });
            
            this.adicionarMensagem('Obrigada pelo seu feedback! 😊', 'bot');
        } catch (error) {
            console.error('Erro ao enviar feedback:', error);
        }
    }
}

// CSS adicional para o chatbot
const chatbotCSS = `
/* Chatbot Styles */
.chatbot {
    position: fixed;
    bottom: var(--spacing-xl);
    right: var(--spacing-xl);
    z-index: 1000;
    font-family: var(--font-secondary);
}

.chatbot__toggle {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-white);
    font-size: var(--font-size-xl);
    cursor: pointer;
    box-shadow: var(--shadow-lg);
    transition: var(--transition-normal);
    position: relative;
}

.chatbot__toggle:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-xl);
}

.chatbot__notification {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: var(--color-error);
    color: var(--color-white);
    border-radius: var(--border-radius-full);
    width: 20px;
    height: 20px;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
}

.chatbot__notification.pulse {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

.chatbot__window {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 380px;
    height: 600px;
    background-color: var(--color-white);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-xl);
    display: none;
    flex-direction: column;
    overflow: hidden;
    transform: translateY(20px) scale(0.95);
    opacity: 0;
    transition: all var(--transition-normal);
}

.chatbot__window.active {
    display: flex;
    transform: translateY(0) scale(1);
    opacity: 1;
}

.chatbot__header {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    color: var(--color-white);
    padding: var(--spacing-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chatbot__header-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.chatbot__avatar {
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
}

.chatbot__title {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    margin: 0;
}

.chatbot__subtitle {
    font-size: var(--font-size-xs);
    opacity: 0.9;
}

.chatbot__close {
    background: none;
    border: none;
    color: var(--color-white);
    font-size: var(--font-size-lg);
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--border-radius-md);
    transition: var(--transition-fast);
}

.chatbot__close:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.chatbot__messages {
    flex: 1;
    padding: var(--spacing-md);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    background-color: var(--color-gray-light);
}

.chatbot__welcome {
    text-align: center;
    padding: var(--spacing-xl) var(--spacing-md);
    background-color: var(--color-white);
    border-radius: var(--border-radius-lg);
    margin-bottom: var(--spacing-md);
}

.chatbot__avatar-large {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--spacing-md);
    color: var(--color-white);
    font-size: var(--font-size-xl);
}

.chatbot__welcome h3 {
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
    font-family: var(--font-primary);
}

.chatbot__welcome p {
    color: var(--color-gray);
    margin: 0;
}

.chatbot__message {
    display: flex;
    gap: var(--spacing-sm);
    opacity: 0;
    transform: translateY(10px);
    transition: all var(--transition-normal);
}

.chatbot__message--visible {
    opacity: 1;
    transform: translateY(0);
}

.chatbot__message--bot {
    align-self: flex-start;
}

.chatbot__message--user {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.chatbot__message-avatar {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-white);
    font-size: var(--font-size-sm);
    flex-shrink: 0;
}

.chatbot__message-content {
    max-width: 80%;
}

.chatbot__message-text {
    background-color: var(--color-white);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-lg);
    line-height: var(--line-height-relaxed);
    box-shadow: var(--shadow-sm);
}

.chatbot__message--user .chatbot__message-text {
    background-color: var(--color-primary);
    color: var(--color-white);
}

.chatbot__message-time {
    font-size: var(--font-size-xs);
    color: var(--color-gray);
    margin-top: var(--spacing-xs);
    text-align: right;
}

.chatbot__message--user .chatbot__message-time {
    text-align: left;
}

.chatbot__quick-actions {
    padding: var(--spacing-md);
    background-color: var(--color-white);
    border-top: 1px solid var(--color-accent);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
}

.chatbot__quick-btn {
    padding: var(--spacing-sm);
    border: 1px solid var(--color-accent);
    border-radius: var(--border-radius-md);
    background-color: var(--color-white);
    color: var(--color-gray-dark);
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: var(--transition-fast);
    text-align: center;
}

.chatbot__quick-btn:hover {
    border-color: var(--color-primary);
    background-color: var(--color-primary);
    color: var(--color-white);
}

.chatbot__input-area {
    background-color: var(--color-white);
    border-top: 1px solid var(--color-accent);
}

.chatbot__typing {
    padding: var(--spacing-sm) var(--spacing-md);
    display: none;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--color-gray);
    font-size: var(--font-size-sm);
}

.chatbot__typing-indicator {
    display: flex;
    gap: 2px;
}

.chatbot__typing-indicator span {
    width: 4px;
    height: 4px;
    background-color: var(--color-gray);
    border-radius: var(--border-radius-full);
    animation: typing 1.4s infinite ease-in-out;
}

.chatbot__typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.chatbot__typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
}

.chatbot__input {
    padding: var(--spacing-md);
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
}

.chatbot__input-field {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-accent);
    border-radius: var(--border-radius-lg);
    font-size: var(--font-size-sm);
    resize: none;
    outline: none;
    transition: var(--transition-fast);
}

.chatbot__input-field:focus {
    border-color: var(--color-primary);
}

.chatbot__send {
    width: 40px;
    height: 40px;
    background-color: var(--color-primary);
    color: var(--color-white);
    border: none;
    border-radius: var(--border-radius-lg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-fast);
}

.chatbot__send:hover {
    background-color: var(--color-primary-dark);
}

.chatbot__action {
    margin: var(--spacing-sm) 0;
    text-align: center;
}

.chatbot__action-btn {
    display: inline-block;
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--color-secondary);
    color: var(--color-primary);
    border-radius: var(--border-radius-lg);
    text-decoration: none;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    transition: var(--transition-fast);
}

.chatbot__action-btn:hover {
    background-color: var(--color-secondary-dark);
    transform: translateY(-1px);
}

.chatbot__contact-info {
    background-color: var(--color-accent);
    padding: var(--spacing-md);
    border-radius: var(--border-radius-lg);
    margin: var(--spacing-sm) 0;
}

.chatbot__contact-info h4 {
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-sm);
}

.chatbot__contact-info p {
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: var(--color-gray-dark);
}

.chatbot__feedback {
    text-align: center;
    padding: var(--spacing-md);
    background-color: var(--color-accent);
    border-radius: var(--border-radius-lg);
    margin: var(--spacing-sm) 0;
}

.chatbot__rating {
    display: flex;
    justify-content: center;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
}

.chatbot__star {
    background: none;
    border: none;
    font-size: var(--font-size-lg);
    cursor: pointer;
    transition: var(--transition-fast);
}

.chatbot__star:hover {
    transform: scale(1.2);
}

/* Responsividade */
@media (max-width: 480px) {
    .chatbot {
        bottom: var(--spacing-md);
        right: var(--spacing-md);
    }
    
    .chatbot__window {
        width: calc(100vw - 2rem);
        height: calc(100vh - 120px);
        bottom: 80px;
        right: 0;
    }
    
    .chatbot__quick-actions {
        grid-template-columns: 1fr;
    }
}
`;

// Adicionar CSS ao documento
const chatbotStyleSheet = document.createElement('style');
chatbotStyleSheet.textContent = chatbotCSS;
document.head.appendChild(chatbotStyleSheet);

// Inicializar chatbot quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.chatbotInterface = new ChatbotInterface();
    
    // Adicionar métodos para casos urgentes
    window.chatbotInterface.processarResposta = function(resposta) {
        const { tipo, resposta: texto, acoes, prioridade } = resposta;
        
        // Adicionar mensagem do bot
        this.adicionarMensagem(texto, 'bot', tipo === 'urgencia' ? 'urgencia' : '');
        
        // Processar ações especiais
        if (acoes && acoes.length > 0) {
            this.processarAcoes(acoes, prioridade);
        }
        
        // Se for urgência, destacar visualmente
        if (tipo === 'urgencia') {
            this.destacarUrgencia();
        }
    };
    
    window.chatbotInterface.processarAcoes = function(acoes, prioridade = 'normal') {
        const acoesContainer = document.createElement('div');
        acoesContainer.className = `chatbot-acoes ${prioridade === 'alta' ? 'urgente' : ''}`;
        
        acoes.forEach(acao => {
            const botao = document.createElement('button');
            botao.className = 'chatbot-acao-btn';
            
            switch(acao) {
                case 'botao_agendar_urgente':
                    botao.innerHTML = '🚨 AGENDAR CONSULTA URGENTE';
                    botao.className += ' urgente';
                    botao.onclick = () => this.abrirAgendamentoUrgente();
                    break;
                    
                case 'contato_direto_urgencia':
                    botao.innerHTML = '📞 CONTATO DIRETO (URGÊNCIA)';
                    botao.className += ' contato-urgente';
                    botao.onclick = () => this.mostrarContatoUrgencia();
                    break;
                    
                case 'botao_agendar_consulta':
                    botao.innerHTML = '📅 Agendar Consulta';
                    botao.onclick = () => this.abrirAgendamento();
                    break;
                    
                case 'mostrar_formulario_contato':
                    botao.innerHTML = '📝 Deixar Contato';
                    botao.onclick = () => this.mostrarFormularioContato();
                    break;
                    
                case 'mostrar_contato':
                    botao.innerHTML = '📞 Ver Contatos';
                    botao.onclick = () => this.mostrarInformacoesContato();
                    break;
                    
                case 'botao_newsletter':
                    botao.innerHTML = '📧 Avisar sobre E-book';
                    botao.onclick = () => this.mostrarNewsletterEbook();
                    break;
            }
            
            if (botao.innerHTML) {
                acoesContainer.appendChild(botao);
            }
        });
        
        if (acoesContainer.children.length > 0) {
            this.chatContainer.appendChild(acoesContainer);
            this.scrollToBottom();
        }
    };
    
    window.chatbotInterface.destacarUrgencia = function() {
        // Adicionar classe de urgência ao container do chat
        const chatWindow = document.getElementById('chatbot-window');
        if (chatWindow) {
            chatWindow.classList.add('caso-urgente');
        }
        
        // Adicionar indicador visual de urgência
        const indicadorUrgencia = document.createElement('div');
        indicadorUrgencia.className = 'indicador-urgencia';
        indicadorUrgencia.innerHTML = '🚨 CASO URGENTE DETECTADO - PRIORIDADE ALTA';
        this.chatContainer.appendChild(indicadorUrgencia);
        
        // Piscar o botão do chat para chamar atenção
        const chatButton = document.querySelector('.chatbot__toggle');
        if (chatButton) {
            chatButton.classList.add('urgencia-piscando');
        }
    };
    
    window.chatbotInterface.abrirAgendamentoUrgente = function() {
        // Abrir modal de agendamento com campo de urgência já marcado
        if (window.sistemaAgendamento) {
            window.sistemaAgendamento.iniciar();
            // Marcar automaticamente como caso urgente
            setTimeout(() => {
                const casoUrgenteCheckbox = document.getElementById('caso_urgente');
                if (casoUrgenteCheckbox) {
                    casoUrgenteCheckbox.checked = true;
                    casoUrgenteCheckbox.dispatchEvent(new Event('change'));
                }
            }, 500);
        } else {
            // Fallback: redirecionar para seção de agendamento
            window.location.href = '#agendamento';
        }
        this.closeChatbot();
    };
    
    window.chatbotInterface.mostrarContatoUrgencia = function() {
        const mensagemUrgencia = `📞 CONTATO DIRETO PARA URGÊNCIAS:

WhatsApp: (82) 99999-9999
Email: urgencia@lmfac.com.br

⚠️ Para casos urgentes, mencione:
• Que é URGENTE
• Qual o prazo para resposta
• Tipo de documento recebido

Garantimos retorno em até 2 horas úteis!`;
        
        this.adicionarMensagem(mensagemUrgencia, 'bot', 'urgencia');
    };
});

