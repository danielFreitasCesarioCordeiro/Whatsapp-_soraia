# 🔔 Sistema de Notificações Automáticas

Sistema back-end automatizado para enviar notificações sobre aniversários e pagamentos/recebimentos via WhatsApp e Email.

## 📋 Funcionalidades

- ✅ **Notificações de Aniversário**: Envia automaticamente felicitações nos aniversários
- 💰 **Notificações de Pagamentos**: Lembra sobre pagamentos a vencer
- 💵 **Notificações de Recebimentos**: Lembra sobre valores a receber
- 📱 **WhatsApp**: Integração com WhatsApp Web
- 📧 **Email**: Envio de emails formatados
- ⏰ **Agendamento Automático**: Verificações programadas com node-cron
- 📊 **API REST**: Gerenciamento completo via API
- 📝 **Logs**: Histórico completo de notificações enviadas

## 🚀 Tecnologias Utilizadas

- **Node.js** com ES6 Modules
- **Express** - Framework web
- **MongoDB** com Mongoose - Banco de dados
- **node-cron** - Agendamento de tarefas
- **whatsapp-web.js** - Integração com WhatsApp
- **Nodemailer** - Envio de emails
- **dotenv** - Variáveis de ambiente

## 📦 Instalação

### 1. Pré-requisitos

- Node.js (versão 18 ou superior)
- MongoDB instalado e rodando
- Conta Gmail com senha de aplicativo (para emails)
- WhatsApp ativo (para notificações via WhatsApp)

### 2. Clone e Instale

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env
```

### 3. Configurar .env

Edite o arquivo `.env` com suas configurações:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/notification-system

# Server
PORT=3000
NODE_ENV=development

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app

# WhatsApp
WHATSAPP_ENABLED=true

# Notification Schedule (Cron)
NOTIFICATION_SCHEDULE=0 8 * * *
BIRTHDAY_ADVANCE_DAYS=1
PAYMENT_ADVANCE_DAYS=3
```

## ▶️ Como Usar

### Iniciar o Servidor

```bash
# Produção
npm start

# Desenvolvimento (com nodemon)
npm run dev
```

### Primeira Vez - WhatsApp

1. Ao iniciar, será exibido um QR Code no terminal
2. Escaneie o QR Code com seu WhatsApp
3. Aguarde a mensagem "WhatsApp conectado com sucesso!"

## 📡 API Endpoints

### 👥 Usuários

```bash
# Criar usuário
POST /api/users
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "birthday": "1990-05-15",
  "notificationPreferences": {
    "email": true,
    "whatsapp": true
  }
}

# Listar usuários
GET /api/users

# Buscar usuário
GET /api/users/:id

# Atualizar usuário
PUT /api/users/:id

# Deletar usuário
DELETE /api/users/:id

# Aniversariantes do mês
GET /api/users/birthdays/month/:month
```

### 💰 Pagamentos/Recebimentos

```bash
# Criar pagamento
POST /api/payments
{
  "user": "user_id",
  "type": "PAYMENT",  // ou "RECEIPT"
  "description": "Aluguel",
  "amount": 1500.00,
  "dueDate": "2025-12-05",
  "category": "Moradia",
  "notes": "Incluir taxa de condomínio"
}

# Listar pagamentos
GET /api/payments
GET /api/payments?type=PAYMENT
GET /api/payments?status=PENDING
GET /api/payments?userId=user_id

# Buscar pagamento
GET /api/payments/:id

# Atualizar pagamento
PUT /api/payments/:id

# Marcar como pago
PATCH /api/payments/:id/pay

# Deletar pagamento
DELETE /api/payments/:id

# Pagamentos por período
GET /api/payments/period/range?startDate=2025-12-01&endDate=2025-12-31

# Estatísticas
GET /api/payments/stats/summary
```

### 🔔 Notificações

