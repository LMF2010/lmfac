import re
import requests
from flask import Blueprint, request, jsonify, session
from unicodedata import normalize

chatbot_bp = Blueprint('chatbot', __name__)

# Função para reconhecer intenções com normalização
def reconhecer_intencao(texto):
    texto = texto.lower().strip()
    texto = normalize('NFKD', texto).encode('ASCII', 'ignore').decode('ASCII')
    
    agendamento_keywords = ['agendar', 'agendamento', 'consulta', 'marcar']
    diagnostico_keywords = ['diagnostico', 'analise', 'recuperar', 'credito', 'tributario']
    
    if any(palavra in texto for palavra in agendamento_keywords):
        return 'agendar'
    elif any(palavra in texto for palavra in diagnostico_keywords):
        return 'diagnostico'
    return None

@chatbot_bp.route('/conversa', methods=['POST'])
def processar_mensagem():
    data = request.get_json()
    mensagem = data.get('mensagem', '').strip()
    resposta = ""
    
    estado = session.get('estado', 'inicio')
    respostas = session.get('respostas', {})
    
    intencao = reconhecer_intencao(mensagem) if estado == 'inicio' else None
    
    if estado == 'inicio':
        if intencao == 'agendar':
            resposta = "Ótimo! Vamos agendar. Para qual área jurídica? (Tributário, Empresarial)"
            session['estado'] = 'selecionar_area'
        elif intencao == 'diagnostico':
            resposta = "Vamos ao diagnóstico gratuito! Qual seu e-mail?"
            session['estado'] = 'diagnostico_email'
            session['respostas'] = {}
        else:
            resposta = "Olá! Como posso ajudar? Digite 'agendar' para consulta ou 'diagnóstico' para análise tributária."
    
    elif estado == 'selecionar_area':
        session['area'] = mensagem
        resposta = f"Perfeito! Para {mensagem}, preciso do seu e-mail."
        session['estado'] = 'agendamento_email'
    
    elif estado == 'agendamento_email':
        if re.match(r"[^@]+@[^@]+\.[^@]{2,}", mensagem):
            session['email'] = mensagem
            resposta = "E-mail válido! Qual seu nome completo?"
            session['estado'] = 'agendamento_nome'
        else:
            resposta = "E-mail inválido. Por favor, insira um e-mail válido."
    
    elif estado == 'agendamento_nome':
        session['nome'] = mensagem
        
        # Chamada para sua API de pagamento existente
        try:
            response = requests.post(
                "http://127.0.0.1:5000/api/agendamento/consultas",
                json={
                    "nome": session['nome'],
                    "email": session['email'],
                    "tipo_servico": session['area'],
                    "valor": 1250.00 if 'tributário' in session['area'].lower() else 350.00
                }
            )
            
            if response.status_code == 201:
                resultado = response.json()
                resposta = f"✅ Agendado! {session['nome']}, confira seu e-mail para detalhes."
            else:
                resposta = "⚠️ Ops! Tivemos um problema. Nossa equipe entrará em contato."
        except Exception as e:
            resposta = "🔴 Erro temporário. Por favor, tente novamente."
        
        session.clear()
    
    # Fluxo diagnóstico (similar ao anterior)
    # ...
    
    session.modified = True
    return jsonify({'resposta': resposta})