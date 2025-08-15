-- Limpar dados incorretos de julho/2025 que deveriam ser maio/2025
DELETE FROM financial_metrics 
WHERE date >= '2025-07-01' AND source = 'ifood';