"""
Script de teste para atualização automática de tokens do iFood
Testa o webhook e a atualização no Supabase
"""

import logging
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Optional
import requests

from config import Config
from supabase_client import SupabaseClient

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TokenUpdateTester:
    """Classe para testar atualização automática de tokens"""
    
    def __init__(self):
        """Inicializa o testador"""
        self.supabase = SupabaseClient()
        logger.info("Testador de tokens inicializado")
    
    def test_token_refresh_flow(self):
        """
        Testa o fluxo completo de atualização de token
        """
        print("\n" + "="*60)
        print("TESTE DE ATUALIZAÇÃO AUTOMÁTICA DE TOKENS")
        print("="*60 + "\n")
        
        # 1. Verificar tokens existentes
        print("1. VERIFICANDO TOKENS EXISTENTES...")
        print("-" * 40)
        existing_tokens = self.check_existing_tokens()
        
        if not existing_tokens:
            print("❌ Nenhum token encontrado no banco!")
            print("\nPara testar, você precisa primeiro:")
            print("1. Ter pelo menos um registro na tabela 'ifood_tokens'")
            print("2. Com client_id, client_secret e refresh_token válidos")
            return
        
        print(f"✅ Encontrados {len(existing_tokens)} tokens\n")
        
        # 2. Selecionar token para teste
        print("2. SELECIONANDO TOKEN PARA TESTE...")
        print("-" * 40)
        test_token = existing_tokens[0]
        print(f"Token selecionado:")
        print(f"  - User ID: {test_token.get('user_id')}")
        print(f"  - Client ID: {test_token.get('client_id')}")
        print(f"  - Token atual: {test_token.get('access_token', 'N/A')[:20]}...")
        print(f"  - Última atualização: {test_token.get('updated_at', 'N/A')}\n")
        
        # 3. Simular webhook do iFood
        print("3. SIMULANDO WEBHOOK DO IFOOD...")
        print("-" * 40)
        new_token = self.simulate_ifood_webhook(test_token)
        
        if new_token:
            print(f"✅ Novo token gerado: {new_token[:20]}...\n")
        else:
            print("❌ Falha ao simular webhook\n")
            return
        
        # 4. Atualizar token no Supabase
        print("4. ATUALIZANDO TOKEN NO SUPABASE...")
        print("-" * 40)
        success = self.update_token_in_database(
            test_token['user_id'],
            new_token
        )
        
        if success:
            print("✅ Token atualizado com sucesso!\n")
        else:
            print("❌ Falha ao atualizar token\n")
            return
        
        # 5. Verificar atualização
        print("5. VERIFICANDO ATUALIZAÇÃO...")
        print("-" * 40)
        self.verify_token_update(test_token['user_id'])
        
        print("\n" + "="*60)
        print("TESTE CONCLUÍDO")
        print("="*60)
    
    def check_existing_tokens(self) -> list:
        """Verifica tokens existentes no banco"""
        try:
            response = self.supabase.table('ifood_tokens').select("*").execute()
            return response.data
        except Exception as e:
            logger.error(f"Erro ao buscar tokens: {e}")
            return []
    
    def simulate_ifood_webhook(self, token_data: Dict) -> Optional[str]:
        """
        Simula o webhook do iFood para renovação de token
        
        NOTA: Em produção, isso seria feito pela API real do iFood
        """
        try:
            # Verificar se temos as credenciais necessárias
            if not all([
                token_data.get('client_id'),
                token_data.get('client_secret'),
                token_data.get('refresh_token')
            ]):
                print("⚠️  Credenciais incompletas para renovação")
                print("    Necessário: client_id, client_secret, refresh_token")
                return None
            
            print("  Simulando chamada para API do iFood...")
            print(f"  POST https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token")
            print(f"  Client ID: {token_data['client_id']}")
            
            # Em ambiente real, seria assim:
            """
            url = "https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token"
            
            data = {
                'grant_type': 'refresh_token',
                'client_id': token_data['client_id'],
                'client_secret': token_data['client_secret'],
                'refresh_token': token_data['refresh_token']
            }
            
            response = requests.post(url, data=data)
            if response.status_code == 200:
                result = response.json()
                return result['access_token']
            """
            
            # Para teste, geramos um token simulado
            import uuid
            new_token = f"test_token_{uuid.uuid4().hex[:20]}_{int(time.time())}"
            
            print("  ✅ Webhook simulado com sucesso")
            return new_token
            
        except Exception as e:
            logger.error(f"Erro ao simular webhook: {e}")
            return None
    
    def update_token_in_database(self, user_id: str, new_token: str) -> bool:
        """Atualiza o token no banco de dados"""
        try:
            # Preparar dados para atualização
            update_data = {
                'access_token': new_token,
                'updated_at': datetime.now().isoformat(),
                'token_expiry': (datetime.now() + timedelta(hours=6)).isoformat()
            }
            
            print(f"  Atualizando token para user_id: {user_id}")
            print(f"  Novo token: {new_token[:20]}...")
            print(f"  Validade: 6 horas")
            
            # Atualizar no Supabase
            response = self.supabase.table('ifood_tokens')\
                .update(update_data)\
                .eq('user_id', user_id)\
                .execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            logger.error(f"Erro ao atualizar token: {e}")
            return False
    
    def verify_token_update(self, user_id: str):
        """Verifica se o token foi atualizado corretamente"""
        try:
            response = self.supabase.table('ifood_tokens')\
                .select("*")\
                .eq('user_id', user_id)\
                .execute()
            
            if response.data:
                updated_token = response.data[0]
                print(f"  Token atual: {updated_token['access_token'][:20]}...")
                print(f"  Última atualização: {updated_token.get('updated_at', 'N/A')}")
                print(f"  Expiração: {updated_token.get('token_expiry', 'N/A')}")
                print("  ✅ Token verificado no banco!")
            else:
                print("  ❌ Token não encontrado após atualização")
                
        except Exception as e:
            logger.error(f"Erro ao verificar token: {e}")


