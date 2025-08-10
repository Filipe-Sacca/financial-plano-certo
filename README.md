# 📊 Plano Certo Hub Insights - Analytics Platform

## 📁 Estrutura do Projeto

```
📂 Plano Certo Hub Insights/
├── 📂 plano-certo-hub-insights/     # 🎯 Aplicação principal (React/TypeScript)
│   ├── src/                         # Código fonte da aplicação
│   ├── components/                  # Componentes React
│   ├── hooks/                       # Custom hooks
│   ├── pages/                       # Páginas da aplicação
│   └── utils/                       # Utilitários e processadores
│
├── 📂 backend/                      # 🖥️ Arquivos de servidor e configuração
│   ├── server.js                    # Servidor Express principal
│   ├── test-server.js               # Servidor de testes
│   ├── test-supabase.js            # Testes de conexão Supabase
│   ├── package.json                # Dependências do backend
│   ├── package-lock.json           # Lock das dependências
│   └── .env                        # Variáveis de ambiente
│
├── 📂 scripts/                      # 🛠️ Scripts de desenvolvimento e debug
│   ├── check-*.js                  # Scripts de verificação
│   ├── create-*.js                 # Scripts de criação de dados
│   ├── debug-data.js               # Debug de dados
│   ├── db-tools.js                 # Ferramentas de banco
│   └── fix-*.js                    # Scripts de correção
│
├── 📂 docs/                         # 📚 Documentação do projeto
│   └── CLAUDE.md                   # Instruções para Claude
│
├── 📂 exports/                      # 📄 Arquivos gerados (PDFs, relatórios)
│
└── 📂 supabase/                     # 🗄️ Configurações do Supabase
    ├── config.toml                 # Configuração do Supabase
    └── migrations/                 # Migrações do banco
```

## 🚀 Como usar

### 1. Aplicação Principal
```bash
cd plano-certo-hub-insights
npm install
npm run dev
```

### 2. Backend/Servidor
```bash
cd backend
npm install
node server.js
```

### 3. Scripts de Desenvolvimento
```bash
cd scripts
node check-clients.js    # Verificar clientes
node create-client.js    # Criar cliente teste
node debug-data.js       # Debug de dados
```

## 📋 Descrição das Pastas

- **`plano-certo-hub-insights/`** - Aplicação React principal com dashboard
- **`backend/`** - Servidor Express, configurações e testes
- **`scripts/`** - Ferramentas de desenvolvimento e debug do banco
- **`docs/`** - Documentação técnica e instruções
- **`exports/`** - PDFs e relatórios gerados
- **`supabase/`** - Configurações e migrações do banco

## 🔧 Status do Projeto

- ✅ **Interface** - Dashboard funcional com componentes
- ✅ **Autenticação** - Sistema de login implementado
- ✅ **Merchant API** - Integração com restaurantes do iFood
- ⚠️ **Financial API** - Em desenvolvimento (dados ficticos)
- ❌ **Catalog API** - A implementar
- ❌ **Promotion API** - A implementar
- ❌ **Webhook API** - A implementar

## 📞 Suporte

Para dúvidas sobre a estrutura ou desenvolvimento, consulte a documentação em `docs/`.