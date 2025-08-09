# 🧪 **Guia de Teste - Monitoramento Automático de Status**

## ✅ **Funcionalidades Implementadas**

### 🔧 **Backend (ifoodMerchantsService.ts)**
- ✅ `checkMerchantsStatus()` - Verificação de status
- ✅ `startAutomaticMonitoring()` - Iniciar monitoramento (5 min)
- ✅ `stopAutomaticMonitoring()` - Parar monitoramento  
- ✅ Sistema de callbacks para notificações
- ✅ Notificações do navegador
- ✅ Logs detalhados

### 🎨 **Frontend (useStatusMonitoring + IfoodApiConfig)**
- ✅ Hook React para gerenciar estado
- ✅ Interface com botões Iniciar/Parar
- ✅ Dashboard com métricas (Total, Disponíveis, Indisponíveis, Alterações)
- ✅ Botão de notificações do navegador
- ✅ Status individual por loja com indicadores
- ✅ Notificações toast em tempo real

---

## 🧪 **Roteiro de Testes**

### **Teste 1: Interface Básica**
1. ✅ **Acessar página com lojas sincronizadas**
2. ✅ **Verificar se aparece seção "Monitoramento Automático"**
3. ✅ **Verificar se há:**
   - Indicador de status (bolinha cinza = inativo)
   - Botão "Iniciar" (verde)
   - Botão "Verificar Agora"
   - Botão de notificações (sino)
   - Dashboard com 4 métricas zeradas

**📊 Resultado esperado:** Interface completa visível

---

### **Teste 2: Verificação Manual**
1. ✅ **Clicar em "Verificar Agora"**
2. ✅ **Verificar nos logs do console:**
   ```
   🔍 [STATUS CHECK] Verificando status de merchants...
   📊 [STATUS CHECK] Resumo: {total: X, available: Y, unavailable: Z}
   ```
3. ✅ **Verificar se métricas são atualizadas no dashboard**

**📊 Resultado esperado:** Dados carregados e exibidos

---

### **Teste 3: Monitoramento Automático**
1. ✅ **Clicar em "Iniciar"**
2. ✅ **Verificar:**
   - Bolinha fica verde e pisca
   - Badge "Ativo (5min)" aparece
   - Botão muda para "Parar" (vermelho)
3. ✅ **Verificar nos logs:**
   ```
   🚀 [AUTO MONITOR] Iniciando monitoramento automático a cada 5 minutos
   📊 [AUTO MONITOR] Primeira verificação concluída
   ```
4. ✅ **Aguardar 5 minutos e verificar execução automática:**
   ```
   🔄 [AUTO MONITOR] Executando verificação automática...
   ```

**📊 Resultado esperado:** Monitoramento rodando em background

---

### **Teste 4: Notificações do Navegador**
1. ✅ **Clicar no botão de notificações (sino)**
2. ✅ **Aceitar permissão do navegador**
3. ✅ **Verificar:**
   - Botão fica verde com sino preenchido
   - Texto "Ativadas"
   - Toast de confirmação

**📊 Resultado esperado:** Notificações ativadas

---

### **Teste 5: Parar Monitoramento**
1. ✅ **Clicar em "Parar"**
2. ✅ **Verificar:**
   - Bolinha fica cinza
   - Badge "Ativo" desaparece
   - Botão volta para "Iniciar"
3. ✅ **Verificar nos logs:**
   ```
   🛑 [AUTO MONITOR] Monitoramento automático parado
   ```

**📊 Resultado esperado:** Monitoramento parado

---

## 🔍 **Logs para Acompanhar**

### **Console do Navegador (F12)**
```bash
# Ao iniciar monitoramento:
🚀 [AUTO MONITOR] Iniciando monitoramento automático a cada 5 minutos
📊 [AUTO MONITOR] Primeira verificação concluída

# A cada 5 minutos:
🔄 [AUTO MONITOR] Executando verificação automática...
🔍 [STATUS CHECK] Verificando status de merchants...

# Se houver mudança de status:
🔔 [AUTO MONITOR] X lojas mudaram de status!
🔔 [NOTIFICATION] Loja Teste: DISPONÍVEL → INDISPONÍVEL
🔔 [NOTIFICATIONS] Enviando notificação
```

---

## 🎯 **Funcionalidades Específicas a Testar**

### **Dashboard de Métricas**
- ✅ **Total:** Número de lojas na tabela
- ✅ **Disponíveis:** Lojas com status = true
- ✅ **Indisponíveis:** Lojas com status = false  
- ✅ **Alterações:** Lojas que mudaram recentemente

### **Status Individual das Lojas**
- ✅ **Badge verde:** "Disponível" 
- ✅ **Badge vermelho:** "Indisponível"
- ✅ **Bolinha azul piscante:** Status mudou recentemente

### **Notificações**
- ✅ **Toast:** Aparecem na interface quando status muda
- ✅ **Browser:** Notificações do SO (se permitido)
- ✅ **Logs:** Console mostra todas as atividades

---

## ⚠️ **Possíveis Problemas e Soluções**

### **❌ Monitoramento não inicia**
- **Verificar:** Console de erros
- **Solução:** Verificar se usuário está logado

### **❌ Notificações não aparecem**
- **Verificar:** Permissão do navegador
- **Solução:** Clicar no botão de notificações

### **❌ Métricas não atualizam**
- **Verificar:** Se há lojas na tabela
- **Solução:** Sincronizar lojas primeiro

### **❌ Logs não aparecem**
- **Verificar:** Console do navegador (F12)
- **Solução:** Abrir DevTools

---

## 🎉 **Teste Completo**

Para confirmar que tudo funciona:

1. ✅ **Carregar lojas** (botão "Carregar Lojas")
2. ✅ **Ativar notificações** (botão sino)
3. ✅ **Iniciar monitoramento** (botão "Iniciar")
4. ✅ **Verificar dashboard** atualizado
5. ✅ **Aguardar 5 minutos** e verificar execução automática
6. ✅ **Verificar logs** no console
7. ✅ **Parar monitoramento** (botão "Parar")

**🎯 Se todos os passos funcionarem, o sistema está 100% operacional!**

---

## 📋 **Resumo das Implementações**

| **Funcionalidade** | **Status** | **Onde Testar** |
|-------------------|------------|------------------|
| Verificação manual | ✅ | Botão "Verificar Agora" |
| Monitoramento automático | ✅ | Botão "Iniciar/Parar" |
| Dashboard métricas | ✅ | 4 cards com números |
| Notificações toast | ✅ | Automático quando status muda |
| Notificações browser | ✅ | Botão sino + permissão |
| Status individual | ✅ | Badges nas lojas |
| Logs detalhados | ✅ | Console F12 |
| Interface responsiva | ✅ | Todos os componentes |

**🚀 Sistema de monitoramento completo e funcional!**