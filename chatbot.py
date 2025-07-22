from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import re
from src.models.agendamento import db, ConfiguracaoSistema

chatbot_bp = Blueprint('chatbot', __name__)

class ChatbotEngine:
    def __init__(self):
        # Palavras-chave para detecção de urgência
        self.urgencia_keywords = [
            'urgente', 'urgência', 'urgencia', 'emergência', 'emergencia',
            'prazo', 'prazos', 'execução fiscal', 'execucao fiscal',
            'mandado', 'intimação', 'intimacao', 'citação', 'citacao',
            'processo judicial', 'audiência', 'audiencia', 'julgamento',
            'recurso', 'embargos', 'defesa', 'contestação', 'contestacao',
            'bloqueio', 'penhora', 'arresto', 'sequestro',
            'dias para responder', 'prazo legal', 'vencimento',
            'multa', 'juros', 'correção monetária', 'correcao monetaria',
            'recebi uma intimação', 'recebi um mandado', 'tenho prazo',
            'preciso responder', 'processo contra mim', 'fisco me intimou'
        ]
        
        self.respostas_automaticas = {
            # Saudações
            'saudacoes': {
                'patterns': [
                    r'\b(oi|olá|ola|bom dia|boa tarde|boa noite|hey|hello)\b',
                    r'\b(tudo bem|como vai|como está)\b'
                ],
                'responses': [
                    "Olá! Sou a assistente virtual do escritório LMFAC - Moura & França Advocacia. Especialistas em recuperação fiscal e defesa tributária. Como posso ajudá-lo hoje?",
                    "Oi! Bem-vindo ao nosso escritório. Somos especialistas em recuperação fiscal para empresas do SIMPLES Nacional. Em que posso auxiliá-lo?",
                    "Olá! Estou aqui para esclarecer suas dúvidas sobre recuperação fiscal e questões tributárias. Como posso ajudar?"
                ]
            },
            
            # Consultas e agendamento
            'consulta': {
                'patterns': [
                    r'\b(consulta|agendamento|agendar|marcar|horário|horario)\b',
                    r'\b(advogada|advogado|jurídica|juridica|legal)\b',
                    r'\b(quanto custa|valor|preço|preco|honorários|honorarios)\b'
                ],
                'responses': [
                    "Oferecemos diferentes tipos de consulta: Recuperação Fiscal (R$ 200), Execução Fiscal (R$ 200), Crimes Econômicos (R$ 250) e Consultoria Preventiva (R$ 150). O pagamento é antecipado e descontado dos honorários se contratar nossos serviços. Gostaria de agendar?",
                    "Nossas consultas são especializadas por área: Recuperação Fiscal de Produtos Monofásicos, Defesa em Execuções Fiscais, Crimes Econômicos e Consultoria Preventiva. Valores de R$ 150 a R$ 250. Qual área te interessa?",
                    "Temos consultas especializadas para empresários do SIMPLES Nacional. O valor varia de R$ 150 a R$ 250 conforme a complexidade. Este valor é totalmente deduzido dos honorários se você contratar nossos serviços. Quer saber mais?"
                ]
            },
            
            # Recuperação Fiscal - Principal área
            'recuperacao_fiscal': {
                'patterns': [
                    r'\b(recuperação|recuperacao|fiscal|tributo|tributos|imposto|impostos)\b',
                    r'\b(PIS|COFINS|monofásico|monofasico|produtos monofásicos)\b',
                    r'\b(dinheiro de volta|reaver|restituição|restituicao|crédito|credito)\b',
                    r'\b(bebida|bebidas|cerveja|refrigerante|medicamento|farmácia|farmacia)\b'
                ],
                'responses': [
                    "Especialistas em recuperação fiscal de produtos monofásicos! Se sua empresa vende bebidas, medicamentos, cosméticos ou pneus, você pode ter direito a recuperar PIS e COFINS pagos indevidamente. Empresas do SIMPLES Nacional frequentemente recuperam valores significativos. Quer um diagnóstico gratuito?",
                    "Sua empresa do SIMPLES Nacional pode estar pagando PIS e COFINS a mais em produtos monofásicos como bebidas, medicamentos e cosméticos. Já ajudamos muitos bares, farmácias e mercados a recuperar milhares de reais. Gostaria de verificar se tem direito?",
                    "Recuperação fiscal é nossa especialidade! Produtos como cervejas, refrigerantes, medicamentos e cosméticos têm tributação monofásica - o imposto já foi pago na origem. Se sua empresa revende esses produtos, pode recuperar valores dos últimos 5 anos. Quer saber mais?"
                ]
            },
            
            # Execuções Fiscais
            'execucao_fiscal': {
                'patterns': [
                    r'\b(execução|execucao|fiscal|dívida|divida|ativa|cobrança|cobranca)\b',
                    r'\b(receita federal|fazenda|fisco|autuação|autuacao|multa)\b',
                    r'\b(penhora|bloqueio|conta|patrimônio|patrimonio|bens)\b'
                ],
                'responses': [
                    "Recebeu uma execução fiscal? Não se desespere! Atuamos na defesa contra execuções fiscais, protegendo seu patrimônio e buscando parcelamentos vantajosos. Muitas execuções têm vícios que podem anulá-las. Precisa de ajuda urgente?",
                    "Execuções fiscais podem ser contestadas! Verificamos prescrição, vícios na constituição do crédito e buscamos as melhores estratégias de defesa. Também negociamos parcelamentos adequados à realidade da sua empresa. Quer uma análise do seu caso?",
                    "Defesa em execução fiscal é área crítica que exige atuação rápida. Protegemos seu patrimônio, contestamos cobranças indevidas e negociamos as melhores condições de pagamento. Quanto tempo você tem para responder à execução?"
                ]
            },
            
            # Crimes Econômicos
            'crimes_economicos': {
                'patterns': [
                    r'\b(crime|crimes|criminal|penal|sonegação|sonegacao)\b',
                    r'\b(ordem tributária|tributario|lavagem|dinheiro|fraude)\b',
                    r'\b(polícia|policia|delegacia|inquérito|inquerito|processo)\b'
                ],
                'responses': [
                    "Crimes contra a ordem tributária são sérios e exigem defesa especializada. Atuamos em sonegação fiscal, fraude à execução e outros crimes econômicos. A defesa técnica adequada pode evitar consequências graves. Precisa de orientação urgente?",
                    "Defesa em crimes econômicos requer expertise específica. Trabalhamos desde a fase de investigação até o julgamento, buscando acordos quando possível e sempre protegendo seus direitos. Está enfrentando alguma investigação?",
                    "Crimes tributários e econômicos têm consequências sérias. Nossa atuação preventiva e defensiva protege empresários e gestores. Oferecemos orientação sobre compliance e defesa em processos criminais. Em que posso ajudá-lo?"
                ]
            },
            
            # Consultoria Preventiva
            'consultoria': {
                'patterns': [
                    r'\b(consultoria|orientação|orientacao|preventiva|compliance)\b',
                    r'\b(SIMPLES|simples nacional|enquadramento|regime)\b',
                    r'\b(evitar|prevenir|problema|problemas|risco|riscos)\b'
                ],
                'responses': [
                    "Consultoria preventiva é investimento que se paga! Orientamos empresas do SIMPLES Nacional sobre gestão fiscal, classificação de produtos e aproveitamento de benefícios. Prevenir é sempre melhor que remediar. Quer uma consultoria?",
                    "Para empresas do SIMPLES Nacional, a consultoria preventiva evita problemas futuros e otimiza a carga tributária. Revisamos enquadramentos, NCMs e práticas fiscais. Sua empresa está em conformidade?",
                    "Consultoria jurídica preventiva para empresários do SIMPLES Nacional. Ajudamos a evitar autuações, otimizar impostos e garantir conformidade legal. É mais barato prevenir que resolver problemas depois. Gostaria de uma avaliação?"
                ]
            },
            
            # Público-alvo específico
            'segmentos': {
                'patterns': [
                    r'\b(bar|bares|restaurante|restaurantes|lanchonete)\b',
                    r'\b(farmácia|farmacia|drogaria|medicamento|medicamentos)\b',
                    r'\b(mercado|mercados|mercearia|mini mercado|supermercado)\b',
                    r'\b(distribuidora|importadora|bebidas|distribuição|distribuicao)\b'
                ],
                'responses': [
                    "Perfeito! Trabalhamos especificamente com empresários como você. Bares, restaurantes, farmácias, mercados e distribuidoras são nosso foco. Esses segmentos têm grandes oportunidades de recuperação fiscal em produtos monofásicos. Quer saber quanto pode recuperar?",
                    "Excelente! Seu segmento é exatamente nosso público-alvo. Empresas como a sua frequentemente recuperam valores significativos em PIS e COFINS de produtos monofásicos. Já ajudamos muitos empresários similares. Gostaria de um diagnóstico?",
                    "Seu negócio está no nosso foco! Bares, farmácias, mercados e distribuidoras têm excelentes oportunidades de recuperação fiscal. Produtos como bebidas e medicamentos são monofásicos - você pode ter direito a reaver impostos. Quer verificar?"
                ]
            },
            
            # Informações gerais
            'contato': {
                'patterns': [
                    r'\b(contato|telefone|endereço|endereco|localização|localizacao)\b',
                    r'\b(whatsapp|email|site|horário|horario|funcionamento)\b'
                ],
                'responses': [
                    "Nosso atendimento é personalizado! Entre em contato pelo WhatsApp, e-mail ou agende uma consulta pelo site. Atendemos presencial e online, com horários flexíveis para empresários. Prefere qual forma de contato?",
                    "Estamos sempre disponíveis para atender empresários do SIMPLES Nacional. Contato por WhatsApp para urgências, e-mail para dúvidas gerais ou agendamento de consulta pelo site. Como prefere falar conosco?",
                    "Atendimento especializado para empresários! WhatsApp para contato rápido, consultas presenciais ou online conforme sua preferência. Nosso foco é facilitar sua vida. Qual a melhor forma de te atender?"
                ]
            },
            
            # Valores e prazos
            'valores_prazos': {
                'patterns': [
                    r'\b(prazo|prazos|tempo|demora|quanto tempo|urgente)\b',
                    r'\b(sucesso|êxito|exito|garantia|resultado|resultados)\b'
                ],
                'responses': [
                    "Prazos variam conforme o caso: Recuperação fiscal pode levar de 6 meses a 2 anos, execuções fiscais exigem resposta em 30 dias, crimes econômicos são urgentes. Trabalhamos com foco em resultados e você só paga se tivermos sucesso na recuperação!",
                    "Cada caso tem seu prazo: diagnóstico fiscal é rápido (1-2 semanas), recuperação de valores leva meses, defesas são urgentes. O importante é que você só paga pelos resultados obtidos. Quer saber o prazo do seu caso específico?",
                    "Atuamos com urgência quando necessário! Execuções e crimes exigem resposta rápida, recuperação fiscal é processo mais longo mas compensador. Nosso diferencial: você só paga se recuperarmos valores ou obtivermos sucesso na defesa."
                ]
            }
        }
        
        # Ações rápidas para o chatbot
        self.acoes_rapidas = [
            {
                'texto': '💰 Recuperação Fiscal',
                'acao': 'recuperacao_fiscal',
                'descricao': 'Recupere PIS e COFINS de produtos monofásicos'
            },
            {
                'texto': '🛡️ Execução Fiscal',
                'acao': 'execucao_fiscal', 
                'descricao': 'Defesa contra cobranças do Fisco'
            },
            {
                'texto': '⚖️ Crimes Econômicos',
                'acao': 'crimes_economicos',
                'descricao': 'Defesa em crimes tributários'
            },
            {
                'texto': '📋 Consultoria Preventiva',
                'acao': 'consultoria',
                'descricao': 'Orientação para SIMPLES Nacional'
            },
            {
                'texto': '📅 Agendar Consulta',
                'acao': 'agendar',
                'descricao': 'Marque sua consulta especializada'
            },
            {
                'texto': '📞 Falar com Advogada',
                'acao': 'contato_humano',
                'descricao': 'Atendimento personalizado'
            }
        ]

    def processar_mensagem(self, mensagem):
        """Processa a mensagem do usuário e retorna uma resposta apropriada"""
        mensagem_lower = mensagem.lower()
        
        # Verificar se é caso urgente PRIMEIRO
        if any(keyword in mensagem_lower for keyword in self.urgencia_keywords):
            return {
                'tipo': 'urgencia',
                'resposta': "🚨 DETECTEI QUE SEU CASO PODE SER URGENTE! 🚨\n\nQuando há prazos legais envolvidos (execuções fiscais, intimações, mandados), cada dia conta. Nossa equipe prioriza casos urgentes e garante contato em até 2 horas úteis.\n\n⚠️ IMPORTANTE: Se você tem um prazo para responder, informe isso no agendamento para que possamos te atender com a agilidade necessária.\n\nVamos agendar sua consulta URGENTE agora?",
                'acoes': ['botao_agendar_urgente', 'contato_direto_urgencia'],
                'prioridade': 'alta'
            }
        
        # Verificar se precisa de escalação para atendimento humano
        if any(keyword in mensagem_lower for keyword in self.escalation_keywords):
            return {
                'tipo': 'escalacao',
                'resposta': "Entendo que você precisa de um atendimento mais especializado. Vou conectá-la com nossa equipe para um atendimento personalizado. Por favor, deixe seu contato que retornaremos em breve, ou agende uma consulta para um atendimento imediato.",
                'acoes': ['mostrar_formulario_contato', 'botao_agendar_consulta']
            }
        
        # Buscar resposta automática
        for categoria, dados in self.respostas_automaticas.items():
            for pattern in dados['patterns']:
                if re.search(pattern, mensagem_lower):
                    import random
                    resposta = random.choice(dados['responses'])
                    
                    acoes = []
                    if categoria in ['consulta', 'documentos']:
                        acoes.append('botao_agendar_consulta')
                    elif categoria == 'ebook':
                        acoes.append('botao_newsletter')
                    elif categoria == 'contato':
                        acoes.append('mostrar_contato')
                    
                    return {
                        'tipo': 'automatica',
                        'categoria': categoria,
                        'resposta': resposta,
                        'acoes': acoes
                    }
        
        # Resposta padrão (fallback)
        import random
        return {
            'tipo': 'fallback',
            'resposta': random.choice(self.fallback_responses),
            'acoes': ['botao_agendar_consulta']
        }

