# 🚀 GUIA COMPLETO: n8n + Evolution API

## 📋 Índice
1. [O que mudou](#o-que-mudou)
2. [Instalar Evolution API](#instalar-evolution-api)
3. [Instalar n8n](#instalar-n8n)
4. [Configurar o Sistema](#configurar-o-sistema)
5. [Workflows n8n](#workflows-n8n)
6. [Testar Tudo](#testar-tudo)

---

## 🎯 O que Mudou

### **Antes (whatsapp-web.js)**
- ❌ QR Code toda hora
- ❌ Instável
- ❌ Sessão cai frequentemente
- ❌ Difícil de escalar

### **Agora (Evolution API + n8n)**
- ✅ **Evolution API**: WhatsApp profissional via HTTP
- ✅ **Estável e robusto**
- ✅ **Múltiplas instâncias**
- ✅ **n8n**: Automação visual (arrasta e solta)
- ✅ **Webhooks e integrações**

---

## 🚀 Passo a Passo Completo

### 1️⃣ Instalar e Configurar MongoDB

#### Windows:

1. Baixe o MongoDB Community: https://www.mongodb.com/try/download/community
2. Instale seguindo o wizard
3. Após instalação, inicie o serviço:

```powershell
# Via Services (services.msc)
# Ou via comando:
net start MongoDB
```

#### Verificar se está rodando:

```powershell
mongo --version
```

---

## 📱 2. INSTALAR EVOLUTION API

### **Opção 1: Docker (RECOMENDADO)**

```powershell
# 1. Instalar Docker Desktop para Windows
# Baixe em: https://www.docker.com/products/docker-desktop/

# 2. Após instalar Docker, execute:
docker run -d `
  --name evolution-api `
  -p 8080:8080 `
  -e AUTHENTICATION_API_KEY=minha-chave-super-secreta-123 `
  -e DATABASE_ENABLED=true `
  -e DATABASE_PROVIDER=mongodb `
  -e DATABASE_CONNECTION_URI=mongodb://host.docker.internal:27017/evolution `
  atendai/evolution-api:latest
```

### **Opção 2: Instalação Manual (Windows)**

```powershell
# 1. Clonar repositório
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# 2. Instalar dependências
npm install

# 3. Copiar .env
Copy-Item .env.example .env

# 4. Editar .env
notepad .env
```

Configure no `.env` da Evolution API:
```env
# API
SERVER_URL=http://localhost:8080
AUTHENTICATION_API_KEY=minha-chave-super-secreta-123

# Database
DATABASE_ENABLED=true
DATABASE_PROVIDER=mongodb
DATABASE_CONNECTION_URI=mongodb://localhost:27017/evolution

# WhatsApp
QRCODE_LIMIT=30
```

```powershell
# 5. Iniciar Evolution API
npm run start:prod
```

### **Verificar se Está Funcionando**

```powershell
# Testar API
Invoke-RestMethod -Uri "http://localhost:8080" -Headers @{"apikey"="minha-chave-super-secreta-123"}
```

✅ Se retornou dados = Evolution API funcionando!

### **Criar Instância do WhatsApp**

```powershell
# Criar instância
$body = @{
    instanceName = "notificacoes"
    qrcode = $true
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/instance/create" `
    -Method Post `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{"apikey"="minha-chave-super-secreta-123"}

Write-Host "QR Code criado! Escaneie com o WhatsApp"
```

### **Conectar WhatsApp:**

1. Copie o QR Code gerado
2. Abra WhatsApp no celular
3. Menu → Aparelhos conectados → Conectar aparelho
4. Escaneie o QR Code

```powershell
# Verificar status da conexão
Invoke-RestMethod -Uri "http://localhost:8080/instance/connectionState/notificacoes" `
    -Headers @{"apikey"="minha-chave-super-secreta-123"}
```

---

## 🔄 3. INSTALAR N8N (Opcional mas Recomendado)

### **Opção 1: Docker (RECOMENDADO)**

```powershell
docker run -d `
  --name n8n `
  -p 5678:5678 `
  -e N8N_BASIC_AUTH_ACTIVE=true `
  -e N8N_BASIC_AUTH_USER=admin `
  -e N8N_BASIC_AUTH_PASSWORD=admin123 `
  -e WEBHOOK_URL=http://localhost:5678/ `
  -v n8n_data:/home/node/.n8n `
  n8nio/n8n
```

### **Opção 2: NPM**

```powershell
# Instalar globalmente
npm install -g n8n

# Iniciar n8n
n8n start
```

### **Acessar n8n:**

1. Abra o navegador: `http://localhost:5678`
2. Login: `admin` / `admin123`
3. Bem-vindo ao n8n! 🎉

---

## ⚙️ 4. CONFIGURAR SEU SISTEMA

### **Atualizar Dependências**

```powershell
# Na pasta do seu projeto
npm install
```

### 3️⃣ Configurar Email (Gmail)

1. Acesse: https://myaccount.google.com/
2. Vá em "Segurança"
3. Ative "Verificação em duas etapas"
4. Procure por "Senhas de app"
5. Crie uma senha para "Email"
6. Copie a senha gerada (16 caracteres)

### 4️⃣ Configurar Arquivo .env do Sistema

1. Copie o arquivo `.env.example` para `.env`:

```powershell
Copy-Item .env.example .env
```

2. Edite o `.env` com suas informações:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/notification-system

# Server
PORT=3000
NODE_ENV=development

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-16-digitos

# Evolution API - NOVO!
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=minha-chave-super-secreta-123
EVOLUTION_INSTANCE_NAME=notificacoes

# n8n (opcional)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/notificacoes
N8N_ENABLED=false

# Notification Schedule
NOTIFICATION_SCHEDULE=0 8 * * *
BIRTHDAY_ADVANCE_DAYS=1
PAYMENT_ADVANCE_DAYS=3
```

### 5️⃣ Iniciar o Sistema

```powershell
npm start
```

Você verá:
```
✅ MongoDB conectado!
✅ Evolution API conectada!
🔄 n8n Integration: Desabilitada
🚀 Servidor rodando na porta: 3000
```

---

## 🎨 5. WORKFLOWS N8N (Opcional)

### **Importar Workflows Prontos**

1. Acesse n8n: `http://localhost:5678`
2. Clique em **"Workflows"** → **"Import from File"**
3. Importe os arquivos da pasta `n8n-workflows/`:
   - `workflow-aniversarios.json`
   - `workflow-pagamentos.json`

### **Configurar Variáveis no n8n**

No n8n, vá em **Settings** → **Environments**:

```env
EVOLUTION_API_URL=http://host.docker.internal:8080
EVOLUTION_API_KEY=minha-chave-super-secreta-123
EVOLUTION_INSTANCE_NAME=notificacoes
```

**Nota:** Use `host.docker.internal` se n8n estiver no Docker.

### **Ativar Workflows**

1. Abra cada workflow
2. Clique em **"Active"** para ativar
3. O workflow de pagamentos rodará automaticamente às 8h

---

## ✅ 6. TESTAR TUDO

### **Teste 1: Evolution API**

```powershell
# Enviar mensagem de teste
$body = @{
    number = "5511999999999"  # Seu número
    text = "🎉 Teste Evolution API funcionando!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/message/sendText/notificacoes" `
    -Method Post `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{"apikey"="minha-chave-super-secreta-123"}
```

✅ Recebeu no WhatsApp? **Evolution API OK!**

### **Teste 2: Sistema Backend**

```powershell
# Criar usuário de teste
$body = @{
    name = "Teste Sistema"
    email = "teste@email.com"
    phone = "11999999999"
    birthday = "1990-11-25"
    notificationPreferences = @{
        email = $true
        whatsapp = $true
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

```powershell
# Forçar verificação
Invoke-RestMethod -Uri "http://localhost:3000/api/notifications/check-now" -Method Post
```

✅ Recebeu notificação? **Sistema OK!**

---

## 🎯 MODOS DE OPERAÇÃO

### **Modo 1: Apenas Backend (Padrão)**

```env
N8N_ENABLED=false
```

- ✅ Sistema Node.js gerencia tudo
- ✅ Cron interno (node-cron)
- ✅ Não precisa do n8n rodando
- ⚠️ Menos visual

### **Modo 2: Backend + n8n (Híbrido)**

```env
N8N_ENABLED=true
```

- ✅ Backend envia eventos para n8n
- ✅ n8n processa e envia notificações
- ✅ Interface visual
- ⚠️ Precisa dos dois rodando

---

## 📊 ARQUITETURA FINAL

```
USUÁRIO
   ↓ (cadastra dados)
BACKEND (Node.js)
   ↓ (consulta/salva)
MongoDB
   ↓ (agendamento)
BACKEND ou n8n
   ↓ (envia WhatsApp)
Evolution API
   ↓
WhatsApp
```

---

## 🚦 CHECKLIST FINAL

- [ ] MongoDB rodando
- [ ] Evolution API instalada e rodando
- [ ] Instância do WhatsApp criada e conectada
- [ ] n8n instalado (opcional)
- [ ] `.env` configurado
- [ ] `npm install` executado
- [ ] Sistema iniciado (`npm start`)
- [ ] Teste de mensagem funcionou

---

## 🆘 TROUBLESHOOTING

### **Evolution API não conecta**
```powershell
# Verificar se está rodando
docker ps  # Se usou Docker
```

### **WhatsApp desconecta**
```powershell
# Verificar status
Invoke-RestMethod -Uri "http://localhost:8080/instance/connectionState/notificacoes" `
    -Headers @{"apikey"="sua-chave"}
```

### **n8n não acha localhost**
Se n8n está no Docker, use:
- `http://host.docker.internal:3000` (Windows/Mac)
- `http://172.17.0.1:3000` (Linux)

---

## 📋 EXEMPLOS DE USO

### Criar Usuário

```powershell
# Primeiro, copie o ID do usuário criado acima
# Depois execute:

$body = @{
    user = "SEU_USER_ID_AQUI"
    type = "PAYMENT"
    description = "Conta de Luz"
    amount = 250.00
    dueDate = "2025-11-26"  # Coloque uma data próxima para testar
    category = "Utilidades"
    status = "PENDING"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/payments" -Method Post -Body $body -ContentType "application/json"
```

### Teste 3: Executar Verificação Manual

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/notifications/check-now" -Method Post
```

## 🔍 Verificar se Está Funcionando

### Ver Logs de Notificações

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/notifications/logs" | ConvertTo-Json -Depth 3
```

### Ver Estatísticas

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/notifications/stats" | ConvertTo-Json -Depth 3
```

### Listar Todos os Usuários

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/users" | ConvertTo-Json -Depth 3
```

### Listar Todos os Pagamentos

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/payments" | ConvertTo-Json -Depth 3
```

### Criar Pagamento

```javascript
{
  "user": "user_id",
  "type": "PAYMENT",
  "description": "Teste",
  "amount": 100.00,
  "dueDate": "2025-11-26"  // Próximos dias
}
```

---

## 🎉 PRONTO!

Agora você tem um sistema **profissional** de notificações com:
- ✅ **Evolution API** (WhatsApp estável e robusto)
- ✅ **n8n** (automação visual opcional)
- ✅ **MongoDB** (dados persistentes)
- ✅ **Backend Node.js** (API REST completa)

**Próximos passos:**
1. Cadastre usuários e pagamentos
2. Teste as notificações
3. Personalize os workflows no n8n (se usar)
4. Monitore os logs

**Dúvidas? Veja os logs:**
```powershell
# Backend
npm start

# Evolution API (Docker)
docker logs evolution-api -f

# n8n (Docker)
docker logs n8n -f
```

🚀 **Sistema pronto para produção!**
