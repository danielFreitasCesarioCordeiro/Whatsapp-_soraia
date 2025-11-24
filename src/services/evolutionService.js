import axios from 'axios';
import { config } from '../config/config.js';
import NotificationLog from '../models/NotificationLog.js';

class EvolutionService {
  constructor() {
    this.apiUrl = config.evolution.apiUrl;
    this.apiKey = config.evolution.apiKey;
    this.instanceName = config.evolution.instanceName;
    this.isReady = false;
    this.checkConnection();
  }

  async checkConnection() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/instance/connectionState/${this.instanceName}`,
        {
          headers: {
            'apikey': this.apiKey
          }
        }
      );
      
      this.isReady = response.data?.instance?.state === 'open';
      
      if (this.isReady) {
        console.log('✅ Evolution API conectada com sucesso!');
      } else {
        console.log('⚠️  Evolution API: Instância não conectada. Status:', response.data?.instance?.state);
      }
    } catch (error) {
      console.error('❌ Erro ao conectar Evolution API:', error.message);
      this.isReady = false;
    }
  }

  formatPhoneNumber(phone) {
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Adiciona o código do país (Brasil) se não tiver
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    return cleaned;
  }

  async sendBirthdayNotification(user) {
    if (!this.isReady) {
      console.log('⚠️  Evolution API não está pronta');
      return false;
    }

    const message = `🎉🎂 *Feliz Aniversário, ${user.name}!* 🎂🎉

Hoje é um dia muito especial! Desejamos a você um feliz aniversário repleto de alegria, saúde e realizações.

Que este novo ano de vida seja incrível!

🎈🎁🎊

_Sistema de Notificações Automáticas_`;

    try {
      const phoneNumber = this.formatPhoneNumber(user.phone);
      
      await axios.post(
        `${this.apiUrl}/message/sendText/${this.instanceName}`,
        {
          number: phoneNumber,
          text: message
        },
        {
          headers: {
            'apikey': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await this.logNotification(user._id, 'BIRTHDAY', 'SUCCESS', 'Mensagem de aniversário enviada');
      console.log(`✅ Notificação de aniversário enviada para ${user.name}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
      await this.logNotification(user._id, 'BIRTHDAY', 'FAILED', 'Erro ao enviar mensagem', error.message);
      return false;
    }
  }

  async sendPaymentNotification(user, payment, daysUntilDue) {
    if (!this.isReady) {
      console.log('⚠️  Evolution API não está pronta');
      return false;
    }

    const isPayment = payment.type === 'PAYMENT';
    const typeText = isPayment ? 'Pagamento' : 'Recebimento';
    const emoji = isPayment ? '💰' : '💵';
    
    const dueAlert = daysUntilDue === 0 
      ? '⚠️ *Vence HOJE!*' 
      : `📅 Faltam *${daysUntilDue} dia(s)* para o vencimento`;

    const message = `${emoji} *Lembrete de ${typeText}*

Olá, *${user.name}*!

Este é um lembrete sobre o seguinte ${typeText.toLowerCase()}:

📝 *Descrição:* ${payment.description}
💵 *Valor:* R$ ${payment.amount.toFixed(2)}
📅 *Data de Vencimento:* ${new Date(payment.dueDate).toLocaleDateString('pt-BR')}
${payment.category ? `🏷️ *Categoria:* ${payment.category}` : ''}

${dueAlert}

${payment.notes ? `📌 *Observações:* ${payment.notes}` : ''}

_Sistema de Notificações Automáticas_`;

    try {
      const phoneNumber = this.formatPhoneNumber(user.phone);
      
      await axios.post(
        `${this.apiUrl}/message/sendText/${this.instanceName}`,
        {
          number: phoneNumber,
          text: message
        },
        {
          headers: {
            'apikey': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await this.logNotification(user._id, payment.type, 'SUCCESS', 'Notificação de pagamento enviada', null, payment._id);
      console.log(`✅ Notificação de pagamento enviada para ${user.name}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
      await this.logNotification(user._id, payment.type, 'FAILED', 'Erro ao enviar mensagem', error.message, payment._id);
      return false;
    }
  }

  async sendMedia(phone, mediaUrl, caption = '') {
    if (!this.isReady) {
      console.log('⚠️  Evolution API não está pronta');
      return false;
    }

    try {
      const phoneNumber = this.formatPhoneNumber(phone);
      
      await axios.post(
        `${this.apiUrl}/message/sendMedia/${this.instanceName}`,
        {
          number: phoneNumber,
          mediatype: 'image',
          media: mediaUrl,
          caption: caption
        },
        {
          headers: {
            'apikey': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mídia WhatsApp:', error.response?.data || error.message);
      return false;
    }
  }

  async logNotification(userId, type, status, message, errorMessage = null, paymentId = null) {
    try {
      await NotificationLog.create({
        user: userId,
        type,
        channel: 'WHATSAPP',
        status,
        message,
        errorMessage,
        relatedPayment: paymentId
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }
}

export default new EvolutionService();
