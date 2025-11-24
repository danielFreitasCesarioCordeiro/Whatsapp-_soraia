# 📊 GUIA: Google Sheets Integration

## 📋 O que esta integração faz?

O sistema agora **busca automaticamente** usuários e pagamentos do Google Sheets, importando para o MongoDB e enviando notificações.

### **Vantagens:**
- ✅ Gerenciar dados em uma planilha (familiar para todos)
- ✅ Sincronização automática a cada 10 minutos
- ✅ Não precisa usar a API REST para cadastrar
- ✅ Toda a equipe pode editar a planilha
- ✅ Backup visual dos dados

---

## 🎯 PASSO 1: Criar a Planilha Google

### **1.1 Criar Nova Planilha**

1. Acesse: https://sheets.google.com
2. Crie uma nova planilha
3. Nomeie: **"Sistema de Notificações"**

### **1.2 Criar Aba: Usuarios**

Crie uma aba chamada **"Usuarios"** com estas colunas:

| Nome | Email | Telefone | Aniversario | Ativo | Notificar_Email | Notificar_WhatsApp |
|------|-------|----------|-------------|-------|-----------------|-------------------|
| João Silva | joao@email.com | 11999999999 | 15/05/1990 | SIM | SIM | SIM |
| Maria Santos | maria@email.com | 11988888888 | 20/08/1985 | SIM | SIM | NAO |

**Colunas obrigatórias:**
- `Nome` - Nome completo
- `Email` - Email único (chave de identificação)
- `Telefone` - WhatsApp (com DDD)
- `Aniversario` - Data no formato DD/MM/YYYY
- `Ativo` - SIM ou NAO
- `Notificar_Email` - SIM ou NAO
- `Notificar_WhatsApp` - SIM ou NAO

### **1.3 Criar Aba: Pagamentos**

Crie uma aba chamada **"Pagamentos"** com estas colunas:

| Email_Usuario | Tipo | Descricao | Valor | Vencimento | Status | Categoria | Observacoes |
|---------------|------|-----------|-------|------------|--------|-----------|-------------|
| joao@email.com | PAGAMENTO | Conta de Luz | 250.00 | 10/12/2025 | PENDING | Utilidades | - |
| maria@email.com | RECEBIMENTO | Salário | 3000.00 | 05/12/2025 | PENDING | Renda | - |

**Colunas obrigatórias:**
- `Email_Usuario` - Email do usuário cadastrado
- `Tipo` - PAGAMENTO ou RECEBIMENTO
- `Descricao` - Descrição do pagamento
- `Valor` - Valor numérico (use ponto para decimal)
- `Vencimento` - Data no formato DD/MM/YYYY
- `Status` - PENDING, PAID, OVERDUE ou CANCELLED
- `Categoria` - Categoria (opcional)
- `Observacoes` - Notas adicionais (opcional)

---

## 🔑 PASSO 2: Configurar Google Cloud

### **2.1 Criar Projeto no Google Cloud**

1. Acesse: https://console.cloud.google.com
2. Clique em **"Selecionar projeto"** → **"Novo Projeto"**
3. Nome: **"Sistema Notificacoes"**
4. Clique em **"Criar"**

### **2.2 Ativar Google Sheets API**

1. No menu lateral: **APIs e Serviços** → **Biblioteca**
2. Pesquise: **"Google Sheets API"**
3. Clique e depois **"Ativar"**

### **2.3 Criar Service Account**

1. **APIs e Serviços** → **Credenciais**
2. **Criar Credenciais** → **Conta de Serviço**
3. Preencha:
   - **Nome**: sistema-notificacoes
   - **ID**: sistema-notificacoes
   - **Descrição**: Acesso ao Google Sheets
4. Clique em **"Criar e continuar"**
5. **Função**: Editor
6. Clique em **"Concluir"**

### **2.4 Criar e Baixar Chave**

1. Clique na conta de serviço criada
2. Aba **"Chaves"**
3. **Adicionar Chave** → **Criar nova chave**
4. Tipo: **JSON**
5. Clique em **"Criar"**
6. Um arquivo `.json` será baixado

### **2.5 Copiar Informações do JSON**

Abra o arquivo JSON baixado e copie:

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "sistema-notificacoes@seu-projeto.iam.gserviceaccount.com",
  ...
}
```

Você vai precisar de:
- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY`

---

## 📝 PASSO 3: Compartilhar Planilha

### **3.1 Obter ID da Planilha**

Na URL da sua planilha:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz-456/edit
                                      ↑
                                    Este é o ID
```

Copie o ID (parte entre `/d/` e `/edit`)

### **3.2 Compartilhar com Service Account**

1. Na planilha, clique em **"Compartilhar"**
2. Cole o email da service account:
   - `sistema-notificacoes@seu-projeto.iam.gserviceaccount.com`
3. Permissão: **Leitor**
4. Clique em **"Enviar"**

✅ Agora o sistema pode ler sua planilha!

---

## ⚙️ PASSO 4: Configurar .env

Edite o arquivo `.env` do seu projeto:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/notification-system
PORT=3000

# Email
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave
EVOLUTION_INSTANCE_NAME=notificacoes

# Google Sheets - NOVO!
GOOGLE_SHEETS_ENABLED=true
GOOGLE_SHEETS_ID=1ABC123xyz-456
GOOGLE_SERVICE_ACCOUNT_EMAIL=sistema-notificacoes@seu-projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"

# Abas da Planilha
GOOGLE_SHEETS_USERS_TAB=Usuarios
GOOGLE_SHEETS_PAYMENTS_TAB=Pagamentos

# Sincronização a cada 10 minutos
GOOGLE_SHEETS_SYNC_SCHEDULE=*/10 * * * *

# Notificações
NOTIFICATION_SCHEDULE=0 8 * * *
BIRTHDAY_ADVANCE_DAYS=1
PAYMENT_ADVANCE_DAYS=3
```

