"""
Cliente Supabase para interação com o banco de dados
"""

import os
import logging
from typing import Optional
from supabase import create_client, Client

logger = logging.getLogger(__name__)


class SupabaseClient:
    """
    Cliente wrapper para operações com Supabase
    """
    
    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        """
        Inicializa o cliente Supabase
        
        Args:
            url: URL do projeto Supabase
            key: Chave de API do Supabase
        """
        self.url = url or os.getenv('SUPABASE_URL')
        self.key = key or os.getenv('SUPABASE_KEY')
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL e SUPABASE_KEY devem ser fornecidos")
        
        self.client: Client = create_client(self.url, self.key)
        logger.info("Cliente Supabase inicializado")
    
    def table(self, table_name: str):
        """
        Retorna referência para uma tabela
        
        Args:
            table_name: Nome da tabela
        """
        return self.client.table(table_name)
    
    def get_tokens(self):
        """
        Busca todos os tokens de acesso do iFood
        """
        try:
            response = self.table('ifood_tokens').select("*").execute()
            logger.info(f"Encontrados {len(response.data)} tokens")
            return response.data
        except Exception as e:
            logger.error(f"Erro ao buscar tokens: {e}")
            raise
    
    def get_merchants(self, user_id: str = None):
        """
        Busca merchants, opcionalmente filtrados por user_id
        """
        try:
            query = self.table('ifood_merchants').select("*")
            if user_id:
                query = query.eq('user_id', user_id)
            response = query.execute()
            logger.info(f"Encontrados {len(response.data)} merchants")
            return response.data
        except Exception as e:
            logger.error(f"Erro ao buscar merchants: {e}")
            raise
    
    def get_products(self, merchant_id: str = None, item_id: str = None):
        """
        Busca produtos com filtros opcionais
        """
        try:
            query = self.table('products').select("*")
            if merchant_id:
                query = query.eq('merchant_id', merchant_id)
            if item_id:
                query = query.eq('item_id', item_id)
            response = query.execute()
            return response.data
        except Exception as e:
            logger.error(f"Erro ao buscar produtos: {e}")
            raise
    
    def upsert_product(self, product_data: dict):
        """
        Insere ou atualiza um produto
        """
        try:
            response = self.table('products').upsert(product_data).execute()
            logger.info(f"Produto upserted: {product_data.get('item_id')}")
            return response.data
        except Exception as e:
            logger.error(f"Erro ao fazer upsert do produto: {e}")
            raise
    
    def update_product_status(self, merchant_id: str, item_id: str, status: str):
        """
        Atualiza o status de um produto específico
        """
        try:
            response = self.table('products')\
                .update({'is_active': status})\
                .eq('merchant_id', merchant_id)\
                .eq('item_id', item_id)\
                .execute()
            logger.info(f"Status atualizado para produto {item_id}: {status}")
            return response.data
        except Exception as e:
            logger.error(f"Erro ao atualizar status do produto: {e}")
            raise
    
    def bulk_create_products(self, products: list):
        """
        Cria múltiplos produtos de uma vez
        """
        try:
            if not products:
                return []
            
            response = self.table('products').insert(products).execute()
            logger.info(f"{len(products)} produtos criados")
            return response.data
        except Exception as e:
            logger.error(f"Erro ao criar produtos em lote: {e}")
            raise
    
    def check_product_exists(self, merchant_id: str, item_id: str) -> bool:
        """
        Verifica se um produto já existe
        """
        try:
            response = self.table('products')\
                .select("id")\
                .eq('merchant_id', merchant_id)\
                .eq('item_id', item_id)\
                .execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Erro ao verificar existência do produto: {e}")
            return False