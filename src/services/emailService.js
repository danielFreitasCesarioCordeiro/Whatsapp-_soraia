import nodemailer from 'nodemailer';
import { config } from '../config/config.js';
import NotificationLog from '../models/NotificationLog.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    if (!config.email.user || !config.email.pass) {
      console.warn('⚠️  Email credentials not configured. Email notifications will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
  }

  async sendBirthdayNotification(user) {
    if (!this.transporter) {
      console.log('Email service not configured');
      return false;
    }

    const subject = `🎉 Feliz Aniversário, ${user.name}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h1 style="color: #4CAF50; text-align: center;">🎂 Feliz Aniversário!</h1>
          <p style="font-size: 16px; color: #333;">Olá, <strong>${user.name}</strong>!</p>
          <p style="font-size: 16px; color: #333;">
            Hoje é um dia muito especial! Desejamos a você um feliz aniversário repleto de alegria, 
            saúde e realizações. Que este novo ano de vida seja incrível!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 50px; margin: 0;">🎈🎉🎁</p>
          </div>
          <p style="font-size: 14px; color: #666; text-align: center;">
            Com carinho,<br>
            <strong>Sistema de Notificações</strong>
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: config.email.user,
        to: user.email,
        subject,
        html
      });

      await this.logNotification(user._id, 'BIRTHDAY', 'SUCCESS', subject);
      return true;
    } catch (error) {
      console.error('Error sending birthday email:', error);
      await this.logNotification(user._id, 'BIRTHDAY', 'FAILED', subject, error.message);
      return false;
    }
  }

  async sendPaymentNotification(user, payment, daysUntilDue) {
    if (!this.transporter) {
      console.log('Email service not configured');
      return false;
    }

    const isPayment = payment.type === 'PAYMENT';
    const typeText = isPayment ? 'Pagamento' : 'Recebimento';
    const emoji = isPayment ? '💰' : '💵';
    
    const subject = `${emoji} Lembrete: ${typeText} - ${payment.description}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h1 style="color: ${isPayment ? '#FF5722' : '#4CAF50'}; text-align: center;">
            ${emoji} Lembrete de ${typeText}
          </h1>
          <p style="font-size: 16px; color: #333;">Olá, <strong>${user.name}</strong>!</p>
          <p style="font-size: 16px; color: #333;">
            Este é um lembrete sobre o seguinte ${typeText.toLowerCase()}:
          </p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Descrição:</strong> ${payment.description}</p>
            <p style="margin: 5px 0;"><strong>Valor:</strong> R$ ${payment.amount.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Data de Vencimento:</strong> ${new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
            ${payment.category ? `<p style="margin: 5px 0;"><strong>Categoria:</strong> ${payment.category}</p>` : ''}
            ${daysUntilDue === 0 
              ? '<p style="color: #FF5722; font-weight: bold; margin: 10px 0;">⚠️ Vence HOJE!</p>' 
              : `<p style="margin: 10px 0;">📅 Faltam ${daysUntilDue} dia(s) para o vencimento</p>`
            }
          </div>
          ${payment.notes ? `<p style="font-size: 14px; color: #666;"><strong>Observações:</strong> ${payment.notes}</p>` : ''}
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Sistema de Notificações Automáticas
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: config.email.user,
        to: user.email,
        subject,
        html
      });

      await this.logNotification(user._id, payment.type, 'SUCCESS', subject, null, payment._id);
      return true;
    } catch (error) {
      console.error('Error sending payment email:', error);
      await this.logNotification(user._id, payment.type, 'FAILED', subject, error.message, payment._id);
      return false;
    }
  }

  async logNotification(userId, type, status, message, errorMessage = null, paymentId = null) {
    try {
      await NotificationLog.create({
        user: userId,
        type,
        channel: 'EMAIL',
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

export default new EmailService();
