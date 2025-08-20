import os
from flask import Flask, render_template  # Adicionado render_template
from flask_cors import CORS
from dotenv import load_dotenv
from flask import jsonify, request
from datetime import timedelta

# --- DIAGNÓSTICO E CARGA FORÇADA DO .env ---
# 1. Encontra o caminho exato para o arquivo .env
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')

# 2. Carrega o arquivo a partir deste caminho exato
load_dotenv(dotenv_path=dotenv_path)

# 3. Pega o Access Token
access_token = os.getenv("MERCADOPAGO_ACCESS_TOKEN")

# 4. IMPRIME O DIAGNÓSTICO NO TERMINAL
print("--- INICIANDO DIAGNÓSTICO ---")
print(f"Caminho do .env: {dotenv_path}")
print(f"Access Token encontrado: {access_token}")
if access_token is None:
    print("ATENÇÃO: Não foi possível encontrar o Access Token. Verifique se o arquivo .env está na pasta 'backend' e se a variável está escrita corretamente.")
print("--- FIM DO DIAGNÓSTICO ---")
# -----------------------------------------


# --- Agora, o resto do programa ---
from database import db
from models import Consulta, HorarioDisponivel
from routes_agendamento import agendamento_bp
from chatbot import chatbot_bp

# --- Criação do App ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'uma_chave_secreta_muito_forte_e_dificil_de_adivinhar_123!'
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config.update(
    SESSION_COOKIE_SECURE=True,       # Para HTTPS
    SESSION_COOKIE_SAMESITE='Lax',    # Segurança contra CSRF
    PERMANENT_SESSION_LIFETIME=timedelta(hours=2),  # Tempo de sessão
    JSONIFY_PRETTYPRINT_REGULAR=True  # JSON bem formatado
)
# --- Inicialização do DB e Registro das Rotas ---
db.init_app(app)
app.register_blueprint(agendamento_bp, url_prefix='/api/agendamento')
app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
CORS(app)

# --- Bloco de Execução Principal ---

@app.route('/chat')
def chat_interface():
    return render_template('chat.html')
@app.route('/api/teste-chatbot', methods=['POST'])
def teste_chatbot():
    """Rota para testar se o chatbot está respondendo"""
    try:
        data = request.get_json()
        return jsonify({
            "status": "success",
            "resposta": "Conexão com o chatbot estabelecida com sucesso!",
            "dados_recebidos": data
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "erro": str(e)
        }), 500
# --- Bloco de Execução Principal --- (substitua o existente por este)
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("\n--- CONFIGURAÇÕES ATIVAS ---")
        print(f"Modo Debug: {'ON' if app.debug else 'OFF'}")
        print(f"Banco de Dados: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print(f"Tempo de Sessão: {app.config['PERMANENT_SESSION_LIFETIME']}\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
