# iFood Review API - Documentação Técnica Completa

## 📋 Visão Geral

**Base URL**: `https://merchant-api.ifood.com.br/review/v1.0`

**Autenticação**:
```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json (para POST requests)
```

**Rate Limits**: 10 requests por segundo por token (HTTP 429 quando excedido)

---

## 🔗 Endpoints Completos

### 1. Listar Reviews

**Método**: `GET`  
**URL**: `/merchants/{merchantId}/reviews`  
**Descrição**: Recupera uma lista filtrada de reviews

#### Path Parameters
| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `merchantId` | string (path) | ✅ | Merchant's UUID |

#### Query Parameters
| Nome | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `page` | number (query) | `1` | Número da página |
| `pageSize` | number (query) | `10` | Quantidade de reviews por página |
| `addCount` | boolean (query) | `false` | Incluir contadores na resposta |
| `dateFrom` | string (query) | - | Data inicial (ISO 8601: `2021-04-05T08:30:00Z`) |
| `dateTo` | string (query) | - | Data final (ISO 8601: `2021-04-05T09:30:00Z`) |
| `sort` | string (query) | `DESC` | Ordem: `ASC` ou `DESC` |
| `sortBy` | string (query) | `CREATED_AT` | Campo: `ORDER_DATE` ou `CREATED_AT` |

#### Exemplo de Request
```bash
curl --location --request GET 'https://merchant-api.ifood.com.br/review/v1.0/merchants/6b487a27-c4fc-4f26-b05e-3967c2331882/reviews?page=1&pageSize=20&addCount=true&dateFrom=2021-04-05T08:30:00Z&dateTo=2021-04-05T09:30:00Z&sort=DESC&sortBy=CREATED_AT' \
--header 'Authorization: Bearer TOKEN'
```

#### Response Structure
```json
{
  "page": 1,
  "size": 3,
  "total": 3,
  "pageCount": 1,
  "reviews": [
    {
      "id": "a26c8718-b1f5-44a0-8f06-ecc71ddfcd5a",
      "comment": "Muito bom, adorei!",
      "createdAt": "2021-04-07T01:46:59.722169Z",
      "discarded": false,
      "moderated": false,
      "published": false,
      "order": {
        "id": "bbec78f9-d579-414b-9120-37fda7968824",
        "shortId": "1234",
        "createdAt": "2021-04-07T00:39:30.902486Z"
      },
      "score": 5.0,
      "surveyId": "2c35c485-9f23-464d-bd83-cf6ecd1c71e0"
    }
  ]
}
```

---

### 2. Obter Detalhes do Review

**Método**: `GET`  
**URL**: `/merchants/{merchantId}/reviews/{reviewId}`  
**Descrição**: Recupera review por seu ID e merchant ID

#### Path Parameters
| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `merchantId` | string (path) | ✅ | Merchant's UUID (obrigatório - marcado com *) |
| `reviewId` | string (path) | ✅ | Review's UUID (obrigatório - marcado com *) |

**Observação**: Este endpoint possui apenas path parameters, sem query parameters adicionais.

#### Exemplo de Request
```bash
curl --location --request GET 'https://merchant-api.ifood.com.br/review/v1.0/merchants/6b487a27-c4fc-4f26-b05e-3967c2331882/reviews/a26c8718-b1f5-44a0-8f06-ecc71ddfcd5a' \
--header 'Authorization: Bearer TOKEN'
```

#### Response Structure
```json
{
  "id": "a26c8718-b1f5-44a0-8f06-ecc71ddfcd5a",
  "comment": "Muito bom, adorei!",
  "createdAt": "2021-04-07T01:46:59.722169Z",
  "discarded": false,
  "moderated": false,
  "published": false,
  "order": {
    "id": "bbec78f9-d579-414b-9120-37fda7968824",
    "shortId": "1234",
    "createdAt": "2021-04-07T00:39:30.902486Z"
  },
  "score": 5.0,
  "surveyId": "2c35c485-9f23-464d-bd83-cf6ecd1c71e0",
  "questionnaire": {
    "questions": [
      {
        "id": "a1cdf161-62b9-4ccf-ad91-8e9898655e39",
        "type": "BINARY",
        "title": "Você gostou da entrega?"
      },
      {
        "id": "8e075d05-d1e3-49f4-b2b5-f11c58428852",
        "type": "CHOICE",
        "title": "Do que você gostou?",
        "answers": [
          {
            "id": "c05f04f8-4af4-42c7-bf57-6bc3392d1d4e",
            "title": "Bem temperada"
          },
          {
            "id": "6d579be3-68b8-454f-9a5f-f7b3aaed1a0f",
            "title": "Temperatura certa"
          }
        ]
      }
    ]
  }
}
```

---

### 3. Responder a um Review

**Método**: `POST`  
**URL**: `/merchants/{merchantId}/reviews/{reviewId}/answers`  
**Descrição**: Cria uma resposta para um review específico ("Post a review reply")

#### Path Parameters
| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `merchantId` | string (path) | ✅ | Merchant's UUID (obrigatório - marcado com *) |
| `reviewId` | string (path) | ✅ | Review's UUID (obrigatório - marcado com *) |

#### Request Body
**Content-Type**: `application/json`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `text` | string | ✅ | Texto da resposta do merchant |

