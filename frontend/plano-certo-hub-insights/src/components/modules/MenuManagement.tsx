
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  UtensilsCrossed, 
  Edit, 
  Image,
  DollarSign,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Store,
  Package,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { FilterBar } from '@/components/ui/filter-bar';
import { useUserStoreProducts } from '@/hooks/useUserStoreProducts';

export const MenuManagement = () => {
  const { data: clients } = useClients();
  const [selectedClient, setSelectedClient] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  // Usar o novo hook para buscar produtos das lojas do usuário
  const { products, groupedProducts, isLoading, error, forceRefresh, lastUpdated, isRefetching } = useUserStoreProducts();

  // Remover dados mock
  // const menuItems = [
  //   {
  //     id: '1',
  //     name: 'Pizza Margherita Grande',
  //     category: 'Pizzas',
  //     price: 32.90,
  //     originalPrice: 32.90,
  //     description: 'Pizza tradicional com molho de tomate, mussarela e manjericão fresco',
  //     isActive: true,
  //     hasPhoto: true,
  //     lastUpdate: '2024-01-15',
  //     status: 'published'
  //   },
  //   {
  //     id: '2',
  //     name: 'Hambúrguer Especial',
  //     category: 'Hambúrgueres',
  //     price: 28.50,
  //     originalPrice: 28.50,
  //     description: 'Hambúrguer artesanal com carne 180g, queijo, alface, tomate',
  //     isActive: true,
  //     hasPhoto: false,
  //     lastUpdate: '2024-01-14',
  //     status: 'draft'
  //   },
  //   {
  //     id: '3',
  //     name: 'Lasanha Bolonhesa',
  //     category: 'Massas',
  //     price: 42.00,
  //     originalPrice: 39.90,
  //     description: 'Lasanha tradicional com molho bolonhesa e queijo gratinado',
  //     isActive: false,
  //     hasPhoto: true,
  //     lastUpdate: '2024-01-13',
  //     status: 'published'
  //   }
  // ];

  // const categories = [
  //   { name: 'Pizzas', items: 12, active: 10 },
  //   { name: 'Hambúrgueres', items: 8, active: 7 },
  //   { name: 'Massas', items: 6, active: 5 },
  //   { name: 'Bebidas', items: 15, active: 15 },
  //   { name: 'Sobremesas', items: 4, active: 3 }
  // ];

  // Remover handleSyncWithIfood simulado
  // const handleSyncWithIfood = async () => {
  //   setSyncStatus('syncing');
  //   // Simular sincronização
  //   setTimeout(() => {
  //     setSyncStatus('success');
  //     setTimeout(() => setSyncStatus('idle'), 2000);
  //   }, 2000);
  // };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Publicado</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Rascunho</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inativo</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const filteredClients = clients?.filter(client => client.ifood_merchant_id) || [];

  return (
    <div className="space-y-6 animate-fade-in pb-6 pt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 mt-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciamento de Cardápios
          </h1>
          <p className="text-gray-600">
            Gerencie cardápios das lojas conectadas ao iFood
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => forceRefresh()}
            disabled={isRefetching}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Atualizando...' : 'Atualizar Produtos'}</span>
          </Button>
          <Button 
            onClick={() => setEditMode(!editMode)}
            disabled={!selectedClient}
            className={editMode ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            {editMode ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Modo Edição
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <FilterBar
        selectedClient={selectedClient}
        onClientChange={setSelectedClient}
        selectedPeriod="30d"
        onPeriodChange={() => {}}
        showPeriodFilter={false}
      />

      {selectedClient && (
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="items">Itens do Cardápio</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Itens do Cardápio</span>
                    <Badge variant="outline" className="text-xs">
                      Auto-sync 5min
                    </Badge>
                  </div>
                  {editMode && (
                    <Badge className="bg-orange-100 text-orange-800">
                      <Edit className="h-3 w-3 mr-1" />
                      Modo Edição Ativo
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {editMode ? 'Clique nos itens para editar' : 'Visualização do cardápio atual'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Foto</TableHead>
                      <TableHead>Última Atualização</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Carregando produtos...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <div className="text-gray-600">Nenhum produto encontrado</div>
                          <p className="text-sm text-gray-500 mt-2">
                            Os produtos das suas lojas aparecerão aqui automaticamente
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id} className={editMode ? 'cursor-pointer hover:bg-gray-50' : ''}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {product.description || 'Sem descrição'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.category || 'Sem categoria'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span>
                                {product.price ? `R$ ${product.price.toFixed(2)}` : 'Não informado'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {product.is_active === 'AVAILABLE' ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              )}
                              <Badge 
                                className={
                                  product.is_active === 'AVAILABLE' 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {product.is_active === 'AVAILABLE' ? 'Disponível' : 'Indisponível'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Image className={`h-4 w-4 ${product.imagePath ? 'text-green-500' : 'text-gray-400'}`} />
                              <span className="text-sm">
                                {product.imagePath ? 'Sim' : 'Não'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {new Date(product.updated_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!editMode}
                              className="flex items-center space-x-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Editar</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Categorias do Cardápio</CardTitle>
                <CardDescription>
                  Organize os itens do seu cardápio por categorias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(() => {
                    // Agrupar produtos por categoria
                    const categoriesMap = products.reduce((acc, product) => {
                      const category = product.category || 'Sem categoria';
                      if (!acc[category]) {
                        acc[category] = { name: category, items: 0, active: 0 };
                      }
                      acc[category].items++;
                      if (product.is_active === 'AVAILABLE') {
                        acc[category].active++;
                      }
                      return acc;
                    }, {} as Record<string, { name: string; items: number; active: number }>);

                    const categories = Object.values(categoriesMap);

                    if (categories.length === 0) {
                      return (
                        <div className="col-span-full text-center py-8">
                          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <div className="text-gray-600">Nenhuma categoria encontrada</div>
                          <p className="text-sm text-gray-500 mt-2">
                            As categorias aparecerão automaticamente com os produtos
                          </p>
                        </div>
                      );
                    }

                    return categories.map((category, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">{category.name}</h3>
                            <Badge variant="outline">{category.items} itens</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Ativos:</span>
                              <span className="font-medium text-green-600">{category.active}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Inativos:</span>
                              <span className="font-medium text-red-600">{category.items - category.active}</span>
                            </div>
                          </div>
                          {editMode && (
                            <Button variant="outline" size="sm" className="w-full mt-3">
                              <Edit className="h-3 w-3 mr-1" />
                              Gerenciar
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Cardápio</CardTitle>
                <CardDescription>
                  Configure as opções de sincronização e exibição
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Funcionalidade em Desenvolvimento</h4>
                    <p className="text-sm text-yellow-700">
                      A integração completa com a API Catalog do iFood está sendo desenvolvida. 
                      Em breve você poderá editar preços, descrições, fotos e todas as informações 
                      do cardápio diretamente aqui e sincronizar com o iFood automaticamente.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Sincronização Automática</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">Preços</span>
                          <Badge variant="outline">Em breve</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">Descrições</span>
                          <Badge variant="outline">Em breve</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">Fotos</span>
                          <Badge variant="outline">Em breve</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Recursos Disponíveis</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">Visualização do Cardápio</span>
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">Análise por Categorias</span>
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">Status dos Itens</span>
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!selectedClient && (
        <Card>
          <CardContent className="p-8 text-center">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione uma Loja
            </h3>
            <p className="text-gray-600 mb-4">
              Escolha uma loja conectada ao iFood para gerenciar seu cardápio
            </p>
            {filteredClients.length === 0 && (
              <p className="text-sm text-orange-600">
                Nenhuma loja com iFood conectado encontrada. 
                Verifique as configurações de API na aba "Clientes".
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
