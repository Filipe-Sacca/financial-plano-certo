/**
 * Picking Modal Component
 * Created: 27/08/2025
 * Purpose: Modal for managing order picking/separation process
 * Integrated with IfoodOrdersManager for seamless UX
 */

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  PlayCircle, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Loader2,
  Weight,
  Hash,
  ClipboardList
} from 'lucide-react';

interface PickingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  userId: string;
}

interface PickingStatus {
  orderId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  separationId?: string;
  startedAt?: string;
  completedAt?: string;
  modifiedItems: any[];
}

interface OrderItem {
  uniqueId: string;
  product_id: string;
  name?: string;
  quantity: number;
  price?: number;
  status?: string;
  notes?: string;
}

interface AddItemForm {
  product_id: string;
  quantity: number;
  replacedUniqueId?: string;
  substitution_reason?: string;
  notes?: string;
  weight?: number;
}

const PickingModal: React.FC<PickingModalProps> = ({ 
  isOpen, 
  onClose, 
  orderId, 
  userId 
}) => {
  const [pickingStatus, setPickingStatus] = useState<PickingStatus | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [addItemForm, setAddItemForm] = useState<AddItemForm>({
    product_id: '',
    quantity: 1,
    substitution_reason: '',
    notes: '',
    weight: 0
  });
  
  const { toast } = useToast();
  const API_BASE = 'http://localhost:8085';

  // Fetch picking status
  const fetchPickingStatus = async () => {
    if (!orderId) return;
    
    try {
      const response = await fetch(
        `${API_BASE}/picking/status/${orderId}?userId=${userId}`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        setPickingStatus(data.data);
      } else {
        setPickingStatus({
          orderId,
          status: 'NOT_STARTED',
          modifiedItems: []
        });
      }
    } catch (error) {
      console.error('Error fetching picking status:', error);
      setPickingStatus({
        orderId,
        status: 'NOT_STARTED', 
        modifiedItems: []
      });
    }
  };

  // Mock function to get order items (integrate with real order data)
  const fetchOrderItems = async () => {
    // In real implementation, this would fetch from order details
    // For now, using mock data
    setOrderItems([
      {
        uniqueId: 'item-1',
        product_id: 'prod-123',
        name: 'Pizza Margherita',
        quantity: 2,
        price: 35.90,
        status: 'AVAILABLE'
      },
      {
        uniqueId: 'item-2', 
        product_id: 'prod-456',
        name: 'Coca Cola 2L',
        quantity: 1,
        price: 8.50,
        status: 'AVAILABLE'
      }
    ]);
  };

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true);
      Promise.all([
        fetchPickingStatus(),
        fetchOrderItems()
      ]).finally(() => setLoading(false));
    }
  }, [isOpen, orderId]);

  // Start separation
  const handleStartSeparation = async () => {
    setActionLoading('start');
    try {
      const response = await fetch(`${API_BASE}/picking/startSeparation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          orderId,
          notes: `Iniciando separação do pedido ${orderId}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "✅ Separação Iniciada",
          description: `Separação do pedido ${orderId.substring(0, 8)}... iniciada com sucesso`
        });
        fetchPickingStatus();
      } else {
        throw new Error(result.error?.message || 'Erro ao iniciar separação');
      }
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Add item to order
  const handleAddItem = async () => {
    if (!addItemForm.product_id || addItemForm.quantity <= 0) {
      toast({
        title: "⚠️ Campos Obrigatórios",
        description: "Product ID e quantidade são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setActionLoading('add');
    try {
      const response = await fetch(`${API_BASE}/picking/orders/${orderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...addItemForm
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "✅ Item Adicionado",
          description: `Item ${addItemForm.product_id} adicionado com sucesso`
        });
        
        // Reset form and refresh
        setAddItemForm({
          product_id: '',
          quantity: 1,
          substitution_reason: '',
          notes: '',
          weight: 0
        });
        setShowAddItemForm(false);
        fetchPickingStatus();
        fetchOrderItems();
      } else {
        throw new Error(result.error?.message || 'Erro ao adicionar item');
      }
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Update item
  const handleUpdateItem = async (item: OrderItem, updates: Partial<OrderItem>) => {
    setActionLoading(`update-${item.uniqueId}`);
    try {
      const response = await fetch(
        `${API_BASE}/picking/orders/${orderId}/items/${item.uniqueId}`, 
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            ...updates
          })
        }
      );

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "✅ Item Atualizado",
          description: `Item ${item.name || item.product_id} atualizado`
        });
        setEditingItem(null);
        fetchPickingStatus();
        fetchOrderItems();
      } else {
        throw new Error(result.error?.message || 'Erro ao atualizar item');
      }
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Remove item
  const handleRemoveItem = async (item: OrderItem, reason?: string) => {
    setActionLoading(`remove-${item.uniqueId}`);
    try {
      const queryParams = new URLSearchParams({
        userId,
        ...(reason && { reason })
      });

      const response = await fetch(
        `${API_BASE}/picking/orders/${orderId}/items/${item.uniqueId}?${queryParams}`, 
        { method: 'DELETE' }
      );

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "✅ Item Removido",
          description: `Item ${item.name || item.product_id} removido`
        });
        fetchPickingStatus();
        fetchOrderItems();
      } else {
        throw new Error(result.error?.message || 'Erro ao remover item');
      }
    } catch (error: any) {
      toast({
        title: "❌ Erro", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  // End separation
  const handleEndSeparation = async () => {
    setActionLoading('end');
    try {
      const response = await fetch(`${API_BASE}/picking/endSeparation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          orderId,
          finalValidation: true,
          notes: `Separação do pedido ${orderId} finalizada`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "✅ Separação Finalizada",
          description: `Separação do pedido ${orderId.substring(0, 8)}... concluída`
        });
        fetchPickingStatus();
      } else {
        throw new Error(result.error?.message || 'Erro ao finalizar separação');
      }
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      'NOT_STARTED': { color: 'bg-gray-100 text-gray-800', label: 'Não Iniciada' },
      'IN_PROGRESS': { color: 'bg-blue-100 text-blue-800', label: 'Em Andamento' },
      'COMPLETED': { color: 'bg-green-100 text-green-800', label: 'Concluída' },
      'FAILED': { color: 'bg-red-100 text-red-800', label: 'Falhou' },
      'CANCELLED': { color: 'bg-orange-100 text-orange-800', label: 'Cancelada' }
    };
    const config = configs[status as keyof typeof configs] || configs.NOT_STARTED;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando separação...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gerenciar Separação - Pedido {orderId.substring(0, 8)}...
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status da Separação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Status da Separação
                </span>
                {pickingStatus && getStatusBadge(pickingStatus.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pickingStatus?.status === 'NOT_STARTED' ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Separação ainda não foi iniciada para este pedido
                  </p>
                  <Button 
                    onClick={handleStartSeparation}
                    disabled={actionLoading === 'start'}
                    className="gap-2"
                  >
                    {actionLoading === 'start' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}
                    Iniciar Separação
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Iniciada em:</Label>
                    <p>{pickingStatus?.startedAt ? new Date(pickingStatus.startedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Separation ID:</Label>
                    <p className="font-mono">{pickingStatus?.separationId?.substring(0, 12)}...</p>
                  </div>
                  <div>
                    <Label>Modificações:</Label>
                    <p>{pickingStatus?.modifiedItems?.length || 0} itens modificados</p>
                  </div>
                  <div>
                    <Label>Concluída em:</Label>
                    <p>{pickingStatus?.completedAt ? new Date(pickingStatus.completedAt).toLocaleString() : 'Em andamento'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Itens do Pedido */}
          {pickingStatus?.status === 'IN_PROGRESS' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Itens do Pedido
                  </span>
                  <Button 
                    onClick={() => setShowAddItemForm(true)}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.uniqueId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.name || item.product_id}</div>
                        <div className="text-sm text-gray-600">
                          Quantidade: {item.quantity} | Preço: R$ {item.price?.toFixed(2)}
                        </div>
                        {item.notes && (
                          <div className="text-xs text-gray-500">Obs: {item.notes}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingItem(item)}
                          disabled={actionLoading?.includes(item.uniqueId)}
                          className="gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveItem(item, 'Removido durante separação')}
                          disabled={actionLoading?.includes(item.uniqueId)}
                          className="gap-1 text-red-600 hover:text-red-700"
                        >
                          {actionLoading === `remove-${item.uniqueId}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulário Adicionar Item */}
          {showAddItemForm && (
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product ID *</Label>
                    <Input
                      value={addItemForm.product_id}
                      onChange={(e) => setAddItemForm({...addItemForm, product_id: e.target.value})}
                      placeholder="ID do produto"
                    />
                  </div>
                  <div>
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      value={addItemForm.quantity}
                      onChange={(e) => setAddItemForm({...addItemForm, quantity: parseInt(e.target.value) || 1})}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Peso (opcional)</Label>
                    <Input
                      type="number"
                      value={addItemForm.weight}
                      onChange={(e) => setAddItemForm({...addItemForm, weight: parseFloat(e.target.value) || 0})}
                      step="0.1"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <Label>Motivo da Substituição</Label>
                    <Input
                      value={addItemForm.substitution_reason}
                      onChange={(e) => setAddItemForm({...addItemForm, substitution_reason: e.target.value})}
                      placeholder="Ex: Produto original indisponível"
                    />
                  </div>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={addItemForm.notes}
                    onChange={(e) => setAddItemForm({...addItemForm, notes: e.target.value})}
                    placeholder="Observações sobre o item..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddItem}
                    disabled={actionLoading === 'add'}
                    className="gap-2"
                  >
                    {actionLoading === 'add' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Adicionar Item
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowAddItemForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          {pickingStatus?.status === 'IN_PROGRESS' && (
            <Button
              onClick={handleEndSeparation}
              disabled={actionLoading === 'end'}
              className="gap-2"
            >
              {actionLoading === 'end' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Finalizar Separação
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PickingModal;