
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  MessageCircle, 
  Phone, 
  Users,
  TrendingUp,
  Bell,
  Settings,
  Send,
  Bot,
  BarChart,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const AssistantModule = () => {
  // Remover whatsappStats e recentMessages mock

  const automatedFeatures = [
    {
      name: 'Consultas de Métricas',
      description: 'Permite consultar vendas, pedidos e indicadores em tempo real',
      enabled: true,
      usageCount: 245
    },
    {
      name: 'Alertas Automáticos',
      description: 'Envia notificações sobre quedas de performance ou oportunidades',
      enabled: true,
      usageCount: 67
    },
    {
      name: 'Agendamento de Reuniões',
      description: 'Agenda reuniões diretamente pelo WhatsApp com integração ao calendário',
      enabled: false,
      usageCount: 23
    },
    {
      name: 'Relatórios Express',
      description: 'Gera relatórios rápidos e envia pelo WhatsApp',
      enabled: true,
      usageCount: 134
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'query': return BarChart;
      case 'alert': return AlertTriangle;
      case 'scheduling': return Calendar;
      default: return MessageCircle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'query': return 'bg-blue-100 text-blue-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'scheduling': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assistente WhatsApp
          </h1>
          <p className="text-gray-600">
            Chatbot inteligente para consultas e notificações automáticas
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configurar</span>
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Testar Bot</span>
          </Button>
        </div>
      </div>

      {/* WhatsApp Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Remover whatsappStats.map */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-orange-500" />
              <span>Conversas Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Remover recentMessages.map */}
            </div>
          </CardContent>
        </Card>

        {/* Automated Features */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Automáticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {automatedFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {feature.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {feature.description}
                      </p>
                    </div>
                    <Switch 
                      checked={feature.enabled}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {feature.usageCount} usos este mês
                    </span>
                    <Button variant="ghost" size="sm">
                      Configurar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Conexão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    WhatsApp Business API
                  </h3>
                  <Badge className="bg-green-100 text-green-800 mt-1">
                    Conectado
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Conexão estável com Twilio
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Bot IA
                  </h3>
                  <Badge className="bg-green-100 text-green-800 mt-1">
                    Ativo
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Processando mensagens normalmente
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Notificações
                  </h3>
                  <Badge className="bg-green-100 text-green-800 mt-1">
                    Habilitadas
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Alertas automáticos ativos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Test */}
      <Card>
        <CardHeader>
          <CardTitle>Teste Rápido do Bot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input 
              placeholder="Digite uma mensagem para testar o bot..."
              className="flex-1"
            />
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Exemplos de comandos:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• "Como estão as vendas hoje?"</li>
              <li>• "Qual o ticket médio desta semana?"</li>
              <li>• "Agendar reunião para quinta-feira às 14h"</li>
              <li>• "Gerar relatório mensal"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
