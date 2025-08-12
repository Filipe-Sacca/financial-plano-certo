# Prompt Template para Criação de Serviços Integrados com n8n

## Contexto do Projeto
Você está trabalhando em um projeto de integração que combina:
- **n8n**: Plataforma de automação de workflows
- **Node.js/TypeScript**: Para serviços backend customizados
- **Python**: Para scripts e serviços complementares
- **APIs externas**: Integração com sistemas terceiros (ex: iFood, delivery platforms)

## Estrutura do Projeto
```
projeto/
├── ifood-token-service/          # Serviço Node.js principal
│   ├── src/
│   │   ├── server.ts             # Servidor Express
│   │   ├── ifoodTokenService.ts  # Serviço de autenticação
│   │   └── [novo_servico].ts     # Novo serviço a ser criado
│   └── package.json
├── python_services/              # Scripts Python auxiliares
│   └── [novo_servico].py
├── docs/                         # Documentação
│   └── [NOVO_SERVICO].md
└── n8n_workflows/               # Workflows exportados do n8n
    └── [novo_workflow].json
```

## Template de Prompt

### Para Criar um Novo Serviço Completo:

```
Preciso criar um serviço integrado para [NOME_DO_SERVIÇO] que será usado no n8n.

**Contexto:**
- Sistema: [Nome do sistema/API externa]
- Objetivo: [Descrever o que o serviço deve fazer]
- Autenticação: [OAuth2/API Key/Token/etc]
- Endpoints necessários: [Listar endpoints da API]

**Requisitos Técnicos:**
1. Criar um serviço Node.js/TypeScript em `ifood-token-service/src/[nomeServico].ts`
2. Implementar endpoints REST para uso no n8n:
   - GET /api/[recurso] - [descrição]
   - POST /api/[recurso] - [descrição]
   - [outros endpoints necessários]

3. Funcionalidades obrigatórias:
   - [ ] Gestão de autenticação/tokens
   - [ ] Tratamento de erros com mensagens claras
   - [ ] Logs detalhados para debugging
   - [ ] Respostas padronizadas em JSON
   - [ ] Headers CORS configurados
   - [ ] Retry automático em caso de falha
   - [ ] Cache quando aplicável

4. Criar script Python auxiliar em `python_services/[nome_servico].py` para:
   - [ ] Processamento de dados
   - [ ] Validações complexas
   - [ ] Integrações alternativas

5. Documentação em `docs/[NOME_SERVICO].md` contendo:
   - [ ] Descrição do serviço
   - [ ] Endpoints disponíveis
   - [ ] Exemplos de requisições/respostas
   - [ ] Configuração no n8n
   - [ ] Troubleshooting

**Integração com n8n:**
- O serviço deve expor endpoints HTTP que o n8n possa chamar
- Usar HTTP Request node no n8n
- Retornar dados estruturados para facilitar o mapeamento no n8n

**Exemplo de dados da API:**
[Colar aqui exemplo de request/response da API]

**Fluxo esperado:**
1. [Descrever passo a passo o fluxo]
2. [...]
```

### Para Adicionar Funcionalidade a Serviço Existente:

```
Preciso adicionar a funcionalidade de [NOME_DA_FUNCIONALIDADE] ao serviço existente.

**Arquivo atual:** `ifood-token-service/src/[arquivo].ts`

**Nova funcionalidade:**
- Endpoint: [GET/POST/PUT/DELETE] /api/[caminho]
- Objetivo: [O que deve fazer]
- Parâmetros esperados: [listar parâmetros]
- Resposta esperada: [formato da resposta]

**Integração com n8n:**
- Como será usado no workflow
- Dados de entrada/saída

**Validações necessárias:**
- [Listar validações]

**Tratamento de erros:**
- [Cenários de erro esperados]
```

## Padrões de Código a Seguir

### TypeScript/Node.js:
```typescript
// Estrutura padrão de endpoint
app.get('/api/[recurso]', async (req: Request, res: Response) => {
    try {
        // Validação de entrada
        // Lógica do serviço
        // Logging
        console.log(`[${new Date().toISOString()}] [SERVICO] Ação realizada`);
        
        // Resposta padronizada
        res.json({
            success: true,
            data: resultado,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] [SERVICO] Erro:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
```

### Python:
```python
import requests
import json
from datetime import datetime
from typing import Dict, Any, Optional

class NomeServico:
    def __init__(self, base_url: str, token: Optional[str] = None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        
    def metodo_principal(self, parametros: Dict[str, Any]) -> Dict[str, Any]:
        """Documentação do método"""
        try:
            # Implementação
            return {
                "success": True,
                "data": resultado,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
```

## Checklist de Implementação

- [ ] **Análise da API Externa**
  - [ ] Documentação revisada
  - [ ] Endpoints identificados
  - [ ] Autenticação testada
  - [ ] Rate limits conhecidos

- [ ] **Desenvolvimento do Serviço Node.js**
  - [ ] Estrutura base criada
  - [ ] Endpoints implementados
  - [ ] Autenticação funcionando
  - [ ] Tratamento de erros
  - [ ] Logs implementados
  - [ ] Testes manuais realizados

- [ ] **Script Python (se necessário)**
  - [ ] Classe principal criada
  - [ ] Métodos implementados
  - [ ] Integração testada

- [ ] **Integração com n8n**
  - [ ] Serviço acessível pelo n8n
  - [ ] Workflow de teste criado
  - [ ] Mapeamento de dados validado
  - [ ] Cenários de erro testados

- [ ] **Documentação**
  - [ ] README atualizado
  - [ ] Documentação técnica criada
  - [ ] Exemplos fornecidos
  - [ ] Troubleshooting documentado

## Exemplos de Uso no n8n

### HTTP Request Node - Configuração Padrão:
```json
{
  "method": "GET/POST",
  "url": "http://localhost:3001/api/[endpoint]",
  "authentication": "None",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      {
        "name": "campo",
        "value": "={{ $json.campo }}"
      }
    ]
  }
}
```

## Variáveis de Ambiente Necessárias

```env
# API Externa
API_BASE_URL=https://api.exemplo.com
API_CLIENT_ID=seu_client_id
API_CLIENT_SECRET=seu_client_secret

# Serviço Local
SERVICE_PORT=3001
SERVICE_HOST=localhost

# Configurações
ENABLE_CACHE=true
CACHE_TTL=3600
MAX_RETRIES=3
RETRY_DELAY=1000
```

## Comandos Úteis

```bash
# Desenvolvimento
cd ifood-token-service
npm install [dependências necessárias]
npm run dev

# Python
pip install requests python-dotenv
python python_services/[nome_servico].py

# n8n (Docker)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

## Notas Importantes

1. **Sempre manter compatibilidade com n8n**: Retornar JSON estruturado
2. **Logging detalhado**: Facilita debugging em produção
3. **Tratamento de erros robusto**: n8n precisa entender quando algo falha
4. **Documentação clara**: Outros desenvolvedores precisarão manter o código
5. **Testes em ambiente local**: Sempre testar integração completa antes de deploy

---

**Como usar este template:**
1. Copie o template apropriado (novo serviço ou adicionar funcionalidade)
2. Preencha todos os campos com informações específicas do seu caso
3. Adicione exemplos reais de dados da API
4. Especifique claramente o comportamento esperado
5. Use o checklist para garantir implementação completa