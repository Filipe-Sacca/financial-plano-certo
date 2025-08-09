-- Limpar dados financeiros existentes do iFood para permitir re-upload com datas corretas
DELETE FROM financial_metrics 
WHERE source = 'ifood';