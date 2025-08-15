
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  ArrowLeft,
  Download,
  Edit
} from 'lucide-react';

interface ActionPlanDetailProps {
  clientName: string;
  onBack: () => void;
}

export const ActionPlanDetail = ({ clientName, onBack }: ActionPlanDetailProps) => {
  // Remover actionPlan mock

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'bg-green-100 text-green-800';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Pendente': return 'bg-gray-100 text-gray-800';
      case 'Atrasado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluído': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'Em Andamento': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Pendente': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      case 'Atrasado': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Plano de Ação - {clientName}
            </h1>
            <p className="text-gray-600">
              Gerado em {new Date().toLocaleDateString('pt-BR')} • Score: 0/100
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Editar Plano</span>
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportar PDF</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Total de Ações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0%</p>
                <p className="text-sm text-gray-600">Progresso Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Progresso do Plano de Ação</h3>
              <span className="text-2xl font-bold text-orange-600">0%</span>
            </div>
            <Progress value={0} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>0 Concluídas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>0 Em Andamento</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>0 Pendentes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="goals">Metas de Crescimento</TabsTrigger>
          <TabsTrigger value="actions">Ações Detalhadas</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metas de Crescimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Remover actionPlan.goals mock */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Faturamento Mensal</h3>
                    <Badge className="bg-red-100 text-red-800">
                      -10%
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Atual:</span>
                      <span className="font-medium">
                        R$ 45.000,00
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Meta:</span>
                      <span className="font-medium text-orange-600">
                        R$ 58.500,00
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prazo:</span>
                      <span className="text-sm">
                        2024-09-30
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Ticket Médio</h3>
                    <Badge className="bg-red-100 text-red-800">
                      -10%
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Atual:</span>
                      <span className="font-medium">
                        R$ 32,50
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Meta:</span>
                      <span className="font-medium text-orange-600">
                        R$ 42,25
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prazo:</span>
                      <span className="text-sm">
                        2024-08-31
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Tempo de Entrega</h3>
                    <Badge className="bg-green-100 text-green-800">
                      +10%
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Atual:</span>
                      <span className="font-medium">
                        45 min
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Meta:</span>
                      <span className="font-medium text-orange-600">
                        35 min
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prazo:</span>
                      <span className="text-sm">
                        2024-07-31
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Avaliação Média</h3>
                    <Badge className="bg-green-100 text-green-800">
                      +10%
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Atual:</span>
                      <span className="font-medium">
                        4,2
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Meta:</span>
                      <span className="font-medium text-orange-600">
                        4,6
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prazo:</span>
                      <span className="text-sm">
                        2024-08-15
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Detalhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Remover actionPlan.actions mock */}
                <div 
                  key={1}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon('Concluído')}
                        <h3 className="font-medium text-gray-900">Otimizar descrições dos 10 produtos mais vendidos</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Reescrever descrições para serem mais atrativas e aumentar conversão</p>
                      <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        <strong>Impacto esperado:</strong> Aumento esperado de 15% na conversão dos produtos
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Badge className={getStatusColor('Concluído')}>
                        Concluído
                      </Badge>
                      <Badge className={getPriorityColor('Alta')}>
                        Alta
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Prazo: 2024-07-05</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Responsável: Equipe Marketing</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Categoria: Cardápio</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Progress value={100} className="flex-1" />
                      <span className="text-sm font-medium text-gray-700 min-w-12">
                        100%
                      </span>
                    </div>
                  </div>
                </div>
                <div 
                  key={2}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon('Em Andamento')}
                        <h3 className="font-medium text-gray-900">Implementar sistema de controle de tempo de preparo</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Criar cronômetros e metas por tipo de prato para reduzir tempo de preparo</p>
                      <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        <strong>Impacto esperado:</strong> Redução de 10 minutos no tempo médio de entrega
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Badge className={getStatusColor('Em Andamento')}>
                        Em Andamento
                      </Badge>
                      <Badge className={getPriorityColor('Alta')}>
                        Alta
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Prazo: 2024-07-20</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Responsável: Gerente de Cozinha</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Categoria: Operacional</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Progress value={70} className="flex-1" />
                      <span className="text-sm font-medium text-gray-700 min-w-12">
                        70%
                      </span>
                    </div>
                  </div>
                </div>
                <div 
                  key={3}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon('Em Andamento')}
                        <h3 className="font-medium text-gray-900">Criar promoção combo para aumento de ticket médio</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Desenvolver combos estratégicos que aumentem o valor do pedido</p>
                      <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        <strong>Impacto esperado:</strong> Aumento de R$ 8-12 no ticket médio
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Badge className={getStatusColor('Em Andamento')}>
                        Em Andamento
                      </Badge>
                      <Badge className={getPriorityColor('Média')}>
                        Média
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Prazo: 2024-07-25</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Responsável: Equipe Marketing</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Categoria: Marketing</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Progress value={40} className="flex-1" />
                      <span className="text-sm font-medium text-gray-700 min-w-12">
                        40%
                      </span>
                    </div>
                  </div>
                </div>
                <div 
                  key={4}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon('Pendente')}
                        <h3 className="font-medium text-gray-900">Treinar equipe para melhoria no atendimento</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Curso de atendimento ao cliente focado em delivery</p>
                      <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        <strong>Impacto esperado:</strong> Melhoria na avaliação média de 0.3 pontos
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Badge className={getStatusColor('Pendente')}>
                        Pendente
                      </Badge>
                      <Badge className={getPriorityColor('Média')}>
                        Média
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Prazo: 2024-08-10</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Responsável: RH</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Categoria: Qualidade</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Progress value={0} className="flex-1" />
                      <span className="text-sm font-medium text-gray-700 min-w-12">
                        0%
                      </span>
                    </div>
                  </div>
                </div>
                <div 
                  key={5}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon('Em Andamento')}
                        <h3 className="font-medium text-gray-900">Integrar sistema de gestão com iFood</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Automatizar atualização de estoque e preços</p>
                      <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        <strong>Impacto esperado:</strong> Redução de 90% nos erros de disponibilidade
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Badge className={getStatusColor('Em Andamento')}>
                        Em Andamento
                      </Badge>
                      <Badge className={getPriorityColor('Alta')}>
                        Alta
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Prazo: 2024-07-15</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Responsável: TI</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Categoria: Tecnologia</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Progress value={85} className="flex-1" />
                      <span className="text-sm font-medium text-gray-700 min-w-12">
                        85%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
