# 📝 GUIA DE INSTALAÇÃO E USO

## 🚀 Passo a Passo Completo

### 1️⃣ Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```powershell
npm install
```

### 2️⃣ Instalar e Configurar MongoDB

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

### 3️⃣ Configurar Email (Gmail)

1. Acesse: https://myaccount.google.com/
2. Vá em "Segurança"
3. Ative "Verificação em duas etapas"
4. Procure por "Senhas de app"
5. Crie uma senha para "Email"
6. Copie a senha gerada (16 caracteres)

### 4️⃣ Configurar Arquivo .env

1. Copie o arquivo `.env.example` para `.env`:

```powershell
Copy-Item .env.example .env
```

2. Edite o `.env` com suas informações:

```env
MONGODB_URI=mongodb://localhost:27017/notification-system
PORT=3000
NODE_ENV=development

# Suas credenciais do Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-16-digitos

# WhatsApp habilitado
WHATSAPP_ENABLED=true

# Verificar todo dia às 8h da manhã
NOTIFICATION_SCHEDULE=0 8 * * *

# Dias de antecedência
BIRTHDAY_ADVANCE_DAYS=1
PAYMENT_ADVANCE_DAYS=3
```

### 5️⃣ Iniciar o Sistema

```powershell
npm start
```

### 6️⃣ Conectar WhatsApp (Primeira Vez)

1. Ao iniciar, um QR Code aparecerá no terminal
2. Abra o WhatsApp no celular
3. Vá em: **Menu (⋮) → Aparelhos conectados → Conectar um aparelho**
4. Escaneie o QR Code
5. Aguarde a mensagem: "✅ WhatsApp conectado com sucesso!"

## 📋 Testando o Sistema

### Teste 1: Criar um Usuário

Abra outro terminal (ou use Postman/Insomnia) e execute:

```powershell
# Usando curl (PowerShell 7+) ou Invoke-RestMethod
$body = @{
    name = "João Silva"
    email = "joao@email.com"
    phone = "11999999999"
    birthday = "1990-05-15"
    notificationPreferences = @{
        email = $true
        whatsapp = $true
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Post -Body $body -ContentType "application/json"
```

### Teste 2: Criar um Pagamento

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

## ⏰ Como Funciona o Agendamento

O sistema verifica automaticamente:

1. **Todo dia às 8:00 AM** (configurável):
   - Verifica aniversários que acontecem amanhã (ou conforme configurado)
   - Verifica pagamentos que vencem nos próximos 3 dias (ou conforme configurado)
   - Envia notificações via Email e/ou WhatsApp

2. **Todo dia à meia-noite**:
   - Atualiza status de pagamentos vencidos para "OVERDUE"

## 🎯 Dicas de Uso

### Para Testar Aniversários

Crie um usuário com aniversário para amanhã:

```javascript
{
  "name": "Teste Aniversário",
  "email": "seu-email@gmail.com",
  "phone": "11999999999",
  "birthday": "1990-11-24"  // Use a data de amanhã
}
```

### Para Testar Pagamentos

Crie um pagamento com vencimento próximo:

```javascript
{
  "user": "user_id",
  "type": "PAYMENT",
  "description": "Teste",
  "amount": 100.00,
  "dueDate": "2025-11-26"  // Próximos dias
}
```

### Executar Verificação Manual

Não quer esperar até 8h? Execute manualmente:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/notifications/check-now" -Method Post
```

## 🛠️ Comandos Úteis

```powershell
# Iniciar servidor
npm start

# Iniciar em modo desenvolvimento (reinicia automaticamente)
npm run dev

# Verificar se MongoDB está rodando
mongosh

# Parar o servidor
Ctrl + C

# Ver logs em tempo real
# Os logs aparecem automaticamente no terminal onde você executou npm start
```

## ❓ Problemas Comuns

### "MongoDB não conecta"

```powershell
# Verificar se está rodando
net start MongoDB

# Se não estiver instalado como serviço, inicie manualmente:
mongod
```

### "WhatsApp desconectou"

```powershell
# Pare o servidor (Ctrl+C)
# Delete a pasta de autenticação:
Remove-Item -Recurse -Force .wwebjs_auth

# Inicie novamente e escaneie o QR Code:
npm start
```

### "Email não envia"

- Verifique se usou a senha de APP (16 dígitos) e não sua senha normal
- Verifique se a verificação em duas etapas está ativa no Gmail
- Teste com: https://myaccount.google.com/apppasswords

## 📞 Formato de Telefone

O sistema aceita vários formatos:

- `11999999999`
- `(11) 99999-9999`
- `+55 11 99999-9999`

Todos são convertidos automaticamente para o formato do WhatsApp.

## 🎉 Pronto!

Agora seu sistema está 100% funcional e automatizado!

As notificações serão enviadas automaticamente no horário configurado. 🚀
