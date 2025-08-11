# Documentação Detalhada dos Módulos iFood API

## Visão Geral

A API do iFood é estruturada em módulos especializados que permitem a integração completa com a plataforma para gerenciamento de estabelecimentos e pedidos. Esta documentação detalha os cinco módulos principais e seus propósitos dentro do aplicativo Plano Certo Hub Insights.

---

## 1. Módulo Authentication

### Propósito no Aplicativo
O módulo de autenticação é fundamental para o funcionamento de todos os outros módulos no Plano Certo Hub Insights. Ele garante o acesso seguro às APIs do iFood através da geração e gerenciamento de tokens de acesso.

### Dados Disponíveis
- **Access Token**: Token JWT com validade limitada para autenticação
- **Refresh Token**: Token para renovação automática do acesso
- **Expires In**: Tempo de validade do token em segundos
- **Token Type**: Tipo do token (Bearer)
- **Scope**: Permissões associadas ao token

### Endpoints Principais
- `POST /authentication/token` - Geração inicial de token
- `POST /authentication/refresh` - Renovação do token
- `POST /authentication/revoke` - Revogação do token

### Funcionalidades no App
- **Autenticação Automática**: Sistema de renovação automática de tokens
- **Gerenciamento de Sessão**: Controle de expiração e renovação
- **Multi-tenant**: Suporte a múltiplos estabelecimentos
- **Auditoria de Acesso**: Log de tentativas de autenticação

### Dados Técnicos
- **Tamanho Máximo do Token**: 8.000 caracteres
- **Protocolo**: HTTPS obrigatório com TLS 1.2+
- **Rate Limit**: Limitações por período de tempo

---

## 2. Módulo Merchant

### Propósito no Aplicativo
O módulo Merchant é essencial para o gerenciamento de estabelecimentos no Plano Certo Hub Insights, fornecendo informações detalhadas sobre lojas, status operacionais e controle de funcionamento.

### Dados Disponíveis
- **Store Details**: Nome, endereço, dados de contato
- **Operating Hours**: Horários de funcionamento por dia da semana
- **Store Status**: Aberto, fechado, em manutenção
- **Delivery Area**: Área de cobertura para entregas
- **Store Configuration**: Configurações específicas do estabelecimento
- **Interruptions**: Fechamentos temporários programados

### Endpoints Principais
```
GET /merchants - Lista todos os estabelecimentos
GET /merchants/{merchantId} - Detalhes de um estabelecimento
GET /merchants/{merchantId}/status - Status operacional
GET /merchants/{merchantId}/opening-hours - Horários de funcionamento
POST /merchants/{merchantId}/interruptions - Criar interrupção temporária
GET /merchants/{merchantId}/interruptions - Listar interrupções
DELETE /merchants/{merchantId}/interruptions/{id} - Remover interrupção
```

### Funcionalidades no App
- **Dashboard de Status**: Monitoramento em tempo real do status das lojas
- **Controle de Horários**: Gestão inteligente de horários de funcionamento
- **Alertas Operacionais**: Notificações sobre mudanças de status
- **Gestão de Interrupções**: Controle de fechamentos temporários
- **Relatórios de Disponibilidade**: Análise de uptime das lojas

### Casos de Uso
- Monitoramento 24/7 do status das lojas
- Planejamento de manutenções programadas
- Análise de padrões de funcionamento
- Otimização de horários operacionais

---

## 3. Módulo Catalog

### Propósito no Aplicativo
O módulo Catalog é o coração do gerenciamento de produtos no Plano Certo Hub Insights, permitindo controle completo sobre cardápios, preços, estoque e disponibilidade de itens.

### Dados Disponíveis
- **Products**: Informações completas dos produtos
- **Categories**: Organização hierárquica do cardápio
- **Pricing**: Preços base e promocionais
- **Stock/Inventory**: Controle de estoque em tempo real
- **Availability**: Status de disponibilidade por item
- **Options/Complements**: Adicionais e complementos
- **Nutritional Info**: Informações nutricionais (quando disponível)

