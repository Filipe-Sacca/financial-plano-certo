# 📊 Guia de Analytics de Entregas - Sistema de Análise Geográfica

## 🎯 Visão Geral

Este sistema foi desenvolvido para permitir análises avançadas de entregas, similar ao que o iFood usa para:
- **Heatmaps de vendas** por região
- **Identificação de zonas** com maior demanda
- **Otimização de áreas** de entrega
- **Precificação dinâmica** por região
- **Previsão de demanda** futura

## 📦 Estrutura de Dados

### 1. **delivery_history** - Histórico Completo
Armazena TODAS as entregas com localização completa:
- Coordenadas do restaurante e cliente
- Tempo de entrega
- Valor do pedido
- Avaliação do cliente
- Condições (clima, horário, dia da semana)

### 2. **delivery_regions** - Regiões de Análise
Define zonas/bairros para análise agregada:
- Polígonos de região (retângulos simplificados)
- Estatísticas por região
- Ajustes de taxa de entrega

### 3. **delivery_grid_analytics** - Grid para Heatmap
Divide a cidade em quadrados de 500m para criar mapas de calor:
- Métricas agregadas por quadrado
- Distribuição por horário
- Taxa de satisfação

### 4. **neighborhood_trends** - Tendências por Bairro
Análise temporal por bairro:
- Crescimento de pedidos
- Market share
- Produtos mais vendidos
- Horários de pico

### 5. **customer_location_analytics** - Base de Clientes
Análise de clientes por localização:
- Frequência de pedidos
- Valor médio
- Identificação de VIPs

## 🗺️ Como Implementar Heatmap de Vendas

### 1. Coletar Dados
```sql
-- Sempre registrar coordenadas ao criar pedido
INSERT INTO delivery_history (
    merchant_id, order_id,
    restaurant_lat, restaurant_lng,
    customer_lat, customer_lng,
    customer_neighborhood,
    order_value, delivery_fee
) VALUES (...);
```

### 2. Gerar Dados para Heatmap
```sql
-- Use a view pronta
SELECT * FROM delivery_heatmap 
WHERE merchant_id = 'SEU_MERCHANT_ID';
```

### 3. Integrar com Leaflet
```javascript
// No frontend com Leaflet.heat
import L from 'leaflet';
import 'leaflet.heat';

// Dados do backend
const heatmapData = await fetch('/api/heatmap-data');
const points = heatmapData.map(item => [
    item.lat_grid,
    item.lng_grid,
    item.order_count // intensidade
]);

// Adicionar ao mapa
L.heatLayer(points, {
    radius: 25,
    blur: 15,
    maxZoom: 17,
    gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
    }
}).addTo(map);
```

## 📈 Análises Disponíveis

### 1. Top Regiões por Receita
```sql
SELECT * FROM top_neighborhoods
WHERE merchant_id = 'SEU_ID'
ORDER BY total_revenue DESC
LIMIT 10;
```

### 2. Crescimento por Região
```sql
SELECT 
    neighborhood_name,
    trend_date,
    total_orders,
    growth_rate
FROM neighborhood_trends
WHERE merchant_id = 'SEU_ID'
    AND trend_period = 'monthly'
ORDER BY trend_date DESC;
```

### 3. Horários de Pico por Bairro
```sql
SELECT 
    customer_neighborhood,
    hour_of_day,
    COUNT(*) as orders
FROM delivery_history
WHERE merchant_id = 'SEU_ID'
GROUP BY customer_neighborhood, hour_of_day
ORDER BY orders DESC;
```

### 4. Distância Média por Região
```sql
SELECT 
    customer_neighborhood,
    AVG(distance_km) as avg_distance,
    AVG(delivery_time_minutes) as avg_time
FROM delivery_history
WHERE merchant_id = 'SEU_ID'
GROUP BY customer_neighborhood;
```

## 🚀 Casos de Uso Futuros

### 1. **Expansão de Área de Entrega**
- Identificar regiões adjacentes com demanda
- Analisar viabilidade por distância/tempo
- Calcular ROI de expansão

### 2. **Precificação Dinâmica**
```sql
-- Ajustar taxa por região baseado em demanda
UPDATE delivery_regions
SET delivery_fee_adjustment = CASE
    WHEN total_orders > 100 THEN -1.00  -- Desconto em área popular
    WHEN avg_delivery_time > 45 THEN 2.00  -- Taxa extra em área distante
    ELSE 0
END;
```

### 3. **Previsão de Demanda**
- Usar dados históricos para ML
- Prever picos por região/horário
- Otimizar alocação de entregadores

### 4. **Marketing Geolocalizado**
- Campanhas focadas em bairros específicos
- Promoções em regiões com baixa penetração
- Fidelização em áreas de alta competição

## 🎨 Visualizações Recomendadas

### 1. **Mapa de Calor (Heatmap)**
- Mostra densidade de pedidos
- Identifica hotspots
- Visual intuitivo

### 2. **Mapa de Clusters**
- Agrupa pedidos próximos
- Mostra volume por cluster
- Útil para rotas

### 3. **Gráfico de Bolhas**
- Eixo X: Distância média
- Eixo Y: Receita
- Tamanho: Número de pedidos

### 4. **Timeline Animado**
- Evolução temporal
- Crescimento por região
- Tendências sazonais

## 💡 Dicas de Implementação

### 1. **Performance**
- Criar índices nas colunas de localização
- Usar cache para queries pesadas
- Agregar dados periodicamente

### 2. **Privacidade**
- Não expor coordenadas exatas de clientes
- Agregar em grids/regiões
- Seguir LGPD

### 3. **Precisão**
- Validar coordenadas antes de salvar
- Usar geocoding para endereços
- Considerar margem de erro GPS

## 🔧 Manutenção

### Jobs Diários (Cron)
```bash
# Atualizar análises diariamente às 2AM
0 2 * * * psql -c "CALL update_daily_analytics();"

# Limpar dados antigos mensalmente
0 3 1 * * psql -c "DELETE FROM delivery_history WHERE order_date < NOW() - INTERVAL '1 year';"
```

### Monitoramento
- Volume de dados por região
- Tempo médio de queries
- Precisão das coordenadas

## 📊 KPIs Sugeridos

1. **Penetração de Mercado**: % de cobertura por bairro
2. **Lifetime Value por Região**: LTV médio dos clientes
3. **Eficiência de Entrega**: Tempo/distância por região
4. **Taxa de Recompra**: Por localização do cliente
5. **Satisfação Geográfica**: Rating médio por área

## 🎯 Próximos Passos

1. **Implementar coleta automática** de coordenadas
2. **Criar dashboard** de visualização
3. **Configurar jobs** de agregação
4. **Treinar modelo** de previsão
5. **Definir políticas** de precificação

---

## 📚 Referências

- [Leaflet Heatmap Plugin](https://github.com/Leaflet/Leaflet.heat)
- [PostGIS para análise geoespacial](https://postgis.net/)
- [Turf.js para cálculos geográficos](https://turfjs.org/)
- [D3.js para visualizações customizadas](https://d3js.org/)