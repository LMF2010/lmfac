// JavaScript para Página do E-book

document.addEventListener('DOMContentLoaded', function() {
    initEbookPage();
});

function initEbookPage() {
    setupCTAButtons();
    setupFAQ();
    setupScrollTracking();
    setupConversionTracking();
    setupNewsletterCapture();
}

// ===== BOTÕES DE CTA =====
function setupCTAButtons() {
    const ctaButtons = document.querySelectorAll('#comprar-ebook, #comprar-ebook-final');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Track conversion event
            trackEvent('ebook_purchase_intent', {
                'event_category': 'ecommerce',
                'event_label': 'ebook_cta_click',
                'value': 97
            });
            
            // Redirect to purchase page
            redirectToPurchase();
        });
    });
}

function redirectToPurchase() {
    // Configurar redirecionamento baseado na plataforma escolhida
    
    // Opção 1: Hotmart (inicial)
    const hotmartUrl = 'https://pay.hotmart.com/[PRODUCT_ID]?checkoutMode=10';
    
    // Opção 2: Site próprio (futuro)
    const siteUrl = '/checkout-ebook';
    
    // Por enquanto, mostrar modal de informação
    showPurchaseModal();
}

function showPurchaseModal() {
    const modal = document.createElement('div');
    modal.className = 'purchase-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Escolha sua forma de pagamento</h3>
                <button class="modal-close" onclick="closePurchaseModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="payment-option" onclick="redirectToHotmart()">
                    <div class="payment-icon">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div class="payment-info">
                        <h4>Cartão de Crédito / PIX</h4>
                        <p>Pagamento seguro via Hotmart</p>
                        <span class="payment-price">R$ 97,00 ou 3x de R$ 32,33</span>
                    </div>
                </div>
                
                <div class="payment-option" onclick="showContactForm()">
                    <div class="payment-icon">
                        <i class="fas fa-whatsapp"></i>
                    </div>
                    <div class="payment-info">
                        <h4>Atendimento Personalizado</h4>
                        <p>Fale conosco para condições especiais</p>
                        <span class="payment-price">Desconto para pagamento à vista</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-overlay" onclick="closePurchaseModal()"></div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 100);
}

function closePurchaseModal() {
    const modal = document.querySelector('.purchase-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function redirectToHotmart() {
    // Implementar redirecionamento para Hotmart quando estiver configurado
    trackEvent('ebook_hotmart_redirect', {
        'event_category': 'ecommerce',
        'event_label': 'hotmart_redirect'
    });
    
    // Por enquanto, mostrar mensagem
    alert('Em breve! O e-book estará disponível para compra. Deixe seu e-mail para ser avisada do lançamento.');
    showNewsletterForm();
}

function showContactForm() {
    trackEvent('ebook_contact_request', {
        'event_category': 'engagement',
        'event_label': 'contact_form'
    });
    
    // Redirecionar para WhatsApp ou formulário de contato
    const whatsappUrl = 'https://wa.me/5511999999999?text=Olá! Tenho interesse no e-book "Guia Prático de Direitos da Mulher Empreendedora". Gostaria de saber sobre condições especiais.';
    window.open(whatsappUrl, '_blank');
}

// ===== FAQ ACCORDION =====
function setupFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Fechar todos os outros
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle do item atual
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ===== SCROLL TRACKING =====
function setupScrollTracking() {
    let scrollMilestones = [25, 50, 75, 90];
    let trackedMilestones = [];
    
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        
        scrollMilestones.forEach(milestone => {
            if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
                trackedMilestones.push(milestone);
                trackEvent('ebook_page_scroll', {
                    'event_category': 'engagement',
                    'event_label': `scroll_${milestone}%`,
                    'value': milestone
                });
            }
        });
    });
}