### Endpoints Principais
```
# Gestão de Catálogos
GET /merchants/{merchantId}/catalogs
GET /merchants/{merchantId}/catalogs/{catalogId}/categories

# Gestão de Produtos
POST /merchants/{merchantId}/categories/{categoryId}/products/{productId}
PUT /merchants/{merchantId}/items - Criação/edição completa de itens
GET /merchants/{merchantId}/catalogs/{groupId}/sellableItems

# Gestão de Preços
PATCH /merchants/{merchantId}/items/price
PATCH /merchants/{merchantId}/options/price
PATCH /merchants/{merchantId}/products/price

# Gestão de Status
PATCH /merchants/{merchantId}/items/status
PATCH /merchants/{merchantId}/options/status
```

### Funcionalidades no App
- **Gestão Inteligente de Cardápio**: Interface intuitiva para edição de produtos
- **Controle de Preços Dinâmico**: Ajustes automáticos e manuais de preços
- **Monitoramento de Estoque**: Alertas de baixo estoque
- **Análise de Performance**: Produtos mais vendidos e margem de lucro
- **Sincronização Multi-plataforma**: iFood Marketplace, iFood Shop, White Label
- **Otimização de Cardápio**: Sugestões baseadas em dados de venda

### Casos de Uso
- Atualização em massa de preços
- Controle de sazonalidade de produtos
- Análise de margem por categoria
- Otimização de mix de produtos

---

## 4. Módulo Financial

### Propósito no Aplicativo
O módulo Financial é crucial para a conciliação financeira e análise de receitas no Plano Certo Hub Insights, proporcionando transparência completa sobre faturamento e recebimentos.

### Dados Disponíveis
- **Sales Data**: Informações detalhadas de vendas
- **Settlement Records**: Registros de liquidação
- **Payment Information**: Dados de transferências do iFood
- **Transaction Details**: Detalhes de cada transação
- **Adjustments**: Ajustes e correções financeiras
- **Fees**: Taxas cobradas pelo iFood
- **Benefits**: Benefícios e promoções aplicadas
- **Tax Information**: Dados para cálculo de impostos

### Endpoints Principais (v2.1)
```
# Dados de Vendas
/financial/v2.1/merchants/{merchantId}/sales
/financial/v2/merchants/{merchantId}/salesAdjustments

# Cancelamentos e Ajustes
/financial/v2/merchants/{merchantId}/cancellations
/financial/v2/merchants/{merchantId}/chargeCancellations
/financial/v2/merchants/{merchantId}/occurrences

# Taxas e Benefícios
/financial/v2/merchants/{merchantId}/maintenanceFees
/financial/v2/merchants/{merchantId}/salesBenefits
/financial/v2/merchants/{merchantId}/adjustmentsBenefits

# Resumos e Pagamentos
/financial/v2/merchants/{merchantId}/period
/financial/v2/merchants/{merchantId}/receivableRecords
/financial/v2/merchants/{merchantId}/payments
/financial/v2/merchants/{merchantId}/incomeTaxes
```

### Funcionalidades no App
- **Dashboard Financeiro**: Visão consolidada de receitas e custos
- **Conciliação Automática**: Matching automático de transações
- **Relatórios Detalhados**: Análises por período, produto, canal
- **Previsão de Recebimentos**: Cronograma de pagamentos (D+30, etc.)
- **Análise de Margem**: Cálculo de lucratividade líquida
- **Controle Fiscal**: Preparação de dados para contabilidade
- **Alertas Financeiros**: Notificações sobre discrepâncias

### Dados Técnicos Importantes
- **Atualização**: Diária às 18h (exceto API de pagamentos)
- **Fechamento Semanal**: Segunda a domingo
- **Processamento**: Calculado na segunda-feira seguinte
- **Transferência**: Conforme plano contratado (ex: D+30)

### Casos de Uso
- Conciliação bancária automatizada
- Análise de lucratividade por canal
- Projeção de fluxo de caixa
- Auditoria de comissões e taxas

---

## 5. Módulo Promotion

### Propósito no Aplicativo
O módulo Promotion permite o gerenciamento estratégico de promoções e descontos no Plano Certo Hub Insights, otimizando vendas através de mecânicas promocionais avançadas.

