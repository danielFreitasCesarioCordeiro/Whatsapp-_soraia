import { google } from 'googleapis';
import { config } from '../config/config.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.auth = null;
    this.isReady = false;
    
    if (config.googleSheets.enabled) {
      this.init();
    }
  }

  async init() {
    try {
      if (!config.googleSheets.serviceAccountEmail || !config.googleSheets.privateKey) {
        console.log('⚠️  Google Sheets: Credenciais não configuradas');
        return;
      }

      // Autenticar com Service Account
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: config.googleSheets.serviceAccountEmail,
          private_key: config.googleSheets.privateKey
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });

      const authClient = await this.auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient });
      
      this.isReady = true;
      console.log('✅ Google Sheets API conectada!');
    } catch (error) {
      console.error('❌ Erro ao conectar Google Sheets:', error.message);
      this.isReady = false;
    }
  }

  async getSheetData(tabName, range = 'A:Z') {
    if (!this.isReady) {
      console.log('⚠️  Google Sheets não está pronta');
      return [];
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheets.spreadsheetId,
        range: `${tabName}!${range}`
      });

      return response.data.values || [];
    } catch (error) {
      console.error(`❌ Erro ao ler aba "${tabName}":`, error.message);
      return [];
    }
  }

  parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Suporta vários formatos: DD/MM/YYYY, YYYY-MM-DD, etc
    const formats = [
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{4})-(\d{2})-(\d{2})$/,   // YYYY-MM-DD
      /^(\d{2})-(\d{2})-(\d{4})$/    // DD-MM-YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format.toString().includes('4})$')) { // YYYY-MM-DD
          return new Date(match[1], match[2] - 1, match[3]);
        } else { // DD/MM/YYYY ou DD-MM-YYYY
          return new Date(match[3], match[2] - 1, match[1]);
        }
      }
    }

    // Tenta parsing direto
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }

  async syncUsers() {
    console.log('📊 Sincronizando usuários do Google Sheets...');
    
    try {
      const rows = await this.getSheetData(config.googleSheets.usersTab);
      
      if (rows.length === 0) {
        console.log('⚠️  Nenhum dado encontrado na aba de usuários');
        return { success: false, count: 0 };
      }

      // Primeira linha = cabeçalhos
      const headers = rows[0].map(h => h.toLowerCase().trim());
      const data = rows.slice(1);

      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const row of data) {
        try {
          // Mapear colunas (ajuste conforme sua planilha)
          const userData = {
            name: row[headers.indexOf('nome')] || row[headers.indexOf('name')],
            email: row[headers.indexOf('email')],
            phone: row[headers.indexOf('telefone')] || row[headers.indexOf('phone')],
            birthday: this.parseDate(row[headers.indexOf('aniversario')] || row[headers.indexOf('birthday')]),
            active: row[headers.indexOf('ativo')] !== 'NAO' && row[headers.indexOf('ativo')] !== 'FALSE',
            notificationPreferences: {
              email: row[headers.indexOf('notificar_email')] !== 'NAO',
              whatsapp: row[headers.indexOf('notificar_whatsapp')] !== 'NAO'
            }
          };

          // Validar dados obrigatórios
          if (!userData.name || !userData.email || !userData.phone) {
            console.log(`⚠️  Linha ignorada: dados incompletos`, userData);
            errors++;
            continue;
          }

          // Verificar se usuário já existe
          const existingUser = await User.findOne({ email: userData.email });

          if (existingUser) {
            // Atualizar usuário existente
            await User.updateOne({ email: userData.email }, userData);
            updated++;
          } else {
            // Criar novo usuário
            await User.create(userData);
            created++;
          }
        } catch (error) {
          console.error('❌ Erro ao processar linha:', error.message);
          errors++;
        }
      }

      console.log(`✅ Usuários sincronizados: ${created} criados, ${updated} atualizados, ${errors} erros`);
      return { success: true, created, updated, errors };

    } catch (error) {
      console.error('❌ Erro ao sincronizar usuários:', error.message);
      return { success: false, error: error.message };
    }
  }

  async syncPayments() {
    console.log('💰 Sincronizando pagamentos do Google Sheets...');
    
    try {
      const rows = await this.getSheetData(config.googleSheets.paymentsTab);
      
      if (rows.length === 0) {
        console.log('⚠️  Nenhum dado encontrado na aba de pagamentos');
        return { success: false, count: 0 };
      }

      // Primeira linha = cabeçalhos
      const headers = rows[0].map(h => h.toLowerCase().trim());
      const data = rows.slice(1);

      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const row of data) {
        try {
          // Buscar usuário pelo email
          const userEmail = row[headers.indexOf('email_usuario')] || row[headers.indexOf('email')];
          const user = await User.findOne({ email: userEmail });

          if (!user) {
            console.log(`⚠️  Usuário não encontrado: ${userEmail}`);
            errors++;
            continue;
          }

          // Mapear colunas
          const typeValue = (row[headers.indexOf('tipo')] || row[headers.indexOf('type')] || '').toUpperCase();
          const statusValue = (row[headers.indexOf('status')] || 'PENDING').toUpperCase();

          const paymentData = {
            user: user._id,
            type: typeValue === 'RECEBIMENTO' || typeValue === 'RECEIPT' ? 'RECEIPT' : 'PAYMENT',
            description: row[headers.indexOf('descricao')] || row[headers.indexOf('description')],
            amount: parseFloat(row[headers.indexOf('valor')] || row[headers.indexOf('amount')] || 0),
            dueDate: this.parseDate(row[headers.indexOf('vencimento')] || row[headers.indexOf('duedate')]),
            status: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'].includes(statusValue) ? statusValue : 'PENDING',
            category: row[headers.indexOf('categoria')] || row[headers.indexOf('category')],
            notes: row[headers.indexOf('observacoes')] || row[headers.indexOf('notes')]
          };

          // Validar dados obrigatórios
          if (!paymentData.description || !paymentData.amount || !paymentData.dueDate) {
            console.log(`⚠️  Linha ignorada: dados incompletos`, paymentData);
            errors++;
            continue;
          }

          // Criar identificador único para evitar duplicatas
          const uniqueKey = `${user._id}-${paymentData.description}-${paymentData.dueDate.toISOString().split('T')[0]}`;
          
          // Verificar se pagamento já existe
          const existingPayment = await Payment.findOne({
            user: user._id,
            description: paymentData.description,
            dueDate: paymentData.dueDate
          });

          if (existingPayment) {
            // Atualizar pagamento existente
            await Payment.updateOne({ _id: existingPayment._id }, paymentData);
            updated++;
          } else {
            // Criar novo pagamento
            await Payment.create(paymentData);
            created++;
          }
        } catch (error) {
          console.error('❌ Erro ao processar linha:', error.message);
          errors++;
        }
      }

      console.log(`✅ Pagamentos sincronizados: ${created} criados, ${updated} atualizados, ${errors} erros`);
      return { success: true, created, updated, errors };

    } catch (error) {
      console.error('❌ Erro ao sincronizar pagamentos:', error.message);
      return { success: false, error: error.message };
    }
  }

  async syncAll() {
    if (!this.isReady) {
      console.log('⚠️  Google Sheets não está configurado');
      return { success: false, error: 'Google Sheets não configurado' };
    }

    console.log('\n🔄 ===== SINCRONIZANDO GOOGLE SHEETS =====');
    console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

    const usersResult = await this.syncUsers();
    const paymentsResult = await this.syncPayments();

    console.log('\n✅ ===== SINCRONIZAÇÃO CONCLUÍDA =====\n');

    return {
      success: true,
      timestamp: new Date(),
      users: usersResult,
      payments: paymentsResult
    };
  }
}

export default new GoogleSheetsService();
