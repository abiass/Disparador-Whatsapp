# 🚀 Guia Completo de Deploy

Este documento contém instruções detalhadas para hospedar o sistema Disparador WhatsApp em três plataformas diferentes:
- **Frontend:** Vercel
- **Backend:** Render
- **Banco de Dados:** Supabase

---

## 📋 Índice
1. [Preparação Inicial](#preparação-inicial)
2. [Deploy do Banco de Dados (Supabase)](#1-banco-de-dados-supabase)
3. [Deploy do Backend (Render)](#2-backend-render)
4. [Deploy do Frontend (Vercel)](#3-frontend-vercel)
5. [Configuração Final](#4-configuração-final)
6. [Troubleshooting](#troubleshooting)

---

## Preparação Inicial

### Pré-requisitos
- Conta no [GitHub](https://github.com) (para conectar aos serviços)
- Conta no [Vercel](https://vercel.com)
- Conta no [Render](https://render.com)
- Conta no [Supabase](https://supabase.com)
- Git instalado localmente

### Estrutura do Projeto Reorganizada
```
Disparador-Whatsapp/
├── backend/               # ← Servidor Node.js/Express
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── routes/
│   ├── classes/
│   ├── utils/
│   ├── middleware/
│   └── config/
├── src/                   # ← Frontend React
├── public/
├── package.json          # ← Frontend
├── vite.config.js
└── vercel.json
```

---

## 1. 🗄️ Banco de Dados (Supabase)

### Passo 1.1: Criar Projeto
1. Acesse [Supabase](https://supabase.com) e faça login
2. Clique em **"New Project"**
3. Configure:
   - **Name:** `disparador-whatsapp`
   - **Database Password:** Gere uma senha forte e **salve-a**
   - **Region:** Escolha a mais próxima (ex: South America)
4. Clique em **"Create new project"**
5. Aguarde a criação (1-2 minutos)

### Passo 1.2: Obter Credenciais de Conexão
1. No menu lateral, vá em **"Settings"** → **"Database"**
2. Na seção **"Connection string"**, selecione **"URI"**
3. Copie a string de conexão no formato:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```
4. Extraia os valores:
   - **DB_HOST:** `db.xxxx.supabase.co`
   - **DB_PORT:** `5432`
   - **DB_USER:** `postgres`
   - **DB_NAME:** `postgres`
   - **DB_PASSWORD:** Sua senha
   - **DB_SSL:** `true` (sempre true no Supabase)

### Passo 1.3: Criar Tabelas do Banco

Execute os scripts SQL no **SQL Editor** do Supabase:

```sql
-- Tabela de usuários
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'ativo',
  tipo_usuario VARCHAR(50) DEFAULT 'consultor',
  telas_liberadas TEXT DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de leads
CREATE TABLE leads_whatsapp (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(50) NOT NULL,
  cnpj VARCHAR(50),
  datahora TIMESTAMP,
  id_whatsapp VARCHAR(255),
  status VARCHAR(50) DEFAULT 'novo',
  status_lead VARCHAR(50),
  obs_perdido TEXT,
  respondeu BOOLEAN DEFAULT FALSE,
  respondeu_em TIMESTAMP,
  sessao_conversa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de campanhas
CREATE TABLE campanhas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'rascunho',
  template_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de contatos
CREATE TABLE contatos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255),
  grupo_id INTEGER,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de templates
CREATE TABLE templates (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de mensagens enviadas
CREATE TABLE mensagens_enviadas (
  id SERIAL PRIMARY KEY,
  campanha_id INTEGER REFERENCES campanhas(id),
  telefone VARCHAR(50) NOT NULL,
  mensagem TEXT,
  status VARCHAR(50) DEFAULT 'pendente',
  enviado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de status de leads por usuário
CREATE TABLE leads_status (
  user_id INTEGER PRIMARY KEY,
  lead_index INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de grupos de contatos
CREATE TABLE grupos_contatos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_leads_telefone ON leads_whatsapp(telefone);
CREATE INDEX idx_contatos_telefone ON contatos(telefone);
CREATE INDEX idx_mensagens_campanha ON mensagens_enviadas(campanha_id);
CREATE INDEX idx_mensagens_telefone ON mensagens_enviadas(telefone);
```

✅ **Pronto!** Seu banco de dados Supabase está configurado.

---

## 2. 🖥️ Backend (Render)

### Passo 2.1: Preparar Repositório
1. Certifique-se que seu código está no GitHub
2. Commit e push das alterações:
   ```bash
   git add .
   git commit -m "Estrutura reorganizada para deploy"
   git push origin main
   ```

### Passo 2.2: Criar Web Service no Render
1. Acesse [Render](https://render.com) e faça login
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Configure:
   - **Name:** `disparador-whatsapp-backend`
   - **Region:** Escolha a mais próxima
   - **Branch:** `main`
   - **Root Directory:** `backend`  ⚠️ **IMPORTANTE**
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (ou pago se preferir)

### Passo 2.3: Configurar Variáveis de Ambiente
No Render, vá em **"Environment"** e adicione:

```env
NODE_ENV=production
PORT=3001

# Banco de Dados Supabase (valores do Passo 1.2)
DB_HOST=db.xxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_NAME=postgres
DB_PASSWORD=sua_senha_do_supabase
DB_SSL=true

# JWT Secret (gere um aleatório)
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui_min_32_caracteres

# -----------------------------
# Opcional: Persistência de sessão WhatsApp (gratuito via Supabase Storage)
# -----------------------------
# URL do projeto Supabase (ex: https://xyzcompany.supabase.co)
SUPABASE_URL=
# Chave de serviço (SERVICE ROLE) — MUITO IMPORTANTE: apenas no backend
SUPABASE_SERVICE_ROLE_KEY=
# Bucket e chave do arquivo de sessão
SUPABASE_SESSION_BUCKET=wpp-sessions
SESSION_FILE_KEY=session-default.zip
# Intervalo (minutos) para upload periódico da sessão (padrão 5)
SESSION_UPLOAD_INTERVAL_MINUTES=5

# NOTA: Se não preencher essas variáveis, a persistência automática será desativada.
```

# Frontend URL (adicionar depois do deploy do Vercel)
FRONTEND_URL=https://seu-frontend.vercel.app
```

**Para gerar JWT_SECRET seguro:**
- No terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Ou use um gerador online de strings aleatórias (mínimo 32 caracteres)

### Passo 2.4: Deploy
1. Clique em **"Create Web Service"**
2. Aguarde o build e deploy (3-5 minutos)
3. Quando finalizar, você terá uma URL tipo: `https://disparador-whatsapp-backend.onrender.com`
4. **Salve essa URL!** Você vai precisar no frontend.
---

### Persistência de Sessão WhatsApp (opção gratuita)
Se você pretende usar o plano Free do Render, siga estes passos para manter a sessão do WhatsApp entre reinícios:

1. No Supabase, vá em **Storage → Create bucket** e crie um bucket (ex: `wpp-sessions`).
2. No Render, adicione as variáveis de ambiente no serviço backend:
   - `SUPABASE_URL` = `https://<seu-projeto>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (Service Role Key do Supabase)
   - `SUPABASE_SESSION_BUCKET` = `wpp-sessions` (ou o nome do seu bucket)
   - `SESSION_FILE_KEY` = `session-default.zip` (ou outro nome)
3. O backend já contém utilitários em `backend/utils/sessionStore.js` que:
   - baixam a sessão antes de inicializar o cliente WhatsApp
   - sobem a sessão quando autenticado e periodicamente
4. Opcional: use **UptimeRobot** (gratuito) para pingar `https://<seu-backend>/health` a cada 5 minutos para reduzir o tempo de inatividade.

> Observação: Mantenha `SUPABASE_SERVICE_ROLE_KEY` apenas no backend (não no frontend). Para segurança extra, gere chaves expiradas e rotacione quando necessário.
### Passo 2.5: Testar Backend
Acesse: `https://seu-backend.onrender.com/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

✅ **Backend no ar!**

---

## 3. 🌐 Frontend (Vercel)

### Passo 3.1: Configurar Variáveis de Ambiente Localmente
Crie o arquivo `.env.local` na **raiz do projeto** (não no backend):

```env
VITE_API_URL=https://seu-backend.onrender.com
VITE_WS_URL=wss://seu-backend.onrender.com
```

**⚠️ IMPORTANTE:** Substitua `seu-backend.onrender.com` pela URL do seu backend do Render.

### Passo 3.2: Testar Localmente
```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` e verifique que está conectando no backend do Render.

### Passo 3.3: Deploy na Vercel

#### Opção 1: Via Interface Web (Recomendado)
1. Acesse [Vercel](https://vercel.com) e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Importe seu repositório do GitHub
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (raiz do projeto)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Em **"Environment Variables"**, adicione:
   - `VITE_API_URL` = `https://seu-backend.onrender.com`
   - `VITE_WS_URL` = `wss://seu-backend.onrender.com`
6. Clique em **"Deploy"**

#### Opção 2: Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Seguir instruções
# Adicionar variáveis de ambiente quando solicitado
```

### Passo 3.4: Obter URL do Frontend
Após o deploy, você terá uma URL tipo: `https://seu-projeto.vercel.app`

✅ **Frontend no ar!**

---

## 4. ⚙️ Configuração Final

### Passo 4.1: Atualizar CORS no Backend
1. Volte ao **Render** → Seu backend → **Environment**
2. Atualize a variável `FRONTEND_URL` com a URL real do Vercel:
   ```
   FRONTEND_URL=https://seu-projeto.vercel.app
   ```
3. Salve e espere o redeploy automático

### Passo 4.2: Verificar Conexão
1. Acesse seu frontend na Vercel
2. Tente fazer login
3. Verifique se as requisições estão funcionando no Network tab do navegador
4. Teste as funcionalidades principais

### Passo 4.3: Persistência do WhatsApp
⚠️ **IMPORTANTE:** O Render Free tier limpa o filesystem a cada redeploy!

**Soluções:**
1. **Recomendado:** Usar plano pago do Render com disco persistente
2. **Alternativa:** Implementar autenticação do WhatsApp via QR code a cada reinício

---

## 5. 📊 Monitoramento

### Logs do Backend (Render)
- Acesse: Render Dashboard → Seu serviço → **Logs**
- Acompanhe em tempo real

### Logs do Frontend (Vercel)
- Acesse: Vercel Dashboard → Seu projeto → **Deployments** → Clique no deployment → **Logs**

### Banco de Dados (Supabase)
- Veja queries em: Dashboard → **Database** → **Query Performance**
- Monitore uso: Dashboard → **Settings** → **Usage**

---

## Troubleshooting

### ❌ Erro: "Network Error" no Frontend
**Causa:** CORS ou URL da API errada
**Solução:**
1. Verifique se `VITE_API_URL` está correta no Vercel
2. Confirme que `FRONTEND_URL` está configurada no Render
3. Redeploy de ambos os serviços

### ❌ Erro: "Database connection failed"
**Causa:** Credenciais do Supabase incorretas
**Solução:**
1. Verifique todas as variáveis `DB_*` no Render
2. Teste a conexão no Supabase: Settings → Database → Connection pooler
3. Certifique-se que `DB_SSL=true`

### ❌ Erro: "Module not found"
**Causa:** Dependências não instaladas ou paths incorretos
**Solução:**
1. Verifique `package.json` no backend
2. Confirme que `Root Directory` no Render está como `backend`
3. Redeploy com `npm install` forçado

### ❌ WebSocket não conecta
**Causa:** URL do WebSocket incorreta
**Solução:**
1. No Vercel, verifique `VITE_WS_URL`
2. Deve começar com `wss://` (seguro) não `ws://`
3. Redeploy do frontend

### ❌ Backend "sleeping" (Render Free)
**Causa:** Render Free desliga após 15min de inatividade
**Solução:**
- Primeira requisição reativa (pode demorar 30-60s)
- Ou configure um ping service (ex: UptimeRobot, Cron-job.org)

### ❌ WhatsApp desconecta após redeploy
**Causa:** Render Free não persiste arquivos de sessão
**Solução:**
- Upgrade para plano pago do Render
- Ou implemente sistema de reconexão automática via QR

---

## 🎉 Deploy Concluído!

Seu sistema está rodando em produção:
- ✅ Frontend: Vercel
- ✅ Backend: Render  
- ✅ Banco de Dados: Supabase

### URLs Importantes
- **Frontend:** `https://seu-projeto.vercel.app`
- **Backend:** `https://seu-backend.onrender.com`
- **Banco de Dados:** Supabase Dashboard

### Próximos Passos
1. Configure SSL/domínio customizado (opcional)
2. Configure backups automáticos no Supabase
3. Configure monitoring/alertas
4. Implemente CI/CD para deploys automáticos

---

## 📚 Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Render](https://render.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Desenvolvido por:** [Seu Nome]  
**Última atualização:** Fevereiro 2026
