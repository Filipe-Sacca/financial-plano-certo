"""
Sistema de Sincronização de Produtos iFood
Baseado no fluxo N8N para polling e atualização de produtos
"""

import logging
import time
from datetime import datetime
from typing import List, Dict, Optional, Any
import json
from dataclasses import dataclass

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class Product:
    """Classe para representar um produto"""
    item_id: str
    name: str
    description: str
    status: str
    product_id: str
    image_path: str
    price: float
    merchant_id: str
    user_id: Optional[str] = None
    client_id: Optional[str] = None


class IFoodProductSync:
    """
    Classe principal para sincronização de produtos do iFood
    Replica a funcionalidade do fluxo N8N em Python
    """
    
    def __init__(self, supabase_client, ifood_api_client):
        """
        Inicializa o sincronizador
        
        Args:
            supabase_client: Cliente Supabase configurado
            ifood_api_client: Cliente da API do iFood configurado
        """
        self.supabase = supabase_client
        self.ifood_api = ifood_api_client
        self.processed_items = set()
        
    def run_sync_cycle(self):
        """
        Executa um ciclo completo de sincronização
        Equivalente ao fluxo completo do N8N
        """
        try:
            logger.info("Iniciando ciclo de sincronização de produtos")
            
            # 1. Buscar tokens de acesso
            tokens = self.get_access_tokens()
            if not tokens:
                logger.error("Nenhum token de acesso encontrado")
                return
            
            for token_data in tokens:
                try:
                    self.process_merchant_products(token_data)
                except Exception as e:
                    logger.error(f"Erro processando merchant {token_data.get('merchant_id')}: {e}")
                    continue
                    
            logger.info("Ciclo de sincronização concluído")
            
        except Exception as e:
            logger.error(f"Erro no ciclo de sincronização: {e}")
            raise
    
    def get_access_tokens(self) -> List[Dict]:
        """
        Busca tokens de acesso da tabela ifood_tokens
        Equivalente ao node "[GET] Pega o Token"
        """
        try:
            response = self.supabase.table('ifood_tokens').select("*").execute()
            return response.data
        except Exception as e:
            logger.error(f"Erro ao buscar tokens: {e}")
            return []
    
    def get_merchant_info(self, user_id: str) -> List[Dict]:
        """
        Busca informações do merchant
        Equivalente ao node "[GET] Pega o Merchant_ID"
        """
        try:
            response = self.supabase.table('ifood_merchants')\
                .select("*")\
                .eq('user_id', user_id)\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Erro ao buscar merchant info: {e}")
            return []
    
    def process_merchant_products(self, token_data: Dict):
        """
        Processa produtos de um merchant específico
        """
        user_id = token_data.get('user_id')
        access_token = token_data.get('access_token')
        client_id = token_data.get('client_id')
        
        if not all([user_id, access_token]):
            logger.warning("Dados de token incompletos")
            return
        
        # Buscar informações do merchant
        merchants = self.get_merchant_info(user_id)
        
        for merchant in merchants:
            merchant_id = merchant.get('merchant_id')
            if not merchant_id:
                continue
                
            logger.info(f"Processando merchant {merchant_id}")
            
            # Buscar catálogos do merchant
            catalogs = self.ifood_api.get_merchant_catalogs(merchant_id, access_token)
            
            if not catalogs:
                logger.warning(f"Nenhum catálogo encontrado para merchant {merchant_id}")
                continue
            
            for catalog in catalogs:
                catalog_id = catalog.get('catalogId')
                if not catalog_id:
                    continue
                    
                # Buscar categorias e produtos
                categories = self.ifood_api.get_catalog_categories(
                    merchant_id, 
                    catalog_id, 
                    access_token
                )
                
                if not categories:
                    continue
                
                # Processar produtos de cada categoria
                for category in categories:
                    items = category.get('items', [])
                    self.process_category_items(
                        items, 
                        merchant_id, 
                        user_id,
                        client_id
                    )
    
    def process_category_items(self, items: List[Dict], merchant_id: str, 
                              user_id: str, client_id: str):
        """
        Processa itens de uma categoria
        """
        for item in items:
            try:
                # Criar objeto produto
                product = self.extract_product_data(item, merchant_id, user_id)
                
                # Verificar se produto existe no banco
                existing_product = self.get_existing_product(
                    merchant_id, 
                    product.item_id
                )
                
                if existing_product:
                    # Atualizar produto existente se necessário
                    self.update_product_if_needed(product, existing_product)
                else:
                    # Criar novo produto
                    self.create_product(product, client_id)
                    
            except Exception as e:
                logger.error(f"Erro processando item {item.get('id')}: {e}")
                continue
    
    def extract_product_data(self, item: Dict, merchant_id: str, 
                            user_id: str) -> Product:
        """
        Extrai dados do produto do item da API
        Equivalente aos nodes de filtragem "[FILTER] Filtra dados Importantes dos Produtos"
        """
        price_data = item.get('price', {})
        price_value = price_data.get('value', 0) if isinstance(price_data, dict) else 0
        
        return Product(
            item_id=item.get('id', ''),
            name=item.get('name', ''),
            description=item.get('description', ''),
            status=item.get('status', 'AVAILABLE'),
            product_id=item.get('productId', ''),
            image_path=item.get('imagePath', ''),
            price=price_value,
            merchant_id=merchant_id,
            user_id=user_id
        )
    
    def get_existing_product(self, merchant_id: str, item_id: str) -> Optional[Dict]:
        """
        Busca produto existente no banco
        Equivalente aos nodes "[GET ALL] Pega todas os Produtos das Lojas"
        """
        try:
            response = self.supabase.table('products')\
                .select("*")\
                .eq('merchant_id', merchant_id)\
                .eq('item_id', item_id)\
                .execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erro ao buscar produto existente: {e}")
            return None
    
    def create_product(self, product: Product, client_id: str):
        """
        Cria novo produto no banco
        Equivalente ao node "[CREATE] Cria o Produto dentro do banco de dados"
        """
        try:
            product_data = {
                'item_id': product.item_id,
                'name': product.name,
                'description': product.description,
                'merchant_id': product.merchant_id,
                'client_id': client_id,
                'is_active': product.status,
                'price': product.price,
                'imagePath': product.image_path,
                'product_id': product.product_id
            }
            
            response = self.supabase.table('products').insert(product_data).execute()
            logger.info(f"Produto criado: {product.item_id}")
            return response.data
            
        except Exception as e:
            logger.error(f"Erro ao criar produto: {e}")
            return None
    
    def update_product_if_needed(self, new_product: Product, existing_product: Dict):
        """
        Atualiza produto se houver mudanças no status
        Equivalente aos nodes de UPDATE
        """
        try:
            # Verificar se o status mudou
            if existing_product.get('is_active') != new_product.status:
                update_data = {
                    'is_active': new_product.status
                }
                
                response = self.supabase.table('products')\
                    .update(update_data)\
                    .eq('merchant_id', new_product.merchant_id)\
                    .eq('item_id', new_product.item_id)\
                    .execute()
                    
                logger.info(f"Status do produto {new_product.item_id} atualizado para {new_product.status}")
                return response.data
                
        except Exception as e:
            logger.error(f"Erro ao atualizar produto: {e}")
            return None
    
    def remove_duplicates(self, items: List[Dict]) -> List[Dict]:
        """
        Remove itens duplicados mantendo apenas os únicos
        Equivalente ao node "[REMOVE] Remove Itens Duplicados e Mantém os Únicos"
        """
        field_counts = {}
        
        # Primeira passagem: contar ocorrências
        for idx, item in enumerate(items):
            for field_name, field_value in item.items():
                key = f"{field_name}:{json.dumps(field_value)}"
                if key not in field_counts:
                    field_counts[key] = []
                field_counts[key].append({
                    'index': idx,
                    'field_name': field_name,
                    'field_value': field_value
                })
        
        # Segunda passagem: criar novos items sem duplicados
        unique_items = []
        for idx, item in enumerate(items):
            cleaned_item = {}
            for field_name, field_value in item.items():
                key = f"{field_name}:{json.dumps(field_value)}"
                # Manter apenas se aparece uma vez
                if len(field_counts[key]) == 1:
                    cleaned_item[field_name] = field_value
            
            if cleaned_item:  # Adicionar apenas se não estiver vazio
                unique_items.append(cleaned_item)
        
        return unique_items