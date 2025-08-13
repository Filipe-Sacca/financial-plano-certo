"""
Configurações do sistema de sincronização
"""

import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()


class Config:
    """
    Classe de configuração centralizada
    """
    
    # Configurações do Supabase
    SUPABASE_URL = os.getenv('SUPABASE_URL', '')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')
    
    # Configurações do iFood API
    IFOOD_API_BASE_URL = os.getenv('IFOOD_API_BASE_URL', 'https://merchant-api.ifood.com.br')
    IFOOD_API_TIMEOUT = int(os.getenv('IFOOD_API_TIMEOUT', '30'))
    IFOOD_API_RETRY_ATTEMPTS = int(os.getenv('IFOOD_API_RETRY_ATTEMPTS', '3'))
    
    # Configurações do Scheduler
    SYNC_INTERVAL_MINUTES = int(os.getenv('SYNC_INTERVAL_MINUTES', '5'))
    
    # Configurações de processamento
    BATCH_SIZE = int(os.getenv('BATCH_SIZE', '100'))
    MAX_CONCURRENT_MERCHANTS = int(os.getenv('MAX_CONCURRENT_MERCHANTS', '5'))
    
    # Configurações de logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'ifood_sync.log')
    
    # Configurações de validação
    REQUIRED_PRODUCT_FIELDS = ['item_id', 'merchant_id', 'name']
    
    # Configurações de status
    VALID_PRODUCT_STATUSES = ['AVAILABLE', 'UNAVAILABLE']
    DEFAULT_PRODUCT_STATUS = 'AVAILABLE'
    
    # Configurações de deduplicação
    DEDUP_KEY_FIELDS = ['merchant_id', 'item_id']
    
    # Configurações de performance
    ENABLE_CACHING = os.getenv('ENABLE_CACHING', 'true').lower() == 'true'
    CACHE_TTL_SECONDS = int(os.getenv('CACHE_TTL_SECONDS', '300'))
    
    # Configurações de modo de execução
    DRY_RUN = os.getenv('DRY_RUN', 'false').lower() == 'true'
    DEBUG_MODE = os.getenv('DEBUG_MODE', 'false').lower() == 'true'
    
    @classmethod
    def validate(cls):
        """
        Valida se as configurações obrigatórias estão presentes
        
        Raises:
            ValueError: Se configurações obrigatórias estiverem faltando
        """
        errors = []
        
        if not cls.SUPABASE_URL:
            errors.append("SUPABASE_URL não configurado")
        
        if not cls.SUPABASE_KEY:
            errors.append("SUPABASE_KEY não configurado")
        
        if errors:
            raise ValueError(f"Erros de configuração: {', '.join(errors)}")
    
    @classmethod
    def get_config_dict(cls):
        """
        Retorna todas as configurações como dicionário
        
        Returns:
            Dict com todas as configurações
        """
        return {
            'supabase': {
                'url': cls.SUPABASE_URL,
                'key': '***' if cls.SUPABASE_KEY else None  # Não expor a chave
            },
            'ifood_api': {
                'base_url': cls.IFOOD_API_BASE_URL,
                'timeout': cls.IFOOD_API_TIMEOUT,
                'retry_attempts': cls.IFOOD_API_RETRY_ATTEMPTS
            },
            'scheduler': {
                'sync_interval_minutes': cls.SYNC_INTERVAL_MINUTES
            },
            'processing': {
                'batch_size': cls.BATCH_SIZE,
                'max_concurrent_merchants': cls.MAX_CONCURRENT_MERCHANTS
            },
            'logging': {
                'level': cls.LOG_LEVEL,
                'file': cls.LOG_FILE
            },
            'performance': {
                'caching_enabled': cls.ENABLE_CACHING,
                'cache_ttl': cls.CACHE_TTL_SECONDS
            },
            'mode': {
                'dry_run': cls.DRY_RUN,
                'debug': cls.DEBUG_MODE
            }
        }


# Validar configurações ao importar
try:
    Config.validate()
except ValueError as e:
    print(f"⚠️  Aviso de configuração: {e}")
    print("Por favor, configure as variáveis de ambiente necessárias no arquivo .env")