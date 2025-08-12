# 📅 CRONOGRAMA DE IMPLEMENTAÇÃO - PLANO CERTO HUB INSIGHTS

**Data de Criação:** 11 de Agosto de 2025  
**Projeto:** Dashboard Analytics para Restaurantes  
**Cliente:** Integração completa com iFood APIs  

---

## 🎯 RESUMO EXECUTIVO DO PROJETO

### Status Atual da Implementação:
- ✅ **20% Concluído** - Authentication API + Merchant API funcionais
- ❌ **80% Pendente** - Financial API (crítica) + 3 módulos completos de negócio

### Módulos do Cliente:
1. **MÓDULO 1:** Integração iFood + Coleta de Dados *(20% implementado)*
2. **MÓDULO 2:** Diagnóstico com IA *(0% implementado)*
3. **MÓDULO 3:** Otimização de Cardápio com IA *(0% implementado)*
4. **MÓDULO 4:** Automação de Cobrança e Relatórios *(0% implementado)*

---

## 📊 MAPEAMENTO COMPLETO: IMPLEMENTADO vs PENDENTE

### 🟢 JÁ IMPLEMENTADO (Base Funcional)

#### 🔐 Authentication API - ✅ COMPLETO
**Arquivos Implementados:**
- `hooks/useIfoodConfig.ts` - Gerenciamento de tokens
- `services/ifoodAuthService.ts` - Autenticação OAuth2
- `IfoodApiConfig.tsx` - Interface de configuração
- Tabela `ifood_tokens` - Persistência de tokens

**Funcionalidades Ativas:**
- ✅ Client Credentials Flow
- ✅ Authorization Code Flow  
- ✅ Auto-renovação de tokens
- ✅ Validação de expiração
- ✅ Interface de configuração de credenciais

---

#### 🏪 Merchant API - ✅ COMPLETO
**Arquivos Implementados:**
- `hooks/useIfoodMerchants.ts` - Gerenciamento de merchants
- `services/ifoodMerchantsService.ts` - Coleta de dados
- `IntegrationStatusCard.tsx` - Status da integração
- Tabela `ifood_merchants` - Dados dos restaurantes

**Funcionalidades Ativas:**
- ✅ Lista de restaurantes por usuário
- ✅ Status operacional em tempo real
- ✅ Dados completos (endereço, contato, horários)
- ✅ Sistema multi-tenant
- ✅ Deduplicação automática
- ✅ Polling de atualização (30s)

---

#### 💻 Dashboard Básico - ✅ PARCIAL
**Componentes Funcionais:**
- ✅ `Dashboard.tsx` - Interface principal (dados fictícios)
- ✅ `ReportsModule.tsx` - Relatórios PDF (dados fictícios)
- ✅ `Header.tsx` - Navegação e filtros
- ✅ Tabela `financial_metrics` - Estrutura base
- ✅ Tabela `clients` - Gestão de clientes

**Limitações Atuais:**
- ❌ KPIs usam dados fictícios/estáticos
- ❌ Gráficos não refletem dados reais
- ❌ Relatórios não têm dados do iFood

---

## 🔴 PENDENTE DE IMPLEMENTAÇÃO (Crítico para o Negócio)

### 💰 Financial API V3 - ❌ NÃO IMPLEMENTADO
> **🚨 CRÍTICO:** 80% do valor do sistema depende desta API

**Arquivos a Criar:**
```
services/
├── ifoodFinancialService.ts        # Coleta dados financeiros
├── ifoodProcessor.ts               # Processamento específico iFood
└── financialDataProcessor.ts       # Processamento genérico

hooks/
├── useFinancialData.ts            # Dados detalhados por pedido
├── useRevenueAnalysis.ts          # Análise de receita
└── useFinancialSummary.ts         # Resumos financeiros

components/
├── FinancialDashboard.tsx         # Dashboard financeiro real
├── RevenueChart.tsx               # Gráfico de receita (dados reais)
└── CostAnalysis.tsx               # Análise de custos detalhada
```

