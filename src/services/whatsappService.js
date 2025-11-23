import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { config } from '../config/config.js';
import NotificationLog from '../models/NotificationLog.js';

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    if (config.whatsapp.enabled) {
      this.init();
    }
  }

  init() {
    console.log('🔄 Inicializando WhatsApp Web...');
    
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', (qr) => {
      console.log('📱 Escaneie o QR Code abaixo com o WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp conectado com sucesso!');
      this.isReady = true;
    });

    this.client.on('authenticated', () => {
      console.log('✅ WhatsApp autenticado!');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação do WhatsApp:', msg);
      this.isReady = false;
    });

    this.client.on('disconnected', (reason) => {
      console.log('⚠️  WhatsApp desconectado:', reason);
      this.isReady = false;
    });

    this.client.initialize();
  }

  formatPhoneNumber(phone) {
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Adiciona o código do país (Brasil) se não tiver
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    return cleaned + '@c.us';
  }

  async sendBirthdayNotification(user) {
    if (!this.isReady) {
      console.log('WhatsApp não está pronto');
      return false;
    }

    const message = `🎉🎂 *Feliz Aniversário, ${user.name}!* 🎂🎉

Hoje é um dia muito especial! Desejamos a você um feliz aniversário repleto de alegria, saúde e realizações.

Que este novo ano de vida seja incrível!

🎈🎁🎊

_Sistema de Notificações Automáticas_`;

    try {
      const chatId = this.formatPhoneNumber(user.phone);
      await this.client.sendMessage(chatId, message);
      
      await this.logNotification(user._id, 'BIRTHDAY', 'SUCCESS', 'Mensagem de aniversário enviada');
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp birthday message:', error);
      await this.logNotification(user._id, 'BIRTHDAY', 'FAILED', 'Erro ao enviar mensagem', error.message);
      return false;
    }
  }

  async sendPaymentNotification(user, payment, daysUntilDue) {
    if (!this.isReady) {
      console.log('WhatsApp não está pronto');
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
      const chatId = this.formatPhoneNumber(user.phone);
      await this.client.sendMessage(chatId, message);
      
      await this.logNotification(user._id, payment.type, 'SUCCESS', 'Notificação de pagamento enviada', null, payment._id);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp payment message:', error);
      await this.logNotification(user._id, payment.type, 'FAILED', 'Erro ao enviar mensagem', error.message, payment._id);
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

export default new WhatsAppService();
