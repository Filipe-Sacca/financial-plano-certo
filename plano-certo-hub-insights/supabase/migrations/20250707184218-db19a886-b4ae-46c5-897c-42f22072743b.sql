-- Clean up any financial_metrics records with zero revenue that are polluting the database
DELETE FROM financial_metrics 
WHERE revenue = 0 OR revenue IS NULL;