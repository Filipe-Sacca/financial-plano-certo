import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as XLSX from 'xlsx';
import { useClients } from '@/hooks/useClients';
import { useCreateFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { useCreateImportLog, useUpdateImportLog, useImportLogs } from '@/hooks/useImportLogs';
import { useCreateProducts } from '@/hooks/useProducts';
import { useCreateProductSales } from '@/hooks/useProductSales';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadFinancialTemplate, downloadMenuTemplate, downloadProductsTemplate, downloadIfoodTemplate, downloadSalesFunnelTemplate } from '@/utils/excelTemplates';
import { parseExcelDate, detectDateFormat, mapColumnNames, normalizeColumnName } from '@/utils/dateUtils';
import { processIfoodFinancialData, processGenericFinancialData } from '@/utils/dataProcessing';
import { toast } from 'sonner';

export const ExcelUploadModule = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [uploadType, setUploadType] = useState<'financial' | 'ifood' | 'menu' | 'products' | 'sales_funnel'>('financial');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<Record<string, string>>({});
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    errors: number;
    total: number;
    errorDetails?: any[];
  } | null>(null);

  const { data: clients } = useClients();
  const { data: importLogs } = useImportLogs();
  const createFinancialMetrics = useCreateFinancialMetrics();
  const createProducts = useCreateProducts();
  const createProductSales = useCreateProductSales();
  const createImportLog = useCreateImportLog();
  const updateImportLog = useUpdateImportLog();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewData([]);
      setUploadResult(null);
      setDetectedColumns({});
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length > 0) {
            const headers = jsonData[0] as string[];
            const dataRows = jsonData.slice(1, 6); // Primeiras 5 linhas de dados
            
            const columnMapping = mapColumnNames(headers);
            setDetectedColumns(columnMapping);
            
            const previewRows = dataRows.map(row => {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = (row as any[])[index];
              });
              return obj;
            });
            
            setPreviewData(previewRows);
            
            console.log('Arquivo analisado:', {
              totalRows: jsonData.length - 1,
              headers,
              columnMapping,
              sampleData: previewRows[0]
            });
            
            toast.success(`Arquivo carregado! ${jsonData.length - 1} linhas encontradas`);
          }
        } catch (error) {
          console.error('Erro ao ler arquivo:', error);
          toast.error('Erro ao ler arquivo Excel. Verifique se o formato está correto.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const processSalesFunnelData = (data: any[]) => {
    const processed = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const parsePercentage = (value: string | number) => {
          if (typeof value === 'number') return value;
          if (typeof value === 'string') {
            return parseFloat(value.replace(/[+%-]/g, ''));
          }
          return 0;
        };

        const record = {
          client_id: selectedClient,
          date: format(new Date(), 'yyyy-MM-dd'),
          step: row.Etapa || row.etapa || row.ETAPA,
          quantity: parseInt(row.Quantidade || row.quantidade || row.QUANTIDADE || 0),
          conversion_rate_current: parsePercentage(row['Percentual atual'] || row.percentual_atual || 0),
          conversion_rate_previous: parsePercentage(row['Percentual anterior'] || row.percentual_anterior || 0),
          growth_rate: parsePercentage(row['Percentual comparativo ao período anterior'] || row.crescimento || 0),
          source: 'sales_funnel'
        };

        processed.push(record);
      } catch (error) {
        errors.push({
          row: i + 1,
          error: `Erro ao processar linha: ${error.message}`
        });
      }
    }

    return { processed, errors };
  };

  const processProductsData = (data: any[]) => {
    const processed = [];
    const errors = [];
    const productsToCreate = [];
    const salesToCreate = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const productName = row['Nome do item'] || row.nome || row.NOME || '';
        const category = row.Categoria || row.categoria || row.CATEGORIA || '';
        const ranking = parseInt(row['Posição no ranking'] || row.posicao || row.POSICAO || 0);
        const visits = parseInt(row.Visitas || row.visitas || row.VISITAS || 0);
        const sales = parseInt(row.Vendas || row.vendas || row.VENDAS || 0);
        
        let totalSales = row['Total vendas'] || row.total_vendas || row.TOTAL_VENDAS || '';
        if (typeof totalSales === 'string') {
          totalSales = parseFloat(totalSales.replace(/[R$\s.]/g, '').replace(',', '.'));
        } else {
          totalSales = parseFloat(totalSales) || 0;
        }

        const averagePrice = sales > 0 ? totalSales / sales : 0;

        const product = {
          client_id: selectedClient,
          name: productName,
          category: category,
          price: averagePrice,
          is_active: true
        };

        productsToCreate.push(product);

        const productSale = {
          client_id: selectedClient,
          date: format(new Date(), 'yyyy-MM-dd'),
          ranking: ranking,
          views: visits,
          quantity_sold: sales,
          revenue: totalSales,
          conversions: sales,
          clicks: visits,
          source: 'products'
        };

        salesToCreate.push(productSale);

      } catch (error) {
        errors.push({
          row: i + 1,
          error: `Erro ao processar linha: ${error.message}`
        });
      }
    }

    return { 
      processed: { products: productsToCreate, sales: salesToCreate }, 
      errors 
    };
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedClient) {
      toast.error('Selecione um arquivo e um cliente');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setUploadResult(null);

    try {
      const importLog = await createImportLog.mutateAsync({
        client_id: selectedClient,
        file_name: selectedFile.name,
        file_type: uploadType,
        status: 'processing'
      });

      setProgress(10);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log('📋 DADOS LIDOS DO EXCEL:');
          console.log('Total de linhas:', jsonData.length);
          console.log('Headers:', Object.keys(jsonData[0] || {}));
          console.log('Primeira linha:', JSON.stringify(jsonData[0], null, 2));
          console.log('Segunda linha:', JSON.stringify(jsonData[1], null, 2));

          setProgress(25);

          let processedData, errors;

          if (uploadType === 'ifood') {
            console.log('🚀 INICIANDO PROCESSAMENTO IFOOD MELHORADO...');
            const result = processIfoodFinancialData(jsonData, selectedClient);
            processedData = result.processed;
            errors = result.errors;
            
            console.log('📈 RESULTADO DO PROCESSAMENTO:');
            console.log('Registros processados:', processedData?.length || 0);
            console.log('Erros encontrados:', errors?.length || 0);
            
            // Validação de totais
            if (processedData && processedData.length > 0) {
              const totalRevenue = processedData.reduce((sum, p) => sum + p.revenue, 0);
              const totalOrders = processedData.reduce((sum, p) => sum + p.orders_count, 0);
              console.log('💰 VALIDAÇÃO - Receita Total:', totalRevenue.toFixed(2));
              console.log('📦 VALIDAÇÃO - Total Pedidos:', totalOrders);
              
              if (totalRevenue === 0) {
                console.error('❌ ERRO: Receita total zerada! Verifique o processamento.');
                toast.error('Erro: Receita total zerada. Verifique o arquivo e tente novamente.');
                setIsProcessing(false);
                return;
              }
            }
          } else if (uploadType === 'financial') {
            const columnMapping = mapColumnNames(Object.keys(jsonData[0] || {}));
            const result = processGenericFinancialData(jsonData, selectedClient, columnMapping);
            processedData = result.processed;
            errors = result.errors;
          } else if (uploadType === 'sales_funnel') {
            const result = processSalesFunnelData(jsonData);
            processedData = result.processed;
            errors = result.errors;
          } else if (uploadType === 'products') {
            const result = processProductsData(jsonData);
            processedData = result.processed;
            errors = result.errors;
          }

          setProgress(50);

          console.log('💾 SALVANDO DADOS PROCESSADOS:');
          console.log('Tipo:', uploadType);
          console.log('Quantidade:', Array.isArray(processedData) ? processedData.length : 
                     (processedData?.products?.length || 0) + (processedData?.sales?.length || 0));

          if (processedData && Array.isArray(processedData) && processedData.length > 0) {
            if (uploadType === 'financial' || uploadType === 'ifood') {
              console.log('💽 Salvando métricas financeiras...');
              console.log('Dados para salvar:', JSON.stringify(processedData.slice(0, 2), null, 2));
              await createFinancialMetrics.mutateAsync(processedData);
              console.log('✅ Métricas financeiras salvas com sucesso');
            }
          } else if (processedData && !Array.isArray(processedData)) {
            if (uploadType === 'products') {
              if (processedData.products?.length > 0) {
                await createProducts.mutateAsync(processedData.products);
              }
              if (processedData.sales?.length > 0) {
                await createProductSales.mutateAsync(processedData.sales);
              }
              console.log('✅ Produtos e vendas salvos com sucesso');
            }
          }

          setProgress(75);

          const successCount = Array.isArray(processedData) ? processedData.length : 
                              (processedData?.products?.length || 0) + (processedData?.sales?.length || 0);

          await updateImportLog.mutateAsync({
            id: importLog.id,
            records_count: jsonData.length,
            success_count: successCount,
            error_count: errors?.length || 0,
            errors: errors,
            status: 'completed'
          });

          setProgress(100);
          setUploadResult({
            success: successCount,
            errors: errors?.length || 0,
            total: jsonData.length,
            errorDetails: errors
          });

          if (successCount > 0) {
            toast.success(`✅ Upload concluído! ${successCount} registros importados com sucesso.`);
            
            // Forçar recarregamento dos dados
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            toast.error('❌ Nenhum registro foi importado. Verifique o formato do arquivo e os logs no console.');
          }

        } catch (error) {
          console.error('💥 ERRO NO PROCESSAMENTO:', error);
          await updateImportLog.mutateAsync({
            id: importLog.id,
            status: 'failed',
            errors: [{ error: error.message }]
          });
          toast.error(`Erro no processamento: ${error.message}`);
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error('💥 ERRO NO UPLOAD:', error);
      setIsProcessing(false);
      toast.error('Erro ao iniciar upload');
    }
  };

  const downloadTemplate = () => {
    switch (uploadType) {
      case 'financial':
        downloadFinancialTemplate();
        break;
      case 'ifood':
        downloadIfoodTemplate();
        break;
      case 'menu':
        downloadMenuTemplate();
        break;
      case 'products':
        downloadProductsTemplate();
        break;
      case 'sales_funnel':
        downloadSalesFunnelTemplate();
        break;
    }
    toast.success('Template baixado com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload de Arquivos Excel</h1>
        <p className="text-muted-foreground">
          Importe dados de vendas, cardápio, produtos e funil de vendas através de planilhas Excel
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Como usar:</strong> 1) Baixe o template, 2) Preencha com seus dados, 3) Selecione o cliente e tipo, 4) Faça o upload
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Arquivo
            </CardTitle>
            <CardDescription>
              Selecione o arquivo Excel e configure a importação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client-select">Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="upload-type">Tipo de Dados</Label>
              <Select value={uploadType} onValueChange={(value: any) => setUploadType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ifood">Dados do iFood</SelectItem>
                  <SelectItem value="financial">Dados Financeiros Genéricos</SelectItem>
                  <SelectItem value="sales_funnel">Funil de Vendas</SelectItem>
                  <SelectItem value="products">Produtos e Performance</SelectItem>
                  <SelectItem value="menu">Dados do Cardápio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file-upload">Arquivo Excel</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
            </div>

            {Object.keys(detectedColumns).length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Colunas Detectadas:</h4>
                <div className="text-sm text-green-700">
                  {Object.entries(detectedColumns).map(([key, value]) => (
                    <div key={key}>• {key}: "{value}"</div>
                  ))}
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processando...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedClient || isProcessing}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processando...' : 'Fazer Upload'}
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>

            {uploadResult && (
              <Alert className={uploadResult.success > 0 ? '' : 'border-orange-200 bg-orange-50'}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload concluído: {uploadResult.success} registros importados com sucesso
                  {uploadResult.errors > 0 && (
                    <span className="text-orange-600">
                      , {uploadResult.errors} erros de {uploadResult.total} total.
                    </span>
                  )}
                  {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">Ver detalhes dos erros</summary>
                      <div className="mt-2 text-xs max-h-32 overflow-y-auto">
                        {uploadResult.errorDetails.slice(0, 5).map((error, index) => (
                          <div key={index} className="border-l-2 border-red-200 pl-2 mb-1">
                            Linha {error.row}: {error.error}
                          </div>
                        ))}
                        {uploadResult.errorDetails.length > 5 && (
                          <div className="text-gray-500">... e mais {uploadResult.errorDetails.length - 5} erros</div>
                        )}
                      </div>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview dos Dados</CardTitle>
            <CardDescription>
              Visualização das primeiras linhas do arquivo selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewData.length > 0 ? (
              <div className="overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(previewData[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value: any, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {String(value).slice(0, 50)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um arquivo para visualizar os dados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Importações</CardTitle>
          <CardDescription>
            Últimas importações realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {importLogs && importLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registros</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.file_name}</TableCell>
                    <TableCell>{(log as any).clients?.name || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{log.file_type}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.status === 'completed' ? 'bg-green-100 text-green-800' :
                        log.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.success_count}/{log.records_count}
                      {log.error_count > 0 && (
                        <span className="text-red-500 ml-1">
                          ({log.error_count} erros)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma importação realizada ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