**Estrutura JSON:**
```json
{
  "text": "string"
}
```

**Exemplo:**
```json
{
  "text": "Obrigado por seu feedback!"
}
```

#### Exemplo de Request
```bash
curl --location --request POST 'https://merchant-api.ifood.com.br/review/v1.0/merchants/6b487a27-c4fc-4f26-b05e-3967c2331882/reviews/a26c8718-b1f5-44a0-8f06-ecc71ddfcd5a/answers' \
--header 'Authorization: Bearer TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "text": "Obrigado por seu feedback!"
}'
```

#### Response Structure
```json
{
  "text": "Obrigado por seu feedback!",
  "createdAt": "2021-04-08T15:04:30.902322Z",
  "reviewId": "a26c8718-b1f5-44a0-8f06-ecc71ddfcd5a"
}
```

---

### 4. Obter Resumo de Reviews

**Método**: `GET`  
**URL**: `/merchants/{merchantId}/summary`  
**Descrição**: Recupera resumo estatístico dos reviews do merchant ("Get a summary")

#### Path Parameters
| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `merchantId` | string (path) | ✅ | Merchant's UUID (obrigatório - marcado com *) |

**Observação**: Este endpoint possui apenas 1 path parameter, sem query parameters adicionais.

#### Exemplo de Request
```bash
curl --location --request GET 'https://merchant-api.ifood.com.br/review/v1.0/merchants/6b487a27-c4fc-4f26-b05e-3967c2331882/summary' \
--header 'Authorization: Bearer TOKEN'
```

#### Response Structure
```json
{
  "totalReviewsCount": 138,
  "validReviewsCount": 65,
  "score": 4.4
}
```

---

## 📊 Tipos de Dados e Validações

### Review Object
```typescript
interface Review {
  id: string;                    // UUID
  comment?: string;              // Comentário do cliente
  createdAt: string;            // ISO 8601 timestamp
  discarded: boolean;           // Review descartado
  moderated: boolean;           // Moderação solicitada
  published: boolean;           // Visível para consumidores
  order: {
    id: string;                 // UUID do pedido
    shortId: string;            // ID curto do pedido
    createdAt: string;          // ISO 8601 timestamp
  };
  score: number;                // Rating 1.0-5.0
  surveyId: string;             // UUID do questionário
  questionnaire?: {             // Apenas em detalhes
    questions: Question[];
  };
}
```

### Question Types
```typescript
interface Question {
  id: string;                   // UUID
  type: 'BINARY' | 'CHOICE';    // Tipo da pergunta
  title: string;                // Texto da pergunta
  answers?: Answer[];           // Para tipo CHOICE
}

interface Answer {
  id: string;                   // UUID
  title: string;                // Texto da resposta
}
```

### Query Parameters Interface
```typescript
interface ReviewQueryParams {
  page?: number;                // Default: 1
  pageSize?: number;            // Default: 10
  addCount?: boolean;           // Default: false
  dateFrom?: string;            // ISO 8601
  dateTo?: string;              // ISO 8601
  sort?: 'ASC' | 'DESC';        // Default: DESC
  sortBy?: 'ORDER_DATE' | 'CREATED_AT'; // Default: CREATED_AT
}
```

---

## 🚨 Códigos de Status HTTP

### Sucesso
- `200 OK` - Request bem-sucedido com dados retornados
- `201 Created` - Resposta ao review criada com sucesso

### Erros do Cliente
- `400 Bad Request` - Parâmetros ou body inválidos
- `401 Unauthorized` - Token inválido ou expirado
- `403 Forbidden` - Acesso negado ao recurso do merchant
- `404 Not Found` - Merchant ou review não encontrado
- `429 Too Many Requests` - Rate limit excedido (10 req/sec)

### Erros do Servidor
- `500 Internal Server Error` - Erro de processamento do servidor
- `503 Service Unavailable` - Serviço temporariamente indisponível

---

## 📋 Regras de Negócio

### Validade dos Reviews
- Reviews são válidos por **3 meses** após criação
- Reviews podem levar até **24 horas** para ficarem visíveis (retorna D-1)
- Comentários ativam período de **7 dias** para contestação/moderação

### Restrições de Conta
- Requer registro com **CNPJ** (não aceita contas CPF)
- Cálculos de resumo não disponíveis para restaurantes de teste

### Políticas de Conteúdo
- Reviews com conteúdo inapropriado não são publicados
- Sistema de moderação para conteúdo questionável

---

## 🔧 Implementação

### Headers Obrigatórios
```http
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json  # Para POST requests
```

### Rate Limits
- **10 requests por segundo** por token
- Implementar retry com exponential backoff
- Monitorar response headers para status do rate limit

### Estratégia de Erro
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
```

---

## 📈 Analytics e Métricas

### KPIs Principais
- **Score médio**: Média das avaliações (1.0-5.0)
- **Total de reviews**: Quantidade total de avaliações
- **Reviews válidos**: Quantidade de avaliações visíveis
- **Taxa de resposta**: Percentual de reviews respondidos
- **Tempo médio de resposta**: Tempo para responder reviews

### Distribuição de Ratings
- Contagem por rating (1-5 estrelas)
- Tendências temporais
- Comparação com períodos anteriores

---

*Documentação criada em: $(date)*
*Versão da API: v1.0*