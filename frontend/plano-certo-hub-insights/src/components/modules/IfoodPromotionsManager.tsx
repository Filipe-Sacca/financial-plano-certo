/**
 * iFood Promotions Manager
 * Created: 01/09/2025
 * Purpose: Dashboard for managing iFood promotions
 */

import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Plus, 
  Eye, 
  Calendar,
  Percent,
  Package,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PromotionItem {
  product_id?: string;
  ean?: string;
  discountValue: number;
  initialDate: string;
  finalDate: string;
  promotionType: 'PERCENTAGE' | 'LXPY' | 'VALUE';
  progressiveDiscount?: {
    quantityToBuy: string;
    quantityToPay: string;
  };
}

interface CreatePromotionForm {
  promotionName: string;
  channels: string[];
  items: PromotionItem[];
}

const IfoodPromotionsManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [form, setForm] = useState<CreatePromotionForm>({
    promotionName: '',
    channels: ['IFOOD-APP'],
    items: []
  });
  const [newItem, setNewItem] = useState<PromotionItem>({
    product_id: '',
    ean: '',
    discountValue: 0,
    initialDate: '',
    finalDate: '',
    promotionType: 'PERCENTAGE'
  });

  const userId = 'c1488646-aca8-4220-aacc-00e7ae3d6490';
  const merchantId = '577cb3b1-5845-4fbc-a219-8cd3939cb9ea';
  const API_BASE = 'http://localhost:8085';
  const { toast } = useToast();

  // Load promotions and products on component mount
  useEffect(() => {
    loadPromotions();
    loadProducts();
  }, []);

  // Load available products from database using existing working endpoint
  const loadProducts = async () => {
    try {
      console.log('📦 Loading products from database...');
      
      // Use the existing working endpoint that returns 9 products
      const response = await fetch(`${API_BASE}/merchants/${merchantId}/items?user_id=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        // The endpoint returns data as array directly, not nested in items
        const products = Array.isArray(result.data) ? result.data : result.data?.items || [];
        setAvailableProducts(products);
        console.log('📦 Real products loaded from table:', products.length);
        console.log('📦 Sample product names:', products.slice(0, 3).map(p => p.name));
      } else {
        console.error('❌ Error loading products:', result.error);
        setAvailableProducts([]);
      }
    } catch (error) {
      console.error('❌ Network error loading products:', error);
      setAvailableProducts([]);
    }
  };

  // Load promotions from database
  const loadPromotions = async () => {
    try {
      setLoadingPromotions(true);
      // TEMPORARY: Use a working endpoint pattern
      const response = await fetch(`${API_BASE}/promotions/${merchantId}?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setPromotions(result.data?.promotions || []);
        console.log('🎁 Promotions loaded:', result.data?.promotions?.length || 0);
      } else {
        console.error('❌ Error loading promotions:', result.error);
      }
    } catch (error) {
      console.error('❌ Network error loading promotions:', error);
    } finally {
      setLoadingPromotions(false);
    }
  };

  // Test promotion service health
  const testHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/promotions/health`);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "✅ Serviço Online",
          description: "Módulo de promoções funcionando corretamente"
        });
      } else {
        throw new Error(result.error || 'Health check failed');
      }
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: `Erro no health check: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add item to promotion
  const addItemToPromotion = () => {
    if (!newItem.initialDate || !newItem.finalDate) {
      toast({
        title: "⚠️ Campos Obrigatórios",
        description: "Data inicial e final são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setForm(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem }]
    }));

    setNewItem({
      product_id: '',
      ean: '',
      discountValue: 0,
      initialDate: '',
      finalDate: '',
      promotionType: 'PERCENTAGE'
    });
    
    // Reset date pickers
    setStartDate(undefined);
    setEndDate(undefined);

    const productName = availableProducts.find(p => p.item_id === newItem.product_id)?.name || 
                        newItem.product_id || 
                        newItem.ean || 
                        'sem identificador';
    
    toast({
      title: "✅ Item Adicionado",
      description: `${productName} adicionado à promoção`
    });
  };

  // Create promotion
  const createPromotion = async () => {
    try {
      if (!form.promotionName || form.items.length === 0) {
        toast({
          title: "⚠️ Campos Obrigatórios", 
          description: "Nome da promoção e pelo menos 1 item são obrigatórios",
          variant: "destructive"
        });
        return;
      }

      setLoading(true);

      const promotionData = {
        userId,
        promotions: [{
          promotionName: form.promotionName,
          channels: form.channels,
          items: form.items
        }]
      };

      const response = await fetch(`${API_BASE}/promotions/${merchantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Promoção Criada",
          description: `AggregationId: ${result.data?.aggregationId || 'N/A'}`
        });
        
        // Reset form and reload promotions
        setForm({
          promotionName: '',
          channels: ['IFOOD-APP'],
          items: []
        });
        setShowCreateForm(false);
        loadPromotions();
      } else {
        throw new Error(result.error || 'Erro ao criar promoção');
      }
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6 space-y-6 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promoções iFood</h2>
          <p className="text-muted-foreground">
            Gerenciar promoções e ofertas especiais
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testHealth} disabled={loading}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Testar Conexão
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Promoção
          </Button>
        </div>
      </div>

      {/* Create Promotion Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Criar Nova Promoção
            </CardTitle>
            <CardDescription>
              Seguindo especificações do iFood: status 202, aggregationId response
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Nome da Promoção *</Label>
                <Input
                  value={form.promotionName}
                  onChange={(e) => setForm({...form, promotionName: e.target.value})}
                  placeholder="ex: Desconto de Setembro"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Aggregation Tag será gerado automaticamente
                </p>
              </div>
            </div>

            {/* Add Item Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Adicionar Item à Promoção
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Selecionar Produto</Label>
                  <Select 
                    value={newItem.product_id} 
                    onValueChange={(value) => {
                      const selectedProduct = availableProducts.find(p => p.item_id === value);
                      setNewItem({
                        ...newItem, 
                        product_id: value,
                        ean: selectedProduct?.ean || selectedProduct?.item_id || ''
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um produto do catálogo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.item_id} value={product.item_id}>
                          {product.name} - R$ {product.price} {product.ean ? `(EAN: ${product.ean})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {availableProducts.length} produtos disponíveis
                  </p>
                </div>
                <div>
                  <Label>Tipo de Promoção</Label>
                  <Select 
                    value={newItem.promotionType} 
                    onValueChange={(value) => setNewItem({...newItem, promotionType: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Desconto Percentual (%)</SelectItem>
                      <SelectItem value="VALUE">Desconto em Valor (R$)</SelectItem>
                      <SelectItem value="LXPY">Leve X Pague Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor do Desconto</Label>
                  <Input
                    type="number"
                    value={newItem.discountValue}
                    onChange={(e) => setNewItem({...newItem, discountValue: parseFloat(e.target.value) || 0})}
                    placeholder="ex: 10"
                  />
                </div>
                <div>
                  <Label>Data Inicial *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data inicial"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          if (date) {
                            setNewItem({...newItem, initialDate: format(date, "yyyy-MM-dd")});
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Data Final *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data final"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date);
                          if (date) {
                            setNewItem({...newItem, finalDate: format(date, "yyyy-MM-dd")});
                          }
                        }}
                        disabled={(date) => date < (startDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-end">
                  <Button onClick={addItemToPromotion} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
              </div>

              {/* LXPY Fields */}
              {newItem.promotionType === 'LXPY' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label>Quantidade para Comprar</Label>
                    <Input
                      value={newItem.progressiveDiscount?.quantityToBuy || ''}
                      onChange={(e) => setNewItem({
                        ...newItem, 
                        progressiveDiscount: {
                          ...newItem.progressiveDiscount,
                          quantityToBuy: e.target.value,
                          quantityToPay: newItem.progressiveDiscount?.quantityToPay || ''
                        }
                      })}
                      placeholder="ex: 3"
                    />
                  </div>
                  <div>
                    <Label>Quantidade para Pagar</Label>
                    <Input
                      value={newItem.progressiveDiscount?.quantityToPay || ''}
                      onChange={(e) => setNewItem({
                        ...newItem,
                        progressiveDiscount: {
                          quantityToBuy: newItem.progressiveDiscount?.quantityToBuy || '',
                          quantityToPay: e.target.value
                        }
                      })}
                      placeholder="ex: 2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Items List */}
            {form.items.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Itens da Promoção ({form.items.length})</h4>
                {form.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {(() => {
                          const product = availableProducts.find(p => p.item_id === item.product_id);
                          return product ? `${product.name} - R$ ${product.price}` : 
                                 item.product_id ? `Produto: ${item.product_id}` : 
                                 item.ean ? `EAN: ${item.ean}` : 'Produto sem identificador';
                        })()}
                      </div>
                      {item.product_id && (
                        <div className="text-xs text-gray-500">
                          ID: {item.product_id} {item.ean ? `• EAN: ${item.ean}` : ''}
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        {item.promotionType === 'PERCENTAGE' ? 'Desconto Percentual' :
                         item.promotionType === 'VALUE' ? 'Desconto em Valor' :
                         item.promotionType === 'LXPY' ? 'Leve X Pague Y' : item.promotionType} - {item.discountValue}
                        {item.promotionType === 'PERCENTAGE' ? '%' : item.promotionType === 'VALUE' ? ' reais' : ' unidades'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.initialDate} até {item.finalDate}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => removeItem(index)}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={createPromotion}
                disabled={loading || form.items.length === 0}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Gift className="h-4 w-4 mr-2" />
                )}
                Criar Promoção
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Promoções Ativas
          </CardTitle>
          <CardDescription>
            Lista de promoções criadas e seus status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma promoção encontrada</p>
              <p className="text-sm">Crie sua primeira promoção usando o botão acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promotion: any, index: number) => {
                const promotionItems = promotion.promotion_data?.promotions?.[0]?.items || [];
                const firstItem = promotionItems[0];
                
                // Calculate days remaining
                const calculateDaysRemaining = (finalDate: string) => {
                  const today = new Date();
                  const endDate = new Date(finalDate);
                  const timeDiff = endDate.getTime() - today.getTime();
                  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                  return daysDiff;
                };
                
                // Get product name from availableProducts using product_id
                const getProductName = (productId: string) => {
                  const product = availableProducts.find(p => p.item_id === productId || p.id === productId);
                  return product?.name || productId || 'Produto não encontrado';
                };

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{promotion.promotion_name}</h4>
                          <Badge variant="outline">
                            {promotion.status || 'PENDING'}
                          </Badge>
                        </div>
                        
                        {/* Products in promotion */}
                        <div className="space-y-2 mb-3">
                          {promotionItems.map((item: any, itemIndex: number) => {
                            const daysRemaining = calculateDaysRemaining(item.finalDate);
                            const isExpired = daysRemaining < 0;
                            const productName = getProductName(item.product_id);
                            
                            return (
                              <div key={itemIndex} className="bg-gray-50 rounded p-3 border-l-4 border-l-blue-500">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-gray-900 text-base">{productName}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={item.promotionType === 'PERCENTAGE' ? 'secondary' : 'outline'} className="bg-green-100 text-green-800 border-green-300">
                                      {item.promotionType === 'PERCENTAGE' ? `${item.discountValue}%` : `R$ ${item.discountValue}`}
                                    </Badge>
                                    <Badge variant={isExpired ? 'destructive' : daysRemaining <= 3 ? 'outline' : 'secondary'} className={
                                      isExpired ? 'bg-red-100 text-red-800 border-red-300' : 
                                      daysRemaining <= 3 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                                      'bg-blue-100 text-blue-800 border-blue-300'
                                    }>
                                      {isExpired ? 'Expirada' : `${daysRemaining} dias`}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-gray-600 flex items-center gap-4">
                                  <span>📅 {item.initialDate} até {item.finalDate}</span>
                                  <span>🏷️ {item.promotionType === 'PERCENTAGE' ? 'Desconto Percentual' : 'Desconto em Valor'}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <p className="text-xs text-gray-500">
                          ID: {promotion.aggregation_id} • Criada em {new Date(promotion.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Gift className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promoções Ativas</p>
                <p className="text-xl font-bold">{promotions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Percent className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipos Suportados</p>
                <p className="text-sm font-medium">Percentual, Valor, LXPY</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status da API</p>
                <p className="text-sm font-medium">Pronto para homologação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Info */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>
              Módulo de Promoções - iFood API v1.0 - Status 202 (Accepted) - AggregationId tracking
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IfoodPromotionsManager;