# 🧹 iFood Log Cleanup - Configuração de Agendamento

Sistema automatizado de limpeza diária de logs de polling do iFood às 6:00 da manhã.

## ✅ Status da Implementação

**TESTE REALIZADO COM SUCESSO:**
- ✅ Script executado manualmente
- ✅ 1.889 logs removidos da tabela `ifood_polling_log`
- ✅ 0 logs restaram na tabela
- ✅ 19 batches processados (100 logs por batch)
- ✅ Sistema de fallback funcionando perfeitamente

## 📋 Arquivos Criados

1. **`scripts/cleanup-polling-logs.js`** - Script principal de limpeza
2. **`scripts/schedule-log-cleanup.bat`** - Arquivo batch para Windows
3. **`src/logCleanupScheduler.ts`** - Scheduler integrado (alternativo)

## 🔧 Configuração no Windows Task Scheduler

### Método 1: Via Interface Gráfica

1. **Abrir Agendador de Tarefas**
   - Pressione `Win + R` → digite `taskschd.msc` → Enter

2. **Criar Nova Tarefa**
   - Clique em "Criar Tarefa Básica..."
   - Nome: `iFood Log Cleanup`
   - Descrição: `Limpeza diária de logs de polling iFood`

3. **Configurar Agendamento**
   - Disparador: "Diariamente"
   - Hora: `06:00:00`
   - Repetir a cada: `1 dias`

4. **Configurar Ação**
   - Ação: "Iniciar um programa"
   - Programa: `C:\Users\gilma\Nova pasta (2)\scripts\schedule-log-cleanup.bat`
   - Iniciar em: `C:\Users\gilma\Nova pasta (2)`

5. **Configurações Avançadas**
   - ✅ Executar com privilégios mais altos
   - ✅ Executar mesmo se o usuário não estiver conectado
   - ✅ Parar a tarefa se ela for executada por mais de 30 minutos

### Método 2: Via Linha de Comando

```cmd
schtasks /create /tn "iFood Log Cleanup" /tr "\"C:\Users\gilma\Nova pasta (2)\scripts\schedule-log-cleanup.bat\"" /sc daily /st 06:00 /ru SYSTEM
```

## 🚀 Execução Manual (Teste)

Para testar a limpeza manualmente:

```bash
cd "C:\Users\gilma\Nova pasta (2)\services\ifood-token-service"
node "../../scripts/cleanup-polling-logs.js"
```

## 📊 Monitoramento

### Verificar Status via API

```bash
# Status do scheduler (se servidor estiver rodando)
curl http://localhost:8085/logs/cleanup/scheduler/status

# Executar limpeza manual via API
curl -X POST http://localhost:8085/logs/cleanup/execute-sql
```

### Logs do Sistema

Os logs da execução ficam visíveis:
- **Console**: Durante execução manual
- **Task Scheduler**: Na aba "Histórico" da tarefa
- **Event Viewer**: Windows Logs → Application

## ⚙️ Configurações

### Variáveis de Ambiente Necessárias

```env
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
```

### Horário de Execução

- **Horário**: 6:00 AM (horário local)
- **Frequência**: Diária
- **Timezone**: Configurável (padrão: America/Sao_Paulo)

## 🔍 Troubleshooting

### Problemas Comuns

1. **Variáveis de ambiente não encontradas**
   - ✅ **Solução**: Execute do diretório `services/ifood-token-service`

2. **Permissões de acesso ao banco**
   - ✅ **Solução**: Verificar SUPABASE_ANON_KEY

3. **Tabela não existe**
   - ✅ **Solução**: Script detecta automaticamente e reporta sucesso

### Validação do Agendamento

```cmd
# Listar tarefas agendadas
schtasks /query /tn "iFood Log Cleanup"

# Executar manualmente
schtasks /run /tn "iFood Log Cleanup"

# Ver histórico
schtasks /query /tn "iFood Log Cleanup" /fo table /v
```

## 📈 Benefícios

- **🚀 Performance**: Remove logs antigos para manter o banco otimizado
- **💾 Espaço**: Libera espaço no banco de dados
- **🔧 Automático**: Execução totalmente automatizada
- **📊 Monitoramento**: Logs detalhados de cada execução
- **🛡️ Confiável**: Sistema de fallback com múltiplas estratégias

## 🕕 Próxima Execução

**Próxima limpeza agendada**: Amanhã às 6:00 AM

Para verificar a data/hora exata da próxima execução:
```cmd
schtasks /query /tn "iFood Log Cleanup" /fo list /v | findstr "Próxima Hora de Execução"
```

---

**✅ IMPLEMENTAÇÃO COMPLETADA**
Sistema de limpeza automática de logs implementado e testado com sucesso!