**Tabelas a Criar:**
- `ifood_financial_detailed` - Dados detalhados por pedido
- `cost_breakdown` - Análise de custos por componente
- `revenue_trends` - Tendências de receita

**Endpoints a Implementar:**
- `/financial/v2.1/merchants/{merchantId}/sales`
- `/financial/v2/merchants/{merchantId}/salesAdjustments`
- `/financial/v2/merchants/{merchantId}/occurrences`
- `/financial/v2/merchants/{merchantId}/chargeCancellations`
- `/financial/v2/merchants/{merchantId}/maintenanceFees`

---

### 📖 Catalog API V2 - ❌ BÁSICO APENAS
> **Estado:** Tabela `products` existe mas incompleta

**Arquivos a Criar/Expandir:**
```
services/
├── ifoodCatalogService.ts         # Gestão completa de catálogo
├── productAnalysisService.ts      # Análise de performance
└── menuOptimizationService.ts     # Otimização de cardápio

hooks/
├── useCatalogManagement.ts        # Gestão de produtos
├── useProductPerformance.ts       # Performance de produtos  
└── useMenuOptimization.ts         # Sugestões de otimização

components/
├── MenuManagement.tsx             # Gestão completa do cardápio
├── ProductAnalysis.tsx            # Análise por produto
├── MenuOptimization.tsx           # Otimizações sugeridas
└── ProductEditor.tsx              # Editor de produtos
```

**Funcionalidades Faltantes:**
- ❌ Gestão completa de categorias
- ❌ Complementos e opcionais
- ❌ Produtos com variações (pizzas)
- ❌ Análise de performance por produto
- ❌ Sincronização completa com iFood

---

### 🎁 Promotion API - ❌ NÃO IMPLEMENTADO

**Arquivos a Criar:**
```
services/
├── ifoodPromotionService.ts       # Gestão de promoções
└── promotionAnalysisService.ts    # Análise de campanhas

hooks/
├── usePromotions.ts               # Gestão de promoções
└── usePromotionAnalysis.ts        # Análise de performance

components/
├── PromotionManager.tsx           # Criador de promoções
├── CampaignDashboard.tsx          # Dashboard de campanhas
└── PromotionAnalysis.tsx          # Análise de ROI
```

**Tabela a Criar:**
- `promotions` - Campanhas promocionais e métricas

---

### 🔔 Webhook API - ❌ NÃO IMPLEMENTADO

**Arquivos a Criar:**
```
api/
└── webhooks/
    └── ifood.ts                   # Endpoint webhook

services/
├── webhookProcessor.ts            # Processamento de eventos
└── realtimeNotifications.ts       # Notificações em tempo real

components/
├── RealtimeStatus.tsx             # Status em tempo real
└── NotificationCenter.tsx         # Centro de notificações
```

**Tabela a Criar:**
- `webhook_events` - Log de eventos recebidos

---

## 🚀 CRONOGRAMA DETALHADO DE EXECUÇÃO

### 📍 FASE 1: FUNDAÇÃO CRÍTICA (Semanas 1-8)
> **Objetivo:** Tornar o dashboard funcional com dados reais

#### Semana 1-2: Financial API - Estrutura Base
**Prioridade:** 🔴 CRÍTICA
```bash
# Tarefas específicas
□ Criar ifoodFinancialService.ts
□ Implementar endpoint /financial/v2.1/merchants/{merchantId}/sales
□ Criar tabela ifood_financial_detailed
□ Configurar estrutura de upsert por (client_id, date, order_number)
□ Testes básicos de coleta de dados
```

#### Semana 3-4: Processamento e Agregação
```bash
□ Implementar ifoodProcessor.ts para dados específicos
□ Sistema de processamento diário às 18h
□ Validação de integridade de dados financeiros
□ Hook useFinancialData.ts para dados detalhados
□ Testes de volume com dados históricos
```

