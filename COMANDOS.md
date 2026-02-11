# 🚀 Comandos Rápidos - Disparador WhatsApp

Referência rápida de comandos para desenvolvimento e deploy.

---

## 💻 Desenvolvimento Local

### Primeira vez (Setup)
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Disparador-Whatsapp.git
cd Disparador-Whatsapp

# Instalar dependências do FRONTEND
npm install

# Instalar dependências do BACKEND
cd backend
npm install
cd ..

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo `.env` na raiz do projeto com suas credenciais.
# Observação: não coloque `SUPABASE_SERVICE_ROLE_KEY` no frontend; para produção, adicione-o no Render (Environment) apenas no backend.
```

### Rodar Frontend
```bash
# Na raiz do projeto
npm run dev
# Acesse: http://localhost:5173
```

### Rodar Backend
```bash
# Em outro terminal
cd backend
npm run dev
# Roda em: http://localhost:3001
```

### Rodar Frontend + Backend Juntos
```bash
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
npm run dev
```

---

## 🔨 Build e Testes

### Build do Frontend
```bash
# Gera pasta dist/
npm run build

# Preview da build
npm run preview
```

### Limpar Build
```bash
# Remove pasta dist
rm -rf dist        # Linux/Mac
rmdir /s dist      # Windows
```

### Lint (Verificar Código)
```bash
npm run lint
```

---

## 📤 Git e Deploy

### Commit e Push
```bash
# Adicionar alterações
git add .

# Commit
git commit -m "feat: descrição da mudança"

# Push (trigger auto-deploy)
git push origin main
```

### Deploy Manual

#### Vercel (Frontend)
```bash
# Instalar CLI (primeira vez)
npm i -g vercel

# Deploy
vercel

# Deploy em produção
vercel --prod
```

#### Render (Backend)
- Deploy é automático via Git push
- Ou manualmente pelo dashboard

---

## 🗄️ Banco de Dados (Supabase)

### Conectar ao Banco via CLI
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Conectar ao projeto
supabase link --project-ref seu-project-ref
```

### Rodar Migrations (se houver)
```bash
cd backend
# Exemplo usando node-pg-migrate ou Prisma
npm run migrate
```

### Backup do Banco
```bash
# Via Supabase Dashboard
# Settings → Database → Database Backups → Download
```

---

## 🧪 Testes e Debug

### Health Check
```bash
# Backend local
curl http://localhost:3001/health

# Backend produção
curl https://seu-backend.onrender.com/health
```

### Testar Login
```bash
# Local
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"nome":"admin","senha":"senha123"}'

# Produção
curl -X POST https://seu-backend.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"nome":"admin","senha":"senha123"}'
```

### Testar WebSocket
```bash
# Instalar wscat (primeira vez)
npm install -g wscat

# Conectar ao WebSocket local
wscat -c ws://localhost:3001

# Conectar ao WebSocket produção
wscat -c wss://seu-backend.onrender.com
```

### Ver Logs em Tempo Real

#### Backend (Render)
```bash
# Via Dashboard: Render → Seu serviço → Logs
# Ou instalar Render CLI:
render logs -s seu-servico
```

#### Frontend (Vercel)
```bash
# Via Dashboard: Vercel → Deployment → View Function Logs
# Ou instalar Vercel CLI:
vercel logs
```

---

## 🔧 Manutenção

### Atualizar Dependências
```bash
# Frontend
npm update
npm audit fix

# Backend
cd backend
npm update
npm audit fix
```

### Verificar Dependências Desatualizadas
```bash
npm outdated              # Frontend
cd backend && npm outdated # Backend
```

### Limpar node_modules
```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Monitoramento

### Ver Uso de Recursos

#### Vercel
```bash
# Via CLI
vercel stats

# Ou Dashboard: Analytics
```

#### Render
```bash
# Dashboard → Metrics
# CPU, Memory, Bandwidth
```

#### Supabase
```bash
# Dashboard → Settings → Usage
# Database size, API requests, Bandwidth
```

---

## 🆘 Troubleshooting

### Frontend não conecta no backend
```bash
# 1. Verificar variável de ambiente
cat .env
# Deve ter: VITE_API_URL=https://...

# 2. Rebuild do frontend
npm run build
vercel --prod

# 3. Verificar CORS no backend
# Render → Environment → FRONTEND_URL
```

### Backend não conecta no banco
```bash
# 1. Testar conexão
cd backend
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://...'
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err : res.rows[0]);
  pool.end();
});
"

# 2. Verificar variáveis no Render
# DB_HOST, DB_PORT, DB_USER, DB_NAME, DB_PASSWORD
```

### WhatsApp desconecta
```bash
# Render Free não persiste arquivos
# Soluções:
# 1. Upgrade para plano pago
# 2. Implementar reconexão automática
# 3. Uso temporário com QR code sempre
```

### Build falha na Vercel
```bash
# Ver logs detalhados
vercel logs

# Comum: Variáveis de ambiente faltando
# Solução: Adicionar VITE_API_URL no dashboard
```

### Build falha no Render
```bash
# Verificar:
# 1. Root Directory = backend
# 2. Build Command = npm install
# 3. Start Command = npm start
# 4. Node version compatível (18+)
```

---

## 🔑 Variáveis de Ambiente

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001     # Dev
VITE_WS_URL=ws://localhost:3001        # Dev

# Produção (configurar na Vercel):
# VITE_API_URL=https://backend.onrender.com
# VITE_WS_URL=wss://backend.onrender.com
```

### Backend (backend/.env)
```bash
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_NAME=disparador_whatsapp
DB_PASSWORD=sua_senha
DB_SSL=false

JWT_SECRET=seu_secret_aqui

FRONTEND_URL=http://localhost:5173
```

### Gerar JWT Secret
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 📚 Links Úteis

### Dashboards
- [Vercel](https://vercel.com/dashboard)
- [Render](https://dashboard.render.com/)
- [Supabase](https://app.supabase.com/)
- [GitHub](https://github.com/)

### Documentação
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [whatsapp-web.js](https://wwebjs.dev/)
- [PostgreSQL](https://www.postgresql.org/docs/)

### Ferramentas
- [Postman](https://www.postman.com/) - Testar APIs
- [Table Plus](https://tableplus.com/) - Cliente PostgreSQL
- [wscat](https://github.com/websockets/wscat) - Testar WebSocket

---

## 💡 Dicas Pro

### Desenvolvimento Produtivo
```bash
# Usar concurrently para rodar frontend + backend juntos
npm install -g concurrently

# Criar script no package.json raiz:
"scripts": {
  "dev:all": "concurrently \"npm run dev\" \"cd backend && npm run dev\""
}

# Rodar tudo com um comando:
npm run dev:all
```

### Git Aliases
```bash
# Adicionar no ~/.gitconfig
[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  pl = pull
  ps = push
  lg = log --oneline --graph --decorate
```

### VS Code Extensions Recomendadas
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Thunder Client** (testar APIs)
- **GitLens**
- **Better Comments**

---

**Mantenha este arquivo atualizado conforme o projeto evolui!**

Última atualização: Fevereiro 2026
