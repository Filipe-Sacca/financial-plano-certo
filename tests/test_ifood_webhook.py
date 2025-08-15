"""
Script para testar webhook real do iFood e atualização de tokens
Este script faz a renovação REAL do token usando a API do iFood
"""

import requests
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional

from config import Config
from supabase_client import SupabaseClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class IFoodTokenRefresher:
    """
    Classe para renovar tokens do iFood usando a API real
    """
    
    IFOOD_AUTH_URL = "https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token"
    
    def __init__(self):
        self.supabase = SupabaseClient()
        logger.info("Inicializando renovador de tokens iFood")
    
    def refresh_all_tokens(self):
        """
        Atualiza todos os tokens que possuem refresh_token
        """
        print("\n" + "="*60)
        print("ATUALIZAÇÃO DE TOKENS IFOOD (API REAL)")
        print("="*60 + "\n")
        
        # Buscar tokens com refresh_token
        tokens = self.get_tokens_with_refresh()
        
        if not tokens:
            print("❌ Nenhum token com refresh_token encontrado!")
            print("\nPara usar este teste, você precisa ter:")
            print("1. client_id")
            print("2. client_secret") 
            print("3. refresh_token")
            print("\nEstes dados são obtidos ao fazer o primeiro OAuth2 com o iFood")
            return
        
        print(f"Encontrados {len(tokens)} tokens para atualizar\n")
        
        success_count = 0
        for token in tokens:
            print(f"Atualizando token para user_id: {token['user_id']}")
            print("-" * 40)
            
            if self.refresh_single_token(token):
                success_count += 1
                print("✅ Sucesso!\n")
            else:
                print("❌ Falha!\n")
        
        print("="*60)
        print(f"Resultado: {success_count}/{len(tokens)} tokens atualizados")
        print("="*60)
    
    def get_tokens_with_refresh(self) -> list:
        """
        Busca tokens que possuem refresh_token
        """
        try:
            response = self.supabase.table('ifood_tokens')\
                .select("*")\
                .not_.is_('refresh_token', 'null')\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Erro ao buscar tokens: {e}")
            return []
    
    def refresh_single_token(self, token_data: Dict) -> bool:
        """
        Renova um único token usando a API real do iFood
        """
        try:
            # Verificar credenciais necessárias
            if not all([
                token_data.get('client_id'),
                token_data.get('client_secret'),
                token_data.get('refresh_token')
            ]):
                print("  ⚠️  Credenciais incompletas")
                return False
            
            print(f"  Client ID: {token_data['client_id']}")
            print(f"  Chamando API do iFood...")
            
            # Fazer chamada real para API do iFood
            response = self.call_ifood_refresh_api(
                client_id=token_data['client_id'],
                client_secret=token_data['client_secret'],
                refresh_token=token_data['refresh_token']
            )
            
            if response:
                # Atualizar no banco
                return self.update_token_in_database(
                    user_id=token_data['user_id'],
                    new_token=response['access_token'],
                    new_refresh=response.get('refresh_token', token_data['refresh_token'])
                )
            
            return False
            
        except Exception as e:
            logger.error(f"Erro ao renovar token: {e}")
            return False
    
    def call_ifood_refresh_api(self, client_id: str, client_secret: str, 
                              refresh_token: str) -> Optional[Dict]:
        """
        Chama a API real do iFood para renovar o token
        """
        try:
            # Preparar dados para renovação
            data = {
                'grant_type': 'refresh_token',
                'client_id': client_id,
                'client_secret': client_secret,
                'refresh_token': refresh_token
            }
            
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            # Fazer requisição
            response = requests.post(
                self.IFOOD_AUTH_URL,
                data=data,
                headers=headers,
                timeout=30
            )
            
            print(f"  Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"  ✅ Novo token obtido!")
                print(f"  Validade: {result.get('expires_in', 'N/A')} segundos")
                return result
            else:
                print(f"  ❌ Erro na API: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"  ❌ Erro de conexão: {e}")
            return None
    
    def update_token_in_database(self, user_id: str, new_token: str, 
                                new_refresh: str) -> bool:
        """
        Atualiza o token no banco de dados
        """
        try:
            update_data = {
                'access_token': new_token,
                'refresh_token': new_refresh,
                'updated_at': datetime.now().isoformat(),
                'token_expiry': (datetime.now() + timedelta(hours=6)).isoformat()
            }
            
            response = self.supabase.table('ifood_tokens')\
                .update(update_data)\
                .eq('user_id', user_id)\
                .execute()
            
            if response.data:
                print(f"  ✅ Token atualizado no banco!")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Erro ao atualizar banco: {e}")
            return False


class WebhookSimulator:
    """
    Simula o recebimento de um webhook do iFood
    """
    
    def __init__(self):
        self.supabase = SupabaseClient()
    
    def simulate_webhook_received(self):
        """
        Simula que recebeu um webhook do iFood
        """
        print("\n" + "="*60)
        print("SIMULAÇÃO DE WEBHOOK RECEBIDO")
        print("="*60 + "\n")
        
        # Simular payload do webhook
        webhook_payload = {
            "event": "TOKEN_REFRESH_REQUIRED",
            "merchant_id": "12345678-1234-1234-1234-123456789012",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "message": "Token expires soon",
                "expires_in": 3600
            }
        }
        
        print("Webhook recebido:")
        print(json.dumps(webhook_payload, indent=2))
        print()
        
        # Processar webhook
        self.process_webhook(webhook_payload)
    
    def process_webhook(self, payload: Dict):
        """
        Processa o webhook e atualiza o token
        """
        print("Processando webhook...")
        
        merchant_id = payload.get('merchant_id')
        if not merchant_id:
            print("❌ Merchant ID não encontrado no webhook")
            return
        
        # Buscar token do merchant
        print(f"Buscando token para merchant: {merchant_id}")
        
        try:
            # Buscar merchant
            response = self.supabase.table('ifood_merchants')\
                .select("*")\
                .eq('merchant_id', merchant_id)\
                .execute()
            
            if not response.data:
                print("❌ Merchant não encontrado")
                return
            
            user_id = response.data[0]['user_id']
            
            # Buscar token do user
            token_response = self.supabase.table('ifood_tokens')\
                .select("*")\
                .eq('user_id', user_id)\
                .execute()
            
            if token_response.data:
                print("✅ Token encontrado, iniciando renovação...")
                
                # Aqui você chamaria o refresh real
                refresher = IFoodTokenRefresher()
                refresher.refresh_single_token(token_response.data[0])
            else:
                print("❌ Token não encontrado para o usuário")
                
        except Exception as e:
            logger.error(f"Erro ao processar webhook: {e}")


def main():
    """Menu principal"""
    print("\n" + "="*60)
    print("TESTE DE ATUALIZAÇÃO DE TOKENS IFOOD")
    print("="*60 + "\n")
    
    print("Escolha uma opção:")
    print("1. Testar renovação REAL via API do iFood")
    print("2. Simular recebimento de webhook")
    print("3. Teste com token simulado (sem API real)")
    print("0. Sair")
    
    choice = input("\nOpção: ").strip()
    
    if choice == "1":
        print("\n⚠️  ATENÇÃO: Este teste usa a API REAL do iFood!")
        print("Certifique-se de ter client_id, client_secret e refresh_token válidos")
        confirm = input("\nContinuar? (s/n): ").strip().lower()
        
        if confirm == 's':
            refresher = IFoodTokenRefresher()
            refresher.refresh_all_tokens()
    
    elif choice == "2":
        simulator = WebhookSimulator()
        simulator.simulate_webhook_received()
    
    elif choice == "3":
        # Usa o script anterior para teste simulado
        import test_token_update
        tester = test_token_update.TokenUpdateTester()
        tester.test_token_refresh_flow()
    
    elif choice == "0":
        print("Saindo...")
    
    else:
        print("Opção inválida!")


if __name__ == "__main__":
    main()