#### Semana 5-6: Dashboard com Dados Reais
```bash
□ Substituir dados fictícios em Dashboard.tsx
□ Implementar KPIs reais:
  - Receita bruta vs líquida
  - Comissões iFood detalhadas  
  - Ticket médio real
  - Taxa de conversão
□ RevenueChart.tsx com dados reais
□ Validação vs painel oficial iFood
```

#### Semana 7-8: Otimização e Validação
```bash
□ Sistema de cache para consultas pesadas
□ Alertas para discrepâncias financeiras
□ Relatórios PDF com dados reais
□ Testes de performance
□ Documentação técnica
```

**Entregável Fase 1:** Dashboard funcional com dados financeiros reais do iFood

---

### 📍 FASE 2: TEMPO REAL (Semanas 9-13)
> **Objetivo:** Eliminar polling e implementar notificações em tempo real

#### Semana 9-10: Infraestrutura Webhook
```bash
□ Criar endpoint /api/webhooks/ifood
□ Implementar validação X-IFood-Signature
□ Tabela webhook_events para auditoria
□ Sistema de retry para falhas de processamento
□ Testes de segurança e validação
```

#### Semana 11-12: Processamento de Eventos
```bash
□ Evento MERCHANT_STATUS_CHANGED
□ Evento FINANCIAL_SETTLEMENT  
□ Evento CATALOG_UPDATED
□ WebSocket para notificações no dashboard
□ Sistema de notificações push
```

#### Semana 13: Integração Dashboard
```bash
□ Atualizações automáticas de KPIs
□ Status de conectividade em tempo real
□ Centro de notificações no header
□ Testes de estabilidade
```

**Entregável Fase 2:** Dashboard com atualizações em tempo real

---

### 📍 FASE 3: CATÁLOGO COMPLETO (Semanas 14-20)
> **Objetivo:** Gestão completa do cardápio e análise de produtos

#### Semana 14-15: Catalog API V2 Completa
```bash
□ Implementar todos endpoints Catalog V2
□ Expansão da tabela products com campos completos
□ Sistema de sincronização completa
□ Gestão de categorias hierárquicas
```

#### Semana 16-17: Funcionalidades Avançadas  
```bash
□ Gestão de complementos (complement_groups)
□ Produtos com variações (pizzas, bebidas)
□ Controle de disponibilidade por horário
□ Preços diferenciados por catálogo/canal
```

#### Semana 18-19: Análise de Performance
```bash
□ Correlação vendas x produtos (via Financial API)
□ Cálculo de margem de lucro por item
□ Ranking produtos mais/menos vendidos
□ Análise de sazonalidade
□ Sugestões de otimização automáticas
```

#### Semana 20: Interface de Gestão
```bash
□ MenuManagement.tsx - Gestão visual
□ ProductAnalysis.tsx - Análise detalhada
□ MenuOptimization.tsx - Sugestões IA
□ Sincronização automática com iFood
```

**Entregável Fase 3:** Sistema completo de gestão e análise de cardápio

---

### 📍 FASE 4: PROMOÇÕES (Semanas 21-25)
> **Objetivo:** Sistema completo de campanhas promocionais

#### Semana 21-22: Promotion API
```bash
□ Implementar endpoints de promoções
□ Tabela promotions com métricas
□ Tipos: FIXED, PERCENTAGE, FIXED_PRICE, LXPY
□ Sistema de validação (máximo 70% desconto)
```

#### Semana 23-24: Gestão e Análise
```bash
□ PromotionManager.tsx - Criador visual
□ Monitoramento de status em tempo real
□ Análise de ROI por campanha
□ A/B testing de promoções
```

#### Semana 25: Dashboard Promocional
```bash
□ CampaignDashboard.tsx - Visão geral
□ Relatórios de impacto promocional
□ Integração com análise de produtos
```

**Entregável Fase 4:** Sistema completo de promoções e campanhas

---

### 📍 FASE 5: IA DIAGNÓSTICO - MÓDULO 2 (Semanas 26-37)
> **Objetivo:** Diagnóstico automático com IA especializada