// ===== CONVERSION TRACKING =====
function setupConversionTracking() {
    // Track page view
    trackEvent('ebook_page_view', {
        'event_category': 'engagement',
        'event_label': 'ebook_landing_page'
    });
    
    // Track time on page
    let startTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        trackEvent('ebook_time_on_page', {
            'event_category': 'engagement',
            'event_label': 'time_spent',
            'value': timeOnPage
        });
    });
}

function trackEvent(eventName, parameters) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
    }
    
    // Facebook Pixel (se configurado)
    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
            content_name: 'Ebook Direitos Mulher Empreendedora',
            content_category: 'Ebook',
            value: 97,
            currency: 'BRL'
        });
    }
    
    // Console log para debug
    console.log('Event tracked:', eventName, parameters);
}

// ===== NEWSLETTER CAPTURE =====
function setupNewsletterCapture() {
    // Exit intent
    let exitIntentShown = false;
    
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0 && !exitIntentShown) {
            exitIntentShown = true;
            showNewsletterForm();
        }
    });
    
    // Time-based trigger (após 2 minutos)
    setTimeout(() => {
        if (!exitIntentShown) {
            showNewsletterForm();
        }
    }, 120000);
}

function showNewsletterForm() {
    const modal = document.createElement('div');
    modal.className = 'newsletter-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🚀 Seja a primeira a saber!</h3>
                <button class="modal-close" onclick="closeNewsletterModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p>O e-book está sendo finalizado! Deixe seu e-mail e seja avisada assim que estiver disponível.</p>
                
                <form id="newsletter-ebook-form" class="newsletter-form">
                    <div class="form-group">
                        <input type="text" name="nome" placeholder="Seu nome" required>
                    </div>
                    <div class="form-group">
                        <input type="email" name="email" placeholder="Seu melhor e-mail" required>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="interesse" value="ebook">
                            <span class="checkmark"></span>
                            Tenho interesse no e-book (R$ 97)
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="interesse" value="consulta">
                            <span class="checkmark"></span>
                            Tenho interesse em agendar uma consulta
                        </label>
                    </div>
                    <button type="submit" class="btn btn--primary">
                        <i class="fas fa-bell"></i>
                        Quero ser avisada!
                    </button>
                </form>
                
                <p class="privacy-note">
                    <i class="fas fa-shield-alt"></i>
                    Seus dados estão seguros. Não enviamos spam.
                </p>
            </div>
        </div>
        <div class="modal-overlay" onclick="closeNewsletterModal()"></div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 100);
    
    // Setup form submission
    const form = modal.querySelector('#newsletter-ebook-form');
    form.addEventListener('submit', handleNewsletterSubmission);
}

function closeNewsletterModal() {
    const modal = document.querySelector('.newsletter-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

async function handleNewsletterSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        interesses: formData.getAll('interesse'),
        fonte: 'ebook_landing_page'
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
    submitBtn.disabled = true;
    
    try {
        // Simular envio (implementar integração real)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        trackEvent('ebook_newsletter_signup', {
            'event_category': 'lead_generation',
            'event_label': 'newsletter_signup',
            'value': 1
        });
        
        // Mostrar sucesso
        e.target.innerHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h3>Cadastro realizado com sucesso!</h3>
                <p>Você será avisada assim que o e-book estiver disponível.</p>
                <button class="btn btn--secondary" onclick="closeNewsletterModal()">Fechar</button>
            </div>
        `;
        
        // Fechar automaticamente após 3 segundos
        setTimeout(closeNewsletterModal, 3000);
        
    } catch (error) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        alert('Erro ao cadastrar. Tente novamente.');
    }
}

// ===== UTILITY FUNCTIONS =====
function showPrivacyPolicy() {
    window.open('/politica-privacidade', '_blank');
}

function showTerms() {
    window.open('/termos-uso', '_blank');
}

// ===== CSS ADICIONAL =====
const ebookCSS = `
/* E-book Page Styles */
.ebook-page {
    font-family: var(--font-secondary);
}

.header--simple {
    background-color: var(--color-white);
    box-shadow: var(--shadow-sm);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 100;
}

.ebook-hero {
    padding: 120px 0 80px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: var(--color-white);
}

.ebook-hero__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xxl);
    align-items: center;
}

