# 📅 CRONOGRAMA DE IMPLEMENTAÇÃO - PLANO CERTO HUB INSIGHTS

**Data de Criação:** 15 de Janeiro de 2025  
**Projeto:** Dashboard Analytics para Restaurantes  
**Cliente:** Integração completa com iFood APIs  

---

## 🎯 RESUMO EXECUTIVO DO PROJETO

### Status Atual da Implementação:
- ⚠️ **33.3% Concluído** - Authentication API + Merchant API funcionais
- 🚨 **66.7% Pendente** - Financial API (0% CONECTADA) + 3 módulos completos de negócio

### Módulos do Cliente:
1. **MÓDULO 1:** Integração iFood + Coleta de Dados *(70% implementado)*
2. **MÓDULO 2:** Diagnóstico com IA *(20% implementado)*
3. **MÓDULO 3:** Otimização de Cardápio com IA *(25% implementado)*
4. **MÓDULO 4:** Automação de Cobrança e Relatórios *(40% implementado)*

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

### 💰 Financial API V3 - ❌ NÃO CONECTADA (0%)
> **🚨 BLOQUEADOR CRÍTICO:** 80% do valor do sistema depende desta API

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
- `/oauth/token` - Autenticação OAuth2
- `/financial/v2.1/merchants/{merchantId}/sales`
- `/financial/v2/merchants/{merchantId}/salesAdjustments`
- `/financial/v2/merchants/{merchantId}/occurrences`
- `/financial/v2/merchants/{merchantId}/chargeCancellations`

---

### 🎁 Promotion API - ❌ NÃO IMPLEMENTADO
> **Prioridade:** SEGUNDA APÓS FINANCIAL API

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

**Tipos Suportados:**
- PERCENTAGE, FIXED, FIXED_PRICE, LXPY

---

## 🚀 CRONOGRAMA DETALHADO DE EXECUÇÃO

### 📍 SPRINT 0: PREPARAÇÃO INTENSIVA (3 dias)
> **Objetivo:** Preparar terreno para Financial API

#### Dia 1: Diagnóstico e Credenciais
**Prioridade:** 🔴 CRÍTICA
```bash
# Tarefas específicas
□ Audit completo - verificar ausência de conexão Financial API
□ Obter credenciais iFood (client_id, client_secret)
□ Configurar ambiente OAuth2 completo
□ Documentar todos os endpoints necessários
□ Setup Postman/Insomnia para testes
```

#### Dia 2: Arquitetura e Estrutura
```bash
□ Análise arquitetura para Financial API do zero
□ Mapeamento fluxo autenticação iFood
□ Estrutura de banco para tokens OAuth
□ Setup Redis para cache de tokens
□ Criar projeto de testes E2E
```

#### Dia 3: Alinhamento e Kick-off
```bash
□ Alinhamento emergencial sobre Financial API
□ Redefinir prazos considerando implementação completa
□ Preparar infraestrutura para alta disponibilidade
□ Kick-off focado em conexão Financial API
```

---

### 📍 FASE 1: MVP PROMOCIONAL (Semanas 1-4)
> **Objetivo:** Dashboard funcional com promoções ativas em 4 semanas

#### Semana 1: Financial API - Conexão Completa
**Prioridade:** 🔴 BLOQUEADOR CRÍTICO
```bash
# Segunda - OAuth2 Setup
□ Configurar OAuth2 iFood completo:
  - Client Credentials Flow
  - Authorization Code Flow
  - Refresh Token automation
□ Criar ifoodAuthService.ts
□ Implementar token management
□ Validar conexão sandbox/produção

# Terça-Quarta - Implementação Core
□ Criar ifoodFinancialService.ts do zero
□ Implementar endpoints críticos:
  - POST /oauth/token (autenticação)
  - GET /financial/v2.1/merchants/{merchantId}/sales
  - GET /financial/v2/merchants/{merchantId}/salesAdjustments
  - GET /financial/v2/merchants/{merchantId}/occurrences
□ Criar tabela ifood_financial_detailed
□ Sistema de retry e error handling

# Quinta - Processamento
□ Processamento batch com validação
□ Sistema de cache Redis
□ Testes de integração completos
□ Validação dados vs painel iFood

# Sexta - Dashboard
□ Dashboard com primeiros KPIs reais
□ Monitoramento de conexão
□ Deploy staging com logs
□ Documentação de integração
```

**Entregável Semana 1:** Financial API conectada e coletando dados reais