```bash
# Executar verificação manual
POST /api/notifications/check-now

# Histórico de notificações
GET /api/notifications/logs
GET /api/notifications/logs?userId=user_id
GET /api/notifications/logs?type=BIRTHDAY
GET /api/notifications/logs?channel=WHATSAPP
GET /api/notifications/logs?status=SUCCESS

# Estatísticas de notificações
GET /api/notifications/stats
```

### 🏥 Health Check

```bash
GET /health
```

## ⏰ Agendamento Automático

O sistema verifica automaticamente:

- **Aniversários**: Configurável (padrão: 1 dia antes)
- **Pagamentos**: Configurável (padrão: 3 dias antes)
- **Horário**: Configurável via cron (padrão: 8:00 AM)

### Formato Cron

```
NOTIFICATION_SCHEDULE=0 8 * * *
```

- `0 8 * * *` - Todo dia às 8:00
- `0 9,18 * * *` - Às 9:00 e 18:00
- `*/30 * * * *` - A cada 30 minutos
- `0 0 * * 0` - Todo domingo à meia-noite

## 📊 Estrutura do Projeto

```
src/
├── config/
│   ├── config.js          # Configurações gerais
│   └── database.js        # Conexão MongoDB
├── models/
│   ├── User.js            # Schema de usuários
│   ├── Payment.js         # Schema de pagamentos
│   └── NotificationLog.js # Schema de logs
├── routes/
│   ├── userRoutes.js      # Rotas de usuários
│   ├── paymentRoutes.js   # Rotas de pagamentos
│   └── notificationRoutes.js # Rotas de notificações
├── services/
│   ├── emailService.js       # Serviço de email
│   ├── whatsappService.js    # Serviço de WhatsApp
│   ├── notificationService.js # Lógica de notificações
│   └── schedulerService.js   # Agendador com cron
└── server.js              # Servidor principal
```

## 🎯 Exemplos de Uso

### Adicionar Usuário com Aniversário

```javascript
POST /api/users
{
  "name": "Maria Santos",
  "email": "maria@email.com",
  "phone": "11988887777",
  "birthday": "1995-11-25",
  "notificationPreferences": {
    "email": true,
    "whatsapp": true
  }
}
```

### Adicionar Pagamento

```javascript
POST /api/payments
{
  "user": "674201f3a1b2c3d4e5f67890",
  "type": "PAYMENT",
  "description": "Conta de Luz",
  "amount": 250.00,
  "dueDate": "2025-12-10",
  "category": "Utilidades",
  "status": "PENDING"
}
```

### Verificar Notificações Manualmente

```bash
curl -X POST http://localhost:3000/api/notifications/check-now
```

## 🔐 Configuração do Gmail

Para usar o Gmail:

1. Acesse: https://myaccount.google.com/security
2. Ative a verificação em duas etapas
3. Gere uma "Senha de app"
4. Use essa senha no `.env` em `EMAIL_PASS`

## 📝 Status dos Pagamentos

- `PENDING` - Pendente
- `PAID` - Pago
- `OVERDUE` - Vencido (atualizado automaticamente)
- `CANCELLED` - Cancelado

## 🎨 Tipos de Notificação

- `BIRTHDAY` - Aniversário
- `PAYMENT` - Pagamento a fazer
- `RECEIPT` - Valor a receber

## 📱 Canais de Notificação

- `EMAIL` - Email via Nodemailer
- `WHATSAPP` - WhatsApp via whatsapp-web.js

## 🔧 Troubleshooting

### WhatsApp não conecta

- Verifique se o WhatsApp está ativo no celular
- Delete a pasta `.wwebjs_auth` e tente novamente
- Verifique se não há outro WhatsApp Web ativo

### Email não envia

- Verifique as credenciais no `.env`
- Use uma senha de aplicativo do Gmail
- Verifique se a verificação em duas etapas está ativa

### MongoDB não conecta

- Verifique se o MongoDB está rodando: `mongod`
- Verifique a URI de conexão no `.env`

## 📄 Licença

ISC

## 👨‍💻 Autor

Sistema desenvolvido para automação de notificações

---

**Nota**: Mantenha suas credenciais seguras e nunca compartilhe o arquivo `.env`!
