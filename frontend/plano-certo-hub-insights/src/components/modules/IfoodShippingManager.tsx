/**
 * iFood Shipping Manager Component
 * Manages shipping operations for platform and external orders
 * Provides interface for monitoring deliveries, handling address changes, and tracking shipments
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Car,
  Bike,
  Navigation,
  Shield,
  RefreshCw,
  Play,
  Pause,
  ExternalLink,
  MapPinned,
  DollarSign,
  Map
} from 'lucide-react';
import { ShippingMap } from './ShippingMap';

// Type definitions
interface ShippingStatus {
  orderId?: string;
  externalId?: string;
  status: string;
  subStatus?: string;
  estimatedDeliveryTime?: string;
  deliveryPerson?: DeliveryPerson;
  trackingUrl?: string;
  safeDeliveryScore?: number;
  riskLevel?: string;
}

interface DeliveryPerson {
  name: string;
  phone: string;
  document?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  photoUrl?: string;
}

interface AddressChange {
  id: string;
  eventId: string;
  orderId?: string;
  externalId?: string;
  newStreetName: string;
  newStreetNumber: string;
  newComplement?: string;
  newNeighborhood: string;
  newCity: string;
  newState: string;
  newPostalCode: string;
  newLatitude: number;
  newLongitude: number;
  changeReason: string;
  customerNote?: string;
  timeoutAt: string;
  currentShippingStatus?: string;
}

interface ActiveShipment {
  id: string;
  merchantId: string;
  orderId?: string;
  externalId?: string;
  status: string;
  subStatus?: string;
  estimatedDeliveryTime?: string;
  trackingUrl?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  vehicleType?: string;
  safeDeliveryScore?: number;
  riskLevel?: string;
  createdAt: string;
  updatedAt: string;
}

export function IfoodShippingManager({ 
  merchantId, 
  userId,
  highlightOrder 
}: { 
  merchantId: string; 
  userId: string;
  highlightOrder?: string | null;
}) {
  const { toast } = useToast();
  const [isPolling, setIsPolling] = useState(false);
  const [activeShipments, setActiveShipments] = useState<ActiveShipment[]>([]);
  const [pendingAddressChanges, setPendingAddressChanges] = useState<AddressChange[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ActiveShipment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [showMapFor, setShowMapFor] = useState<string | null>(null);
  
  // Form states for status update
  const [statusForm, setStatusForm] = useState({
    status: '',
    subStatus: '',
    metadata: {}
  });

  // Form states for address change response
  const [addressChangeResponse, setAddressChangeResponse] = useState({
    accept: true,
    reason: '',
    additionalFee: 0
  });

  // Load active shipments (only those with delivery person assigned)
  const loadActiveShipments = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8085/shipping/active?merchantId=${merchantId}&hasDriver=true`);
      const result = await response.json();
      
      if (result.success) {
        // Filter to show only shipments that have been dispatched or beyond
        const shippingStatuses = ['DISPATCHED', 'DRIVER_NEAR', 'ARRIVED_AT_PICKUP', 'IN_TRANSIT', 'ARRIVED_AT_DELIVERY'];
        const filteredShipments = result.data.filter((shipment: ActiveShipment) => 
          shippingStatuses.includes(shipment.status) || shipment.deliveryPersonName
        );
        setActiveShipments(filteredShipments);
      } else {
        console.error('Failed to load active shipments:', result.error);
      }
    } catch (error) {
      console.error('Error loading active shipments:', error);
    }
  }, [merchantId]);

  // Load pending address changes
  const loadPendingAddressChanges = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8085/shipping/address-changes/pending?merchantId=${merchantId}`);
      const result = await response.json();
      
      if (result.success) {
        setPendingAddressChanges(result.data);
      } else {
        console.error('Failed to load pending address changes:', result.error);
      }
    } catch (error) {
      console.error('Error loading pending address changes:', error);
    }
  }, [merchantId]);

  // Start polling
  const startPolling = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8085/shipping/polling/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId, userId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsPolling(true);
        toast({
          title: "Polling Started",
          description: "Shipping event polling is now active",
        });
        
        // Start refreshing data periodically
        loadActiveShipments();
        loadPendingAddressChanges();
      } else {
        toast({
          title: "Polling Failed",
          description: result.message || "Failed to start polling",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error starting polling:', error);
      toast({
        title: "Error",
        description: "Failed to start polling",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stop polling
  const stopPolling = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8085/shipping/polling/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId, userId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsPolling(false);
        toast({
          title: "Polling Stopped",
          description: "Shipping event polling has been stopped",
        });
      } else {
        toast({
          title: "Stop Failed",
          description: result.message || "Failed to stop polling",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error stopping polling:', error);
      toast({
        title: "Error",
        description: "Failed to stop polling",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update shipping status
  const updateShippingStatus = async (shipment: ActiveShipment) => {
    setIsLoading(true);
    try {
      const endpoint = shipment.orderId 
        ? `http://localhost:8085/shipping/orders/${shipment.orderId}/status`
        : `http://localhost:8085/shipping/external/${shipment.externalId}/status`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          userId,
          ...statusForm
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Status updated to ${statusForm.status}`,
        });
        loadActiveShipments();
        setStatusForm({ status: '', subStatus: '', metadata: {} });
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Failed to update status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update shipping status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Respond to address change
  const respondToAddressChange = async (change: AddressChange) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8085/shipping/address-change/${change.eventId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          userId,
          ...addressChangeResponse
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: addressChangeResponse.accept ? "Address Change Accepted" : "Address Change Rejected",
          description: addressChangeResponse.reason || "Response sent successfully",
        });
        loadPendingAddressChanges();
        setAddressChangeResponse({ accept: true, reason: '', additionalFee: 0 });
      } else {
        toast({
          title: "Response Failed",
          description: result.message || "Failed to respond to address change",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error responding to address change:', error);
      toast({
        title: "Error",
        description: "Failed to respond to address change",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get Safe Delivery score
  const getSafeDeliveryScore = async (shipment: ActiveShipment) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        merchantId,
        userId,
        ...(shipment.orderId ? { orderId: shipment.orderId } : { externalId: shipment.externalId! })
      });
      
      const response = await fetch(`http://localhost:8085/shipping/safe-delivery/score?${params}`);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Safe Delivery Score",
          description: `Score: ${result.data.score} - Risk: ${result.data.riskLevel}`,
        });
        loadActiveShipments();
      } else {
        toast({
          title: "Score Failed",
          description: result.message || "Failed to get Safe Delivery score",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error getting Safe Delivery score:', error);
      toast({
        title: "Error",
        description: "Failed to get Safe Delivery score",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get tracking URL
  const getTrackingUrl = async (shipment: ActiveShipment) => {
    try {
      const params = new URLSearchParams({
        merchantId,
        userId,
        ...(shipment.orderId ? { orderId: shipment.orderId } : { externalId: shipment.externalId! })
      });
      
      const response = await fetch(`http://localhost:8085/shipping/tracking?${params}`);
      const result = await response.json();
      
      if (result.success && result.data.trackingUrl) {
        window.open(result.data.trackingUrl, '_blank');
      } else {
        toast({
          title: "No Tracking URL",
          description: "Tracking URL not available for this shipment",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error getting tracking URL:', error);
      toast({
        title: "Error",
        description: "Failed to get tracking URL",
        variant: "destructive"
      });
    }
  };

  // Auto-refresh data when polling is active
  useEffect(() => {
    if (isPolling) {
      const interval = setInterval(() => {
        loadActiveShipments();
        loadPendingAddressChanges();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isPolling, loadActiveShipments, loadPendingAddressChanges]);

  // Initial load
  useEffect(() => {
    loadActiveShipments();
    loadPendingAddressChanges();
  }, [loadActiveShipments, loadPendingAddressChanges]);

  // Handle highlighted order from navigation
  useEffect(() => {
    if (highlightOrder && activeShipments.length > 0) {
      const shipmentToHighlight = activeShipments.find(
        s => s.orderId === highlightOrder || s.externalId === highlightOrder
      );
      
      if (shipmentToHighlight) {
        // Show map for this shipment
        setShowMapFor(shipmentToHighlight.orderId || shipmentToHighlight.externalId || null);
        
        // Show toast notification
        toast({
          title: "🚚 Entrega Localizada",
          description: `Visualizando entrega do pedido ${highlightOrder.substring(0, 8)}...`,
        });
        
        // Scroll to the shipment in the list (if needed)
        const element = document.getElementById(`shipment-${highlightOrder}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-orange-500', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-orange-500', 'ring-offset-2');
          }, 3000);
        }
      }
    }
  }, [highlightOrder, activeShipments, toast]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'REQUESTED': 'bg-blue-500',
      'ACKNOWLEDGED': 'bg-purple-500',
      'PREPARING': 'bg-yellow-500',
      'READY_FOR_PICKUP': 'bg-orange-500',
      'DISPATCHED': 'bg-indigo-500',
      'ARRIVED_AT_DELIVERY': 'bg-cyan-500',
      'DELIVERED': 'bg-green-500',
      'CONCLUDED': 'bg-gray-500',
      'CANCELLED': 'bg-red-500'
    };
    return statusColors[status] || 'bg-gray-400';
  };

  // Get risk level color
  const getRiskLevelColor = (level?: string) => {
    const riskColors: Record<string, string> = {
      'LOW': 'text-green-500',
      'MEDIUM': 'text-yellow-500',
      'HIGH': 'text-orange-500',
      'VERY_HIGH': 'text-red-500'
    };
    return riskColors[level || ''] || 'text-gray-400';
  };

  // Get vehicle icon
  const getVehicleIcon = (type?: string) => {
    switch (type) {
      case 'CAR': return <Car className="h-4 w-4" />;
      case 'MOTORCYCLE': return <Bike className="h-4 w-4" />;
      case 'BICYCLE': return <Bike className="h-4 w-4" />;
      case 'WALKER': return <User className="h-4 w-4" />;
      default: return <Truck className="h-4 w-4" />;
    }
  };

  // Calculate time remaining for address change
  const getTimeRemaining = (timeoutAt: string) => {
    const now = new Date();
    const timeout = new Date(timeoutAt);
    const diff = timeout.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Card className="w-full mt-20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <CardTitle>Shipping Manager</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isPolling ? "default" : "secondary"}>
              {isPolling ? 'Polling Active' : 'Polling Inactive'}
            </Badge>
            <Button
              onClick={isPolling ? stopPolling : startPolling}
              disabled={isLoading}
              size="sm"
              variant={isPolling ? "destructive" : "default"}
            >
              {isPolling ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Stop Polling
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Start Polling
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                loadActiveShipments();
                loadPendingAddressChanges();
              }}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        <CardDescription>
          Monitor deliveries in progress with assigned drivers
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active Shipments ({activeShipments.length})
            </TabsTrigger>
            <TabsTrigger value="address-changes">
              Address Changes ({pendingAddressChanges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeShipments.length === 0 ? (
              <Alert>
                <Truck className="h-4 w-4" />
                <AlertTitle>No Deliveries in Progress</AlertTitle>
                <AlertDescription>
                  There are no orders with assigned drivers at the moment.
                  Orders will appear here once a driver has been assigned.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[600px] w-full">
                <div className="space-y-4">
                  {activeShipments.map((shipment) => (
                    <Card 
                      key={shipment.id} 
                      id={`shipment-${shipment.orderId || shipment.externalId}`}
                      className="p-4 transition-all duration-300"
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">
                              {shipment.orderId || shipment.externalId}
                            </span>
                            {shipment.externalId && (
                              <Badge variant="outline">External</Badge>
                            )}
                          </div>
                          <Badge className={getStatusColor(shipment.status)}>
                            {shipment.status}
                          </Badge>
                        </div>

                        {/* Delivery Info */}
                        {shipment.deliveryPersonName && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{shipment.deliveryPersonName}</span>
                            </div>
                            {shipment.deliveryPersonPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{shipment.deliveryPersonPhone}</span>
                              </div>
                            )}
                            {shipment.vehicleType && (
                              <div className="flex items-center gap-1">
                                {getVehicleIcon(shipment.vehicleType)}
                                <span>{shipment.vehicleType}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Estimated Time */}
                        {shipment.estimatedDeliveryTime && (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              ETA: {new Date(shipment.estimatedDeliveryTime).toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Safe Delivery Score */}
                        {shipment.safeDeliveryScore !== undefined && (
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className={`h-4 w-4 ${getRiskLevelColor(shipment.riskLevel)}`} />
                            <span>
                              Safe Delivery: {shipment.safeDeliveryScore}/100
                            </span>
                            {shipment.riskLevel && (
                              <Badge variant="outline" className={getRiskLevelColor(shipment.riskLevel)}>
                                {shipment.riskLevel}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedShipment(shipment)}
                          >
                            Update Status
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const showMap = selectedShipment?.id === shipment.id && showMapFor === shipment.id;
                              setShowMapFor(showMap ? null : shipment.id);
                              if (!showMap) setSelectedShipment(shipment);
                            }}
                          >
                            <Map className="h-4 w-4 mr-1" />
                            {showMapFor === shipment.id ? 'Hide Map' : 'Show Map'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => getSafeDeliveryScore(shipment)}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Check Safety
                          </Button>
                          {shipment.trackingUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => getTrackingUrl(shipment)}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Track
                            </Button>
                          )}
                        </div>

                        {/* Map View */}
                        {showMapFor === shipment.id && (
                          <div className="mt-4">
                            <ShippingMap 
                              shipment={{
                                orderId: shipment.orderId,
                                externalId: shipment.externalId,
                                status: shipment.status,
                                estimatedDeliveryTime: shipment.estimatedDeliveryTime,
                                // Mock data for demo - in production these would come from the API
                                restaurantLocation: {
                                  lat: -23.550520,
                                  lng: -46.633308,
                                  name: "Restaurant",
                                  address: merchantId
                                },
                                customerLocation: {
                                  lat: -23.560520 + (Math.random() - 0.5) * 0.02,
                                  lng: -46.643308 + (Math.random() - 0.5) * 0.02,
                                  name: "Customer",
                                  address: "Delivery Address"
                                },
                                deliveryPersonLocation: shipment.deliveryPersonName ? {
                                  lat: -23.555520 + (Math.random() - 0.5) * 0.01,
                                  lng: -46.638308 + (Math.random() - 0.5) * 0.01,
                                  name: shipment.deliveryPersonName,
                                  phone: shipment.deliveryPersonPhone || '',
                                  vehicleType: shipment.vehicleType
                                } : undefined
                              }}
                            />
                          </div>
                        )}

                        {/* Status Update Form */}
                        {selectedShipment?.id === shipment.id && (
                          <div className="space-y-3 border-t pt-3 mt-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Status</Label>
                                <Select
                                  value={statusForm.status}
                                  onValueChange={(value) => setStatusForm({ ...statusForm, status: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                                    <SelectItem value="PREPARING">Preparing</SelectItem>
                                    <SelectItem value="READY_FOR_PICKUP">Ready for Pickup</SelectItem>
                                    <SelectItem value="DISPATCHED">Dispatched</SelectItem>
                                    <SelectItem value="ARRIVED_AT_DELIVERY">Arrived at Delivery</SelectItem>
                                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                                    <SelectItem value="CONCLUDED">Concluded</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Sub Status (Optional)</Label>
                                <Input
                                  value={statusForm.subStatus}
                                  onChange={(e) => setStatusForm({ ...statusForm, subStatus: e.target.value })}
                                  placeholder="Enter sub status"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateShippingStatus(shipment)}
                                disabled={!statusForm.status || isLoading}
                              >
                                Update
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedShipment(null);
                                  setStatusForm({ status: '', subStatus: '', metadata: {} });
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="address-changes" className="space-y-4">
            {pendingAddressChanges.length === 0 ? (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertTitle>No Pending Address Changes</AlertTitle>
                <AlertDescription>
                  There are no pending address change requests at the moment.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[600px] w-full">
                <div className="space-y-4">
                  {pendingAddressChanges.map((change) => (
                    <Card key={change.id} className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPinned className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">
                              {change.orderId || change.externalId}
                            </span>
                            <Badge variant="destructive">
                              {getTimeRemaining(change.timeoutAt)}
                            </Badge>
                          </div>
                          {change.currentShippingStatus && (
                            <Badge variant="outline">
                              {change.currentShippingStatus}
                            </Badge>
                          )}
                        </div>

                        {/* Address Details */}
                        <div className="space-y-2 text-sm">
                          <div className="font-medium">New Address:</div>
                          <div className="pl-4 space-y-1 text-muted-foreground">
                            <div>{change.newStreetName}, {change.newStreetNumber}</div>
                            {change.newComplement && <div>{change.newComplement}</div>}
                            <div>{change.newNeighborhood}</div>
                            <div>{change.newCity}, {change.newState} - {change.newPostalCode}</div>
                            <div className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              <span>{change.newLatitude}, {change.newLongitude}</span>
                            </div>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="space-y-1 text-sm">
                          <div className="font-medium">Reason:</div>
                          <div className="pl-4 text-muted-foreground">{change.changeReason}</div>
                          {change.customerNote && (
                            <>
                              <div className="font-medium">Customer Note:</div>
                              <div className="pl-4 text-muted-foreground">{change.customerNote}</div>
                            </>
                          )}
                        </div>

                        {/* Response Form */}
                        <div className="space-y-3 border-t pt-3">
                          <div className="flex items-center gap-4">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setAddressChangeResponse({ ...addressChangeResponse, accept: true });
                                respondToAddressChange(change);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setAddressChangeResponse({ ...addressChangeResponse, accept: false });
                                respondToAddressChange(change);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <Label>Reason (Optional)</Label>
                              <Textarea
                                value={addressChangeResponse.reason}
                                onChange={(e) => setAddressChangeResponse({ 
                                  ...addressChangeResponse, 
                                  reason: e.target.value 
                                })}
                                placeholder="Enter reason for decision"
                                className="h-20"
                              />
                            </div>
                            {addressChangeResponse.accept && (
                              <div>
                                <Label>Additional Fee (Optional)</Label>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    value={addressChangeResponse.additionalFee}
                                    onChange={(e) => setAddressChangeResponse({ 
                                      ...addressChangeResponse, 
                                      additionalFee: parseFloat(e.target.value) || 0 
                                    })}
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}