#### Semana 2: Promotion API Core
```bash
# Segunda-Terça - Services
□ Criar ifoodPromotionService.ts
□ Endpoints essenciais:
  - POST /merchants/{merchantId}/promotions
  - GET /merchants/{merchantId}/promotions
  - PATCH /merchants/{merchantId}/promotions/{id}
□ Tabela promotions com triggers

# Quarta-Quinta - Hooks e Validação
□ usePromotions.ts + usePromotionAnalysis.ts
□ Validação tipos: PERCENTAGE, FIXED, FIXED_PRICE, LXPY
□ Sistema de aprovação/rejeição

# Sexta - Testes
□ Testes integração
□ Monitoramento status real-time
□ Alertas automáticos
```

**Entregável Semana 2:** Promotion API funcionando com tipos básicos

#### Semana 3: Interface Promocional
```bash
# Segunda-Quarta - Components
□ PromotionManager.tsx - Wizard de criação
  - Seleção de produtos
  - Configuração de regras
  - Preview de impacto
□ CampaignDashboard.tsx - Visão executiva
  - Métricas em tempo real
  - Comparação campanhas
  - Tendências

# Quinta-Sexta - Analytics
□ PromotionAnalysis.tsx - Analytics
  - ROI por campanha
  - Análise de conversão
  - Sugestões automáticas
□ Integração Financial API
```

**Entregável Semana 3:** Interface completa de promoções

#### Semana 4: Validação e Otimização
```bash
# Segunda-Terça - Testes
□ Testes com cliente piloto
□ Ajustes baseados em feedback
□ Otimização queries (< 200ms)

# Quarta-Quinta - Features
□ A/B testing framework
□ Sistema de templates promocionais
□ Documentação usuário

# Sexta - Deploy
□ Deploy produção
□ Treinamento cliente
□ Go-live monitorado
```

**Entregável Fase 1:** MVP completo com Financial + Promotion APIs funcionais

---

### 📍 FASE 2: TEMPO REAL & CATÁLOGO (Semanas 5-12)
> **Objetivo:** Sistema real-time e catálogo sincronizado

#### Semana 5-8: Webhook Infrastructure
```bash
□ Webhook endpoint com rate limiting
□ Validação assinatura X-IFood
□ Queue processing (Bull/BullMQ)
□ WebSocket server
□ Eventos: PROMOTION_STATUS, FINANCIAL_SETTLEMENT, CATALOG_UPDATED
□ Push notifications (FCM/OneSignal)
```

#### Semana 5-10: Catálogo Avançado
```bash
□ Sincronização completa produtos
□ Gestão categorias hierárquicas
□ Variações e complementos
□ Preços por canal
□ Correlação vendas x produtos
□ Elasticidade preço
□ Mix ideal por período
□ Sugestões automáticas
```

#### Semana 9-12: IA Diagnóstico Básico
```bash
□ OpenAI/Claude API setup
□ Embeddings produtos/vendas
□ Base conhecimento Plano Certo
□ Score automático (0-100)
□ Top 5 oportunidades
□ Plano ação básico
□ Validação consultores
```

**Entregável Fase 2:** Sistema real-time + Catálogo + IA v1

---

### 📍 FASE 3: IA AVANÇADA - MÓDULOS 2 & 3 (Semanas 13-24)
> **Objetivo:** Inteligência artificial completa

#### Semana 13-16: IA Promocional
```bash
□ Previsão demanda com ML
□ Otimização automática descontos
□ Segmentação cliente avançada
□ Campanhas personalizadas
□ ROI prediction
```

#### Semana 17-20: IA Cardápio
```bash
□ Geração descrições com GPT-4
□ Otimização imagens (AI upscale)
□ Precificação dinâmica
□ Bundle suggestions
□ Menu engineering automático
```

#### Semana 21-24: IA Diagnóstico Completo
```bash
□ Análise preditiva completa
□ Benchmarking inteligente
□ Roadmap personalizado
□ Simulações what-if
□ Coaching virtual
```

**Entregável Fase 3:** MÓDULOS 2 e 3 - IA completa funcionando

---

### 📍 FASE 4: AUTOMAÇÃO COBRANÇA - MÓDULO 4 (Semanas 25-32)
> **Objetivo:** Automação completa de processos

#### Semana 25-28: Automação Cobrança
```bash
□ WhatsApp Business API
□ Gateway pagamento (Stripe/Pagarme)
□ ERP/Contabilidade
□ Workflow automation
□ Cobrança automática
□ Lembretes inteligentes
□ Gestão inadimplência
□ Relatórios fiscais
```

