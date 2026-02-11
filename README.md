# 📱 Disparador WhatsApp - Sistema Completo

Sistema completo de disparo e gerenciamento de mensagens WhatsApp com interface web moderna, desenvolvido com React, Node.js e PostgreSQL.

[![Deploy Status](https://img.shields.io/badge/frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Deploy Status](https://img.shields.io/badge/backend-Render-46E3B7?logo=render)](https://render.com)
[![Database](https://img.shields.io/badge/database-Supabase-3ECF8E?logo=supabase)](https://supabase.com)

---

## 🚀 Destaques

- ✅ **Interface Moderna** - React + Vite + TailwindCSS
- ✅ **Gerenciamento de Campanhas** - Crie e agende disparos em massa
- ✅ **Importação de Contatos** - CSV e Excel
- ✅ **Chat em Tempo Real** - WebSocket para mensagens instantâneas
- ✅ **Relatórios Completos** - Acompanhe performance e estatísticas
- ✅ **Multi-usuário** - Controle de acesso e permissões
- ✅ **QR Code WhatsApp** - Conexão fácil via interface web
- ✅ **Deploy em Nuvem** - Pronto para produção

---

## 📋 Índice

- [Instalação Local](#-instalação-local)
- [Deploy em Produção](#-deploy-em-produção)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação](#-documentação)
- [Tecnologias](#-tecnologias)
- [Screenshots](#-screenshots)
- [Licença](#-licença)

---

## 💻 Instalação Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL (ou conta no Supabase)
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/Disparador-Whatsapp.git
cd Disparador-Whatsapp
```

2. **Instale as dependências**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Configure as variáveis de ambiente**
```bash
# Copie os templates
cp .env.example .env
cp backend/.env.example backend/.env

# Edite os arquivos .env com suas credenciais
```

4. **Configure o banco de dados**
- Crie um banco PostgreSQL
- Execute os scripts SQL (veja [DEPLOY.md](./DEPLOY.md#passo-13-criar-tabelas-do-banco))

5. **Inicie os servidores**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

6. **Acesse a aplicação**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

📖 **Mais detalhes:** [COMANDOS.md](./COMANDOS.md)

---

## ☁️ Deploy em Produção

Este projeto está configurado para deploy em:
- **Frontend:** Vercel
- **Backend:** Render
- **Banco de Dados:** Supabase

### Quick Start

1. Faça push do código para o GitHub
2. Siga o guia completo em [DEPLOY.md](./DEPLOY.md)
3. Use o checklist em [CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)

### Arquitetura de Deploy

```
Frontend (Vercel)  ←→  Backend (Render)  ←→  Database (Supabase)
     React              Node.js/Express        PostgreSQL
```

📖 **Guia Completo:** [DEPLOY.md](./DEPLOY.md)

---

## 📁 Estrutura do Projeto

```
Disparador-Whatsapp/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── config/            # Configurações (API)
│   └── utils/             # Utilitários
├── backend/               # Backend (Node.js + Express)
│   ├── server.js          # Servidor principal
│   ├── routes/            # Rotas da API
│   ├── middleware/        # Middlewares (auth, etc)
│   ├── classes/           # Classes de negócio
│   └── config/            # Config banco de dados
├── public/                # Arquivos estáticos
└── docs/                  # Documentação
```

📖 **Estrutura Detalhada:** [ESTRUTURA.md](./ESTRUTURA.md)

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [DEPLOY.md](./DEPLOY.md) | Guia completo de deploy em produção |
| [CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md) | Checklist passo a passo para deploy |
| [ESTRUTURA.md](./ESTRUTURA.md) | Documentação da estrutura do projeto |
| [COMANDOS.md](./COMANDOS.md) | Referência rápida de comandos |
| [backend/README.md](./backend/README.md) | Documentação específica do backend |
| [INTEGRACAO.md](./INTEGRACAO.md) | Documentação de integração |

---

## 🛠️ Tecnologias

### Frontend
- **React 19** - Interface de usuário
- **Vite** - Build tool e dev server
- **TailwindCSS** - Estilização
- **Lucide React** - Ícones
- **React Router** - Navegação
- **Recharts** - Gráficos e visualizações

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **whatsapp-web.js** - API do WhatsApp
- **JWT** - Autenticação
- **WebSocket (ws)** - Comunicação em tempo real
- **Multer** - Upload de arquivos

### Deploy
- **Vercel** - Hospedagem do frontend
- **Render** - Hospedagem do backend
- **Supabase** - Banco de dados PostgreSQL

---

## 🎯 Funcionalidades

### Gerenciamento de Usuários
- ✅ Cadastro e login
- ✅ Controle de permissões
- ✅ Tipos de usuário (admin, consultor)

### Campanhas
- ✅ Criar campanhas de disparo
- ✅ Agendar envios
- ✅ Status em tempo real
- ✅ Pausar/retomar campanhas

### Contatos
- ✅ Importar via CSV/Excel
- ✅ Gerenciar grupos
- ✅ Validação de números
- ✅ Exportar dados

### Leads
- ✅ Captura automática de respostas
- ✅ Histórico de conversas
- ✅ Chat em tempo real
- ✅ Status de atendimento

### Relatórios
- ✅ Estatísticas de envio
- ✅ Gráficos de performance
- ✅ Exportação de dados
- ✅ Filtros avançados

---

## 📸 Screenshots

### Dashboard
![Dashboard](./docs/screenshots/dashboard.png)

### Gerenciamento de Campanhas
![Campanhas](./docs/screenshots/campanhas.png)

### Chat em Tempo Real
![Chat](./docs/screenshots/chat.png)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 🐛 Reportar Bugs

Encontrou um bug? Por favor, abra uma [issue](https://github.com/seu-usuario/Disparador-Whatsapp/issues) com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)

---

## 📄 Licença

Este projeto está sob a licença [MIT](./LICENSE).

---

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- Email: seu@email.com

---

## 🙏 Agradecimentos

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - API do WhatsApp
- [Vercel](https://vercel.com) - Hospedagem do frontend
- [Render](https://render.com) - Hospedagem do backend
- [Supabase](https://supabase.com) - Banco de dados

---

## ⭐ Apoie o Projeto

Se este projeto foi útil para você, considere dar uma estrela ⭐ no GitHub!

[⬆ Voltar ao topo](#-disparador-whatsapp---sistema-completo)

