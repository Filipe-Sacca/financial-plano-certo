# 🪝 Guia de Hooks do Claude para Commits Automatizados

*Como criar comandos personalizados de commit usando o sistema de hooks do Claude*

## 📚 O que são Hooks do Claude?

Hooks são comandos shell que executam automaticamente em resposta a eventos durante sua sessão com o Claude. Eles permitem automação personalizada e workflows otimizados.

## 🎯 Tipos de Hooks Disponíveis

### 1. **Tool Hooks** (Executam quando ferramentas são usadas)
- `pre-tool` - Antes de qualquer ferramenta
- `post-tool` - Depois de qualquer ferramenta
- Hooks específicos: `pre-bash`, `post-edit`, etc.

### 2. **Session Hooks** (Executam em eventos da sessão)
- `session-start` - Quando inicia uma sessão
- `session-end` - Quando termina uma sessão
- `user-prompt-submit` - Após você enviar um comando

### 3. **Custom Hooks** (Você define o gatilho)
- Podem ser ativados por palavras-chave
- Podem ser ativados por padrões

## 🚀 Configurando Hook de Commit Automatizado

### Passo 1: Localizar o arquivo de configuração

```bash
# Windows
%APPDATA%\Claude\claude_desktop_config.json

# macOS
~/Library/Application Support/Claude/claude_desktop_config.json

# Linux
~/.config/Claude/claude_desktop_config.json
```

### Passo 2: Configurar o Hook de Commit

```json
{
  "hooks": {
    "post-edit": {
      "command": "bash",
      "args": ["-c", "git add -A && git diff --cached --quiet || echo '✏️ Arquivos modificados detectados. Use /commit para fazer commit'"]
    },
    "post-write": {
      "command": "bash",
      "args": ["-c", "git add -A && echo '📝 Novo arquivo criado e adicionado ao git'"]
    }
  }
}
```

## 🎨 Criando Comando Personalizado /commit

### Opção 1: Hook Simples (Básico)

```json
{
  "hooks": {
    "user-prompt-submit": {
      "command": "bash",
      "args": ["-c", "if [[ '$PROMPT' == '/commit'* ]]; then MSG=${PROMPT#/commit }; git add -A && git commit -m \"$MSG\" && echo '✅ Commit realizado!'; exit 0; fi"]
    }
  }
}
```

### Opção 2: Hook Avançado com Validação

```json
{
  "hooks": {
    "user-prompt-submit": {
      "command": "python",
      "args": ["~/.claude/hooks/smart_commit.py"]
    }
  }
}
```

**Arquivo `~/.claude/hooks/smart_commit.py`:**

```python
#!/usr/bin/env python3
import os
import sys
import subprocess
import re

def smart_commit():
    prompt = os.environ.get('PROMPT', '')
    
    # Verifica se é um comando de commit
    if not prompt.startswith('/commit'):
        return
    
    # Extrai a mensagem
    message = prompt.replace('/commit', '').strip()
    
    # Se não houver mensagem, gera uma automática
    if not message:
        # Analisa as mudanças
        diff = subprocess.run(['git', 'diff', '--staged', '--name-status'], 
                            capture_output=True, text=True)
        
        files = diff.stdout.strip().split('\n')
        
        # Gera mensagem baseada nas mudanças
        if not files:
            print("❌ Nenhuma mudança para commitar")
            sys.exit(1)
        
        # Detecta o tipo de mudança
        added = sum(1 for f in files if f.startswith('A'))
        modified = sum(1 for f in files if f.startswith('M'))
        deleted = sum(1 for f in files if f.startswith('D'))
        
        # Gera prefixo conventional commit
        if added > modified and added > deleted:
            prefix = "feat"
            action = "add"
        elif modified > added and modified > deleted:
            prefix = "fix" if "bug" in prompt.lower() else "refactor"
            action = "update"
        elif deleted > 0:
            prefix = "chore"
            action = "remove"
        else:
            prefix = "chore"
            action = "update"
        
        # Detecta a área afetada
        areas = set()
        for file in files:
            if 'frontend' in file:
                areas.add('frontend')
            elif 'backend' in file:
                areas.add('backend')
            elif 'docs' in file or 'documentation' in file:
                areas.add('docs')
            elif 'test' in file:
                areas.add('tests')
        
        area = '/'.join(areas) if areas else 'project'
        
        message = f"{prefix}({area}): {action} {added+modified+deleted} files"
    
    # Valida formato Conventional Commits
    pattern = r'^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?: .+'
    if not re.match(pattern, message):
        # Tenta corrigir automaticamente
        if ':' not in message:
            message = f"chore: {message}"
    
    # Faz o commit
    subprocess.run(['git', 'add', '-A'])
    result = subprocess.run(['git', 'commit', '-m', message], 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✅ Commit realizado: {message}")
        # Adiciona co-author do Claude
        subprocess.run(['git', 'commit', '--amend', '-m', 
                       f"{message}\n\nCo-authored-by: Claude <claude@anthropic.com>"])
    else:
        print(f"❌ Erro no commit: {result.stderr}")

if __name__ == '__main__':
    smart_commit()
```

