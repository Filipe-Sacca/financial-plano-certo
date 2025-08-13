# 📦 Instruções de Instalação - Sistema de Sincronização iFood

## ⚠️ IMPORTANTE: Instalar Python Primeiro

### Opção 1: Microsoft Store (RECOMENDADO - Mais Fácil)
1. Abra a **Microsoft Store**
2. Pesquise por **"Python 3.12"**
3. Clique em **"Obter"** ou **"Instalar"**
4. Aguarde a instalação concluir

### Opção 2: Site Oficial
1. Acesse: https://www.python.org/downloads/
2. Baixe **Python 3.12** ou superior
3. Execute o instalador
4. ⚠️ **IMPORTANTE**: Marque a opção **"Add Python to PATH"**
5. Clique em **"Install Now"**

## ✅ Verificar Instalação do Python

Abra um novo **Prompt de Comando** (CMD) e digite:
```cmd
python --version
```

Deve aparecer algo como: `Python 3.12.x`

## 📥 Instalar Dependências do Projeto

### Método 1: Instalação Simplificada
```cmd
cd "C:\Users\gilma\Nova pasta (2)"
python -m pip install supabase requests python-dotenv schedule colorlog
```

### Método 2: Usando requirements.txt
```cmd
cd "C:\Users\gilma\Nova pasta (2)"
python -m pip install -r requirements.txt
```

## ⚙️ Configurar Credenciais

1. Copie o arquivo de exemplo:
```cmd
copy .env.example .env
```

2. Edite o arquivo `.env` com suas credenciais:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-de-api
```

## 🚀 Executar o Sistema

```cmd
python main.py
```

## 🔧 Solução de Problemas

### Python não reconhecido
- Feche e abra um novo terminal após instalar
- Verifique se o Python foi adicionado ao PATH

### Erro ao instalar dependências
```cmd
python -m pip install --upgrade pip
python -m pip install --user supabase requests python-dotenv schedule colorlog
```

### Permissão negada
Execute o CMD como Administrador

## 📝 Comandos Úteis

- **Verificar Python**: `python --version`
- **Atualizar pip**: `python -m pip install --upgrade pip`
- **Listar pacotes**: `python -m pip list`
- **Executar em modo teste**: Defina `DRY_RUN=true` no arquivo `.env`

## 💡 Dica
Após instalar o Python pela Microsoft Store, ele deve funcionar automaticamente em qualquer terminal novo que você abrir.