#### Semana 26-28: Base de Conhecimento IA
```bash
□ Integração OpenAI/Claude API
□ Base de conhecimento metodologia Plano Certo
□ Benchmarks setoriais por categoria de restaurante
□ Sistema de prompt engineering especializado
```

#### Semana 29-31: Algoritmos de Análise
```bash
□ Análise automática de padrões financeiros
□ Identificação de oportunidades (baixa conversão, produtos parados)
□ Sistema de score de performance (0-100)
□ Comparação automática com benchmarks
```

#### Semana 32-35: Interface e Relatórios IA
```bash
□ DiagnosticDashboard.tsx - Análise automática
□ Geração de relatórios PDF com IA
□ Recomendações personalizadas por restaurante
□ Sistema de acompanhamento de melhorias
```

#### Semana 36-37: Validação e Refinamento
```bash
□ Validação de diagnósticos com consultores Plano Certo
□ Ajuste fino dos modelos de IA
□ Testes A/B com diferentes abordagens
□ Sistema de feedback para melhoria contínua
```

**Entregável Fase 5:** MÓDULO 2 - Sistema de diagnóstico automático funcionando

---

### 📍 FASE 6: IA OTIMIZAÇÃO CARDÁPIO - MÓDULO 3 (Semanas 26-36)
> **Execução paralela com Fase 5**

#### Semana 26-28: IA para Conteúdo
```bash
□ Sistema de geração de descrições de produtos
□ Otimização automática de imagens (upscale, crop)
□ Sugestões de preços baseadas em dados de mercado
□ Análise de tendências gastronômicas
```

#### Semana 29-31: Análise Avançada
```bash
□ Correlação vendas x qualidade descrição/imagem
□ A/B testing automático de variações de cardápio
□ Sugestões de reorganização de menu (ordem, categorias)
□ Análise preditiva de sazonalidade
```

#### Semana 32-35: Interface de Otimização
```bash
□ MenuAIOptimizer.tsx - Editor inteligente
□ Preview de impacto das mudanças sugeridas
□ Sistema de aprovação de sugestões
□ Monitoramento pós-implementação
```

#### Semana 36: Integração Final
```bash
□ Sincronização automática com iFood após aprovação
□ Dashboard de performance pós-otimização
□ Sistema de aprendizado contínuo
```

**Entregável Fase 6:** MÓDULO 3 - Otimização automática de cardápio com IA

---

### 📍 FASE 7: AUTOMAÇÃO COBRANÇA - MÓDULO 4 (Semanas 33-40)
> **Execução paralela, independente das outras fases**

#### Semana 33-35: Integrações Externas
```bash
□ WhatsApp Business API (Meta ou Twilio)
□ Sistema de email automatizado (Resend/SendGrid)
□ Gateway de pagamento (Stripe/PagSeguro/MercadoPago)
□ Sistema de geração de faturas (PDF automático)
```

#### Semana 36-38: Automação de Processos
```bash
□ BillingAutomation.tsx - Gestão de cobrança
□ Geração automática baseada em dados Financial API
□ Envio programado via WhatsApp (lembretes, 2ª via)
□ Relatórios automáticos por email para clientes
□ Sistema de controle de inadimplência
```

#### Semana 39-40: Dashboard de Cobrança
```bash
□ BillingDashboard.tsx - Gestão financeira interna
□ Controle de pagamentos por cliente
□ Métricas de cobrança e inadimplência
□ Sistema de alertas de pagamento em atraso
□ Integração com contabilidade
```

**Entregável Fase 7:** MÓDULO 4 - Sistema completo de automação de cobrança

---

## 📈 MARCOS E VALIDAÇÃO

### 🎯 Marco 1 - Semana 8: "DASHBOARD FUNCIONAL"
**Critério de Aceitação:**
- ✅ KPIs do dashboard mostram dados reais do iFood
- ✅ Relatórios PDF contêm dados financeiros verdadeiros
- ✅ Gráficos refletem performance real dos restaurantes
- ✅ Conciliação financeira > 99.9% de precisão