class TokenAutoRefreshSimulator:
    """Simula o processo de atualização automática contínua"""
    
    def __init__(self):
        self.supabase = SupabaseClient()
        self.refresh_interval = 300  # 5 minutos em segundos
    
    def start_auto_refresh(self):
        """
        Inicia simulação de atualização automática
        """
        print("\n" + "="*60)
        print("SIMULADOR DE ATUALIZAÇÃO AUTOMÁTICA")
        print("="*60 + "\n")
        print(f"Intervalo de atualização: {self.refresh_interval} segundos")
        print("Pressione Ctrl+C para parar\n")
        
        try:
            while True:
                print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Verificando tokens...")
                
                # Buscar tokens que precisam atualização
                tokens = self.get_tokens_to_refresh()
                
                if tokens:
                    print(f"  {len(tokens)} tokens precisam atualização")
                    for token in tokens:
                        self.refresh_single_token(token)
                else:
                    print("  Nenhum token precisa atualização")
                
                print(f"  Próxima verificação em {self.refresh_interval} segundos...")
                time.sleep(self.refresh_interval)
                
        except KeyboardInterrupt:
            print("\n\nSimulação interrompida pelo usuário")
    
    def get_tokens_to_refresh(self) -> list:
        """Busca tokens que precisam ser atualizados"""
        try:
            # Buscar todos os tokens
            response = self.supabase.table('ifood_tokens').select("*").execute()
            tokens = response.data
            
            # Filtrar tokens que expiram em breve (< 1 hora)
            tokens_to_refresh = []
            for token in tokens:
                expiry = token.get('token_expiry')
                if expiry:
                    expiry_time = datetime.fromisoformat(expiry.replace('Z', '+00:00'))
                    if (expiry_time - datetime.now()).total_seconds() < 3600:
                        tokens_to_refresh.append(token)
                else:
                    # Se não tem data de expiração, considera que precisa atualizar
                    tokens_to_refresh.append(token)
            
            return tokens_to_refresh
            
        except Exception as e:
            logger.error(f"Erro ao buscar tokens: {e}")
            return []
    
    def refresh_single_token(self, token_data: Dict):
        """Atualiza um único token"""
        try:
            user_id = token_data['user_id']
            print(f"    Atualizando token para user {user_id}...")
            
            # Simular novo token
            import uuid
            new_token = f"auto_token_{uuid.uuid4().hex[:15]}_{int(time.time())}"
            
            # Atualizar no banco
            update_data = {
                'access_token': new_token,
                'updated_at': datetime.now().isoformat(),
                'token_expiry': (datetime.now() + timedelta(hours=6)).isoformat()
            }
            
            self.supabase.table('ifood_tokens')\
                .update(update_data)\
                .eq('user_id', user_id)\
                .execute()
            
            print(f"    ✅ Token atualizado: {new_token[:20]}...")
            
        except Exception as e:
            logger.error(f"Erro ao atualizar token: {e}")


def main():
    """Função principal"""
    print("\n" + "="*60)
    print("TESTADOR DE ATUALIZAÇÃO DE TOKENS IFOOD")
    print("="*60 + "\n")
    
    print("Escolha uma opção:")
    print("1. Teste único de atualização")
    print("2. Simulação de atualização automática contínua")
    print("3. Verificar tokens atuais")
    print("0. Sair")
    
    choice = input("\nOpção: ").strip()
    
    if choice == "1":
        tester = TokenUpdateTester()
        tester.test_token_refresh_flow()
    
    elif choice == "2":
        simulator = TokenAutoRefreshSimulator()
        simulator.start_auto_refresh()
    
    elif choice == "3":
        tester = TokenUpdateTester()
        tokens = tester.check_existing_tokens()
        
        print("\n" + "="*60)
        print("TOKENS ATUAIS NO BANCO")
        print("="*60 + "\n")
        
        if tokens:
            for i, token in enumerate(tokens, 1):
                print(f"Token {i}:")
                print(f"  User ID: {token.get('user_id')}")
                print(f"  Client ID: {token.get('client_id')}")
                print(f"  Access Token: {token.get('access_token', 'N/A')[:30]}...")
                print(f"  Refresh Token: {'Sim' if token.get('refresh_token') else 'Não'}")
                print(f"  Última atualização: {token.get('updated_at', 'N/A')}")
                print(f"  Expiração: {token.get('token_expiry', 'N/A')}")
                print()
        else:
            print("Nenhum token encontrado no banco!")
    
    elif choice == "0":
        print("Saindo...")
    
    else:
        print("Opção inválida!")


if __name__ == "__main__":
    main()