## 🔥 Hook Ultimate: Sistema Completo de Commits

### Configuração no `claude_desktop_config.json`:

```json
{
  "hooks": {
    "user-prompt-submit": {
      "command": "node",
      "args": ["~/.claude/hooks/commit-system.js"]
    },
    "post-edit": {
      "command": "bash",
      "args": ["-c", "git add -A 2>/dev/null || true"]
    },
    "post-write": {
      "command": "bash",
      "args": ["-c", "git add -A 2>/dev/null || true"]
    }
  }
}
```

### Arquivo `~/.claude/hooks/commit-system.js`:

```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROMPT = process.env.PROMPT || '';

// Comandos personalizados
const commands = {
  '/commit': handleCommit,
  '/smart-commit': handleSmartCommit,
  '/commit-all': handleCommitAll,
  '/amend': handleAmend,
  '/push': handlePush,
  '/pr': handlePullRequest
};

// Processa o comando
async function main() {
  const [cmd] = PROMPT.split(' ');
  
  if (commands[cmd]) {
    await commands[cmd]();
  }
}

// Commit simples
function handleCommit() {
  const message = PROMPT.replace('/commit', '').trim();
  
  if (!message) {
    console.log('❌ Forneça uma mensagem: /commit <mensagem>');
    return;
  }
  
  try {
    execSync('git add -A');
    execSync(`git commit -m "${message}"`);
    console.log(`✅ Commit: ${message}`);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Commit inteligente com análise
function handleSmartCommit() {
  try {
    // Analisa mudanças
    const status = execSync('git status --porcelain').toString();
    const files = status.trim().split('\n');
    
    // Categoriza mudanças
    const changes = {
      added: files.filter(f => f.startsWith('A ')).length,
      modified: files.filter(f => f.startsWith('M ')).length,
      deleted: files.filter(f => f.startsWith('D ')).length
    };
    
    // Detecta tipo de mudança
    let type = 'chore';
    let scope = '';
    
    files.forEach(file => {
      if (file.includes('test')) type = 'test';
      else if (file.includes('doc')) type = 'docs';
      else if (file.includes('fix') || file.includes('bug')) type = 'fix';
      else if (file.includes('feat')) type = 'feat';
      
      if (file.includes('frontend/')) scope = 'frontend';
      else if (file.includes('backend/')) scope = 'backend';
      else if (file.includes('services/')) scope = 'services';
    });
    
    // Gera mensagem
    const action = changes.added > changes.modified ? 'add' : 
                  changes.modified > changes.deleted ? 'update' : 'remove';
    const count = changes.added + changes.modified + changes.deleted;
    
    const message = scope 
      ? `${type}(${scope}): ${action} ${count} files`
      : `${type}: ${action} ${count} files`;
    
    // Adiciona detalhes
    const details = [];
    if (changes.added) details.push(`+${changes.added} added`);
    if (changes.modified) details.push(`~${changes.modified} modified`);
    if (changes.deleted) details.push(`-${changes.deleted} deleted`);
    
    const fullMessage = `${message}\n\n${details.join(', ')}`;
    
    // Commit
    execSync('git add -A');
    execSync(`git commit -m "${fullMessage}"`);
    
    console.log(`✅ Smart Commit:\n${fullMessage}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Commit all com mensagem padrão