### 🎯 Marco 2 - Semana 13: "TEMPO REAL"
**Critério de Aceitação:**  
- ✅ Webhooks recebendo eventos iFood com < 5s latência
- ✅ Dashboard atualiza automaticamente sem refresh
- ✅ Notificações push funcionando
- ✅ Status de conectividade 99.9% uptime

### 🎯 Marco 3 - Semana 25: "GESTÃO COMPLETA"
**Critério de Aceitação:**
- ✅ Cardápio totalmente sincronizado com iFood
- ✅ Promoções criadas e monitoradas em tempo real
- ✅ Análise de performance por produto funcionando
- ✅ Sugestões de otimização baseadas em dados

### 🎯 Marco 4 - Semana 37: "IA FUNCIONANDO"
**Critério de Aceitação:**
- ✅ Diagnósticos automáticos com > 80% precisão
- ✅ Otimizações de cardápio gerando resultados mensuráveis
- ✅ Relatórios inteligentes aprovados por consultores
- ✅ Base de conhecimento Plano Certo integrada

### 🎯 Marco 5 - Semana 40: "SISTEMA COMPLETO"
**Critério de Aceitação:**
- ✅ Automação de cobrança funcionando fim-a-fim
- ✅ Todos os 4 módulos do cliente integrados
- ✅ Performance geral do sistema > 99.5% uptime
- ✅ Sistema validado e pronto para produção

---

## ⚠️ RISCOS E DEPENDÊNCIAS CRÍTICAS

### 🚨 Riscos Altos
1. **Financial API Rate Limits** - iFood tem limite de 10 req/s
2. **Volume de Dados** - Restaurantes grandes podem gerar milhares de transações/dia
3. **Qualidade da IA** - Diagnósticos precisam validação de especialistas
4. **Integrações Externas** - WhatsApp/Email APIs podem mudar

### 🔗 Dependências Críticas
- **Fase 5 e 6 dependem completamente da Fase 1** (Financial API)
- **Módulo 3 precisa das Fases 3 e 4** (Catalog + Promotion)
- **Validação da IA precisa de consultores Plano Certo disponíveis**
- **Módulo 4 precisa de aprovação de integrações de pagamento**

---

## 💰 ESTIMATIVA DE IMPACTO FINANCEIRO

### Valor Gerado por Fase:
- **Fase 1:** 60% do valor (dashboard funcional)
- **Fase 2:** 15% do valor (experiência em tempo real)  
- **Fase 3-4:** 15% do valor (gestão completa)
- **Fase 5-7:** 10% do valor (automação e IA)

### ROI Esperado por Módulo:
- **Módulo 1:** Economia de 80% tempo em relatórios manuais
- **Módulo 2:** Aumento médio de 15% em receita via otimizações
- **Módulo 3:** Melhoria de 25% em conversão de cardápio
- **Módulo 4:** Redução de 90% tempo em cobrança manual

---

## 📞 PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana (Semana 1):
1. **INICIAR FASE 1 IMEDIATAMENTE** - Criar ifoodFinancialService.ts
2. **Configurar ambiente de desenvolvimento** para Financial API
3. **Validar credenciais iFood** em ambiente de sandbox
4. **Definir estrutura da tabela** ifood_financial_detailed

### Semana Seguinte (Semana 2):
1. **Implementar primeiro endpoint** /financial/v2.1/sales
2. **Testes com dados reais** de restaurante piloto
3. **Configurar sistema de processamento** diário
4. **Validar integridade** dos dados coletados

---

**🎯 FOCO ABSOLUTO:** Sem a Financial API, 80% do sistema não funciona. Esta é a prioridade #1 absoluta.

**📊 PROGRESSO:** Acompanhar semanalmente via este documento + reuniões de status.

**⏱️ PRAZO TOTAL:** 40 semanas (~10 meses) para sistema completo e todos os módulos do cliente funcionais.

---

*Documento criado em 11/01/2025 - Baseado na documentação técnica completa do projeto*