### Dados Disponíveis
- **Promotion Details**: Informações da promoção (nome, descrição, período)
- **Discount Mechanics**: Tipo de desconto e valores
- **Product Targeting**: Produtos incluídos na promoção
- **Usage Analytics**: Métricas de uso das promoções
- **Revenue Impact**: Impacto nas vendas e margem

### Tipos de Promoções Suportadas
1. **FIXED**: Desconto fixo em valor
2. **PERCENTAGE**: Desconto percentual
3. **FIXED_PRICE**: Preço fixo promocional
4. **LXPY (Leve X Pague Y)**: Mecânica "leve X pague Y"
5. **ATACAREJO**: Desconto por quantidade (atacado)
6. **PERCENTAGE_PER_X_UNITS**: Percentual a cada X unidades

### Endpoints Principais
```
POST /merchants/{merchantId}/promotions - Criar promoção
GET /merchants/{merchantId}/promotions - Listar promoções
PUT /merchants/{merchantId}/promotions/{promotionId} - Atualizar promoção
DELETE /merchants/{merchantId}/promotions/{promotionId} - Remover promoção
```

### Funcionalidades no App
- **Criador de Promoções**: Interface visual para criação de campanhas
- **Análise de Performance**: ROI de cada promoção
- **A/B Testing**: Comparação de diferentes estratégias
- **Agendamento Inteligente**: Programação automática de promoções
- **Segmentação**: Promoções por região, horário, perfil de cliente
- **Alertas de Margem**: Controle para não ultrapassar 70% de desconto

### Limitações e Validações
- **Desconto Máximo**: 70% sobre o preço de catálogo
- **Prevenção de Fraude**: Validações automáticas de desconto
- **Período de Validade**: Promoções ativas durante período especificado
- **Acesso Restrito**: Módulo exclusivo para parceiros marketplace

### Casos de Uso
- Campanhas de Black Friday automatizadas
- Promoções de horário específico
- Liquidação de estoque sazonal
- Incentivo a compras maiores (atacado)

---

## Integração no Plano Certo Hub Insights

### Arquitetura de Dados
Todos os módulos se integram de forma sinérgica no aplicativo:

1. **Authentication** → Base para todos os demais módulos
2. **Merchant** → Contexto operacional para análises
3. **Catalog** → Base de produtos para relatórios
4. **Financial** → Dados de receita e lucratividade
5. **Promotion** → Impacto das estratégias de marketing

### Fluxo de Dados
```
Authentication → Merchant Data → Catalog Sync → Financial Analysis → Promotion Optimization
```

### Benefícios da Integração Completa
- **Visão 360°**: Dashboard unificado de performance
- **Análise Preditiva**: Machine learning baseado em dados históricos
- **Automação Inteligente**: Ajustes automáticos baseados em métricas
- **Compliance**: Auditoria completa de operações
- **Otimização Contínua**: Sugestões baseadas em dados reais

---

## Considerações Técnicas

### Performance
- **Cache Inteligente**: Redução de chamadas API desnecessárias
- **Processamento Assíncrono**: Operações em background
- **Rate Limiting**: Controle automático de limites de API

### Segurança
- **Tokens Seguros**: Renovação automática e criptografia
- **Logs de Auditoria**: Rastreamento completo de operações
- **Validação de Dados**: Sanitização de inputs

### Escalabilidade
- **Multi-tenant**: Suporte a múltiplos estabelecimentos
- **Load Balancing**: Distribuição inteligente de carga
- **Backup e Recovery**: Proteção de dados críticos

---

## Cronograma de Atualizações

### APIs Descontinuadas
- **Financial v2.0 e v2.1**: Descontinuação em 17/06/2025
- **Catalog v1**: Migração recomendada para v2

### Novas Funcionalidades
- **Financial v3**: APIs de eventos financeiros granulares
- **Catalog v2**: Unificação de catálogos multi-serviços
- **Enhanced Promotion**: Mecânicas promocionais avançadas

Esta documentação serve como base para o desenvolvimento e manutenção das funcionalidades do Plano Certo Hub Insights relacionadas à integração com a API do iFood.