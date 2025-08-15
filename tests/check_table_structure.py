"""
Script para verificar a estrutura da tabela ifood_tokens
"""

import os
from dotenv import load_dotenv
from supabase_client import SupabaseClient
import json

# Carregar variáveis de ambiente
load_dotenv()

def check_table_structure():
    print("Verificando estrutura da tabela ifood_tokens...")
    
    try:
        client = SupabaseClient()
        
        # Buscar todos os registros para ver a estrutura
        response = client.table('ifood_tokens').select("*").execute()
        
        print(f"Total de registros: {len(response.data)}")
        
        if response.data:
            print("\nEstrutura do primeiro registro:")
            print("-" * 40)
            first_record = response.data[0]
            
            for key, value in first_record.items():
                print(f"{key}: {type(value).__name__} = {value}")
            
            print("\nCampos esperados pelo serviço:")
            print("-" * 40)
            required_fields = [
                'id', 'client_id', 'client_secret', 'access_token', 
                'expires_at', 'user_id', 'created_at', 'updated_at'
            ]
            
            for field in required_fields:
                status = "✅" if field in first_record else "❌"
                print(f"{status} {field}")
            
            # Verificar campos faltantes
            missing_fields = [f for f in required_fields if f not in first_record]
            if missing_fields:
                print(f"\n⚠️  Campos faltantes: {missing_fields}")
        else:
            print("Nenhum registro encontrado na tabela!")
    
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    check_table_structure()