.ebook-hero__title {
    font-family: var(--font-primary);
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    margin-bottom: var(--spacing-lg);
}

.highlight {
    color: var(--color-secondary);
}

.ebook-hero__subtitle {
    font-size: var(--font-size-xl);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--spacing-xl);
    opacity: 0.9;
}

.ebook-hero__benefits {
    margin-bottom: var(--spacing-xl);
}

.benefit-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
}

.benefit-item i {
    color: var(--color-secondary);
    font-size: var(--font-size-lg);
}

.price-box {
    background-color: rgba(255, 255, 255, 0.1);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-lg);
    text-align: center;
    margin-bottom: var(--spacing-lg);
}

.price-label {
    display: block;
    font-size: var(--font-size-sm);
    opacity: 0.8;
    margin-bottom: var(--spacing-xs);
}

.price-value {
    display: block;
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-secondary);
}

.price-installment {
    display: block;
    font-size: var(--font-size-sm);
    opacity: 0.8;
    margin-top: var(--spacing-xs);
}

.security-text {
    text-align: center;
    font-size: var(--font-size-sm);
    opacity: 0.8;
    margin-top: var(--spacing-md);
}

.ebook-cover {
    position: relative;
    max-width: 400px;
    margin: 0 auto;
}

.ebook-cover__image {
    width: 100%;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-xl);
}

.ebook-cover__badge {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: var(--color-error);
    color: var(--color-white);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    transform: rotate(15deg);
}

.ebook-content {
    padding: var(--spacing-xxl) 0;
}

.ebook-chapters {
    display: grid;
    gap: var(--spacing-xl);
    max-width: 800px;
    margin: 0 auto;
}

.chapter-item {
    display: flex;
    gap: var(--spacing-lg);
    align-items: flex-start;
}

.chapter-number {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    color: var(--color-white);
    width: 60px;
    height: 60px;
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    flex-shrink: 0;
}

.chapter-content h3 {
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
    font-family: var(--font-primary);
}

.ebook-bonus {
    background-color: var(--color-accent);
    padding: var(--spacing-xxl) 0;
}

.bonus-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
}

.bonus-item {
    background-color: var(--color-white);
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-lg);
    text-align: center;
    box-shadow: var(--shadow-md);
}

.bonus-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark));
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--spacing-lg);
    color: var(--color-white);
    font-size: var(--font-size-2xl);
}

.bonus-value {
    color: var(--color-secondary);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-sm);
}

.total-value {
    text-align: center;
    font-size: var(--font-size-lg);
}

.strike {
    text-decoration: line-through;
    color: var(--color-gray);
}

.ebook-author {
    padding: var(--spacing-xxl) 0;
}

.author-content {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: var(--spacing-xl);
    align-items: center;
    max-width: 800px;
    margin: 0 auto;
}

.author-photo {
    width: 100%;
    border-radius: var(--border-radius-full);
    box-shadow: var(--shadow-lg);
}

.author-credentials {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-lg);
}

.credential {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--color-gray-dark);
}

.credential i {
    color: var(--color-primary);
}

.ebook-faq {
    background-color: var(--color-gray-light);
    padding: var(--spacing-xxl) 0;
}

.faq-list {
    max-width: 800px;
    margin: 0 auto;
}

