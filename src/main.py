#!/usr/bin/env python3
"""
Script principal para sincronização de produtos iFood
Implementa o polling automático equivalente ao Schedule Trigger do N8N
"""

import sys
import signal
import logging
import schedule
import time
from datetime import datetime
from typing import Optional
import colorlog

from config import Config
from supabase_client import SupabaseClient
from ifood_api_client import IFoodAPIClient
from ifood_product_sync import IFoodProductSync
from product_processor import ProductProcessor


# Configurar logging colorido
def setup_logging():
    """Configura o sistema de logging com cores"""
    handler = colorlog.StreamHandler()
    handler.setFormatter(
        colorlog.ColoredFormatter(
            '%(log_color)s%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S',
            log_colors={
                'DEBUG': 'cyan',
                'INFO': 'green',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'red,bg_white',
            }
        )
    )
    
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, Config.LOG_LEVEL))
    logger.addHandler(handler)
    
    # Adicionar handler para arquivo se configurado
    if Config.LOG_FILE:
        file_handler = logging.FileHandler(Config.LOG_FILE)
        file_handler.setFormatter(
            logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        )
        logger.addHandler(file_handler)
    
    return logger


class ProductSyncScheduler:
    """
    Scheduler para executar sincronização de produtos periodicamente
    Equivalente ao Schedule Trigger do N8N
    """
    
    def __init__(self):
        """Inicializa o scheduler"""
        self.logger = logging.getLogger(__name__)
        self.running = False
        self.sync_system: Optional[IFoodProductSync] = None
        self.processor = ProductProcessor()
        self.last_sync = None
        self.sync_count = 0
        self.error_count = 0
        
        # Configurar manipuladores de sinal para shutdown gracioso
        signal.signal(signal.SIGINT, self.handle_shutdown)
        signal.signal(signal.SIGTERM, self.handle_shutdown)
        
        self.initialize_clients()
    
    def initialize_clients(self):
        """Inicializa os clientes necessários"""
        try:
            self.logger.info("🚀 Inicializando sistema de sincronização...")
            
            # Validar configurações
            Config.validate()
            
            # Inicializar cliente Supabase
            self.supabase_client = SupabaseClient(
                url=Config.SUPABASE_URL,
                key=Config.SUPABASE_KEY
            )
            
            # Inicializar cliente da API do iFood
            self.ifood_client = IFoodAPIClient(
                timeout=Config.IFOOD_API_TIMEOUT,
                retry_attempts=Config.IFOOD_API_RETRY_ATTEMPTS
            )
            
            # Criar sistema de sincronização integrado
            self.sync_system = IFoodProductSyncIntegrated(
                supabase_client=self.supabase_client,
                ifood_api_client=self.ifood_client,
                processor=self.processor,
                config=Config
            )
            
            self.logger.info("✅ Sistema inicializado com sucesso")
            
        except Exception as e:
            self.logger.critical(f"❌ Erro fatal ao inicializar sistema: {e}")
            sys.exit(1)
    
    def sync_job(self):
        """Job de sincronização executado periodicamente"""
        try:
            self.sync_count += 1
            self.logger.info(f"🔄 Iniciando sincronização #{self.sync_count}")
            self.logger.info(f"⏰ Horário: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            start_time = time.time()
            
            # Executar sincronização
            if Config.DRY_RUN:
                self.logger.info("🏃 Executando em modo DRY RUN (sem alterações no banco)")
            
            self.sync_system.run_sync_cycle()
            
            elapsed_time = time.time() - start_time
            self.last_sync = datetime.now()
            
            self.logger.info(f"✅ Sincronização #{self.sync_count} concluída em {elapsed_time:.2f} segundos")
            
        except Exception as e:
            self.error_count += 1
            self.logger.error(f"❌ Erro na sincronização #{self.sync_count}: {e}")
            
            # Se muitos erros consecutivos, pode ser um problema sistêmico
            if self.error_count >= 5:
                self.logger.critical("⚠️  Muitos erros consecutivos. Verifique a configuração.")
    
    def run(self):
        """Inicia o scheduler"""
        self.running = True
        
        self.logger.info("=" * 60)
        self.logger.info("🚀 SISTEMA DE SINCRONIZAÇÃO DE PRODUTOS IFOOD")
        self.logger.info("=" * 60)
        self.logger.info(f"📋 Configurações:")
        self.logger.info(f"   - Intervalo: {Config.SYNC_INTERVAL_MINUTES} minutos")
        self.logger.info(f"   - Batch size: {Config.BATCH_SIZE} produtos")
        self.logger.info(f"   - Modo: {'DRY RUN' if Config.DRY_RUN else 'PRODUÇÃO'}")
        self.logger.info(f"   - Debug: {'Ativado' if Config.DEBUG_MODE else 'Desativado'}")
        self.logger.info("=" * 60)
        
        # Executar primeira sincronização imediatamente
        self.logger.info("🎯 Executando primeira sincronização...")
        self.sync_job()
        
        # Agendar próximas execuções
        schedule.every(Config.SYNC_INTERVAL_MINUTES).minutes.do(self.sync_job)
        
        self.logger.info(f"⏰ Próxima sincronização em {Config.SYNC_INTERVAL_MINUTES} minutos")
        self.logger.info("💡 Pressione Ctrl+C para parar")
        
        # Loop principal
        while self.running:
            try:
                schedule.run_pending()
                time.sleep(1)
            except KeyboardInterrupt:
                break
    
    def handle_shutdown(self, signum, frame):
        """Manipula o shutdown gracioso do sistema"""
        self.logger.info("\n🛑 Sinal de shutdown recebido. Encerrando...")
        self.running = False
        
        # Estatísticas finais
        self.logger.info("=" * 60)
        self.logger.info("📊 ESTATÍSTICAS DA SESSÃO")
        self.logger.info(f"   - Total de sincronizações: {self.sync_count}")
        self.logger.info(f"   - Erros encontrados: {self.error_count}")
        if self.last_sync:
            self.logger.info(f"   - Última sincronização: {self.last_sync.strftime('%Y-%m-%d %H:%M:%S')}")
        self.logger.info("=" * 60)
        self.logger.info("👋 Sistema encerrado com sucesso")
        sys.exit(0)


class IFoodProductSyncIntegrated(IFoodProductSync):
    """
    Versão integrada do sincronizador com processador
    """
    
    def __init__(self, supabase_client, ifood_api_client, processor, config):
        super().__init__(supabase_client, ifood_api_client)
        self.processor = processor
        self.config = config
        self.stats = {
            'products_created': 0,
            'products_updated': 0,
            'products_skipped': 0,
            'errors': 0
        }
    
    def process_category_items(self, items, merchant_id, user_id, client_id):
        """
        Processa itens com deduplicação e validação
        """
        if not items:
            return
        
        # Preparar produtos para processamento
        products_to_process = []
        for item in items:
            product = self.extract_product_data(item, merchant_id, user_id)
            db_product = self.processor.prepare_product_for_db(
                vars(product),
                {'client_id': client_id}
            )
            products_to_process.append(db_product)
        
        # Remover duplicados
        unique_products = self.processor.remove_duplicates(products_to_process)
        
        # Processar em lotes
        batches = self.processor.batch_products(unique_products, self.config.BATCH_SIZE)
        
        for batch in batches:
            self.process_batch(batch, merchant_id)
    
    def process_batch(self, batch, merchant_id):
        """Processa um lote de produtos"""
        for product in batch:
            try:
                # Validar produto
                is_valid, errors = self.processor.validate_product(product)
                if not is_valid:
                    logger.warning(f"Produto inválido {product.get('item_id')}: {errors}")
                    self.stats['errors'] += 1
                    continue
                
                # Verificar se existe
                existing = self.get_existing_product(merchant_id, product['item_id'])
                
                if existing:
                    # Verificar se precisa atualizar
                    if self.processor.should_update_product(existing, product):
                        if not self.config.DRY_RUN:
                            self.update_product_if_needed(product, existing)
                        self.stats['products_updated'] += 1
                    else:
                        self.stats['products_skipped'] += 1
                else:
                    # Criar novo produto
                    if not self.config.DRY_RUN:
                        self.create_product(product, product.get('client_id'))
                    self.stats['products_created'] += 1
                    
            except Exception as e:
                logger.error(f"Erro processando produto: {e}")
                self.stats['errors'] += 1
    
    def run_sync_cycle(self):
        """Executa ciclo com estatísticas"""
        # Resetar estatísticas
        self.stats = {
            'products_created': 0,
            'products_updated': 0,
            'products_skipped': 0,
            'errors': 0
        }
        
        # Executar sincronização
        super().run_sync_cycle()
        
        # Logar estatísticas
        logger.info(f"📊 Estatísticas do ciclo:")
        logger.info(f"   - Produtos criados: {self.stats['products_created']}")
        logger.info(f"   - Produtos atualizados: {self.stats['products_updated']}")
        logger.info(f"   - Produtos ignorados: {self.stats['products_skipped']}")
        logger.info(f"   - Erros: {self.stats['errors']}")


def main():
    """Função principal"""
    # Configurar logging
    logger = setup_logging()
    
    # Criar e executar scheduler
    scheduler = ProductSyncScheduler()
    
    try:
        scheduler.run()
    except Exception as e:
        logger.critical(f"Erro fatal: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()