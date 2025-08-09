
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { ActionPlanDetail } from './ActionPlanDetail';

export const DiagnosticModule = () => {
  const [selectedActionPlan, setSelectedActionPlan] = useState<string | null>(null);
  const [showStrategyConfig, setShowStrategyConfig] = useState(false);

  // Remover diagnostics e actionPlans mock

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedActionPlan) {
    return (
      <ActionPlanDetail 
        clientName={selectedActionPlan} 
        onBack={() => setSelectedActionPlan(null)} 
      />
    );
  }

  if (showStrategyConfig) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuração de Estratégias IA
            </h1>
            <p className="text-gray-600">
              Configure as estratégias da metodologia Plano Certo Delivery para orientar a IA
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowStrategyConfig(false)}>
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Metodologia Plano Certo Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estratégias de Análise */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Estratégias de Análise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Análise de Performance</h4>
                    <textarea 
                      className="w-full h-32 p-3 border rounded-lg text-sm"
                      placeholder="Descreva como a IA deve analisar métricas de performance (faturamento, pedidos, ticket médio, etc.)"
                      defaultValue="Analisar tendências dos últimos 90 dias, comparar com benchmarks do setor, identificar padrões sazonais e pontos críticos de queda de performance. Considerar impactos de promoções, eventos e mudanças operacionais."
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Análise de Cardápio</h4>
                    <textarea 
                      className="w-full h-32 p-3 border rounded-lg text-sm"
                      placeholder="Como analisar performance dos produtos do cardápio"
                      defaultValue="Avaliar funil de conversão por produto, analisar descrições e fotos, identificar produtos com baixo desempenho, sugerir otimizações de preço e posicionamento no cardápio."
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Análise Operacional</h4>
                    <textarea 
                      className="w-full h-32 p-3 border rounded-lg text-sm"
                      placeholder="Critérios para análise operacional"
                      defaultValue="Monitorar tempos de preparo e entrega, avaliar capacidade produtiva, identificar gargalos operacionais, analisar padrões de rejeição de pedidos e disponibilidade de produtos."
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Análise de Satisfação</h4>
                    <textarea 
                      className="w-full h-32 p-3 border rounded-lg text-sm"
                      placeholder="Como analisar satisfação do cliente"
                      defaultValue="Monitorar avaliações e comentários, identificar padrões de reclamações, correlacionar satisfação com métricas operacionais, sugerir ações para melhoria da experiência."
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Critérios de Priorização */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Critérios de Priorização</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Prioridade Alta</h4>
                    <textarea 
                      className="w-full h-24 p-3 border rounded-lg text-sm"
                      placeholder="Critérios para prioridade alta"
                      defaultValue="Quedas > 20% em métricas principais, problemas que afetam diretamente a receita, questões de segurança alimentar, problemas recorrentes com avaliações."
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Prioridade Média</h4>
                    <textarea 
                      className="w-full h-24 p-3 border rounded-lg text-sm"
                      placeholder="Critérios para prioridade média"
                      defaultValue="Oportunidades de otimização com impacto moderado, melhorias operacionais, ajustes de cardápio com potencial de 5-15% de aumento."
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Prioridade Baixa</h4>
                    <textarea 
                      className="w-full h-24 p-3 border rounded-lg text-sm"
                      placeholder="Critérios para prioridade baixa"
                      defaultValue="Otimizações incrementais, melhorias estéticas, ajustes menores que não impactam diretamente a receita principal."
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Templates de Ações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Templates de Ações</h3>
              <div className="space-y-3">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Template: Otimização de Cardápio</h4>
                    <textarea 
                      className="w-full h-20 p-3 border rounded-lg text-sm"
                      defaultValue="1. Analisar produtos com baixa conversão; 2. Reescrever descrições; 3. Otimizar fotos; 4. Ajustar posicionamento; 5. Monitorar resultados por 30 dias"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Template: Melhoria Operacional</h4>
                    <textarea 
                      className="w-full h-20 p-3 border rounded-lg text-sm"
                      defaultValue="1. Identificar gargalos; 2. Treinar equipe; 3. Implementar controles; 4. Monitorar métricas; 5. Ajustar processos conforme necessário"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline">Resetar Padrões</Button>
              <Button className="bg-orange-500 hover:bg-orange-600">
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diagnóstico com IA
          </h1>
          <p className="text-gray-600">
            Análise inteligente baseada na metodologia Plano Certo Delivery
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowStrategyConfig(true)}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Configurar Estratégias IA</span>
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Nova Análise</span>
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
                <p className="text-2xl font-bold text-gray-900">85</p>
                <p className="text-sm text-gray-600">Score Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">6</p>
                <p className="text-sm text-gray-600">Problemas Identificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">11</p>
                <p className="text-sm text-gray-600">Oportunidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-sm text-gray-600">Ações Implementadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diagnostic Results */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados dos Diagnósticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Remover diagnostics.map */}
          </div>
        </CardContent>
      </Card>

      {/* Action Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Planos de Ação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Remover actionPlans.map */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
