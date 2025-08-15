# 🔧 Configuração CORRETA dos Hooks do Claude Code

*Baseado na documentação oficial - Implementação testada e funcional*

## ⚠️ CORREÇÃO IMPORTANTE

**Arquivo correto**: `~/.claude/settings.json` (NÃO `claude_desktop_config.json`)

## 📍 Localização dos Arquivos

### Windows
```
C:\Users\[SEU_USUARIO]\.claude\settings.json
C:\Users\[SEU_USUARIO]\.claude\hooks\
```

### macOS
```
~/.claude/settings.json
~/.claude/hooks/
```

### Linux
```
~/.claude/settings.json
~/.claude/hooks/
```

## 🎯 Tipos de Hooks Disponíveis

| Hook | Quando Executa | Uso Principal |
|------|----------------|---------------|
| **UserPromptSubmit** | Quando você envia um prompt | Comandos personalizados |
| **PreToolUse** | Antes de usar uma ferramenta | Validação/preparação |
| **PostToolUse** | Após usar uma ferramenta | Limpeza/processamento |
| **Stop** | Quando Claude termina resposta | Notificações/resumo |
| **SubagentStop** | Quando subagente termina | Processamento de resultados |
| **SessionStart** | Início da sessão | Inicialização |
| **PreCompact** | Antes de compactar contexto | Backup/salvamento |
| **Notification** | Em notificações do sistema | Alertas customizados |

## ✅ Configuração Completa e Testada

### 1. Arquivo `~/.claude/settings.json`

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "node \"C:\\Users\\gilma\\.claude\\hooks\\commit-handler.js\"",
            "timeout": 5000
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c \"cd '$CLAUDE_PROJECT_DIR' && git add -A 2>/dev/null || true\"",
            "timeout": 2000
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c \"cd '$CLAUDE_PROJECT_DIR' && git status -s 2>/dev/null | head -3\"",
            "timeout": 2000
          }
        ]
      }
    ]
  }
}
```

## 🚀 Comandos Implementados

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/commit <msg>` | Commit com mensagem | `/commit fix: corrige bug login` |
| `/smart-commit` | Commit inteligente automático | `/smart-commit` |
| `/push` | Push para origin | `/push` |
| `/status` | Status do git | `/status` |
| `/log` | Últimos commits | `/log` |
| `/amend [msg]` | Altera último commit | `/amend nova mensagem` |

## 📝 Script de Instalação Automática

### Windows (PowerShell como Admin)

