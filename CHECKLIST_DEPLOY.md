# ✅ Checklist de Deploy

Use este checklist para garantir que todos os passos foram executados corretamente.

## 📋 Pré-Deploy

### Preparação do Código
- [ ] Código commitado e pushed para GitHub
- [ ] Branch `main` está atualizada
- [ ] Estrutura separada: `backend/` e `src/` (frontend)
- [ ] Arquivos `.env.example` criados e documentados
- [ ] Arquivos `.gitignore` configurados (não commitar `.env`)

### Teste Local
- [ ] Backend funciona localmente (`cd backend && npm start`)
- [ ] Frontend funciona localmente (`npm run dev`)
- [ ] Conexão entre frontend e backend OK
- [ ] Todas as funcionalidades testadas

---

## 🗄️ 1. Banco de Dados (Supabase)

- [ ] Conta criada no Supabase
- [ ] Projeto criado
- [ ] Senha do banco salva em local seguro
- [ ] Script SQL executado (criação de tabelas)
- [ ] Tabelas criadas verificadas no Table Editor
- [ ] Credenciais anotadas:
  - [ ] `DB_HOST`
  - [ ] `DB_PORT`
  - [ ] `DB_USER`
  - [ ] `DB_NAME`
  - [ ] `DB_PASSWORD`

---

## 🖥️ 2. Backend (Render)

### Configuração Inicial
- [ ] Conta criada no Render
- [ ] Repositório GitHub conectado
- [ ] Web Service criado
- [ ] **Root Directory:** `backend` ⚠️

### Build Settings
- [ ] **Build Command:** `npm install`
- [ ] **Start Command:** `npm start`
- [ ] **Runtime:** Node

### Variáveis de Ambiente
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `DB_HOST=...` (Supabase)
- [ ] `DB_PORT=5432`
- [ ] `DB_USER=postgres`
- [ ] `DB_NAME=postgres`
- [ ] `DB_PASSWORD=...` (Supabase)
- [ ] `DB_SSL=true`
- [ ] `JWT_SECRET=...` (gerado)
- [ ] `FRONTEND_URL=https://...` (adicionar depois)

### Deploy e Teste
- [ ] Deploy concluído sem erros
- [ ] URL do backend anotada: `https://____________.onrender.com`
- [ ] Health check funcionando: `/health`
- [ ] Logs sem erros críticos

---

## 🌐 3. Frontend (Vercel)

### Configuração Inicial
- [ ] Conta criada na Vercel
- [ ] Repositório GitHub importado
- [ ] **Framework Preset:** Vite detectado
- [ ] **Root Directory:** `./` (raiz)

### Build Settings
- [ ] **Build Command:** `npm run build`
- [ ] **Output Directory:** `dist`

### Variáveis de Ambiente
- [ ] `VITE_API_URL=https://seu-backend.onrender.com`
- [ ] `VITE_WS_URL=wss://seu-backend.onrender.com`

### Deploy e Teste
- [ ] Deploy concluído sem erros
- [ ] URL do frontend anotada: `https://____________.vercel.app`
- [ ] Site carrega corretamente
- [ ] Não há erros no console do navegador

---

## ⚙️ 4. Configuração Final

### Backend (atualizar CORS)
- [ ] Voltar ao Render → Environment
- [ ] Atualizar `FRONTEND_URL` com URL real do Vercel
- [ ] Salvar e esperar redeploy
- [ ] Verificar logs após redeploy

### Testes de Integração
- [ ] Login funciona
- [ ] Criação de usuários funciona
- [ ] Upload de contatos funciona
- [ ] Criação de campanhas funciona
- [ ] QR Code do WhatsApp aparece
- [ ] Conexão WebSocket estabelecida
- [ ] Mensagens em tempo real funcionam

---

## 🔐 5. Segurança

- [ ] Arquivo `.env` NÃO está no Git
- [ ] JWT_SECRET é forte (32+ caracteres aleatórios)
- [ ] Senhas do banco não estão no código
- [ ] CORS configurado apenas para frontend específico
- [ ] SSL habilitado no banco (Supabase)

---

## 📊 6. Monitoramento

### Configurar Alertas (Opcional)
- [ ] UptimeRobot configurado (ping no backend)
- [ ] Email de notificação configurado
- [ ] Verificação a cada 5 minutos

### Testes de Carga (Recomendado)
- [ ] Testar com múltiplos usuários simultâneos
- [ ] Verificar performance de importação de contatos
- [ ] Verificar limite de mensagens do WhatsApp

---

## 📝 7. Documentação

- [ ] URLs de produção documentadas
- [ ] Credenciais salvas em cofre de senhas
- [ ] README atualizado
- [ ] Equipe treinada no sistema

---

## 🎉 Deploy Concluído!

### Informações Finais

**URLs:**
- Frontend: `https://________________.vercel.app`
- Backend: `https://________________.onrender.com`
- Banco: Supabase Dashboard

**Acessos:**
- [ ] Supabase: email@email.com
- [ ] Render: email@email.com
- [ ] Vercel: email@email.com
- [ ] GitHub Repo: github.com/usuario/repo

**Próximos Passos:**
- [ ] Configurar domínio customizado (opcional)
- [ ] Configurar backups automáticos
- [ ] Documentar processos de manutenção
- [ ] Planejar escalabilidade futura

---

## 🆘 Em Caso de Problemas

1. **Verificar logs:**
   - Render: Dashboard → Logs
   - Vercel: Dashboard → Deployment → Logs
   - Supabase: Dashboard → Logs

2. **Testar endpoints individualmente:**
   ```bash
   # Health check backend
   curl https://seu-backend.onrender.com/health
   
   # Teste de login
   curl -X POST https://seu-backend.onrender.com/api/login \
     -H "Content-Type: application/json" \
     -d '{"nome":"admin","senha":"senha123"}'
   ```

3. **Consultar documentação:**
   - [DEPLOY.md](./DEPLOY.md)
   - [Troubleshooting](./DEPLOY.md#troubleshooting)

---

**Data do Deploy:** ___/___/______  
**Responsável:** ____________________
