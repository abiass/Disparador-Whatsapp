// ==========================================
// EXEMPLO DE INTEGRAÇÃO DO SERVIDOR
// Adicione isso ao seu servidor Express existente
// ==========================================

/\*
// No seu arquivo server.js ou index.js principal, adicione:

const express = require('express');
const { Pool } = require('pg');
const http = require('http');
const socketIo = require('socket.io');
const FilaDisparo = require('./src/server/classes/FilaDisparo');

// 1. Inicializar banco de dados
const pool = new Pool({
user: 'seu_usuario',
password: 'sua_senha',
host: 'localhost',
port: 5432,
database: 'disparador_whatsapp'
});

// 2. Inicializar Express e WebSocket
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
cors: { origin: '\*' }
});

// 3. Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 4. Adicionar pool e io aos requests
app.use((req, res, next) => {
req.pool = pool;
req.io = io;
next();
});

// 5. Inicializar Fila de Disparo
const filaDisparo = new FilaDisparo(wppClient, pool, io);
app.set('filaDisparo', filaDisparo);
app.set('wppClient', wppClient); // seu cliente WhatsApp-Web.js

// 6. Registrar rotas
app.use('/api/campanhas', require('./src/server/routes/campanhasRoutes'));
app.use('/api/contatos', require('./src/server/routes/contatosRoutes'));
app.use('/api', require('./src/server/routes/templatesRelatoriosRoutes'));

// 7. WebSocket - Listener para progresso de disparo
io.on('connection', (socket) => {
console.log(`Novo cliente conectado: ${socket.id}`);

socket.on('disconnect', () => {
console.log(`Cliente desconectado: ${socket.id}`);
});

socket.on('acompanhar*campanha', (campanhaId) => {
socket.join(`campanha*${campanhaId}`);
    console.log(`Cliente ${socket.id} acompanhando campanha ${campanhaId}`);
});
});

// 8. Eventos de progresso (emitidos pela FilaDisparo)
const originalEmit = io.emit;
io.prototype.emit = function(...args) {
if (args[0] === 'disparador:progresso') {
const campanhaId = args[1].campanhaId;
io.to(`campanha_${campanhaId}`).emit(...args);
}
return originalEmit.apply(this, args);
};

// 9. Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
console.log(`🚀 Servidor rodando na porta ${PORT}`);
console.log(`📊 Disparador de WhatsApp pronto!`);
});

\*/

// ==========================================
// INSTRUÇÕES DE USO DO SISTEMA
// ==========================================

/\*

## PASSO 1: INICIALIZAR O BANCO DE DADOS

Execute o arquivo database/init.sql:

```sql
psql -U seu_usuario -d disparador_whatsapp -f database/init.sql
```

## PASSO 2: INSTALAR DEPENDÊNCIAS

```bash
npm install multer csv-parser xlsx node-cron
npm install recharts react-dropzone date-fns
```

## PASSO 3: CONFIGURAR VARIÁVEIS DE AMBIENTE

Crie um arquivo .env:

```

```

## PASSO 4: ROTAS DISPONÍVEIS

### Campanhas

- GET /api/campanhas - Lista campanhas
- GET /api/campanhas/:id - Detalhes da campanha
- POST /api/campanhas - Criar campanha
- PUT /api/campanhas/:id - Editar campanha
- DELETE /api/campanhas/:id - Deletar campanha
- POST /api/campanhas/:id/iniciar - Iniciar disparo
- POST /api/campanhas/:id/pausar - Pausar disparo
- POST /api/campanhas/:id/retomar - Retomar disparo

### Contatos

- GET /api/contatos - Lista contatos
- GET /api/contatos/:id - Detalhes do contato
- POST /api/contatos - Criar contato
- PUT /api/contatos/:id - Editar contato
- DELETE /api/contatos/:id - Deletar contato
- DELETE /api/contatos - Deletar múltiplos
- POST /api/contatos/importar - Importar CSV/Excel
- POST /api/contatos/validar - Validar números
- GET /api/contatos/exportar/csv - Exportar CSV

### Templates

- GET /api/templates - Lista templates
- GET /api/templates/:id - Detalhes do template
- POST /api/templates - Criar template
- PUT /api/templates/:id - Editar template
- DELETE /api/templates/:id - Deletar template