function handleCommitAll() {
  const timestamp = new Date().toISOString().split('T')[0];
  const message = `chore: automatic commit ${timestamp}`;
  
  try {
    execSync('git add -A');
    execSync(`git commit -m "${message}"`);
    console.log(`✅ Auto-commit: ${message}`);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Amend último commit
function handleAmend() {
  const message = PROMPT.replace('/amend', '').trim();
  
  try {
    if (message) {
      execSync(`git commit --amend -m "${message}"`);
      console.log(`✅ Commit alterado: ${message}`);
    } else {
      execSync('git commit --amend --no-edit');
      console.log('✅ Commit alterado (mensagem mantida)');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Push para remote
function handlePush() {
  try {
    const branch = execSync('git branch --show-current').toString().trim();
    execSync(`git push origin ${branch}`);
    console.log(`✅ Push realizado para origin/${branch}`);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Cria PR
function handlePullRequest() {
  const title = PROMPT.replace('/pr', '').trim() || 'New Pull Request';
  
  try {
    execSync(`gh pr create --title "${title}" --body "Created with Claude"`);
    console.log(`✅ PR criado: ${title}`);
  } catch (error) {
    console.error('❌ Erro (gh cli necessário):', error.message);
  }
}

main().catch(console.error);
```

## 📋 Comandos Disponíveis Após Configuração

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/commit <msg>` | Commit simples | `/commit fix: corrige bug no login` |
| `/smart-commit` | Commit com análise automática | `/smart-commit` |
| `/commit-all` | Commit tudo com mensagem padrão | `/commit-all` |
| `/amend [msg]` | Altera último commit | `/amend fix: mensagem corrigida` |
| `/push` | Push para origin | `/push` |
| `/pr <title>` | Cria Pull Request | `/pr feat: nova funcionalidade` |

## 🛠️ Instalação Rápida

### Windows (PowerShell como Admin):
```powershell
# Criar diretório de hooks
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude\hooks"

# Baixar script de commit
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/seu-repo/commit-hook.js" `
  -OutFile "$env:APPDATA\Claude\hooks\commit-system.js"

# Adicionar ao config
$config = Get-Content "$env:APPDATA\Claude\claude_desktop_config.json" | ConvertFrom-Json
$config.hooks = @{
  "user-prompt-submit" = @{
    "command" = "node"
    "args" = @("$env:APPDATA\Claude\hooks\commit-system.js")
  }
}
$config | ConvertTo-Json -Depth 10 | Set-Content "$env:APPDATA\Claude\claude_desktop_config.json"
```

### macOS/Linux (Bash):
```bash
# Criar diretório de hooks
mkdir -p ~/.claude/hooks

# Criar script de commit
cat > ~/.claude/hooks/commit.sh << 'EOF'
#!/bin/bash
if [[ "$PROMPT" == /commit* ]]; then
  MSG="${PROMPT#/commit }"
  git add -A && git commit -m "$MSG" && echo "✅ Committed: $MSG"
fi
EOF

chmod +x ~/.claude/hooks/commit.sh

# Adicionar ao config
echo '{
  "hooks": {
    "user-prompt-submit": {
      "command": "bash",
      "args": ["~/.claude/hooks/commit.sh"]
    }
  }
}' > ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

## ⚡ Hooks Prontos para Produtividade

### Hook de Auto-Save
```json
{
  "post-edit": {
    "command": "bash",
    "args": ["-c", "git add -A && git commit -m 'auto-save: changes at $(date +%H:%M:%S)' --quiet"]
  }
}
```

### Hook de Lint antes de Commit
```json
{
  "pre-commit": {
    "command": "bash",
    "args": ["-c", "npm run lint && npm run test || (echo '❌ Fix issues before commit' && exit 1)"]
  }
}
```

### Hook de Notificação
```json
{
  "post-tool": {
    "command": "bash",
    "args": ["-c", "if [[ '$TOOL' == 'git' ]]; then notify-send 'Claude Git' 'Operation completed'; fi"]
  }
}
```

## 🎯 Best Practices

1. **Sempre teste hooks** em um repo de teste primeiro
2. **Use logs** para debug: `echo "Debug: $PROMPT" >> ~/.claude/hooks.log`
3. **Mantenha hooks simples** - lógica complexa em scripts separados
4. **Documente seus hooks** customizados
5. **Versione seus hooks** no git para backup

## 🚀 Exemplo Completo Funcionando

Após configurar, você poderá:

```bash
# No Claude, simplesmente digite:
/commit fix: corrige validação de email

# Claude responderá:
✅ Commit realizado: fix: corrige validação de email
📊 3 arquivos modificados, 2 adicionados
🔄 Branch: main
```

## 🔧 Troubleshooting

### Hook não executa?
1. Verifique permissões: `chmod +x ~/.claude/hooks/*`
2. Verifique o path no config
3. Reinicie o Claude após mudanças

### Erro de comando não encontrado?
- Garanta que o comando está no PATH
- Use paths absolutos: `/usr/bin/git` ao invés de `git`

### Debug de hooks:
```json
{
  "user-prompt-submit": {
    "command": "bash",
    "args": ["-c", "echo 'PROMPT: $PROMPT' >> /tmp/claude-debug.log && your-command"]
  }
}
```

---

**💡 Dica Pro**: Combine hooks com aliases do sistema para máxima produtividade!