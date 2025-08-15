"""
Cliente para integração com a API do iFood
"""

import logging
import requests
from typing import List, Dict, Optional
from time import sleep
from urllib.parse import urljoin

logger = logging.getLogger(__name__)


class IFoodAPIClient:
    """
    Cliente para interação com a API do iFood Merchant
    """
    
    BASE_URL = "https://merchant-api.ifood.com.br"
    CATALOG_V2_PATH = "/catalog/v2.0"
    
    def __init__(self, timeout: int = 30, retry_attempts: int = 3):
        """
        Inicializa o cliente da API do iFood
        
        Args:
            timeout: Timeout para requisições em segundos
            retry_attempts: Número de tentativas em caso de erro
        """
        self.timeout = timeout
        self.retry_attempts = retry_attempts
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        logger.info("Cliente iFood API inicializado")
    
    def _make_request(self, method: str, url: str, headers: Dict = None, 
                     params: Dict = None, json_data: Dict = None) -> Optional[Dict]:
        """
        Faz uma requisição HTTP com retry
        
        Args:
            method: Método HTTP (GET, POST, etc)
            url: URL completa para a requisição
            headers: Headers adicionais
            params: Query parameters
            json_data: Dados JSON para POST/PUT
            
        Returns:
            Resposta em formato dict ou None em caso de erro
        """
        for attempt in range(self.retry_attempts):
            try:
                request_headers = self.session.headers.copy()
                if headers:
                    request_headers.update(headers)
                
                response = self.session.request(
                    method=method,
                    url=url,
                    headers=request_headers,
                    params=params,
                    json=json_data,
                    timeout=self.timeout
                )
                
                response.raise_for_status()
                
                if response.content:
                    return response.json()
                return {}
                
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 401:
                    logger.error("Token de acesso inválido ou expirado")
                    raise
                elif e.response.status_code == 404:
                    logger.warning(f"Recurso não encontrado: {url}")
                    return None
                else:
                    logger.error(f"Erro HTTP {e.response.status_code}: {e.response.text}")
                    if attempt < self.retry_attempts - 1:
                        sleep(2 ** attempt)  # Backoff exponencial
                        continue
                    raise
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"Erro na requisição (tentativa {attempt + 1}): {e}")
                if attempt < self.retry_attempts - 1:
                    sleep(2 ** attempt)
                    continue
                raise
        
        return None
    
    def get_merchant_catalogs(self, merchant_id: str, access_token: str) -> List[Dict]:
        """
        Busca os catálogos de um merchant
        Equivalente ao node "[GET] Pega o catálogo do Merchant"
        
        Args:
            merchant_id: ID do merchant
            access_token: Token de acesso OAuth2
            
        Returns:
            Lista de catálogos
        """
        url = f"{self.BASE_URL}{self.CATALOG_V2_PATH}/merchants/{merchant_id}/catalogs"
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        logger.info(f"Buscando catálogos para merchant {merchant_id}")
        response = self._make_request('GET', url, headers=headers)
        
        if response:
            # A resposta pode ser uma lista direta ou um objeto com lista
            if isinstance(response, list):
                catalogs = response
            else:
                catalogs = response.get('data', [response])
            
            logger.info(f"Encontrados {len(catalogs)} catálogos")
            return catalogs
        
        return []
    
    def get_catalog_categories(self, merchant_id: str, catalog_id: str, 
                              access_token: str, include_items: bool = True) -> List[Dict]:
        """
        Busca categorias e produtos de um catálogo
        Equivalente ao node "[GET] Pega as Categorias e os Produtos da Categoria"
        
        Args:
            merchant_id: ID do merchant
            catalog_id: ID do catálogo
            access_token: Token de acesso OAuth2
            include_items: Se deve incluir os itens/produtos
            
        Returns:
            Lista de categorias com seus produtos
        """
        url = f"{self.BASE_URL}{self.CATALOG_V2_PATH}/merchants/{merchant_id}/catalogs/{catalog_id}/categories"
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        params = {}
        
        if include_items:
            params['includeItems'] = 'true'
            params['include_items'] = 'true'  # API pode aceitar ambos os formatos
        
        logger.info(f"Buscando categorias para catálogo {catalog_id}")
        response = self._make_request('GET', url, headers=headers, params=params)
        
        if response:
            # A resposta pode ser uma lista direta ou um objeto com lista
            if isinstance(response, list):
                categories = response
            else:
                categories = response.get('data', [response])
            
            total_items = sum(len(cat.get('items', [])) for cat in categories)
            logger.info(f"Encontradas {len(categories)} categorias com {total_items} produtos")
            return categories
        
        return []
    
    def get_product_details(self, merchant_id: str, catalog_id: str, 
                          product_id: str, access_token: str) -> Optional[Dict]:
        """
        Busca detalhes de um produto específico
        
        Args:
            merchant_id: ID do merchant
            catalog_id: ID do catálogo
            product_id: ID do produto
            access_token: Token de acesso OAuth2
            
        Returns:
            Detalhes do produto ou None
        """
        url = f"{self.BASE_URL}{self.CATALOG_V2_PATH}/merchants/{merchant_id}/catalogs/{catalog_id}/products/{product_id}"
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        logger.info(f"Buscando detalhes do produto {product_id}")
        return self._make_request('GET', url, headers=headers)
    
    def update_product_status(self, merchant_id: str, catalog_id: str, 
                            product_id: str, status: str, access_token: str) -> bool:
        """
        Atualiza o status de um produto no iFood
        
        Args:
            merchant_id: ID do merchant
            catalog_id: ID do catálogo
            product_id: ID do produto
            status: Novo status (AVAILABLE, UNAVAILABLE)
            access_token: Token de acesso OAuth2
            
        Returns:
            True se atualizado com sucesso
        """
        url = f"{self.BASE_URL}{self.CATALOG_V2_PATH}/merchants/{merchant_id}/catalogs/{catalog_id}/products/{product_id}/status"
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        data = {
            'status': status
        }
        
        logger.info(f"Atualizando status do produto {product_id} para {status}")
        response = self._make_request('PUT', url, headers=headers, json_data=data)
        
        return response is not None
    
    def validate_token(self, access_token: str) -> bool:
        """
        Valida se um token de acesso está válido
        
        Args:
            access_token: Token de acesso OAuth2
            
        Returns:
            True se o token é válido
        """
        # Fazer uma requisição simples para validar o token
        url = f"{self.BASE_URL}{self.CATALOG_V2_PATH}/merchants"
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        try:
            response = self._make_request('GET', url, headers=headers)
            return response is not None
        except:
            return False
    
    def batch_get_products(self, merchant_id: str, catalog_id: str, 
                          access_token: str) -> List[Dict]:
        """
        Busca todos os produtos de todas as categorias de um catálogo
        
        Args:
            merchant_id: ID do merchant
            catalog_id: ID do catálogo
            access_token: Token de acesso OAuth2
            
        Returns:
            Lista consolidada de todos os produtos
        """
        categories = self.get_catalog_categories(
            merchant_id, 
            catalog_id, 
            access_token, 
            include_items=True
        )
        
        all_products = []
        for category in categories:
            items = category.get('items', [])
            for item in items:
                # Adicionar informação da categoria ao item
                item['category_id'] = category.get('id')
                item['category_name'] = category.get('name')
                all_products.append(item)
        
        logger.info(f"Total de {len(all_products)} produtos encontrados")
        return all_products