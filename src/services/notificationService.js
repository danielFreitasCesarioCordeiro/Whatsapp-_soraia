import User from '../models/User.js';
import Payment from '../models/Payment.js';
import emailService from './emailService.js';
import evolutionService from './evolutionService.js';
import { config } from '../config/config.js';
import axios from 'axios';

class NotificationService {
  async checkAndSendBirthdayNotifications() {
    try {
      console.log('🎂 Verificando aniversários...');
      
      const today = new Date();
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + config.notifications.birthdayAdvanceDays);
      
      // Busca usuários cujo aniversário é na data de verificação
      const users = await User.find({
        active: true,
        birthday: { $exists: true, $ne: null }
      });

      const usersToNotify = users.filter(user => {
        const birthday = new Date(user.birthday);
        return birthday.getMonth() === checkDate.getMonth() && 
               birthday.getDate() === checkDate.getDate();
      });

      console.log(`📊 Encontrados ${usersToNotify.length} aniversariantes para notificar`);

      for (const user of usersToNotify) {
        await this.sendBirthdayNotification(user);
      }

      return {
        success: true,
        count: usersToNotify.length,
        users: usersToNotify.map(u => ({ name: u.name, email: u.email }))
      };
    } catch (error) {
      console.error('Error checking birthdays:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBirthdayNotification(user) {
    console.log(`🎉 Enviando notificação de aniversário para ${user.name}`);

    const results = {
      email: false,
      whatsapp: false
    };

    // Envia email se habilitado
    if (user.notificationPreferences.email) {
      results.email = await emailService.sendBirthdayNotification(user);
    }

    // Envia WhatsApp se habilitado
    if (user.notificationPreferences.whatsapp) {
      results.whatsapp = await evolutionService.sendBirthdayNotification(user);
    }
    
    // Envia para n8n webhook se habilitado
    if (config.n8n.enabled) {
      await this.sendToN8nWebhook({
        type: 'birthday',
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      });
    }

    return results;
  }

  async checkAndSendPaymentNotifications() {
    try {
      console.log('💰 Verificando pagamentos e recebimentos...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + config.notifications.paymentAdvanceDays);
      checkDate.setHours(23, 59, 59, 999);

      // Busca pagamentos pendentes até a data de verificação
      const payments = await Payment.find({
        status: 'PENDING',
        dueDate: { 
          $gte: today,
          $lte: checkDate 
        }
      }).populate('user');

      // Filtra apenas pagamentos que ainda não receberam notificação hoje
      const paymentsToNotify = payments.filter(payment => {
        if (!payment.lastNotificationDate) return true;
        
        const lastNotif = new Date(payment.lastNotificationDate);
        lastNotif.setHours(0, 0, 0, 0);
        return lastNotif.getTime() !== today.getTime();
      });

      console.log(`📊 Encontrados ${paymentsToNotify.length} pagamentos para notificar`);

      for (const payment of paymentsToNotify) {
        if (payment.user && payment.user.active) {
          const daysUntilDue = Math.ceil((payment.dueDate - today) / (1000 * 60 * 60 * 24));
          await this.sendPaymentNotification(payment.user, payment, daysUntilDue);
          
          // Atualiza a data da última notificação
          payment.lastNotificationDate = new Date();
          await payment.save();
        }
      }

      return {
        success: true,
        count: paymentsToNotify.length,
        payments: paymentsToNotify.map(p => ({
          description: p.description,
          amount: p.amount,
          dueDate: p.dueDate,
          user: p.user?.name
        }))
      };
    } catch (error) {
      console.error('Error checking payments:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPaymentNotification(user, payment, daysUntilDue) {
    console.log(`💵 Enviando notificação de ${payment.type} para ${user.name}: ${payment.description}`);

    const results = {
      email: false,
      whatsapp: false
    };

    // Envia email se habilitado
    if (user.notificationPreferences.email) {
      results.email = await emailService.sendPaymentNotification(user, payment, daysUntilDue);
    }

    // Envia WhatsApp se habilitado
    if (user.notificationPreferences.whatsapp) {
      results.whatsapp = await evolutionService.sendPaymentNotification(user, payment, daysUntilDue);
    }
    
    // Envia para n8n webhook se habilitado
    if (config.n8n.enabled) {
      await this.sendToN8nWebhook({
        type: 'payment',
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        payment: {
          description: payment.description,
          amount: payment.amount,
          dueDate: payment.dueDate,
          daysUntilDue: daysUntilDue
        }
      });
    }

    return results;
  }

  async sendToN8nWebhook(data) {
    try {
      await axios.post(config.n8n.webhookUrl, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Dados enviados para n8n webhook');
    } catch (error) {
      console.error('❌ Erro ao enviar para n8n webhook:', error.message);
    }
  }

  async checkAndUpdateOverduePayments() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await Payment.updateMany(
        {
          status: 'PENDING',
          dueDate: { $lt: today }
        },
        {
          $set: { status: 'OVERDUE' }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`⚠️  ${result.modifiedCount} pagamento(s) marcado(s) como vencido(s)`);
      }

      return result;
    } catch (error) {
      console.error('Error updating overdue payments:', error);
      return { success: false, error: error.message };
    }
  }

  async runAllChecks() {
    console.log('\n🔔 ===== EXECUTANDO VERIFICAÇÕES AUTOMÁTICAS =====');
    console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

    const birthdayResults = await this.checkAndSendBirthdayNotifications();
    const paymentResults = await this.checkAndSendPaymentNotifications();
    await this.checkAndUpdateOverduePayments();

    console.log('\n✅ ===== VERIFICAÇÕES CONCLUÍDAS =====\n');

    return {
      timestamp: new Date(),
      birthdays: birthdayResults,
      payments: paymentResults
    };
  }
}

export default new NotificationService();
