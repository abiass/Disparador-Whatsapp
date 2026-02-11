# 🚀 Guia de Início Rápido

## Para quem quer começar AGORA! ⚡

Este é o guia mais rápido para colocar o projeto no ar.

---

## 📍 Você está aqui → Precisa chegar lá 🎯

### Desenvolvimento Local (15 minutos)
```bash
# 1. Clone
git clone https://github.com/seu-usuario/Disparador-Whatsapp.git
cd Disparador-Whatsapp

# 2. Instale tudo
npm install
cd backend && npm install && cd ..

# 3. Configure
cp .env.example .env
# Edite o arquivo `.env` (na raiz) com suas credenciais.
# Observações:
# - Não coloque a SUPABASE_SERVICE_ROLE_KEY no frontend; para produção, adicione-a no dashboard do Render.
# - O projeto usa um ÚNICO `.env` na raiz para evitar duplicidade de variáveis (não precisa criar `backend/.env`).

# 4. Rode
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev

# 5. Acesse
# http://localhost:5173
```

✅ **Pronto!** Funcionando localmente.

---

### Deploy em Produção (30 minutos)

#### 1️⃣ Supabase (5 min)
- Crie conta: https://supabase.com
- New Project → Anote credenciais
- SQL Editor → Cole script do [DEPLOY.md](./DEPLOY.md#passo-13-criar-tabelas-do-banco)
- ✅ Banco pronto!

#### 2️⃣ Render (10 min)
- Crie conta: https://render.com
- New Web Service → Conecte GitHub
- **Root Directory:** `backend`
- **Build:** `npm install`
- **Start:** `npm start`
- Adicione variáveis de ambiente
- ✅ Backend no ar!

#### 3️⃣ Vercel (5 min)
- Crie conta: https://vercel.com
- Import Project → Conecte GitHub
- Adicione variáveis:
  - `VITE_API_URL` = sua-url-do-render
  - `VITE_WS_URL` = wss://sua-url-do-render
- ✅ Frontend no ar!

#### 4️⃣ Configurar CORS (5 min)
- Volte ao Render
- Environment → Adicione:
  - `FRONTEND_URL` = sua-url-da-vercel
- ✅ Tudo conectado!

#### 5️⃣ Testar (5 min)
- Acesse seu site na Vercel
- Faça login
- Teste funcionalidades
- 🎉 **FUNCIONANDO!**

---

## 📚 Documentação Completa

Se precisar de mais detalhes:

| Preciso de... | Veja... |
|---------------|---------|
| Deploy passo a passo detalhado | [DEPLOY.md](./DEPLOY.md) |
| Checklist para não esquecer nada | [CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md) |
| Entender a estrutura do projeto | [ESTRUTURA.md](./ESTRUTURA.md) |
| Comandos úteis do dia a dia | [COMANDOS.md](./COMANDOS.md) |
| Visão geral do projeto | [README.md](./README.md) |
| O que mudou na reorganização | [SUMMARY.md](./SUMMARY.md) |

---

## 🆘 Problemas Comuns

### "Network Error" no frontend
```bash
# Verifique VITE_API_URL na Vercel
# Verifique FRONTEND_URL no Render
```

### "Database connection failed"
```bash
# Verifique todas as variáveis DB_* no Render
# Certifique-se que DB_SSL=true
```

### "Module not found"
```bash
# Verifique Root Directory = backend no Render
# Redeploy com npm install limpo
```

---

## 💡 Dicas

### Primeira vez com estas plataformas?
1. ✅ Todas têm plano gratuito
2. ✅ Deploy em minutos, não horas
3. ✅ SSL/HTTPS automático
4. ✅ Git push = auto deploy

### Já tem experiência?
- Use `vercel` CLI para deploy mais rápido
- Configure webhooks para CI/CD
- Ative monitoramento desde o início

---

## 🎯 Resultado Final

Após seguir este guia, você terá:

✅ Frontend rodando na Vercel  
✅ Backend rodando no Render  
✅ Banco de dados no Supabase  
✅ SSL/HTTPS automático  
✅ Deploy automático via Git  
✅ Logs centralizados  
✅ Sistema em produção!  

---

## 📞 Precisa de Ajuda?

1. 📖 Leia a seção de Troubleshooting em [DEPLOY.md](./DEPLOY.md#troubleshooting)
2. 🔍 Verifique os logs nas plataformas
3. ✅ Use o [CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)

---

**Boa sorte! 🚀**

Lembre-se: A primeira vez sempre demora mais. Depois fica fácil!
