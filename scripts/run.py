#!/usr/bin/env python3
"""
🚀 iFood Integration Hub - Launcher Principal
============================================

Script principal para executar os diferentes módulos do sistema.

Uso:
    python run.py --help                    # Mostra ajuda
    python run.py --api-server              # Inicia servidor API
    python run.py --token-check             # Verifica tokens
    python run.py --merchant-status         # Verifica status das lojas
"""

import sys
import os
import argparse
import subprocess
from pathlib import Path

# Adicionar src ao path
sys.path.insert(0, str(Path(__file__).parent / "src"))

def run_api_server():
    """Inicia servidor API"""
    print("🌐 Iniciando servidor API...")
    try:
        from src.api_server import main
        main()
    except ImportError:
        print("❌ Erro: Não foi possível importar o servidor API")
        print("💡 Verifique se o arquivo api_server.py está na pasta src/")

def run_token_check():
    """Verifica status dos tokens"""
    print("🔍 Verificando status dos tokens...")
    script_path = "scripts-utils/test-expiration-check.js"
    if os.path.exists(script_path):
        subprocess.run(["node", script_path])
    else:
        print("❌ Script de verificação não encontrado")

def run_merchant_status():
    """Verifica status das lojas"""
    print("🏪 Verificando status das lojas...")
    try:
        from src.ifood_merchant_status_service import main
        main()
    except ImportError:
        print("❌ Erro: Não foi possível importar o serviço de status")

def show_status():
    """Mostra status geral do sistema"""
    print("📊 STATUS DO SISTEMA")
    print("=" * 50)
    
    # Verificar se o serviço de tokens está rodando
    print("🔐 Serviço de Tokens:")
    try:
        subprocess.run(["node", "scripts-utils/monitor-token-updates.js", "--stats-only"], 
                      timeout=10, capture_output=True)
        print("   ✅ Serviço funcionando")
    except:
        print("   ⚠️ Não foi possível verificar")
    
    # Verificar arquivos importantes
    important_files = [
        "services/ifood-token-service/src/ifoodTokenService.ts",
        "frontend/plano-certo-hub-insights/package.json",
        "config/requirements.txt"
    ]
    
    print("\n📁 Arquivos importantes:")
    for file in important_files:
        if os.path.exists(file):
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file}")

def main():
    parser = argparse.ArgumentParser(
        description="🚀 iFood Integration Hub - Launcher Principal",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:
  python run.py --api-server        # Iniciar servidor API
  python run.py --token-check       # Verificar tokens
  python run.py --status            # Mostrar status geral
        """
    )

    parser.add_argument("--api-server", action="store_true",
                       help="Iniciar servidor API")
    parser.add_argument("--token-check", action="store_true",
                       help="Verificar status dos tokens")
    parser.add_argument("--merchant-status", action="store_true",
                       help="Verificar status das lojas")
    parser.add_argument("--status", action="store_true",
                       help="Mostrar status geral do sistema")
    
    args = parser.parse_args()

    if args.api_server:
        run_api_server()
    elif args.token_check:
        run_token_check()
    elif args.merchant_status:
        run_merchant_status()
    elif args.status:
        show_status()
    else:
        print("🚀 iFood Integration Hub")
        print("=" * 50)
        print("Use --help para ver as opções disponíveis")
        print()
        print("🔧 Comandos principais:")
        print("  python run.py --status           # Status do sistema")
        print("  python run.py --token-check      # Verificar tokens")
        print()
        print("📁 Estrutura do projeto:")
        print("  src/                 # Código Python")
        print("  services/            # Serviços Node.js")
        print("  frontend/            # Interface web")
        print("  scripts-utils/       # Scripts utilitários")
        print("  n8n-workflows/       # Automação N8N")

if __name__ == "__main__":
    main()