// JavaScript Principal - Site LMFAC

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades
    initNavigation();
    initScrollEffects();
    initFormValidation();
    initAnimations();
    initNewsletterForm();
});

// ===== NAVEGAÇÃO =====
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav__link');

    // Toggle menu mobile
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('show-menu');
        });
    }

    // Fechar menu mobile
    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
        });
    }

    // Fechar menu ao clicar em link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
        });
    });

    // Scroll suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header transparente no scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY >= 50) {
            header.classList.add('scroll-header');
        } else {
            header.classList.remove('scroll-header');
        }
    });
}

// ===== EFEITOS DE SCROLL =====
function initScrollEffects() {
    // Observador de interseção para animações
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    document.querySelectorAll('.section, .target-card, .servico-card').forEach(el => {
        observer.observe(el);
    });

    // Link ativo na navegação
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active-link');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active-link');
                    }
                });
            }
        });
    });
}

// ===== VALIDAÇÃO DE FORMULÁRIOS =====
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });

        // Validação em tempo real
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    let isValid = true;
    let errorMessage = '';

    // Verificar se campo obrigatório está preenchido
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório';
    }
    // Validar email
    else if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Digite um email válido';
        }
    }
    // Validar telefone
    else if (field.name === 'telefone' && value) {
        const phoneRegex = /^[\(\)\s\-\+\d]{10,}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            errorMessage = 'Digite um telefone válido';
        }
    }

    // Mostrar/esconder erro
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }

    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('field-error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.textContent = message;
    
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

function clearFieldError(field) {
    field.classList.remove('field-error');
    
    const errorMessage = field.parentNode.querySelector('.field-error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// ===== ANIMAÇÕES =====
function initAnimations() {
    // Contador animado
    const counters = document.querySelectorAll('.counter');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };

    // Observar contadores
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // Animação de digitação para títulos
    const typewriterElements = document.querySelectorAll('.typewriter');
    
    typewriterElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                element.style.borderRight = 'none';
            }
        };
        
        // Iniciar quando elemento estiver visível
        const typeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(typeWriter, 500);
                    typeObserver.unobserve(entry.target);
                }
            });
        });
        
        typeObserver.observe(element);
    });
}

// ===== NEWSLETTER =====
function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Mostrar loading
            submitBtn.textContent = 'Cadastrando...';
            submitBtn.disabled = true;
            
            try {
                // Simular envio (implementar integração real)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                showNotification('Email cadastrado com sucesso! Obrigada por se inscrever.', 'success');
                this.reset();
            } catch (error) {
                showNotification('Erro ao cadastrar email. Tente novamente.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// ===== UTILITÁRIOS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 7) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    
    input.value = value;
}

function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    }
    
    input.value = value;
}

// Aplicar máscaras automaticamente
document.addEventListener('DOMContentLoaded', function() {
    // Máscara de telefone
    document.querySelectorAll('input[name="telefone"], input[type="tel"]').forEach(input => {
        input.addEventListener('input', () => formatPhone(input));
    });
    
    // Máscara de CPF
    document.querySelectorAll('input[name="cpf"]').forEach(input => {
        input.addEventListener('input', () => formatCPF(input));
    });
});

// ===== CSS ADICIONAL =====
const additionalCSS = `
/* Animações */
.animate-in {
    animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header scroll */
.scroll-header {
    background-color: rgba(255, 255, 255, 0.98) !important;
    backdrop-filter: blur(10px);
    box-shadow: var(--shadow-md);
}

/* Validação de formulários */
.field-error {
    border-color: var(--color-error) !important;
}

.field-error-message {
    color: var(--color-error);
    font-size: var(--font-size-xs);
    margin-top: var(--spacing-xs);
    display: block;
}

/* Loading states */
.loading {
    opacity: 0.7;
    pointer-events: none;
}

.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid transparent;
    border-top: 2px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Typewriter effect */
.typewriter {
    overflow: hidden;
    white-space: nowrap;
    animation: blink-caret 1s step-end infinite;
}

@keyframes blink-caret {
    from, to { border-color: transparent; }
    50% { border-color: var(--color-primary); }
}

/* Smooth transitions */
* {
    transition: color var(--transition-fast), 
                background-color var(--transition-fast),
                border-color var(--transition-fast),
                transform var(--transition-fast),
                opacity var(--transition-fast);
}

/* Focus states */
input:focus,
textarea:focus,
select:focus,
button:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Print styles */
@media print {
    .chatbot,
    .header,
    .footer,
    .btn {
        display: none !important;
    }
    
    body {
        font-size: 12pt;
        line-height: 1.4;
    }
    
    .section {
        page-break-inside: avoid;
    }
}
`;

// Adicionar CSS ao documento
const mainStyleSheet = document.createElement('style');
mainStyleSheet.textContent = additionalCSS;
document.head.appendChild(mainStyleSheet);

// Exportar funções para uso global
window.LMFAC = {
    showNotification,
    formatPhone,
    formatCPF,
    validateForm,
    validateField
};

