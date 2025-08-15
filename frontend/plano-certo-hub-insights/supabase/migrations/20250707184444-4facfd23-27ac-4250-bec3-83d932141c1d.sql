-- Limpar dados incorretos processados pelo processador genérico Excel
DELETE FROM financial_metrics 
WHERE source = 'excel' AND revenue > 100000;