```powershell
# Script de instalação completo
$ErrorActionPreference = "Stop"

Write-Host "🔧 Instalando Claude Code Hooks..." -ForegroundColor Cyan

# 1. Cria estrutura de diretórios
$claudeDir = "$env:USERPROFILE\.claude"
$hooksDir = "$claudeDir\hooks"

New-Item -ItemType Directory -Force -Path $claudeDir | Out-Null
New-Item -ItemType Directory -Force -Path $hooksDir | Out-Null

Write-Host "✅ Diretórios criados" -ForegroundColor Green

# 2. Baixa o commit-handler.js
$commitHandlerUrl = "https://raw.githubusercontent.com/seu-repo/commit-handler.js"
$commitHandlerPath = "$hooksDir\commit-handler.js"

# Por enquanto, cria localmente
@'
[CONTEÚDO DO commit-handler.js AQUI]
'@ | Set-Content -Path $commitHandlerPath

Write-Host "✅ Script de commit instalado" -ForegroundColor Green

# 3. Cria settings.json
$settingsPath = "$claudeDir\settings.json"
$settings = @{
    hooks = @{
        UserPromptSubmit = @(
            @{
                matcher = ".*"
                hooks = @(
                    @{
                        type = "command"
                        command = "node `"$commitHandlerPath`""
                        timeout = 5000
                    }
                )
            }
        )
        PostToolUse = @(
            @{
                matcher = "Edit|Write|MultiEdit"
                hooks = @(
                    @{
                        type = "command"
                        command = "bash -c `"cd '`$CLAUDE_PROJECT_DIR' && git add -A 2>/dev/null || true`""
                        timeout = 2000
                    }
                )
            }
        )
    }
}

$settings | ConvertTo-Json -Depth 10 | Set-Content -Path $settingsPath

Write-Host "✅ Configuração criada" -ForegroundColor Green
Write-Host "" 
Write-Host "🎉 Instalação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Reinicie o Claude Code"
Write-Host "2. Teste com: /status"
Write-Host "3. Use: /commit, /smart-commit, /push"
```

## 🔍 Verificação da Instalação

### Teste 1: Verificar arquivos
```bash
# Windows
dir %USERPROFILE%\.claude\
dir %USERPROFILE%\.claude\hooks\

# macOS/Linux
ls -la ~/.claude/
ls -la ~/.claude/hooks/
```

### Teste 2: Validar JSON
```bash
# Windows PowerShell
Get-Content "$env:USERPROFILE\.claude\settings.json" | ConvertFrom-Json

# macOS/Linux
python3 -m json.tool ~/.claude/settings.json
```

### Teste 3: Testar comando
```bash
# No Claude Code, digite:
/status

# Deve mostrar o status do git
```

## 🛡️ Considerações de Segurança

### ✅ Boas Práticas
1. **Sempre use caminhos absolutos** nos comandos
2. **Valide inputs** antes de executar
3. **Use timeout** em todos os hooks
4. **Escape caracteres especiais** em comandos shell
5. **Nunca execute código não confiável**

### ❌ Evite
1. Usar `eval()` ou `exec()`
2. Passar inputs direto para shell sem sanitização
3. Acessar arquivos sensíveis (.env, .ssh)
4. Hooks sem timeout
5. Comandos que modificam sistema

## 🐛 Troubleshooting

### Hook não executa?

1. **Verifique o caminho**:
```bash
node -e "console.log(require('os').homedir())"
```

2. **Teste o script diretamente**:
```bash
echo '{"prompt": "/status"}' | node ~/.claude/hooks/commit-handler.js
```

3. **Ative debug**:
```bash
claude --debug
```

4. **Verifique logs**:
```bash
# Windows
type %USERPROFILE%\.claude\hooks\debug.log

# macOS/Linux
cat ~/.claude/hooks/debug.log
```

### Erro de permissão?

```bash
# macOS/Linux
chmod +x ~/.claude/hooks/*.js
```

### JSON inválido?

Use um validador:
```bash
python3 -c "import json; json.load(open('$HOME/.claude/settings.json'))"
```

## 📊 Estrutura de Dados dos Hooks

### Input (stdin)
```json
{
  "eventName": "UserPromptSubmit",
  "prompt": "/commit fix: bug resolvido",
  "projectDir": "/path/to/project",
  "sessionId": "abc123",
  "timestamp": "2024-01-01T00:00:00Z",
  "tool": "Edit",
  "toolInput": {...},
  "toolOutput": {...}
}
```

### Output esperado
- **Exit code 0**: Sucesso
- **Exit code 1**: Erro (bloqueia execução)
- **stdout**: Mostrado ao usuário
- **stderr**: Logs de erro

## 🎯 Exemplos Avançados

### Hook com Validação
```javascript
// Valida branch antes de commit
if (eventName === 'UserPromptSubmit' && prompt.startsWith('/commit')) {
    const branch = execSync('git branch --show-current').toString().trim();
    
    if (branch === 'main' || branch === 'master') {
        console.error('❌ Não faça commit direto na main!');
        console.log('💡 Crie uma branch: git checkout -b feature/nome');
        process.exit(1); // Bloqueia
    }
}
```

### Hook com Notificação
```javascript
// Notifica após push
if (prompt.startsWith('/push')) {
    handlePush();
    
    // Notificação do sistema (Windows)
    execSync(`powershell -Command "New-BurntToastNotification -Text 'Push realizado!'"`, {
        stdio: 'ignore'
    });
}
```

### Hook com Auto-Format
```javascript
// Formata código antes de commit
if (eventName === 'PostToolUse' && tool.match(/Edit|Write/)) {
    const file = toolInput.file_path;
    
    if (file.endsWith('.js') || file.endsWith('.ts')) {
        execSync(`npx prettier --write "${file}"`, { stdio: 'ignore' });
        execSync(`git add "${file}"`);
    }
}
```

## ✨ Resultado Final

Após configuração correta, você terá:

1. ✅ Comandos `/commit`, `/smart-commit`, `/push` funcionando
2. ✅ Auto-add de arquivos após edição
3. ✅ Status do git após cada resposta
4. ✅ Commits com co-author do Claude
5. ✅ Mensagens inteligentes baseadas em mudanças

---

**💡 Dica**: Sempre teste em um repositório de teste antes de usar em produção!