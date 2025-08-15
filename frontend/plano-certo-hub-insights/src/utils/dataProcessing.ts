
// Re-export all interfaces and functions from the refactored modules
export type { ProcessedFinancialData, DetailedIfoodData } from './types/financialData';
export { aggregateDataByDate } from './processors/aggregationUtils';
export { processIfoodFinancialData } from './processors/ifoodProcessor';
export { processGenericFinancialData } from './processors/genericProcessor';
