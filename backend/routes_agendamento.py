import os
from flask import Blueprint, request, jsonify
import mercadopago  # Importação correta

from database import db
from models import Consulta, HorarioDisponivel, StatusPagamento, StatusAgendamento

# Carrega as variáveis do arquivo .env (nosso cofre)


agendamento_bp = Blueprint('agendamento', __name__)

# Inicializa o SDK do Mercado Pago com o nosso Access Token
sdk = mercadopago.SDK(os.getenv("MERCADOPAGO_ACCESS_TOKEN"))

@agendamento_bp.route('/consultas', methods=['POST'])
def criar_consulta():
    data = request.get_json()

    # --- LÓGICA DO MERCADO PAGO COMEÇA AQUI ---
    try:
        # 1. Criamos um dicionário com as informações do pagamento
        payment_data = {
            "transaction_amount": float(data['valor']),
            "description": data['tipo_servico'],
            "payment_method_id": "pix", # Podemos adicionar outros depois
            "payer": {
                "email": data['email'],
                "first_name": data['nome'],
            },
            "notification_url": "https://seusite.com/webhook-mercadopago", # Precisaremos de um URL real no futuro
        }

        # 2. Enviamos os dados para a API do Mercado Pago
        payment_response = sdk.payment( ).create(payment_data)
        payment = payment_response["response"]

        # 3. Verificamos se o link de pagamento foi criado com sucesso
        if payment.get("id") is None:
            print("Erro ao criar pagamento:", payment)
            return jsonify({"erro": "Não foi possível gerar o link de pagamento."}), 500

        link_de_pagamento = payment['point_of_interaction']['transaction_data']['qr_code_base64']
        id_pagamento_mp = str(payment['id'])

    except Exception as e:
        print(f"Erro na API do Mercado Pago: {e}")
        return jsonify({"erro": "Ocorreu um problema com nosso sistema de pagamentos."}), 500
    # --- FIM DA LÓGICA DO MERCADO PAGO ---


    # Salvamos a consulta no nosso banco de dados com o link de pagamento
    nova_consulta = Consulta(
        nome_cliente=data['nome'],
        email_cliente=data['email'],
        telefone_cliente=data.get('telefone'),
        tipo_consulta=data['tipo_servico'],
        valor_consulta=float(data['valor']),
        link_pagamento=link_de_pagamento, # Usamos o link real agora
        id_pagamento_externo=id_pagamento_mp # Guardamos o ID do pagamento
    )
    db.session.add(nova_consulta)
    db.session.commit()

    # Retorna o link de pagamento para o frontend
    return jsonify({'link_pagamento': link_de_pagamento, 'tipo': 'pix'}), 201


@agendamento_bp.route('/horarios', methods=['GET'])
def listar_horarios():
    horarios_exemplo = [
        {'data': '2025-08-10T14:00:00', 'disponivel': True},
        {'data': '2025-08-10T15:00:00', 'disponivel': True},
        {'data': '2025-08-11T09:00:00', 'disponivel': False},
        {'data': '2025-08-11T10:00:00', 'disponivel': True},
    ]
    return jsonify(horarios_exemplo)

@agendamento_bp.route('/webhook-pagamento', methods=['POST'])
def webhook_pagamento():
    data = request.get_json()
    print("Webhook do Mercado Pago recebido:", data)
    return jsonify({'status': 'recebido'}), 200

