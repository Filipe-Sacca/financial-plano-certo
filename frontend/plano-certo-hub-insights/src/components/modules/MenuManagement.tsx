
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
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
  Clock,
  Plus
} from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { FilterBar } from '@/components/ui/filter-bar';
import { useUserStoreProducts } from '@/hooks/useUserStoreProducts';
import { useIfoodMerchants } from '@/hooks/useIfoodMerchants';
import { useIfoodTokens } from '@/hooks/useIfoodTokens';
import { useAuth } from '@/App';

export const MenuManagement = () => {
  const { data: clients } = useClients();
  const { user } = useAuth();
  const { data: merchants } = useIfoodMerchants(user?.id);
  const { tokens, getTokenForUser } = useIfoodTokens();
  const [selectedClient, setSelectedClient] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  // Estados para criação de categoria
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    externalCode: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'UNAVAILABLE',
    index: 0,
    template: 'DEFAULT' as 'DEFAULT' | 'PIZZA' | 'COMBO'
  });

  // Estados para gerenciar categorias existentes
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [selectedMerchantForCategories, setSelectedMerchantForCategories] = useState('');
  
  // Usar o novo hook para buscar produtos das lojas do usuário
  const { products, groupedProducts, isLoading, error, forceRefresh, lastUpdated, isRefetching } = useUserStoreProducts();

  // Buscar categorias quando merchant for selecionado
  useEffect(() => {
    if (selectedClient) {
      fetchCategories(selectedClient);
      setSelectedMerchantForCategories(selectedClient);
    }
  }, [selectedClient]);

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

  // Determinar o user_id correto
  const getCurrentUserId = () => {
    // Prioridade: 1) user autenticado, 2) localStorage, 3) primeiro token disponível, 4) fallback
    if (user?.id) {
      return user.id;
    }
    
    const savedUserId = localStorage.getItem('user_id');
    if (savedUserId) {
      return savedUserId;
    }
    
    // Se temos tokens disponíveis, usar o primeiro
    if (tokens && tokens.length > 0) {
      const firstToken = tokens[0];
      console.log('🎯 Usando user_id do primeiro token disponível:', firstToken.user_id);
      // Salvar no localStorage para próximas vezes
      localStorage.setItem('user_id', firstToken.user_id);
      return firstToken.user_id;
    }
    
    return 'test-user-001'; // Fallback
  };

  // Função para buscar categorias existentes
  const fetchCategories = async (merchantId: string) => {
    if (!merchantId) return;

    setIsLoadingCategories(true);
    try {
      const userId = getCurrentUserId();
      const response = await fetch(`http://localhost:8083/merchants/${merchantId}/categories?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCategories(result.data || []);
        console.log(`✅ ${result.count || 0} categorias encontradas para merchant: ${merchantId}`);
      } else {
        console.error('❌ Erro ao buscar categorias:', result.error);
        setCategories([]);
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar categorias:', error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Função para criar categoria no iFood
  const handleCreateCategory = async () => {
    if (!selectedClient) {
      toast.error('Selecione uma loja primeiro');
      return;
    }

    if (!categoryForm.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setIsCreatingCategory(true);

    try {
      console.log('🔍 Buscando dados do cliente selecionado:', selectedClient);
      console.log('📋 Lista de clientes:', clients);
      
      // Buscar cliente por ID ou usar o selectedClient diretamente se for um merchantId
      let merchantId: string | null = null;
      
      // Primeiro tentar encontrar o cliente pelo ID
      const client = clients?.find(c => c.id === selectedClient);
      if (client?.ifood_merchant_id) {
        merchantId = client.ifood_merchant_id;
        console.log('🏪 Cliente encontrado:', client);
        console.log('🏷️ Merchant ID encontrado via cliente:', merchantId);
      } else {
        // Tentar encontrar nos merchants diretos do iFood
        const merchant = merchants?.find(m => m.merchant_id === selectedClient);
        if (merchant) {
          merchantId = merchant.merchant_id;
          console.log('🏪 Merchant encontrado:', merchant);
          console.log('🏷️ Merchant ID encontrado via merchants:', merchantId);
        } else {
          // Como último recurso, tentar usar diretamente se parecer um ID válido
          if (selectedClient && selectedClient !== 'all' && selectedClient.length > 5) {
            merchantId = selectedClient;
            console.log('🏷️ Usando selectedClient diretamente como Merchant ID:', merchantId);
          }
        }
      }

      if (!merchantId) {
        console.error('❌ Dados do cliente:', {
          selectedClient,
          client,
          merchantId,
          clients: clients?.map(c => ({ id: c.id, name: c.name, ifood_merchant_id: c.ifood_merchant_id })),
          merchants: merchants?.map(m => ({ merchant_id: m.merchant_id, name: m.name }))
        });
        toast.error(`Não foi possível encontrar o ID do merchant para este cliente.\n\nSelectedClient: ${selectedClient}\nVerifique se:\n1. O cliente tem ID do iFood configurado na aba Clientes\n2. O merchant está sincronizado com o iFood\n3. Tente recarregar a página`);
        return;
      }

      // Buscar token de acesso do usuário
      console.log('🔐 Buscando token de acesso...');
      const userId = getCurrentUserId();
      console.log('🔍 User ID sendo usado:', userId);
      
      const accessToken = await getTokenForUser(userId);
      
      if (!accessToken) {
        const availableUsers = tokens.map(t => t.user_id).join(', ');
        
        if (tokens.length === 0) {
          toast.error(`❌ Nenhum token de acesso válido encontrado.

⚠️ AÇÃO NECESSÁRIA:
1. 🔐 Faça login no iFood primeiro (Página de Tokens)
2. ✅ Certifique-se de que o token foi salvo
3. 🔄 Atualize a página e tente novamente`);
        } else {
          toast.error(`❌ Token expirado ou não encontrado para o usuário: ${userId}

📊 Status dos tokens:
• Tokens encontrados: ${tokens.length}
• Usuários disponíveis: ${availableUsers}

⚠️ AÇÃO NECESSÁRIA:
1. 🔄 Renovar token na página de Tokens do iFood
2. ✅ Verificar se o user_id está correto
3. 🔄 Aguardar atualização automática do token`);
        }
        return;
      }

      console.log('✅ Token obtido, fazendo requisição para criar categoria...');

      const response = await fetch(`http://localhost:8083/merchants/${merchantId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Adicionar header Authorization
        },
        body: JSON.stringify({
          user_id: userId, // Usar user_id correto
          name: categoryForm.name,
          externalCode: categoryForm.externalCode || undefined,
          status: categoryForm.status,
          index: categoryForm.index,
          template: categoryForm.template
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('✅ Categoria criada com sucesso no iFood!');
        
        // Resetar formulário
        setCategoryForm({
          name: '',
          externalCode: '',
          status: 'AVAILABLE',
          index: 0,
          template: 'DEFAULT'
        });

        // Fechar modal
        setIsCreateCategoryOpen(false);

        // Atualizar produtos para refletir mudanças
        forceRefresh();
        
        // Atualizar lista de categorias
        fetchCategories(merchantId);
        
      } else {
        // Melhor tratamento de erros específicos
        if (response.status === 400) {
          if (result.error?.includes('catálogo')) {
            toast.error(`❌ Erro no catálogo do merchant:

${result.error}

💡 Possíveis soluções:
1. 🔄 Verifique se o merchant está ativo no iFood
2. 📋 Confirme se há catálogos criados no merchant
3. 🔐 Token pode estar expirado - renove na página de Tokens`);
          } else if (result.error?.includes('Conflict') || result.error?.includes('already exists')) {
            toast.error(`❌ Categoria já existe no iFood!

📦 Nome: "${categoryForm.name}"

💡 Soluções:
• 🔄 Use um nome diferente
• 📋 Verifique as categorias existentes
• ✏️ Modifique o nome e tente novamente`);
          } else {
            toast.error(`❌ Erro de validação: ${result.error || 'Dados inválidos'}`);
          }
        } else if (response.status === 401) {
          toast.error(`❌ Token expirado ou inválido.

🔄 AÇÃO NECESSÁRIA: 
Renove o token na página de Tokens do iFood`);
        } else {
          toast.error(`❌ Erro ao criar categoria (${response.status}): ${result.error || 'Erro desconhecido'}`);
        }
      }

    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      
      if (error.message?.includes('Failed to fetch')) {
        toast.error(`❌ Erro de conexão:

🔗 Não foi possível conectar ao serviço iFood.

💡 Verifique se:
1. 🖥️ O serviço está rodando (porta 8083)
2. 🌐 Sua conexão com a internet
3. 🔄 Tente novamente em alguns segundos`);
      } else {
        toast.error(`❌ Erro inesperado ao criar categoria: ${error.message}`);
      }
    } finally {
      setIsCreatingCategory(false);
    }
  };

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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Categorias do Cardápio</CardTitle>
                    <CardDescription>
                      Organize os itens do seu cardápio por categorias
                    </CardDescription>
                  </div>
                  
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        console.log('🔍 DEBUG INFO:', {
                          selectedClient,
                          clients: clients?.map(c => ({ id: c.id, name: c.name, ifood_merchant_id: c.ifood_merchant_id })),
                          merchants: merchants?.map(m => ({ merchant_id: m.merchant_id, name: m.name })),
                          filteredClients: filteredClients?.map(c => ({ id: c.id, name: c.name, ifood_merchant_id: c.ifood_merchant_id }))
                        });
                      }}
                    >
                      Debug Info
                    </Button>
                  )}
                  
                  {/* Botão Nova Categoria */}
                  <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        disabled={!selectedClient || selectedClient === 'all'}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Nova Categoria</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Criar Nova Categoria no iFood</DialogTitle>
                        <DialogDescription>
                          Preencha os dados para criar uma nova categoria no seu catálogo do iFood
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        {/* Nome da Categoria */}
                        <div className="grid gap-2">
                          <Label htmlFor="categoryName">Nome da Categoria *</Label>
                          <Input
                            id="categoryName"
                            placeholder="Ex: Pizzas, Bebidas, Sobremesas..."
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                            disabled={isCreatingCategory}
                          />
                        </div>

                        {/* Código Externo */}
                        <div className="grid gap-2">
                          <Label htmlFor="externalCode">Código Externo</Label>
                          <Input
                            id="externalCode"
                            placeholder="Código interno (opcional)"
                            value={categoryForm.externalCode}
                            onChange={(e) => setCategoryForm(prev => ({ ...prev, externalCode: e.target.value }))}
                            disabled={isCreatingCategory}
                          />
                          <p className="text-sm text-muted-foreground">
                            Se não informado, será gerado automaticamente
                          </p>
                        </div>

                        {/* Status */}
                        <div className="grid gap-2">
                          <Label htmlFor="status">Status</Label>
                          <Select 
                            value={categoryForm.status} 
                            onValueChange={(value: 'AVAILABLE' | 'UNAVAILABLE') => 
                              setCategoryForm(prev => ({ ...prev, status: value }))
                            }
                            disabled={isCreatingCategory}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AVAILABLE">Disponível</SelectItem>
                              <SelectItem value="UNAVAILABLE">Indisponível</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Índice */}
                        <div className="grid gap-2">
                          <Label htmlFor="index">Ordem de Exibição</Label>
                          <Input
                            id="index"
                            type="number"
                            placeholder="0"
                            value={categoryForm.index}
                            onChange={(e) => setCategoryForm(prev => ({ ...prev, index: parseInt(e.target.value) || 0 }))}
                            disabled={isCreatingCategory}
                          />
                          <p className="text-sm text-muted-foreground">
                            Ordem de exibição no cardápio (0 = primeiro)
                          </p>
                        </div>

                        {/* Template */}
                        <div className="grid gap-2">
                          <Label htmlFor="template">Tipo de Template</Label>
                          <Select 
                            value={categoryForm.template} 
                            onValueChange={(value: 'DEFAULT' | 'PIZZA' | 'COMBO') => 
                              setCategoryForm(prev => ({ ...prev, template: value }))
                            }
                            disabled={isCreatingCategory}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DEFAULT">Padrão</SelectItem>
                              <SelectItem value="PIZZA">Pizza</SelectItem>
                              <SelectItem value="COMBO">Combo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateCategoryOpen(false)}
                          disabled={isCreatingCategory}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleCreateCategory}
                          disabled={isCreatingCategory || !categoryForm.name.trim()}
                        >
                          {isCreatingCategory ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Criando...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Criar Categoria
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Seção de Categorias Existentes */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Categorias do iFood</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!selectedClient) return;
                          
                          setIsLoadingCategories(true);
                          try {
                            const userId = getCurrentUserId();
                            const response = await fetch(`http://localhost:8083/merchants/${selectedClient}/categories/sync`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ user_id: userId })
                            });
                            const result = await response.json();
                            
                            if (result.success) {
                              toast.success(`✅ Sincronização concluída!
                              
📊 Resultado:
• Total: ${result.data?.total || 0}
• Novas: ${result.data?.new || 0}
• Atualizadas: ${result.data?.updated || 0}`);
                              fetchCategories(selectedClient);
                            } else {
                              toast.error(`❌ Erro na sincronização: ${result.error}`);
                            }
                          } catch (error: any) {
                            toast.error(`❌ Erro: ${error.message}`);
                          } finally {
                            setIsLoadingCategories(false);
                          }
                        }}
                        disabled={isLoadingCategories || !selectedClient}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingCategories ? 'animate-spin' : ''}`} />
                        Sincronizar iFood
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectedClient && fetchCategories(selectedClient)}
                        disabled={isLoadingCategories || !selectedClient}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingCategories ? 'animate-spin' : ''}`} />
                        Atualizar Lista
                      </Button>
                    </div>
                  </div>

                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center p-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      <span>Carregando categorias...</span>
                    </div>
                  ) : categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {categories.map((category) => (
                        <Card key={category.id} className="border border-green-200 bg-green-50">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base font-bold text-black">
                                {category.name}
                              </CardTitle>
                              <Badge variant="outline" className="text-green-700 border-green-300">
                                {category.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2 text-sm text-gray-700">
                              <div className="text-xs text-gray-600">
                                Criado: {new Date(category.created_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-green-200">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-white bg-orange-600 border-orange-300 hover:bg-orange-700"
                                  onClick={() => {
                                    toast.info(`🔗 Vincular produtos existentes

📦 Categoria: ${category.name}

🔜 Próximos passos:
• Atualizar produtos existentes com esta categoria
• Sincronizar com API do iFood
• Configurar produtos específicos da categoria`);
                                  }}
                                >
                                  <Package className="h-4 w-4 mr-2" />
                                  Vincular Produtos
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-white bg-orange-600 border-orange-300 hover:bg-orange-700"
                                  onClick={() => {
                                    toast.info(`📊 Detalhes da Categoria

📦 Nome: ${category.name}
📅 Criado: ${new Date(category.created_at).toLocaleDateString('pt-BR')}`);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-500">
                      {selectedClient ? (
                        <div>
                          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>Nenhuma categoria criada ainda</p>
                          <p className="text-sm">Use o botão "Nova Categoria" para começar</p>
                        </div>
                      ) : (
                        <div>
                          <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>Selecione uma loja primeiro</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Card separado para Produtos por Categoria (integração iFood + sincronização) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Produtos por Categoria</CardTitle>
                <CardDescription>
                  Produtos organizados por categoria do iFood e sincronização automática
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(() => {
                    // Criar mapa combinado: categorias do iFood + categorias da sincronização
                    const combinedCategoriesMap: Record<string, { name: string; items: number; active: number; isFromIFood?: boolean; ifoodId?: string }> = {};
                    
                    // Primeiro, adicionar todas as categorias do iFood (mesmo que sem produtos ainda)
                    categories.forEach(ifoodCategory => {
                      combinedCategoriesMap[ifoodCategory.name] = {
                        name: ifoodCategory.name,
                        items: 0,
                        active: 0,
                        isFromIFood: true,
                        ifoodId: ifoodCategory.ifood_category_id
                      };
                    });
                    
                    // Depois, contar produtos para cada categoria
                    products.forEach(product => {
                      const categoryName = product.category || 'Sem categoria';
                      
                      if (!combinedCategoriesMap[categoryName]) {
                        // Categoria da sincronização que não existe no iFood
                        combinedCategoriesMap[categoryName] = {
                          name: categoryName,
                          items: 0,
                          active: 0,
                          isFromIFood: false
                        };
                      }
                      
                      combinedCategoriesMap[categoryName].items++;
                      if (product.is_active === 'AVAILABLE') {
                        combinedCategoriesMap[categoryName].active++;
                      }
                    });

                    const allCategoriesWithProducts = Object.values(combinedCategoriesMap);

                    if (allCategoriesWithProducts.length === 0) {
                      return (
                        <div className="col-span-full text-center py-8">
                          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <div className="text-gray-600">Nenhuma categoria encontrada</div>
                          <p className="text-sm text-gray-500 mt-2">
                            Clique em "Sincronizar iFood" para buscar categorias
                          </p>
                        </div>
                      );
                    }

                    return allCategoriesWithProducts.map((category, index) => (
                      <Card key={index} className={category.isFromIFood ? "border-blue-200 bg-blue-50" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-black">{category.name}</h3>
                              {category.isFromIFood && (
                                <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-100">
                                  iFood
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline" className="bg-gray-100 text-black font-bold">{category.items} itens</Badge>
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
                            {category.isFromIFood && category.ifoodId && (
                              <div className="text-xs text-blue-600 mt-2">
                                Categoria oficial do iFood
                              </div>
                            )}
                          </div>
                          {editMode && (
                            <Button variant="outline" size="sm" className="w-full mt-3">
                              <Edit className="h-3 w-3 mr-1" />
                              {category.isFromIFood ? 'Gerenciar (iFood)' : 'Gerenciar (Local)'}
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
            <h3 className="text-lg font-medium text-foreground mb-2">
              Selecione uma Loja
            </h3>
            <p className="text-muted-foreground mb-4">
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