#### Semana 29-32: WhatsApp Assistant
```bash
□ Consulta métricas via chat
□ Alertas proativos
□ Suporte 24/7
□ Agendamento reuniões
□ Aprovação promoções
```

**Entregável Fase 4:** MÓDULO 4 - Sistema completo de automação

---

## 📈 MARCOS E VALIDAÇÃO

### 🎯 Marco 1 - Semana 4: "MVP FUNCIONAL"
**Critério de Aceitação:**
- ✅ Financial API conectada e coletando dados
- ✅ Promotion API criando campanhas
- ✅ Dashboard com dados reais
- ✅ ROI mensurável

### 🎯 Marco 2 - Semana 12: "TEMPO REAL"
**Critério de Aceitação:**  
- ✅ Webhooks recebendo eventos < 5s latência
- ✅ Catálogo 100% sincronizado
- ✅ IA diagnóstico v1 funcional
- ✅ Status conectividade 99.9%

### 🎯 Marco 3 - Semana 24: "IA COMPLETA"
**Critério de Aceitação:**
- ✅ Diagnósticos automáticos > 80% precisão
- ✅ Otimização cardápio com resultados
- ✅ Promoções com IA funcionando
- ✅ Base conhecimento integrada

### 🎯 Marco 4 - Semana 32: "SISTEMA COMPLETO"
**Critério de Aceitação:**
- ✅ Automação cobrança funcionando
- ✅ WhatsApp bot operacional
- ✅ Todos módulos integrados
- ✅ Performance > 99.5% uptime

---

## ⚠️ RISCOS E DEPENDÊNCIAS CRÍTICAS

### 🚨 Riscos Altos
1. **Financial API não conectada** - CERTEZA/CRÍTICO - Sem alternativa
2. **OAuth2 iFood complexo** - Alta probabilidade - Suporte técnico necessário
3. **Rate Limits iFood** - 10 req/s limite - Cache + Queue obrigatório
4. **Volume de Dados** - Milhares transações/dia - Particionamento necessário

### 🔗 Dependências Críticas
- **Financial API bloqueia todo o sistema** - Prioridade absoluta
- **Promotion API depende de Financial** - Para métricas ROI
- **IA depende de dados históricos** - Mínimo 30 dias
- **WhatsApp precisa aprovação Meta** - 2-4 semanas processo

---

## 💰 ESTIMATIVA DE IMPACTO FINANCEIRO

### Valor Gerado por Fase:
- **Fase 1:** 70% do valor (MVP funcional)
- **Fase 2:** 20% do valor (real-time + catálogo)  
- **Fase 3:** 8% do valor (IA completa)
- **Fase 4:** 2% do valor (automação)

### ROI Esperado:
- **Fase 1 (4 semanas):** Investimento R$ 40k → Retorno R$ 120k (3x)
- **Fase 2 (8 semanas):** Investimento R$ 60k → Retorno R$ 150k (2.5x)
- **Fase 3 (12 semanas):** Investimento R$ 80k → Retorno R$ 240k (3x)
- **Fase 4 (8 semanas):** Investimento R$ 40k → Retorno R$ 160k (4x)

### Economia de Tempo:
- **Relatórios:** 60h/mês → 2h/mês
- **Promoções:** 20h/campanha → 1h/campanha
- **Diagnóstico:** 40h/cliente → 2h/cliente
- **Cobrança:** 30h/mês → 1h/mês

---

## 📞 PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana (15-17/01):
1. **DIA 1:** Obter credenciais iFood + Setup OAuth2
2. **DIA 2:** Arquitetura Financial API + Estrutura banco
3. **DIA 3:** Kick-off emergencial + Início implementação

### Próxima Semana (20-24/01):
1. **SEGUNDA:** Implementar OAuth2 completo
2. **TERÇA-QUARTA:** Financial Service do zero
3. **QUINTA:** Testes integração
4. **SEXTA:** Dashboard com primeiros dados reais

---

**🎯 FOCO ABSOLUTO:** Financial API é o bloqueador crítico. Sem ela, nada funciona.

**📊 PROGRESSO:** Acompanhamento diário via dashboard + reuniões 2x/semana.

**⏱️ PRAZO TOTAL:** 32 semanas (8 meses) - Conclusão em Setembro 2025.

---

*Documento atualizado em 15/01/2025 - Baseado na análise dos cronogramas existentes*