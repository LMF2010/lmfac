from database import db  # <-- AQUI ESTÁ A MUDANÇA: Importamos o 'db' do nosso app principal
from datetime import datetime
from enum import Enum

# Não precisamos mais da linha 'db = SQLAlchemy()' aqui, pois já pegamos do app.

class StatusPagamento(Enum):
    PENDENTE = "pendente"
    PAGO = "pago"
    CANCELADO = "cancelado"

class StatusAgendamento(Enum):
    AGUARDANDO_PAGAMENTO = "aguardando_pagamento"
    CONFIRMADO = "confirmado"
    CANCELADO = "cancelado"

class Consulta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome_cliente = db.Column(db.String(100), nullable=False)
    email_cliente = db.Column(db.String(100), nullable=False)
    telefone_cliente = db.Column(db.String(20))
    tipo_consulta = db.Column(db.String(50), nullable=False)
    data_agendamento = db.Column(db.DateTime)
    valor_consulta = db.Column(db.Float, nullable=False)
    status_pagamento = db.Column(db.Enum(StatusPagamento), default=StatusPagamento.PENDENTE)
    status_agendamento = db.Column(db.Enum(StatusAgendamento), default=StatusAgendamento.AGUARDANDO_PAGAMENTO)
    link_pagamento = db.Column(db.String(500))
    id_pagamento_externo = db.Column(db.String(100))
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

class HorarioDisponivel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data_hora_inicio = db.Column(db.DateTime, nullable=False)
    disponivel = db.Column(db.Boolean, default=True)
    consulta_id = db.Column(db.Integer, db.ForeignKey('consulta.id'))
class Questionario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    dados = db.Column(db.JSON)
    complexidade = db.Column(db.String(50))
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