# Instância global do chatbot
chatbot_engine = ChatbotEngine()

@chatbot_bp.route('/mensagem', methods=['POST'])
def processar_mensagem():
    """Endpoint para processar mensagens do chatbot"""
    
    try:
        data = request.get_json()
        mensagem = data.get('mensagem', '').strip()
        sessao_id = data.get('sessao_id')
        
        if not mensagem:
            return jsonify({
                'success': False,
                'error': 'Mensagem não pode estar vazia'
            }), 400
        
        # Processar mensagem
        resultado = chatbot_engine.processar_mensagem(mensagem)
        
        # Salvar conversa (opcional, para analytics)
        salvar_conversa(sessao_id, mensagem, resultado['resposta'])
        
        return jsonify({
            'success': True,
            'resposta': resultado['resposta'],
            'tipo': resultado['tipo'],
            'acoes': resultado.get('acoes', []),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        current_app.logger.error(f"Erro no chatbot: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@chatbot_bp.route('/iniciar', methods=['POST'])
def iniciar_conversa():
    """Endpoint para iniciar uma nova conversa"""
    
    try:
        import uuid
        sessao_id = str(uuid.uuid4())
        
        mensagem_inicial = "Olá! Sou a assistente virtual do escritório Moura & França Advocacia. Estou aqui para esclarecer suas dúvidas jurídicas e ajudá-la com informações sobre nossos serviços. Como posso ajudá-la hoje?"
        
        return jsonify({
            'success': True,
            'sessao_id': sessao_id,
            'mensagem_inicial': mensagem_inicial,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        current_app.logger.error(f"Erro ao iniciar conversa: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@chatbot_bp.route('/feedback', methods=['POST'])
def feedback_conversa():
    """Endpoint para receber feedback sobre a conversa"""
    
    try:
        data = request.get_json()
        sessao_id = data.get('sessao_id')
        rating = data.get('rating')  # 1-5
        comentario = data.get('comentario', '')
        
        # Salvar feedback (implementar conforme necessário)
        salvar_feedback(sessao_id, rating, comentario)
        
        return jsonify({
            'success': True,
            'message': 'Obrigada pelo seu feedback!'
        })
    
    except Exception as e:
        current_app.logger.error(f"Erro ao salvar feedback: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@chatbot_bp.route('/admin/conversas', methods=['GET'])
def listar_conversas():
    """Endpoint administrativo para listar conversas"""
    
    try:
        # Implementar listagem de conversas para análise
        # Por enquanto, retorna dados mock
        conversas = [
            {
                'sessao_id': 'exemplo-123',
                'data_inicio': datetime.now().isoformat(),
                'total_mensagens': 5,
                'status': 'finalizada',
                'feedback_rating': 5
            }
        ]
        
        return jsonify({
            'success': True,
            'conversas': conversas
        })
    
    except Exception as e:
        current_app.logger.error(f"Erro ao listar conversas: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

def salvar_conversa(sessao_id, mensagem_usuario, resposta_bot):
    """Salva a conversa no banco de dados para análise posterior"""
    try:
        # Implementar salvamento no banco de dados
        # Por enquanto, apenas log
        current_app.logger.info(f"Conversa {sessao_id}: {mensagem_usuario} -> {resposta_bot}")
    except Exception as e:
        current_app.logger.error(f"Erro ao salvar conversa: {str(e)}")

def salvar_feedback(sessao_id, rating, comentario):
    """Salva o feedback da conversa"""
    try:
        # Implementar salvamento de feedback
        current_app.logger.info(f"Feedback {sessao_id}: {rating}/5 - {comentario}")
    except Exception as e:
        current_app.logger.error(f"Erro ao salvar feedback: {str(e)}")

@chatbot_bp.route('/admin/configurar', methods=['POST'])
def configurar_chatbot():
    """Endpoint para configurar respostas do chatbot"""
    
    try:
        data = request.get_json()
        
        # Salvar configurações personalizadas
        for chave, valor in data.items():
            ConfiguracaoSistema.set_valor(f'chatbot_{chave}', json.dumps(valor))
        
        return jsonify({
            'success': True,
            'message': 'Configurações do chatbot atualizadas'
        })
    
    except Exception as e:
        current_app.logger.error(f"Erro ao configurar chatbot: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

