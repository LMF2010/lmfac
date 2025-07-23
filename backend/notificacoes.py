"""
Sistema de notificações para casos urgentes
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging

class NotificacaoUrgencia:
    """Classe para gerenciar notificações de casos urgentes"""
    
    def __init__(self):
        # Configurações de email (em produção, usar variáveis de ambiente)
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.email_remetente = "contato@lmfac.com.br"  # Configurar com email real
        self.senha_email = "senha_app_gmail"  # Usar senha de app do Gmail
        self.email_advogada = "laura@lmfac.com.br"  # Email da advogada
        
    def notificar_caso_urgente(self, dados_consulta):
        """Envia notificação imediata para casos urgentes"""
        
        try:
            # Preparar dados
            tipo_consulta = dados_consulta.get('tipo_consulta', 'Não especificado')
            nome_cliente = dados_consulta.get('nome', 'Não informado')
            email_cliente = dados_consulta.get('email', 'Não informado')
            telefone_cliente = dados_consulta.get('telefone', 'Não informado')
            empresa = dados_consulta.get('empresa', 'Não informado')
            descricao = dados_consulta.get('descricao', 'Não informado')
            prazo_resposta = dados_consulta.get('prazo_resposta', 'Não especificado')
            
            # Criar mensagem de email
            msg = MIMEMultipart()
            msg['From'] = self.email_remetente
            msg['To'] = self.email_advogada
            msg['Subject'] = f"🚨 CASO URGENTE - {tipo_consulta} - {nome_cliente}"
            
            # Corpo do email
            corpo_email = f"""
            <html>
            <body>
                <h2 style="color: #d32f2f;">🚨 CASO URGENTE RECEBIDO</h2>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <strong>⚠️ Este caso possui prazo legal para resposta!</strong><br>
                    <strong>Prazo informado:</strong> {prazo_resposta}
                </div>
                
                <h3>Dados do Cliente:</h3>
                <ul>
                    <li><strong>Nome:</strong> {nome_cliente}</li>
                    <li><strong>Email:</strong> {email_cliente}</li>
                    <li><strong>Telefone:</strong> {telefone_cliente}</li>
                    <li><strong>Empresa:</strong> {empresa}</li>
                </ul>
                
                <h3>Detalhes da Consulta:</h3>
                <ul>
                    <li><strong>Tipo:</strong> {tipo_consulta}</li>
                    <li><strong>Descrição do caso:</strong> {descricao}</li>
                    <li><strong>Data/Hora:</strong> {datetime.now().strftime('%d/%m/%Y às %H:%M')}</li>
                </ul>
                
                <div style="background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
                    <strong>📞 Ação Requerida:</strong><br>
                    Entre em contato com o cliente em até 2 horas úteis conforme prometido no site.
                </div>
                
                <p><em>Esta notificação foi gerada automaticamente pelo sistema LMFAC.</em></p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(corpo_email, 'html'))
            
            # Enviar email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_remetente, self.senha_email)
            text = msg.as_string()
            server.sendmail(self.email_remetente, self.email_advogada, text)
            server.quit()
            
            logging.info(f"Notificação de urgência enviada para {self.email_advogada}")
            return True
            
        except Exception as e:
            logging.error(f"Erro ao enviar notificação de urgência: {str(e)}")
            return False
    
    def notificar_whatsapp_urgencia(self, dados_consulta):
        """Envia notificação via WhatsApp para casos urgentes (implementação futura)"""
        
        # Placeholder para integração com API do WhatsApp Business
        # Pode ser implementado com Twilio, ChatAPI ou similar
        
        try:
            telefone_advogada = "+5582999999999"  # Configurar número real
            nome_cliente = dados_consulta.get('nome', 'Cliente')
            tipo_consulta = dados_consulta.get('tipo_consulta', 'Consulta')
            prazo_resposta = dados_consulta.get('prazo_resposta', 'Não especificado')
            
            mensagem = f"""
🚨 CASO URGENTE RECEBIDO

Cliente: {nome_cliente}
Tipo: {tipo_consulta}
Prazo: {prazo_resposta}

⚠️ Requer contato em até 2 horas úteis!

Acesse o painel administrativo para mais detalhes.
            """
            
            # Aqui seria implementada a integração com API do WhatsApp
            # Por enquanto, apenas log
            logging.info(f"WhatsApp de urgência seria enviado para {telefone_advogada}: {mensagem}")
            
            return True
            
        except Exception as e:
            logging.error(f"Erro ao enviar WhatsApp de urgência: {str(e)}")
            return False
    
    def criar_lembrete_followup(self, dados_consulta, horas=2):
        """Cria lembrete para follow-up de casos urgentes"""
        
        try:
            # Implementar sistema de lembretes
            # Pode usar Celery, cron jobs ou similar
            
            logging.info(f"Lembrete de follow-up criado para {horas} horas")
            return True
            
        except Exception as e:
            logging.error(f"Erro ao criar lembrete: {str(e)}")
            return False

# Instância global
notificador = NotificacaoUrgencia()

