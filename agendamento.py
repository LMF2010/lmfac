from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

db = SQLAlchemy()

class StatusPagamento(Enum):
    PENDENTE = "pendente"
    PAGO = "pago"
    CANCELADO = "cancelado"
    EXPIRADO = "expirado"

class StatusAgendamento(Enum):
    AGUARDANDO_PAGAMENTO = "aguardando_pagamento"
    CONFIRMADO = "confirmado"
    REALIZADO = "realizado"
    CANCELADO = "cancelado"

class Consulta(db.Model):
    __tablename__ = 'consultas'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Dados do cliente
    nome_cliente = db.Column(db.String(100), nullable=False)
    email_cliente = db.Column(db.String(100), nullable=False)
    telefone_cliente = db.Column(db.String(20), nullable=True)
    empresa_cliente = db.Column(db.String(100), nullable=True)
    
    # Dados da consulta
    tipo_consulta = db.Column(db.String(50), nullable=False)  # presencial, online, telefone
    descricao_caso = db.Column(db.Text, nullable=True)
    data_agendamento = db.Column(db.DateTime, nullable=True)
    duracao_minutos = db.Column(db.Integer, default=60)
    
    # Dados do pagamento
    valor_consulta = db.Column(db.Float, nullable=False, default=200.00)
    pagamento_id = db.Column(db.String(100), nullable=True)  # ID do pagamento no PagBank
    checkout_id = db.Column(db.String(100), nullable=True)   # ID do checkout no PagBank
    link_pagamento = db.Column(db.String(500), nullable=True)
    status_pagamento = db.Column(db.Enum(StatusPagamento), default=StatusPagamento.PENDENTE)
    data_pagamento = db.Column(db.DateTime, nullable=True)
    
    # Status do agendamento
    status_agendamento = db.Column(db.Enum(StatusAgendamento), default=StatusAgendamento.AGUARDANDO_PAGAMENTO)
    
    # Metadados
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Observações internas
    observacoes = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome_cliente': self.nome_cliente,
            'email_cliente': self.email_cliente,
            'telefone_cliente': self.telefone_cliente,
            'empresa_cliente': self.empresa_cliente,
            'tipo_consulta': self.tipo_consulta,
            'descricao_caso': self.descricao_caso,
            'data_agendamento': self.data_agendamento.isoformat() if self.data_agendamento else None,
            'duracao_minutos': self.duracao_minutos,
            'valor_consulta': self.valor_consulta,
            'status_pagamento': self.status_pagamento.value if self.status_pagamento else None,
            'status_agendamento': self.status_agendamento.value if self.status_agendamento else None,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'link_pagamento': self.link_pagamento
        }

class HorarioDisponivel(db.Model):
    __tablename__ = 'horarios_disponiveis'
    
    id = db.Column(db.Integer, primary_key=True)
    data_hora = db.Column(db.DateTime, nullable=False)
    disponivel = db.Column(db.Boolean, default=True)
    consulta_id = db.Column(db.Integer, db.ForeignKey('consultas.id'), nullable=True)
    
    # Metadados
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'data_hora': self.data_hora.isoformat(),
            'disponivel': self.disponivel,
            'consulta_id': self.consulta_id
        }

class ConfiguracaoSistema(db.Model):
    __tablename__ = 'configuracao_sistema'
    
    id = db.Column(db.Integer, primary_key=True)
    chave = db.Column(db.String(50), unique=True, nullable=False)
    valor = db.Column(db.Text, nullable=False)
    descricao = db.Column(db.String(200), nullable=True)
    
    # Metadados
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @staticmethod
    def get_valor(chave, default=None):
        config = ConfiguracaoSistema.query.filter_by(chave=chave).first()
        return config.valor if config else default
    
    @staticmethod
    def set_valor(chave, valor, descricao=None):
        config = ConfiguracaoSistema.query.filter_by(chave=chave).first()
        if config:
            config.valor = valor
            config.data_atualizacao = datetime.utcnow()
        else:
            config = ConfiguracaoSistema(chave=chave, valor=valor, descricao=descricao)
            db.session.add(config)
        db.session.commit()
        return config