.faq-item {
    background-color: var(--color-white);
    border-radius: var(--border-radius-lg);
    margin-bottom: var(--spacing-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
}

.faq-question {
    padding: var(--spacing-lg);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: var(--transition-fast);
}

.faq-question:hover {
    background-color: var(--color-accent);
}

.faq-question h3 {
    margin: 0;
    color: var(--color-primary);
}

.faq-answer {
    padding: 0 var(--spacing-lg);
    max-height: 0;
    overflow: hidden;
    transition: all var(--transition-normal);
}

.faq-item.active .faq-answer {
    padding: var(--spacing-lg);
    max-height: 200px;
}

.faq-item.active .faq-question i {
    transform: rotate(180deg);
}

.ebook-final-cta {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    color: var(--color-white);
    padding: var(--spacing-xxl) 0;
    text-align: center;
}

.urgency-box {
    background-color: var(--color-error);
    color: var(--color-white);
    padding: var(--spacing-md);
    border-radius: var(--border-radius-lg);
    margin: var(--spacing-lg) auto;
    max-width: 300px;
    font-weight: var(--font-weight-semibold);
}

.payment-methods {
    margin-top: var(--spacing-lg);
}

.payment-icons {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
    margin-top: var(--spacing-sm);
}

.payment-icons i {
    font-size: var(--font-size-2xl);
    opacity: 0.8;
}

.footer--simple {
    background-color: var(--color-gray-dark);
    color: var(--color-white);
    padding: var(--spacing-lg) 0;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-links {
    display: flex;
    gap: var(--spacing-lg);
}

.footer-links a {
    color: var(--color-white);
    text-decoration: none;
    opacity: 0.8;
    transition: var(--transition-fast);
}

.footer-links a:hover {
    opacity: 1;
}

/* Modals */
.purchase-modal,
.newsletter-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-normal);
}

.purchase-modal.active,
.newsletter-modal.active {
    opacity: 1;
    visibility: visible;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
}

.modal-content {
    background-color: var(--color-white);
    border-radius: var(--border-radius-xl);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    z-index: 1001;
    transform: scale(0.9);
    transition: var(--transition-normal);
}

.purchase-modal.active .modal-content,
.newsletter-modal.active .modal-content {
    transform: scale(1);
}

.modal-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--color-accent);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-close {
    background: none;
    border: none;
    font-size: var(--font-size-xl);
    cursor: pointer;
    color: var(--color-gray);
}

.modal-body {
    padding: var(--spacing-lg);
}

.payment-option {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border: 2px solid var(--color-accent);
    border-radius: var(--border-radius-lg);
    margin-bottom: var(--spacing-md);
    cursor: pointer;
    transition: var(--transition-fast);
}

.payment-option:hover {
    border-color: var(--color-primary);
    background-color: var(--color-accent);
}

.payment-icon {
    width: 60px;
    height: 60px;
    background-color: var(--color-primary);
    border-radius: var(--border-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-white);
    font-size: var(--font-size-xl);
}

.payment-price {
    color: var(--color-secondary);
    font-weight: var(--font-weight-semibold);
}

.newsletter-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
}

.checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-primary);
    border-radius: var(--border-radius-sm);
    position: relative;
}

.checkbox-label input:checked + .checkmark::after {
    content: '✓';
    position: absolute;
    top: -2px;
    left: 2px;
    color: var(--color-primary);
    font-weight: bold;
}

.success-message {
    text-align: center;
    padding: var(--spacing-xl);
}

.success-message i {
    font-size: var(--font-size-3xl);
    color: var(--color-success);
    margin-bottom: var(--spacing-md);
}

.privacy-note {
    text-align: center;
    font-size: var(--font-size-xs);
    color: var(--color-gray);
    margin-top: var(--spacing-md);
}

/* Responsividade */
@media (max-width: 768px) {
    .ebook-hero__content {
        grid-template-columns: 1fr;
        text-align: center;
    }
    
    .author-content {
        grid-template-columns: 1fr;
        text-align: center;
    }
    
    .footer-content {
        flex-direction: column;
        gap: var(--spacing-md);
        text-align: center;
    }
    
    .bonus-grid {
        grid-template-columns: 1fr;
    }
    
    .chapter-item {
        flex-direction: column;
        text-align: center;
    }
}
`;

// Adicionar CSS ao documento
const ebookStyleSheet = document.createElement('style');
ebookStyleSheet.textContent = ebookCSS;
document.head.appendChild(ebookStyleSheet);

