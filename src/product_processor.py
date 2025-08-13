"""
Processador de produtos com lógica de deduplicação e validação
"""

import logging
import json
from typing import List, Dict, Set, Tuple
from collections import defaultdict

logger = logging.getLogger(__name__)


class ProductProcessor:
    """
    Classe para processar e dedupplicar produtos
    Implementa a lógica do node Code do N8N
    """
    
    def __init__(self):
        """
        Inicializa o processador
        """
        self.processed_items = set()
        self.field_counts = defaultdict(list)
        
    def remove_duplicates(self, products: List[Dict]) -> List[Dict]:
        """
        Remove produtos duplicados mantendo apenas os únicos
        Implementação equivalente ao node "[REMOVE] Remove Itens Duplicados e Mantém os Únicos"
        
        Args:
            products: Lista de produtos para processar
            
        Returns:
            Lista de produtos únicos
        """
        if not products:
            return []
        
        # Reset para novo processamento
        self.field_counts.clear()
        
        # Primeira passagem: contar ocorrências de cada campo
        for idx, product in enumerate(products):
            for field_name, field_value in product.items():
                # Criar chave única combinando nome do campo e valor
                # Usar JSON.dumps para lidar com objetos/arrays corretamente
                key = f"{field_name}:{json.dumps(field_value, sort_keys=True)}"
                
                self.field_counts[key].append({
                    'index': idx,
                    'field_name': field_name,
                    'field_value': field_value
                })
        
        # Segunda passagem: criar novos produtos removendo campos duplicados
        unique_products = []
        for idx, product in enumerate(products):
            cleaned_product = {}
            
            for field_name, field_value in product.items():
                key = f"{field_name}:{json.dumps(field_value, sort_keys=True)}"
                
                # Manter apenas se este campo+valor aparece apenas uma vez
                if len(self.field_counts[key]) == 1:
                    cleaned_product[field_name] = field_value
            
            # Adicionar apenas se não estiver vazio
            if cleaned_product:
                unique_products.append(cleaned_product)
        
        logger.info(f"Produtos processados: {len(products)} -> {len(unique_products)} únicos")
        return unique_products
    
    def identify_duplicates_by_key(self, products: List[Dict], 
                                  key_fields: List[str]) -> Tuple[List[Dict], List[Dict]]:
        """
        Identifica produtos duplicados baseado em campos chave
        
        Args:
            products: Lista de produtos
            key_fields: Campos para usar como chave de deduplicação
            
        Returns:
            Tupla com (produtos únicos, produtos duplicados)
        """
        seen_keys = set()
        unique = []
        duplicates = []
        
        for product in products:
            # Criar chave baseada nos campos especificados
            key_values = []
            for field in key_fields:
                value = product.get(field, '')
                key_values.append(str(value))
            
            key = '|'.join(key_values)
            
            if key in seen_keys:
                duplicates.append(product)
            else:
                seen_keys.add(key)
                unique.append(product)
        
        logger.info(f"Identificados {len(unique)} únicos e {len(duplicates)} duplicados")
        return unique, duplicates
    
    def merge_product_data(self, existing: Dict, new: Dict, 
                          preserve_fields: List[str] = None) -> Dict:
        """
        Mescla dados de produtos preservando campos específicos
        
        Args:
            existing: Produto existente
            new: Novo produto
            preserve_fields: Campos a preservar do produto existente
            
        Returns:
            Produto mesclado
        """
        merged = new.copy()
        
        if preserve_fields:
            for field in preserve_fields:
                if field in existing:
                    merged[field] = existing[field]
        
        return merged
    
    def validate_product(self, product: Dict) -> Tuple[bool, List[str]]:
        """
        Valida se um produto tem os campos obrigatórios
        
        Args:
            product: Produto para validar
            
        Returns:
            Tupla com (é válido, lista de erros)
        """
        required_fields = ['item_id', 'merchant_id', 'name']
        errors = []
        
        for field in required_fields:
            if not product.get(field):
                errors.append(f"Campo obrigatório ausente: {field}")
        
        # Validações adicionais
        if product.get('price'):
            try:
                price = float(product['price'])
                if price < 0:
                    errors.append("Preço não pode ser negativo")
            except (TypeError, ValueError):
                errors.append("Preço inválido")
        
        return len(errors) == 0, errors
    
    def normalize_product_status(self, status: str) -> str:
        """
        Normaliza o status do produto
        
        Args:
            status: Status original
            
        Returns:
            Status normalizado
        """
        status_map = {
            'AVAILABLE': 'AVAILABLE',
            'UNAVAILABLE': 'UNAVAILABLE',
            'ACTIVE': 'AVAILABLE',
            'INACTIVE': 'UNAVAILABLE',
            'ENABLED': 'AVAILABLE',
            'DISABLED': 'UNAVAILABLE',
            '1': 'AVAILABLE',
            '0': 'UNAVAILABLE',
            'true': 'AVAILABLE',
            'false': 'UNAVAILABLE'
        }
        
        normalized = status_map.get(str(status).upper(), 'AVAILABLE')
        return normalized
    
    def batch_products(self, products: List[Dict], batch_size: int = 100) -> List[List[Dict]]:
        """
        Divide produtos em lotes para processamento
        
        Args:
            products: Lista de produtos
            batch_size: Tamanho do lote
            
        Returns:
            Lista de lotes
        """
        batches = []
        for i in range(0, len(products), batch_size):
            batch = products[i:i + batch_size]
            batches.append(batch)
        
        logger.info(f"Produtos divididos em {len(batches)} lotes de até {batch_size} itens")
        return batches
    
    def extract_product_changes(self, existing: Dict, new: Dict) -> Dict:
        """
        Extrai mudanças entre produto existente e novo
        
        Args:
            existing: Produto existente
            new: Novo produto
            
        Returns:
            Dicionário com as mudanças
        """
        changes = {}
        
        # Campos para comparar
        comparable_fields = [
            'name', 'description', 'price', 'is_active', 
            'status', 'imagePath', 'product_id'
        ]
        
        for field in comparable_fields:
            existing_value = existing.get(field)
            new_value = new.get(field)
            
            if existing_value != new_value:
                changes[field] = {
                    'old': existing_value,
                    'new': new_value
                }
        
        return changes
    
    def should_update_product(self, existing: Dict, new: Dict) -> bool:
        """
        Determina se um produto deve ser atualizado
        
        Args:
            existing: Produto existente
            new: Novo produto
            
        Returns:
            True se deve atualizar
        """
        # Sempre atualizar se o status mudou
        if existing.get('is_active') != new.get('status'):
            return True
        
        # Verificar outras mudanças importantes
        important_fields = ['name', 'price', 'description']
        for field in important_fields:
            if existing.get(field) != new.get(field):
                return True
        
        return False
    
    def prepare_product_for_db(self, product: Dict, additional_data: Dict = None) -> Dict:
        """
        Prepara produto para inserção/atualização no banco
        
        Args:
            product: Dados do produto
            additional_data: Dados adicionais para incluir
            
        Returns:
            Produto preparado para o banco
        """
        db_product = {
            'item_id': product.get('item_id', product.get('id')),
            'name': product.get('name', ''),
            'description': product.get('description', ''),
            'merchant_id': product.get('merchant_id'),
            'is_active': self.normalize_product_status(product.get('status', 'AVAILABLE')),
            'price': product.get('price', {}).get('value', 0) if isinstance(product.get('price'), dict) else product.get('price', 0),
            'imagePath': product.get('imagePath', ''),
            'product_id': product.get('productId', product.get('product_id', ''))
        }
        
        # Adicionar dados adicionais se fornecidos
        if additional_data:
            db_product.update(additional_data)
        
        # Remover campos None
        db_product = {k: v for k, v in db_product.items() if v is not None}
        
        return db_product