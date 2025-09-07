/**
 * Página de Rastreamento para Entregadores
 * Acesso via: /delivery/:orderId ou /delivery/:trackingCode
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Package, Navigation, CheckCircle } from 'lucide-react';

interface DeliveryInfo {
  orderId: string;
  displayId: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    complement?: string;
    neighborhood: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  items: Array<{
    name: string;
    quantity: number;
    observations?: string;
  }>;
  payment: {
    method: string;
    paid: boolean;
    change?: number;
  };
  status: string;
  restaurant: {
    name: string;
    address: string;
    phone: string;
  };
}

export function DeliveryTracking() {
  const { orderId } = useParams();
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    loadDeliveryInfo();
  }, [orderId]);

  const loadDeliveryInfo = async () => {
    try {
      // Aqui você buscaria as informações do pedido
      // Por enquanto, vamos simular com dados de exemplo
      const mockData: DeliveryInfo = {
        orderId: orderId || '',
        displayId: '#1234',
        customer: {
          name: 'João Silva',
          phone: '(11) 98765-4321',
          address: 'Rua das Flores, 123',
          complement: 'Apto 45',
          neighborhood: 'Vila Madalena',
          city: 'São Paulo',
          coordinates: {
            lat: -23.5505,
            lng: -46.6333
          }
        },
        items: [
          { name: 'Hambúrguer Especial', quantity: 1, observations: 'Sem cebola' },
          { name: 'Batata Frita', quantity: 1 },
          { name: 'Coca-Cola', quantity: 1 }
        ],
        payment: {
          method: 'Cartão de Crédito',
          paid: true
        },
        status: 'DISPATCHED',
        restaurant: {
          name: 'Sua Loja',
          address: 'Rua Principal, 456',
          phone: '(11) 3456-7890'
        }
      };

      setDelivery(mockData);
      setCurrentStatus(mockData.status);
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      // Aqui você enviaria a atualização para o servidor
      console.log('Atualizando status para:', newStatus);
      setCurrentStatus(newStatus);
      
      // Feedback visual
      const statusMessages: Record<string, string> = {
        'ARRIVED_AT_PICKUP': 'Você chegou no restaurante',
        'IN_TRANSIT': 'Saindo para entrega',
        'ARRIVED_AT_DELIVERY': 'Você chegou no cliente',
        'DELIVERED': 'Entrega concluída!'
      };
      
      alert(statusMessages[newStatus] || 'Status atualizado');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const openInMaps = () => {
    if (delivery?.customer.coordinates) {
      const { lat, lng } = delivery.customer.coordinates;
      // Abre no Google Maps
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      // Abre com o endereço
      const address = `${delivery?.customer.address}, ${delivery?.customer.neighborhood}, ${delivery?.customer.city}`;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
    }
  };

  const callCustomer = () => {
    if (delivery?.customer.phone) {
      window.location.href = `tel:${delivery.customer.phone.replace(/\D/g, '')}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Carregando informações da entrega...</p>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-500">Entrega não encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header com status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Entrega {delivery.displayId}</CardTitle>
              <Badge variant={currentStatus === 'DELIVERED' ? 'default' : 'secondary'}>
                {currentStatus}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Entregar para
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{delivery.customer.name}</p>
              <p className="text-sm text-gray-600">{delivery.customer.address}</p>
              {delivery.customer.complement && (
                <p className="text-sm text-gray-600">{delivery.customer.complement}</p>
              )}
              <p className="text-sm text-gray-600">
                {delivery.customer.neighborhood} - {delivery.customer.city}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={openInMaps}
                className="flex-1"
                variant="default"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Abrir no Maps
              </Button>
              <Button 
                onClick={callCustomer}
                className="flex-1"
                variant="outline"
              >
                <Phone className="h-4 w-4 mr-2" />
                Ligar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Itens do Pedido */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Itens do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {delivery.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <span className="text-sm">{item.quantity}x {item.name}</span>
                    {item.observations && (
                      <p className="text-xs text-gray-500">{item.observations}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between font-semibold">
                <span>Pagamento:</span>
                <span className="flex items-center gap-2">
                  {delivery.payment.method}
                  {delivery.payment.paid && (
                    <Badge variant="default" className="text-xs">PAGO</Badge>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <Card>
          <CardContent className="pt-6 space-y-2">
            {currentStatus === 'DISPATCHED' && (
              <Button 
                onClick={() => updateStatus('IN_TRANSIT')}
                className="w-full"
                size="lg"
              >
                Saindo para Entrega
              </Button>
            )}
            
            {currentStatus === 'IN_TRANSIT' && (
              <Button 
                onClick={() => updateStatus('ARRIVED_AT_DELIVERY')}
                className="w-full"
                size="lg"
                variant="secondary"
              >
                Cheguei no Cliente
              </Button>
            )}
            
            {currentStatus === 'ARRIVED_AT_DELIVERY' && (
              <Button 
                onClick={() => updateStatus('DELIVERED')}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirmar Entrega
              </Button>
            )}
            
            {currentStatus === 'DELIVERED' && (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-lg font-semibold">Entrega Concluída!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Restaurante */}
        <Card className="bg-gray-100">
          <CardContent className="pt-4 text-sm text-gray-600 text-center">
            <p className="font-semibold">{delivery.restaurant.name}</p>
            <p>{delivery.restaurant.phone}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}