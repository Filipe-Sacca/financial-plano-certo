# Token Auto-Renewal System

## Visão Geral

O sistema de renovação automática de tokens do iFood foi implementado para garantir que os tokens de acesso sejam sempre válidos, funcionando de forma similar ao fluxo N8N anterior que executava a cada 2 horas.

## Como Funciona

### 1. Início Automático
Quando o servidor inicia, o scheduler de renovação de tokens é automaticamente ativado se a variável de ambiente `AUTO_START_TOKEN_SCHEDULER` estiver configurada como `true` (padrão).

### 2. Intervalo de Execução
- **Padrão**: 120 minutos (2 horas)
- **Configurável**: Via variável de ambiente `TOKEN_SCHEDULER_INTERVAL`
- O scheduler verifica todos os tokens a cada intervalo configurado

### 3. Processo de Renovação
O scheduler executa os seguintes passos:

1. **Busca todos os tokens** no banco de dados
2. **Verifica expiração**: Identifica tokens que:
   - Já expiraram
   - Vão expirar nos próximos 5 minutos
3. **Renova automaticamente** cada token expirado/expirando
4. **Registra o resultado** com estatísticas detalhadas

## Configuração

### Variáveis de Ambiente (.env)

```env
# Token Scheduler Configuration
AUTO_START_TOKEN_SCHEDULER=true  # true para iniciar automaticamente (padrão)
TOKEN_SCHEDULER_INTERVAL=120     # Intervalo em minutos (padrão: 120 = 2 horas)
```

### Aplicar Mudanças no Banco de Dados

Para adicionar o campo de timestamp de atualização (opcional):

```bash
psql -U seu_usuario -d seu_banco -f ifood-token-service/add_timestamps.sql
```

## Endpoints de Controle

### Iniciar Scheduler Manualmente
```bash
POST http://localhost:8081/token/scheduler/start
Content-Type: application/json

{
  "intervalMinutes": 120  # Opcional, padrão: 120
}
```

### Parar Scheduler
```bash
POST http://localhost:8081/token/scheduler/stop
```

### Verificar Status
```bash
GET http://localhost:8081/token/scheduler/status
```

Resposta:
```json
{
  "success": true,
  "scheduler": "Token Auto-Renewal",
  "running": true,
  "nextCheck": "2025-08-12T12:31:03.511Z"
}
```

### Atualizar Todos os Tokens Manualmente
```bash
POST http://localhost:8081/token/update-all-expired
```

## Logs e Monitoramento

O sistema gera logs detalhados:

```
🔄 ===================================
🕐 Token renewal check started at 2025-08-12T10:31:02.960Z
🔄 ===================================
✅ Token renewal check completed successfully
📊 Statistics:
   - Total tokens: 1
   - Expired tokens found: 1
   - Successfully updated: 1
   - Failed updates: 0
🔄 ===================================
🕐 Next check scheduled at 2025-08-12T12:31:03.511Z
🔄 ===================================
```

## Comparação com N8N

| Aspecto | N8N | Node.js Service |
|---------|-----|-----------------|
| Intervalo | 2 horas (fixo) | Configurável (padrão: 2 horas) |
| Início | Schedule Trigger | Automático ao iniciar servidor |
| Controle | Via N8N UI | Via API endpoints |
| Logs | N8N executions | Console + estruturado |
| Resiliência | Depende do N8N | Integrado no serviço |

## Vantagens da Nova Implementação

1. **Integração Nativa**: Parte do serviço principal, não depende de ferramentas externas
2. **Configurável**: Intervalo ajustável via variáveis de ambiente
3. **Controle via API**: Start/stop/status disponíveis como endpoints REST
4. **Logs Detalhados**: Informações completas sobre cada ciclo de renovação
5. **Compatibilidade**: Funciona mesmo sem o campo `token_updated_at` no BD
6. **Performance**: Atualiza apenas tokens expirados/expirando

## Troubleshooting

### Scheduler não inicia automaticamente
- Verifique se `AUTO_START_TOKEN_SCHEDULER=true` no arquivo `.env`
- Confirme se o servidor está rodando corretamente

### Tokens não estão sendo atualizados
- Verifique os logs do servidor para erros
- Confirme se as credenciais do iFood estão corretas no banco
- Use o endpoint `/token/scheduler/status` para verificar se está rodando

### Erro "token_updated_at column not found"
- Este é um aviso não crítico
- Execute o script SQL `add_timestamps.sql` para adicionar o campo
- O sistema funciona normalmente sem este campo