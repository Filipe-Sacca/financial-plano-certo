"""
Script simplificado para testar atualização de tokens
Sem emojis, com melhor tratamento de erros
"""

import logging
import json
import time
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_connection():
    """Testa conexão com Supabase"""
    print("\n" + "="*60)
    print("TESTE DE CONEXAO COM SUPABASE")
    print("="*60 + "\n")
    
    # Verificar configurações
    supabase_url = os.getenv('SUPABASE_URL', '')
    supabase_key = os.getenv('SUPABASE_KEY', '')
    
    print("1. Verificando configuracoes...")
    print("-" * 40)
    
    if not supabase_url or supabase_url == 'https://seu-projeto.supabase.co':
        print("[ERRO] SUPABASE_URL nao configurado!")
        print("       Configure no arquivo .env")
        print(f"       Valor atual: {supabase_url}")
        return False
    
    if not supabase_key or supabase_key == 'sua-chave-de-api-aqui':
        print("[ERRO] SUPABASE_KEY nao configurado!")
        print("       Configure no arquivo .env")
        return False
    
    print(f"[OK] URL: {supabase_url}")
    print(f"[OK] Key: {supabase_key[:20]}...")
    
    # Tentar conectar
    print("\n2. Testando conexao...")
    print("-" * 40)
    
    try:
        from supabase_client import SupabaseClient
        client = SupabaseClient(supabase_url, supabase_key)
        
        # Tentar uma query simples
        response = client.table('ifood_tokens').select("count").execute()
        print("[OK] Conexao estabelecida com sucesso!")
        return True
        
    except Exception as e:
        print(f"[ERRO] Falha na conexao: {e}")
        return False


def test_token_simulation():
    """Teste simulado sem precisar de conexão real"""
    print("\n" + "="*60)
    print("TESTE SIMULADO DE ATUALIZACAO DE TOKEN")
    print("="*60 + "\n")
    
    print("Este teste NAO precisa de conexao com Supabase")
    print("Apenas demonstra o fluxo de atualizacao\n")
    
    # Simular dados de token
    fake_token = {
        'user_id': 'user_123',
        'client_id': 'client_abc',
        'client_secret': 'secret_xyz',
        'refresh_token': 'refresh_123',
        'access_token': 'old_token_456',
        'updated_at': datetime.now().isoformat()
    }
    
    print("1. Token atual:")
    print("-" * 40)
    print(f"   User ID: {fake_token['user_id']}")
    print(f"   Client ID: {fake_token['client_id']}")
    print(f"   Token: {fake_token['access_token']}")
    print(f"   Atualizado: {fake_token['updated_at']}\n")
    
    print("2. Simulando chamada para iFood API...")
    print("-" * 40)
    print("   POST /authentication/v1.0/oauth/token")
    print("   Grant Type: refresh_token")
    print(f"   Client ID: {fake_token['client_id']}\n")
    
    # Simular resposta
    time.sleep(1)
    new_token = f"new_token_{int(time.time())}"
    
    print("3. Resposta simulada do iFood:")
    print("-" * 40)
    print(f"   Novo token: {new_token}")
    print("   Validade: 21600 segundos (6 horas)")
    print("   Status: 200 OK\n")
    
    print("4. Atualizacao no banco (simulada):")
    print("-" * 40)
    print("   UPDATE ifood_tokens")
    print(f"   SET access_token = '{new_token}'")
    print(f"   WHERE user_id = '{fake_token['user_id']}'\n")
    
    print("[OK] Teste simulado concluido com sucesso!")
    print("\nFluxo de atualizacao:")
    print("1. Sistema detecta token proximo de expirar")
    print("2. Chama API do iFood com refresh_token")
    print("3. Recebe novo access_token")
    print("4. Atualiza no banco de dados")
    print("5. Usa novo token nas proximas chamadas")


def check_environment():
    """Verifica o ambiente e configurações"""
    print("\n" + "="*60)
    print("VERIFICACAO DO AMBIENTE")
    print("="*60 + "\n")
    
    print("1. Variaveis de ambiente:")
    print("-" * 40)
    
    env_vars = {
        'SUPABASE_URL': os.getenv('SUPABASE_URL', 'NAO CONFIGURADO'),
        'SUPABASE_KEY': os.getenv('SUPABASE_KEY', 'NAO CONFIGURADO'),
        'SYNC_INTERVAL_MINUTES': os.getenv('SYNC_INTERVAL_MINUTES', '5'),
        'DRY_RUN': os.getenv('DRY_RUN', 'false')
    }
    
    for key, value in env_vars.items():
        if 'KEY' in key and value != 'NAO CONFIGURADO':
            # Ocultar parte da chave
            display_value = value[:20] + '...' if len(value) > 20 else value
        else:
            display_value = value
        
        status = '[OK]' if value != 'NAO CONFIGURADO' else '[ERRO]'
        print(f"   {status} {key}: {display_value}")
    
    print("\n2. Dependencias Python:")
    print("-" * 40)
    
    dependencies = ['supabase', 'requests', 'schedule', 'python-dotenv']
    for dep in dependencies:
        try:
            __import__(dep.replace('-', '_'))
            print(f"   [OK] {dep}")
        except ImportError:
            print(f"   [ERRO] {dep} - nao instalado")
    
    print("\n3. Arquivos do sistema:")
    print("-" * 40)
    
    required_files = [
        'main.py',
        'ifood_product_sync.py',
        'supabase_client.py',
        'ifood_api_client.py',
        'config.py',
        '.env'
    ]
    
    for file in required_files:
        if os.path.exists(file):
            print(f"   [OK] {file}")
        else:
            print(f"   [ERRO] {file} - nao encontrado")


def main():
    """Menu principal"""
    print("\n" + "="*60)
    print("TESTE DE ATUALIZACAO DE TOKENS - VERSAO SIMPLES")
    print("="*60 + "\n")
    
    print("Escolha uma opcao:")
    print("1. Verificar ambiente e configuracoes")
    print("2. Testar conexao com Supabase")
    print("3. Teste simulado (sem conexao)")
    print("0. Sair")
    
    choice = input("\nOpcao: ").strip()
    
    if choice == "1":
        check_environment()
    
    elif choice == "2":
        if test_connection():
            print("\n[SUCESSO] Conexao funcionando!")
            print("Voce pode executar o sistema principal: python main.py")
        else:
            print("\n[ATENCAO] Configure as credenciais no arquivo .env")
    
    elif choice == "3":
        test_token_simulation()
    
    elif choice == "0":
        print("Saindo...")
    
    else:
        print("Opcao invalida!")


if __name__ == "__main__":
    main()