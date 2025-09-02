/**
 * iFood Orders Manager
 * Created: 19/08/2025
 * Purpose: Dashboard for monitoring iFood orders with real-time polling status
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Play, 
  Square, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  Activity,
  Check,
  X,
  Package,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import PickingModal from './PickingModal';

interface PollingStatus {
  isRunning: boolean;
  userId: string;
  startedAt: string;
  nextPollingAt: string;
  consecutiveErrors: number;
  metrics: {
    pollingAccuracy: number;
    acknowledgmentRate: number;
    avgApiResponseTime: number;
    errorRate: number;
  };
}

interface Order {
  id: string;
  ifood_order_id: string;
  merchant_id: string;
  status: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount?: number;
  created_at: string;
  order_data: any;
}

interface Event {
  id: string;
  event_id: string;
  event_type: string;
  event_category: string;
  merchant_id: string;
  acknowledgment_success: boolean;
  received_at: string;
  acknowledged_at?: string;
  event_data: any;
}

const IfoodOrdersManager: React.FC = () => {
  const [pollingStatus, setPollingStatus] = useState<PollingStatus | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<string>('577cb3b1-5845-4fbc-a219-8cd3939cb9ea');
  const [pickingModalOpen, setPickingModalOpen] = useState(false);
  const [selectedOrderForPicking, setSelectedOrderForPicking] = useState<string>('');
  const userId = 'c1488646-aca8-4220-aacc-00e7ae3d6490'; // Real user ID from database
  const { toast } = useToast();

  const API_BASE = 'http://localhost:8085';

  // Fetch polling status
  const fetchPollingStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/polling/status/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setPollingStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching polling status:', error);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/orders/${selectedMerchant}?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data?.orders || []);
        console.log('📦 Orders fetched:', data.data?.orders?.length || 0);
      } else {
        console.error('❌ Error fetching orders:', data.error);
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Network error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch completed orders for merchant
  const fetchCompletedOrders = async () => {
    try {
      setLoadingCompleted(true);
      const response = await fetch(`${API_BASE}/orders/${selectedMerchant}/completed?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setCompletedOrders(data.data?.orders || []);
        console.log('✅ Completed orders fetched:', data.data?.orders?.length || 0);
      } else {
        console.error('❌ Error fetching completed orders:', data.error);
        setCompletedOrders([]);
      }
    } catch (error) {
      console.error('❌ Network error fetching completed orders:', error);
      setCompletedOrders([]);
    } finally {
      setLoadingCompleted(false);
    }
  };

  // Start polling
  const startPolling = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/polling/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "🚀 Polling Iniciado",
          description: "Sistema de polling iFood ativo (30s intervals)"
        });
        fetchPollingStatus();
      } else {
        toast({
          title: "❌ Erro",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error starting polling:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao iniciar polling",
        variant: "destructive"
      });
    }
  };

  // Stop polling
  const stopPolling = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/polling/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "🛑 Polling Parado",
          description: "Sistema de polling iFood desativado"
        });
        setPollingStatus(null);
      }
    } catch (error) {
      console.error('Error stopping polling:', error);
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPollingStatus();
      if (selectedMerchant) {
        fetchOrders();
        fetchCompletedOrders();
      }
    }, 10000);

    // Initial fetch
    fetchPollingStatus();
    if (selectedMerchant) {
      fetchOrders();
      fetchCompletedOrders();
    }

    return () => clearInterval(interval);
  }, [selectedMerchant]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',      // Aguardando separação
      'PREPARING': 'bg-orange-100 text-orange-800 border-orange-200',    // Em separação
      'CONFIRMED': 'bg-blue-100 text-blue-800 border-blue-200',          // Pronto para entrega  
      'DELIVERED': 'bg-green-100 text-green-800 border-green-200',       // Entregue
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200'              // Cancelado
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Action handlers - IMPLEMENTAÇÃO REAL
  const [loadingActions, setLoadingActions] = useState<Record<string, 'confirming' | 'cancelling' | 'completing' | null>>({});

  const handleConfirmOrder = async (orderId: string) => {
    try {
      console.log('🔄 Confirmando pedido:', orderId);
      setLoadingActions(prev => ({ ...prev, [orderId]: 'confirming' }));
      
      const response = await fetch(`${API_BASE}/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const result = await response.json();
      console.log('📋 Resultado da confirmação:', result);
      
      if (result.success) {
        toast({
          title: "✅ Pedido Confirmado",
          description: `Pedido ${orderId.substring(0, 8)}... confirmado com sucesso!`
        });
        
        // Refresh orders list
        await fetchOrders();
      } else {
        throw new Error(result.error || 'Erro ao confirmar pedido');
      }
    } catch (error: any) {
      console.error('❌ Erro ao confirmar pedido:', error);
      toast({
        title: "❌ Erro",
        description: `Erro ao confirmar pedido: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      console.log('🚫 Cancelando pedido:', orderId);
      setLoadingActions(prev => ({ ...prev, [orderId]: 'cancelling' }));
      
      const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId,
          reason: 'Cancelado pelo merchant via dashboard'
        }),
      });
      
      const result = await response.json();
      console.log('📋 Resultado do cancelamento:', result);
      
      if (result.success) {
        toast({
          title: "🚫 Pedido Cancelado",
          description: `Pedido ${orderId.substring(0, 8)}... cancelado com sucesso!`
        });
        
        // Refresh orders list (cancelled order will be filtered out)
        await fetchOrders();
      } else {
        throw new Error(result.error || 'Erro ao cancelar pedido');
      }
    } catch (error: any) {
      console.error('❌ Erro ao cancelar pedido:', error);
      toast({
        title: "❌ Erro",
        description: `Erro ao cancelar pedido: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      console.log('🏁 Concluindo pedido:', orderId);
      setLoadingActions(prev => ({ ...prev, [orderId]: 'completing' }));
      
      const response = await fetch(`${API_BASE}/orders/${orderId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const result = await response.json();
      console.log('📋 Resultado da conclusão:', result);
      
      if (result.success) {
        toast({
          title: "🏁 Pedido Concluído",
          description: `Pedido ${orderId.substring(0, 8)}... marcado como concluído!`
        });
        
        // Refresh both lists
        await Promise.all([fetchOrders(), fetchCompletedOrders()]);
      } else {
        throw new Error(result.error || 'Erro ao concluir pedido');
      }
    } catch (error: any) {
      console.error('❌ Erro ao concluir pedido:', error);
      toast({
        title: "❌ Erro",
        description: `Erro ao concluir pedido: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [orderId]: null }));
    }
  };

  // Open picking modal
  const handleOpenPicking = (orderId: string) => {
    setSelectedOrderForPicking(orderId);
    setPickingModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pedidos iFood</h2>
          <p className="text-muted-foreground">
            Monitor de pedidos em tempo real com polling automático
          </p>
        </div>
      </div>

      {/* Polling Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status do Polling
          </CardTitle>
          <CardDescription>
            Sistema de monitoramento automático a cada 30 segundos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Polling Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {pollingStatus?.isRunning ? (
                  <>
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-600">ATIVO</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 bg-gray-400 rounded-full" />
                    <span className="text-sm font-medium text-gray-600">INATIVO</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={startPolling}
                  disabled={pollingStatus?.isRunning}
                  className="flex items-center gap-1"
                >
                  <Play className="h-3 w-3" />
                  Iniciar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={stopPolling}
                  disabled={!pollingStatus?.isRunning}
                  className="flex items-center gap-1"
                >
                  <Square className="h-3 w-3" />
                  Parar
                </Button>
              </div>
            </div>

            {/* Metrics */}
            {pollingStatus && (
              <>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Precisão Timing</p>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-green-600">
                      {pollingStatus.metrics.pollingAccuracy}%
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Taxa Acknowledgment</p>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {pollingStatus.metrics.acknowledgmentRate}%
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Resp. API Média</p>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(pollingStatus.metrics.avgApiResponseTime)}ms
                    </div>
                    <Clock className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
              </>
            )}
          </div>

          {pollingStatus?.isRunning && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>Próximo polling: {new Date(pollingStatus.nextPollingAt).toLocaleTimeString()}</span>
              </div>
            </div>
          )}

          {pollingStatus?.consecutiveErrors > 0 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {pollingStatus.consecutiveErrors} erros consecutivos detectados
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Pedidos Recentes
          </CardTitle>
          <CardDescription>
            Pedidos processados automaticamente via virtual bag
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pedido encontrado</p>
              <p className="text-sm">Aguardando pedidos do sistema de polling...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(orders || []).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.ifood_order_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{order.customer_phone || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.total_amount ? `R$ ${order.total_amount.toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        {/* FLUXO CORRETO: PENDING → Separação → Confirmar → Concluir */}
                        
                        {/* Etapa 1: Ações para pedidos PENDING */}
                        {order.status === 'PENDING' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                              onClick={() => {
                                console.log('🎯 Botão Confirmar clicado para pedido:', order.ifood_order_id);
                                handleConfirmOrder(order.ifood_order_id);
                              }}
                              disabled={!!loadingActions[order.ifood_order_id]}
                            >
                              {loadingActions[order.ifood_order_id] === 'confirming' ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3 mr-1" />
                              )}
                              Confirmar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                              onClick={() => handleOpenPicking(order.ifood_order_id)}
                            >
                              <Package className="h-3 w-3 mr-1" />
                              Separação
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="cursor-pointer"
                              onClick={() => {
                                console.log('🎯 Botão Cancelar clicado para pedido:', order.ifood_order_id);
                                handleCancelOrder(order.ifood_order_id);
                              }}
                              disabled={!!loadingActions[order.ifood_order_id]}
                            >
                              {loadingActions[order.ifood_order_id] === 'cancelling' ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <X className="h-3 w-3 mr-1" />
                              )}
                              Cancelar
                            </Button>
                          </>
                        )}
                        
                        {/* Etapa 2: Continuar Separação (PREPARING) */}
                        {order.status === 'PREPARING' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                              onClick={() => handleOpenPicking(order.ifood_order_id)}
                            >
                              <Package className="h-3 w-3 mr-1" />
                              Continuar Separação
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="cursor-pointer"
                              onClick={() => {
                                console.log('🎯 Botão Cancelar clicado para pedido:', order.ifood_order_id);
                                handleCancelOrder(order.ifood_order_id);
                              }}
                              disabled={!!loadingActions[order.ifood_order_id]}
                            >
                              {loadingActions[order.ifood_order_id] === 'cancelling' ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <X className="h-3 w-3 mr-1" />
                              )}
                              Cancelar
                            </Button>
                          </>
                        )}
                        
                        {/* Etapa 3: Confirmar Entrega (CONFIRMED) */}
                        {order.status === 'CONFIRMED' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                            onClick={() => {
                              console.log('🎯 Botão Confirmar Entrega clicado para pedido:', order.ifood_order_id);
                              handleCompleteOrder(order.ifood_order_id);
                            }}
                            disabled={!!loadingActions[order.ifood_order_id]}
                          >
                            {loadingActions[order.ifood_order_id] === 'completing' ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            Confirmar Entrega
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Seção de Pedidos Concluídos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>Pedidos Concluídos</span>
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
              {completedOrders.length} finalizados
            </Badge>
          </CardTitle>
          <CardDescription>
            Histórico de pedidos que foram entregues/finalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCompleted ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Carregando pedidos concluídos...</span>
            </div>
          ) : completedOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Nenhum pedido concluído</p>
              <p className="text-sm">Pedidos finalizados aparecerão aqui</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Concluído em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedOrders.map((order) => (
                  <TableRow key={order.id} className="bg-green-50/30">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {order.ifood_order_id.substring(0, 8)}...
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {order.ifood_order_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {order.customer_name || 'Cliente não informado'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        CONCLUÍDO
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.total_amount ? `R$ ${order.total_amount.toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {order.delivered_at ? 
                        new Date(order.delivered_at).toLocaleString('pt-BR') : 
                        new Date(order.updated_at).toLocaleString('pt-BR')
                      }
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status dos Pedidos</p>
                <p className="text-sm font-medium">
                  ✅ {orders?.filter(o => o.status === 'CONFIRMED').length || 0} Confirmados
                </p>
                <p className="text-xs text-muted-foreground">
                  ⏳ {orders?.filter(o => o.status === 'PENDING').length || 0} Pendentes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pedidos</p>
                <p className="text-xl font-bold">{orders?.length || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Pendentes: {orders?.filter(o => o.status === 'PENDING').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold">
                  R$ {(orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Hoje: {orders?.filter(o => {
                    const today = new Date().toDateString();
                    return new Date(o.created_at).toDateString() === today;
                  }).length || 0} pedidos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="text-sm">{new Date().toLocaleTimeString('pt-BR')}</p>
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
              Sistema conectado ao backend ({API_BASE}) - 
              Polling automático a cada 30s - 
              Virtual Bag Processing ativo
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Picking */}
      <PickingModal
        isOpen={pickingModalOpen}
        onClose={() => setPickingModalOpen(false)}
        orderId={selectedOrderForPicking}
        userId={userId}
      />
    </div>
  );
};

export default IfoodOrdersManager;