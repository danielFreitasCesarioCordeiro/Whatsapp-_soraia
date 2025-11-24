import cron from 'node-cron';
import notificationService from './notificationService.js';
import googleSheetsService from './googleSheetsService.js';
import { config } from '../config/config.js';

class SchedulerService {
  constructor() {
    this.jobs = [];
  }

  start() {
    console.log('⏰ Iniciando agendador de notificações...');
    console.log(`📅 Agendamento configurado: ${config.notifications.schedule}`);
    console.log(`🎂 Aniversários: notificar ${config.notifications.birthdayAdvanceDays} dia(s) antes`);
    console.log(`💰 Pagamentos: notificar ${config.notifications.paymentAdvanceDays} dia(s) antes\n`);

    // Agenda a verificação automática baseada no cron configurado
    const mainJob = cron.schedule(config.notifications.schedule, async () => {
      await notificationService.runAllChecks();
    });

    // Agenda verificação de pagamentos vencidos (executa todo dia à meia-noite)
    const overdueJob = cron.schedule('0 0 * * *', async () => {
      await notificationService.checkAndUpdateOverduePayments();
    });

    this.jobs.push(mainJob, overdueJob);

    // Agenda sincronização do Google Sheets (se habilitado)
    if (config.googleSheets.enabled) {
      console.log(`📊 Google Sheets: sincronização agendada (${config.googleSheets.syncSchedule})`);
      
      const sheetsJob = cron.schedule(config.googleSheets.syncSchedule, async () => {
        await googleSheetsService.syncAll();
      });
      
      this.jobs.push(sheetsJob);
    }

    console.log('✅ Agendador iniciado com sucesso!');
    console.log('📌 As notificações serão enviadas automaticamente nos horários programados.\n');

    // Executa uma verificação inicial (opcional)
    this.runInitialCheck();
  }

  async runInitialCheck() {
    console.log('🔄 Executando verificação inicial...\n');
    setTimeout(async () => {
      await notificationService.runAllChecks();
    }, 5000); // Aguarda 5 segundos após o servidor iniciar
  }

  stop() {
    console.log('🛑 Parando agendador...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('✅ Agendador parado.');
  }

  // Método para executar verificação manual
  async runManualCheck() {
    console.log('🔧 Executando verificação manual...');
    return await notificationService.runAllChecks();
  }

  // Método para sincronizar Google Sheets manualmente
  async runManualSync() {
    console.log('🔧 Executando sincronização manual do Google Sheets...');
    return await googleSheetsService.syncAll();
  }
}

export default new SchedulerService();
