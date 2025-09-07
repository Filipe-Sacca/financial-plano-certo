import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '../ui/card';

// Fix for default markers in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different markers
const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface ShippingMapProps {
  shipment: {
    orderId?: string;
    externalId?: string;
    status: string;
    restaurantLocation?: {
      lat: number;
      lng: number;
      name: string;
      address: string;
    };
    customerLocation?: {
      lat: number;
      lng: number;
      name: string;
      address: string;
    };
    deliveryPersonLocation?: {
      lat: number;
      lng: number;
      name: string;
      phone: string;
      vehicleType?: string;
    };
    estimatedDeliveryTime?: string;
  };
}

// Component to update map view when delivery person moves
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

// Component to fit bounds to show all markers
function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  
  return null;
}

export function ShippingMap({ shipment }: ShippingMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.550520, -46.633308]); // São Paulo default
  
  // Collect all positions for bounds
  const positions: [number, number][] = [];
  
  if (shipment.restaurantLocation) {
    positions.push([shipment.restaurantLocation.lat, shipment.restaurantLocation.lng]);
  }
  
  if (shipment.customerLocation) {
    positions.push([shipment.customerLocation.lat, shipment.customerLocation.lng]);
  }
  
  if (shipment.deliveryPersonLocation) {
    positions.push([shipment.deliveryPersonLocation.lat, shipment.deliveryPersonLocation.lng]);
    setMapCenter([shipment.deliveryPersonLocation.lat, shipment.deliveryPersonLocation.lng]);
  }
  
  // Create route line
  const routePositions: [number, number][] = [];
  if (shipment.restaurantLocation && shipment.customerLocation) {
    routePositions.push(
      [shipment.restaurantLocation.lat, shipment.restaurantLocation.lng],
      [shipment.customerLocation.lat, shipment.customerLocation.lng]
    );
  }
  
  // Calculate distance if we have both locations
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d.toFixed(2);
  };
  
  const distance = shipment.deliveryPersonLocation && shipment.customerLocation
    ? calculateDistance(
        shipment.deliveryPersonLocation.lat,
        shipment.deliveryPersonLocation.lng,
        shipment.customerLocation.lat,
        shipment.customerLocation.lng
      )
    : null;
  
  return (
    <Card className="w-full p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          🗺️ Rastreamento em Tempo Real
        </h3>
        <div className="flex gap-4 text-sm text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            Restaurante
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Cliente
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Entregador
          </span>
        </div>
        {distance && (
          <div className="flex gap-4 text-sm">
            <span>📏 Distância até o cliente: {distance} km</span>
            {shipment.estimatedDeliveryTime && (
              <span>⏱️ Entrega estimada: {new Date(shipment.estimatedDeliveryTime).toLocaleTimeString('pt-BR')}</span>
            )}
          </div>
        )}
      </div>
      
      <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapBounds positions={positions} />
          
          {/* Restaurant Marker */}
          {shipment.restaurantLocation && (
            <Marker 
              position={[shipment.restaurantLocation.lat, shipment.restaurantLocation.lng]}
              icon={restaurantIcon}
            >
              <Popup>
                <div>
                  <strong>🍴 {shipment.restaurantLocation.name}</strong>
                  <br />
                  {shipment.restaurantLocation.address}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Customer Marker */}
          {shipment.customerLocation && (
            <Marker 
              position={[shipment.customerLocation.lat, shipment.customerLocation.lng]}
              icon={customerIcon}
            >
              <Popup>
                <div>
                  <strong>🏠 {shipment.customerLocation.name}</strong>
                  <br />
                  {shipment.customerLocation.address}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Delivery Person Marker */}
          {shipment.deliveryPersonLocation && (
            <Marker 
              position={[shipment.deliveryPersonLocation.lat, shipment.deliveryPersonLocation.lng]}
              icon={deliveryIcon}
            >
              <Popup>
                <div>
                  <strong>🛵 {shipment.deliveryPersonLocation.name}</strong>
                  <br />
                  📱 {shipment.deliveryPersonLocation.phone}
                  <br />
                  {shipment.deliveryPersonLocation.vehicleType && (
                    <>🚗 {shipment.deliveryPersonLocation.vehicleType}</>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Route Line */}
          {routePositions.length > 0 && (
            <Polyline 
              positions={routePositions}
              color="blue"
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
          
          {/* Delivery Path from Restaurant to Delivery Person */}
          {shipment.restaurantLocation && shipment.deliveryPersonLocation && (
            <Polyline 
              positions={[
                [shipment.restaurantLocation.lat, shipment.restaurantLocation.lng],
                [shipment.deliveryPersonLocation.lat, shipment.deliveryPersonLocation.lng]
              ]}
              color="green"
              weight={3}
              opacity={0.8}
            />
          )}
          
          {/* Delivery Path from Delivery Person to Customer */}
          {shipment.deliveryPersonLocation && shipment.customerLocation && (
            <Polyline 
              positions={[
                [shipment.deliveryPersonLocation.lat, shipment.deliveryPersonLocation.lng],
                [shipment.customerLocation.lat, shipment.customerLocation.lng]
              ]}
              color="orange"
              weight={3}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>
      
      {/* Status Bar */}
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Status: <span className="text-primary">{shipment.status}</span>
          </span>
          <span className="text-sm">
            Pedido: {shipment.orderId || shipment.externalId}
          </span>
        </div>
      </div>
    </Card>
  );
}