### Relatórios

- GET /api/relatorios/geral - Relatório geral
- GET /api/relatorios/campanha/:id - Relatório de campanha
- GET /api/relatorios/exportar/:id - Exportar relatório
- GET /api/relatorios/grafico/envios - Dados gráfico envios
- GET /api/relatorios/grafico/status - Dados gráfico status

## PASSO 5: FLUXO DE USO

1. **Criar Templates**: Acesse Manage Templates
   - Nome do template
   - Conteúdo com variáveis {nome}, {empresa}, etc
   - Categoria (vendas, geral, etc)

2. **Importar Contatos**: Acesse Gerenciar Contatos
   - Faça upload de CSV ou Excel
   - Valide números contra WhatsApp
   - Sistema normaliza automaticamente

3. **Criar Campanha**: Clique em Nova Campanha
   - Nome e descrição
   - Selecione template
   - Selecione contatos
   - Configure intervalos (5-13 seg recomendado)
   - Configure limite por hora (30 recomendado)
   - Salve como rascunho ou inicie agora

4. **Monitorar Disparo**: Dashboard de Campanhas
   - Veja progresso em tempo real
   - Monitore sucessos e falhas
   - Pause/Retome quando necessário

5. **Análise**: Acesse Relatórios
   - Veja gráficos de envios
   - Taxa de entrega e erros
   - Estatísticas por campanha
   - Exporte dados em CSV

## PASSO 6: SEGURANÇA ANTI-BAN

O sistema implementa automaticamente:

✅ Intervalos randomizados entre mensagens (evita padrão detectável)
✅ Limite de mensagens por hora (protocolo WhatsApp)
✅ Restrição a horário comercial (9h-21h)
✅ Pause automática a cada 20 mensagens
✅ Monitoramento de taxa de erro
✅ Validação de números antes de enviar
✅ Tratamento inteligente de falhas com retry

## PASSO 7: WebSocket (Tempo Real)

Os atualizações em tempo real são emitidas automaticamente:

```javascript
// Frontend
socket.on("disparador:progresso", (dados) => {
  console.log("Progresso:", dados);
  // tipos: 'sucesso', 'erro', 'aguardando', 'pausa_automatica', 'concluida'
});
```

## PASSO 8: TRATAMENTO DE ERROS

O sistema trata:

- Números inválidos
- Contatos sem WhatsApp
- Limite de hora atingido
- Horário comercial
- Taxa de erro alta
- Falhas de conexão

## DICAS DE USO

1. **Comece pequeno**: Teste com 10-20 contatos primeiro
2. **Personalize**: Use variáveis {nome}, {empresa} no template
3. **Valide**: Sempre valide números antes de disparar
4. **Monitore**: Acompanhe os primeiros envios em tempo real
5. **Pause se necessário**: Sistema pode pausar automaticamente se erro > 30%
6. **Respeite a lei**: Certifique-se de ter consentimento de todos
7. **Faça backup**: Sempre tenha backup do banco antes de campanhas grandes

## EXEMPLO DE USO VIA API

```bash
# Criar template
curl -X POST http://localhost:3001/api/templates \\
  -H "Content-Type: application/json" \\
  -d '{
    "nome": "Prospecção",
    "conteudo": "Olá {nome}, tenho uma oportunidade para você!",
    "variaveis": ["{nome}"],
    "categoria": "vendas"
  }'

# Criar campanha
curl -X POST http://localhost:3001/api/campanhas \\
  -H "Content-Type: application/json" \\
  -d '{
    "nome": "Minha Campanha",
    "template_id": 1,
    "contatos": [1, 2, 3, 4, 5],
    "intervalo_min": 5,
    "intervalo_max": 13,
    "limite_por_hora": 30
  }'

# Iniciar campanha
curl -X POST http://localhost:3001/api/campanhas/1/iniciar

# Monitorar em tempo real (WebSocket)
const socket = io('http://localhost:3001');
socket.on('disparador:progresso', (dados) => {
  console.log(dados);
});
```

\*/

module.exports = {
instrucoes: "Veja os comentários acima para instruções de integração"
};