**⚠️ IMPORTANTE:** A `GOOGLE_PRIVATE_KEY` deve manter os `\n`:
```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0B...\n-----END PRIVATE KEY-----\n"
```

---

## 🚀 PASSO 5: Iniciar e Testar

### **5.1 Instalar Dependências**

```powershell
npm install
```

### **5.2 Iniciar Sistema**

```powershell
npm start
```

Você verá:
```
✅ MongoDB conectado!
✅ Evolution API conectada!
✅ Google Sheets API conectada!
📊 Google Sheets: sincronização agendada (*/10 * * * *)
```

### **5.3 Testar Sincronização Manual**

```powershell
# Sincronizar tudo (usuários + pagamentos)
Invoke-RestMethod -Uri "http://localhost:3000/api/sheets/sync" -Method Post

# Apenas usuários
Invoke-RestMethod -Uri "http://localhost:3000/api/sheets/sync/users" -Method Post

# Apenas pagamentos
Invoke-RestMethod -Uri "http://localhost:3000/api/sheets/sync/payments" -Method Post
```

### **5.4 Verificar Status**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/sheets/status"
```

---

## 🔄 Como Funciona

### **Sincronização Automática**

```
A cada 10 minutos (configurável):

1. 📊 Sistema lê Google Sheets
2. 🔍 Compara com MongoDB
3. ➕ Cria novos usuários/pagamentos
4. 🔄 Atualiza existentes
5. ✅ Registra logs

Notificações continuam automáticas às 8h!
```

### **Fluxo Completo**

```
Google Sheets
     ↓ (sincroniza a cada 10min)
  MongoDB
     ↓ (verifica diariamente às 8h)
Notificações
     ↓
WhatsApp / Email
```

---

## 📋 Exemplos de Planilha

### **Aba: Usuarios**

```
Nome            | Email              | Telefone    | Aniversario | Ativo | Notificar_Email | Notificar_WhatsApp
João Silva      | joao@email.com     | 11999999999 | 15/05/1990  | SIM   | SIM             | SIM
Maria Santos    | maria@email.com    | 11988888888 | 20/08/1985  | SIM   | SIM             | NAO
Pedro Costa     | pedro@email.com    | 11977777777 | 10/12/1992  | NAO   | NAO             | NAO
```

### **Aba: Pagamentos**

```
Email_Usuario   | Tipo        | Descricao      | Valor   | Vencimento  | Status  | Categoria  | Observacoes
joao@email.com  | PAGAMENTO   | Conta de Luz   | 250.00  | 10/12/2025  | PENDING | Utilidades | -
maria@email.com | RECEBIMENTO | Salário        | 3000.00 | 05/12/2025  | PENDING | Renda      | -
joao@email.com  | PAGAMENTO   | Aluguel        | 1500.00 | 05/12/2025  | PENDING | Moradia    | Inclui condomínio
```

---

## 🎯 Dicas e Boas Práticas

### **✅ Faça:**
- Use formatos de data consistentes (DD/MM/YYYY)
- Mantenha emails únicos
- Use SIM/NAO para booleanos
- Teste com poucos dados primeiro
- Verifique os logs após sincronização

### **❌ Evite:**
- Deixar células vazias em colunas obrigatórias
- Usar vírgula no lugar de ponto para valores
- Remover a linha de cabeçalho
- Mudar nomes das colunas
- Emails duplicados

---

## 🆘 Troubleshooting

### **"Google Sheets não conecta"**

Verifique:
1. Service Account tem acesso à planilha?
2. `GOOGLE_SHEETS_ID` está correto?
3. `GOOGLE_PRIVATE_KEY` tem os `\n`?
4. API do Google Sheets está ativada?

```powershell
# Testar conexão
Invoke-RestMethod -Uri "http://localhost:3000/api/sheets/status"
```

### **"Dados não sincronizam"**

```powershell
# Ver logs detalhados
npm start

# Forçar sincronização
Invoke-RestMethod -Uri "http://localhost:3000/api/sheets/sync" -Method Post
```

### **"Erro: private_key must be a string"**

A chave privada precisa estar entre aspas no `.env`:
```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### **"Usuário não encontrado para pagamento"**

1. Sincronize usuários primeiro
2. Verifique se o email está correto
3. O usuário deve existir antes do pagamento

---

## 📊 API Endpoints

```bash
# Status do Google Sheets
GET /api/sheets/status

# Sincronizar tudo
POST /api/sheets/sync

# Sincronizar apenas usuários
POST /api/sheets/sync/users

# Sincronizar apenas pagamentos
POST /api/sheets/sync/payments
```

---

## 🎉 Pronto!

Agora você pode:
- ✅ **Editar usuários** direto no Google Sheets
- ✅ **Adicionar pagamentos** na planilha
- ✅ **Sincronização automática** a cada 10 minutos
- ✅ **Notificações automáticas** funcionando
- ✅ **Equipe colaborando** na mesma planilha

**Sistema 100% funcional com Google Sheets!** 🚀
