// Sistema de Agendamento Atualizado - Frontend
class SistemaAgendamentoAtualizado {
    constructor() {
        this.apiUrl = '/api/agendamento';
        this.tiposConsulta = {
            'recuperacao_fiscal': {
                'nome': 'Recuperação Fiscal de Produtos Monofásicos',
                'descricao': 'Análise para recuperação de PIS e COFINS pagos indevidamente',
                'valor': 200.00,
                'duracao': 60
            },
            'execucao_fiscal': {
                'nome': 'Defesa em Execução Fiscal',
                'descricao': 'Orientação sobre execuções fiscais e proteção patrimonial',
                'valor': 200.00,
                'duracao': 60
            },
            'crimes_economicos': {
                'nome': 'Defesa em Crimes Econômicos',
                'descricao': 'Consulta sobre crimes contra ordem tributária e econômicos',
                'valor': 250.00,
                'duracao': 90
            },
            'consultoria_juridica': {
                'nome': 'Consultoria Jurídica Preventiva',
                'descricao': 'Orientação preventiva para empresas do SIMPLES Nacional',
                'valor': 150.00,
                'duracao': 45
            }
        };
        this.dadosConsulta = {};
        this.init();
    }

    init() {
        this.criarModal();
        this.bindEvents();
    }

    criarModal() {
        const modalHTML = `
            <div id="agendamento-modal-novo" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Agendar Consulta Jurídica</h2>
                        <span class="modal-close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="progress-bar">
                            <div class="progress-step active" data-step="1">1</div>
                            <div class="progress-step" data-step="2">2</div>
                            <div class="progress-step" data-step="3">3</div>
                        </div>

                        <div id="step-1" class="step active">
                            <h3>Escolha o Tipo de Consulta</h3>
                            <div class="tipos-consulta">
                                ${Object.entries(this.tiposConsulta).map(([key, tipo]) => `
                                    <div class="tipo-consulta-card" data-tipo="${key}">
                                        <h4>${tipo.nome}</h4>
                                        <p>${tipo.descricao}</p>
                                        <div class="tipo-info">
                                            <span class="valor">R$ ${tipo.valor.toFixed(2)}</span>
                                            <span class="duracao">${tipo.duracao} min</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="step-actions">
                                <button id="btn-continuar-tipo" class="btn btn--primary" disabled>Continuar</button>
                            </div>
                        </div>

                        <div id="step-2" class="step">
                            <h3>Seus Dados</h3>
                            <form id="form-agendamento-novo">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="nome">Nome Completo *</label>
                                        <input type="text" id="nome" name="nome" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="email">E-mail *</label>
                                        <input type="email" id="email" name="email" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="telefone">Telefone *</label>
                                        <input type="tel" id="telefone" name="telefone" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="cpf">CPF</label>
                                        <input type="text" id="cpf" name="cpf" placeholder="000.000.000-00">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="empresa">Nome da Empresa</label>
                                        <input type="text" id="empresa" name="empresa">
                                    </div>
                                    <div class="form-group">
                                        <label for="cnpj">CNPJ</label>
                                        <input type="text" id="cnpj" name="cnpj" placeholder="00.000.000/0000-00">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="descricao">Descreva brevemente sua situação</label>
                                    <textarea id="descricao" name="descricao" rows="4" placeholder="Ex: Tenho um bar e gostaria de saber se posso recuperar impostos pagos sobre bebidas..."></textarea>
                                </div>
                                <div class="form-group urgencia-group">
                                    <label class="urgencia-label">
                                        <input type="checkbox" id="caso_urgente" name="caso_urgente">
                                        <span class="checkmark"></span>
                                        <strong>Caso Urgente</strong> - Tenho prazo legal para resposta (execução fiscal, processo judicial, etc.)
                                    </label>
                                    <div id="detalhes_urgencia" class="urgencia-detalhes" style="display: none;">
                                        <label for="prazo_resposta">Qual o prazo para resposta?</label>
                                        <input type="text" id="prazo_resposta" name="prazo_resposta" placeholder="Ex: 15 dias, até 30/01/2024, etc.">
                                        <small>Casos urgentes são priorizados e você receberá contato em até 2 horas úteis</small>
                                    </div>
                                </div>
                            </form>
                            <div class="step-actions">
                                <button id="btn-voltar-dados" class="btn btn--secondary">Voltar</button>
                                <button id="btn-continuar-dados" class="btn btn--primary">Continuar</button>
                            </div>
                        </div>

                        <div id="step-3" class="step">
                            <h3>Confirmação e Pagamento</h3>
                            <div class="resumo-consulta">
                                <div class="resumo-header">
                                    <h4>Resumo da Consulta</h4>
                                </div>
                                <div class="resumo-item">
                                    <span class="label">Tipo de Consulta:</span>
                                    <span id="resumo-tipo" class="value"></span>
                                </div>
                                <div class="resumo-item">
                                    <span class="label">Cliente:</span>
                                    <span id="resumo-cliente" class="value"></span>
                                </div>
                                <div class="resumo-item">
                                    <span class="label">E-mail:</span>
                                    <span id="resumo-email" class="value"></span>
                                </div>
                                <div class="resumo-item">
                                    <span class="label">Telefone:</span>
                                    <span id="resumo-telefone" class="value"></span>
                                </div>
                                <div class="resumo-item">
                                    <span class="label">Empresa:</span>
                                    <span id="resumo-empresa" class="value"></span>
                                </div>
                                <div class="resumo-item total">
                                    <span class="label">Valor Total:</span>
                                    <span id="resumo-valor" class="value"></span>
                                </div>
                                <div class="resumo-item">
                                    <span class="label">Duração:</span>
                                    <span id="resumo-duracao" class="value"></span>
                                </div>
                            </div>
                            <div class="info-pagamento">
                                <div class="info-box">
                                    <i class="fas fa-info-circle"></i>
                                    <div>
                                        <p><strong>Importante:</strong> O pagamento da consulta é antecipado.</p>
                                        <p>Caso você contrate nossos serviços após a consulta, este valor será <strong>descontado integralmente</strong> dos honorários contratuais.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="step-actions">
                                <button id="btn-voltar-pagamento" class="btn btn--secondary">Voltar</button>
                                <button id="btn-pagar" class="btn btn--primary">
                                    <i class="fas fa-credit-card"></i>
                                    Pagar e Agendar
                                </button>
                            </div>
                        </div>

                        <div id="step-4" class="step">
                            <h3>Processando Pagamento...</h3>
                            <div class="loading">
                                <div class="spinner"></div>
                                <p>Redirecionando para o pagamento seguro...</p>
                                <small>Você será redirecionado para a plataforma PagBank</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    bindEvents() {
        // Abrir modal
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="agendar-consulta"]') || 
                e.target.closest('[data-action="agendar-consulta"]')) {
                e.preventDefault();
                this.abrirModal();
            }
        });

        // Fechar modal
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close') || e.target.matches('.modal')) {
                this.fecharModal();
            }
        });

        // Seleção de tipo de consulta
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tipo-consulta-card')) {
                this.selecionarTipoConsulta(e.target.closest('.tipo-consulta-card'));
            }
        });

        // Navegação entre steps
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btn-continuar-tipo') {
                this.irParaStep(2);
            } else if (e.target.id === 'btn-voltar-dados') {
                this.irParaStep(1);
            } else if (e.target.id === 'btn-continuar-dados') {
                this.validarDados() && this.irParaStep(3);
            } else if (e.target.id === 'btn-voltar-pagamento') {
                this.irParaStep(2);
            } else if (e.target.id === 'btn-pagar') {
                this.processarPagamento();
            }
        });

        // Checkbox de caso urgente
        document.addEventListener('change', (e) => {
            if (e.target.id === 'caso_urgente') {
                const detalhesUrgencia = document.getElementById('detalhes_urgencia');
                if (e.target.checked) {
                    detalhesUrgencia.style.display = 'block';
                } else {
                    detalhesUrgencia.style.display = 'none';
                    document.getElementById('prazo_resposta').value = '';
                }
            }
        });

        // Máscaras de input
        this.aplicarMascaras();
    }

    aplicarMascaras() {
        document.addEventListener('input', (e) => {
            if (e.target.id === 'telefone') {
                e.target.value = this.mascaraTelefone(e.target.value);
            } else if (e.target.id === 'cpf') {
                e.target.value = this.mascaraCPF(e.target.value);
            } else if (e.target.id === 'cnpj') {
                e.target.value = this.mascaraCNPJ(e.target.value);
            }
        });
    }

    mascaraTelefone(valor) {
        return valor.replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4,5})(\d{4})/, '$1-$2')
            .slice(0, 15);
    }

    mascaraCPF(valor) {
        return valor.replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .slice(0, 14);
    }

    mascaraCNPJ(valor) {
        return valor.replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})/, '$1-$2')
            .slice(0, 18);
    }

    abrirModal() {
        const modal = document.getElementById('agendamento-modal-novo');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.resetarModal();
    }

    fecharModal() {
        const modal = document.getElementById('agendamento-modal-novo');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    resetarModal() {
        this.dadosConsulta = {};
        this.irParaStep(1);
        document.getElementById('form-agendamento-novo').reset();
        document.querySelectorAll('.tipo-consulta-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('btn-continuar-tipo').disabled = true;
    }

    selecionarTipoConsulta(card) {
        // Remove seleção anterior
        document.querySelectorAll('.tipo-consulta-card').forEach(c => {
            c.classList.remove('selected');
        });

        // Seleciona novo tipo
        card.classList.add('selected');
        const tipo = card.dataset.tipo;
        this.dadosConsulta.tipoConsulta = tipo;
        this.dadosConsulta.tipoInfo = this.tiposConsulta[tipo];

        // Habilita botão continuar
        document.getElementById('btn-continuar-tipo').disabled = false;
    }

    irParaStep(stepNumber) {
        // Esconde todos os steps
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });

        // Mostra step atual
        document.getElementById(`step-${stepNumber}`).classList.add('active');

        // Atualiza progress bar
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index < stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Ações específicas por step
        if (stepNumber === 3) {
            this.preencherResumo();
        }
    }

    validarDados() {
        const form = document.getElementById('form-agendamento-novo');
        const formData = new FormData(form);

        // Campos obrigatórios
        const camposObrigatorios = ['nome', 'email', 'telefone'];
        for (let campo of camposObrigatorios) {
            if (!formData.get(campo)) {
                this.mostrarErro(`O campo ${campo} é obrigatório.`);
                return false;
            }
        }

        // Validar email
        const email = formData.get('email');
        if (!this.validarEmail(email)) {
            this.mostrarErro('Por favor, insira um e-mail válido.');
            return false;
        }

        // Salvar dados
        this.dadosConsulta.dados = {
            nome: formData.get('nome'),
            email: formData.get('email'),
            telefone: formData.get('telefone'),
            cpf: formData.get('cpf'),
            empresa: formData.get('empresa'),
            cnpj: formData.get('cnpj'),
            descricao: formData.get('descricao'),
            caso_urgente: formData.get('caso_urgente') === 'on',
            prazo_resposta: formData.get('prazo_resposta')
        };

        return true;
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    preencherResumo() {
        const { tipoInfo, dados } = this.dadosConsulta;

        document.getElementById('resumo-tipo').textContent = tipoInfo.nome;
        document.getElementById('resumo-cliente').textContent = dados.nome;
        document.getElementById('resumo-email').textContent = dados.email;
        document.getElementById('resumo-telefone').textContent = dados.telefone;
        document.getElementById('resumo-empresa').textContent = dados.empresa || 'Não informado';
        document.getElementById('resumo-valor').textContent = `R$ ${tipoInfo.valor.toFixed(2)}`;
        document.getElementById('resumo-duracao').textContent = `${tipoInfo.duracao} minutos`;

        // Adicionar informação de urgência se aplicável
        if (dados.caso_urgente) {
            const resumoContainer = document.querySelector('.resumo-consulta');
            const urgenciaInfo = document.createElement('div');
            urgenciaInfo.className = 'resumo-item urgencia';
            urgenciaInfo.innerHTML = `
                <span class="label">⚠️ Caso Urgente:</span>
                <span class="value">Prazo: ${dados.prazo_resposta || 'Não especificado'}</span>
            `;
            resumoContainer.appendChild(urgenciaInfo);
        }
    }

    async processarPagamento() {
        this.irParaStep(4);

        try {
            const response = await fetch(`${this.apiUrl}/solicitar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo_consulta: this.dadosConsulta.tipoConsulta,
                    nome_cliente: this.dadosConsulta.dados.nome,
                    email_cliente: this.dadosConsulta.dados.email,
                    telefone_cliente: this.dadosConsulta.dados.telefone,
                    cpf_cliente: this.dadosConsulta.dados.cpf,
                    empresa_cliente: this.dadosConsulta.dados.empresa,
                    cnpj_cliente: this.dadosConsulta.dados.cnpj,
                    descricao_caso: this.dadosConsulta.dados.descricao
                })
            });

            const result = await response.json();

            if (result.success) {
                // Redirecionar para pagamento
                window.location.href = result.checkout_url;
            } else {
                this.mostrarErro(result.message || 'Erro ao processar solicitação.');
                this.irParaStep(3);
            }
        } catch (error) {
            console.error('Erro:', error);
            this.mostrarErro('Erro de conexão. Tente novamente.');
            this.irParaStep(3);
        }
    }

    mostrarErro(mensagem) {
        // Criar ou atualizar elemento de erro
        let errorElement = document.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            document.querySelector('.modal-body').prepend(errorElement);
        }

        errorElement.textContent = mensagem;
        errorElement.style.display = 'block';

        // Remover após 5 segundos
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new SistemaAgendamentoAtualizado();
});

