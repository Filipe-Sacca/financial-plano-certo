
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Headphones, 
  Plus, 
  Calendar, 
  FileText,
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';

export const SupportModule = () => {
  // Remover tickets e meetings mock

  const knowledgeBase = [
    {
      title: 'Como configurar integração com iFood',
      category: 'Integração',
      views: 245,
      updated: '2024-07-01'
    },
    {
      title: 'Interpretando relatórios de performance',
      category: 'Relatórios',
      views: 187,
      updated: '2024-06-28'
    },
    {
      title: 'Otimização de cardápio - Boas práticas',
      category: 'Cardápio',
      views: 156,
      updated: '2024-06-25'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return AlertCircle;
      case 'in_progress': return Clock;
      case 'resolved': return CheckCircle;
      default: return MessageSquare;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Suporte Interno
          </h1>
          <p className="text-gray-600">
            Sistema de chamados, reuniões e base de conhecimento
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Agendar Reunião</span>
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Novo Chamado</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-sm text-gray-600">Chamados Abertos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">15</p>
                <p className="text-sm text-gray-600">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">42</p>
                <p className="text-sm text-gray-600">Resolvidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">6</p>
                <p className="text-sm text-gray-600">Reuniões Agendadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chamados de Suporte</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Buscar chamados..."
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* tickets.map((ticket) => { */}
                {/* const StatusIcon = getStatusIcon(ticket.status); */}
                {/* return ( */}
                  {/* <div  */}
                    {/* key={ticket.id} */}
                    {/* className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200" */}
                  {/* > */}
                    {/* <div className="flex items-start justify-between mb-3"> */}
                      {/* <div> */}
                        {/* <div className="flex items-center space-x-2 mb-1"> */}
                          {/* <span className="font-medium text-gray-900"> */}
                            {/* {ticket.id} */}
                          {/* </span> */}
                          {/* <Badge className={getPriorityColor(ticket.priority)}> */}
                            {/* {ticket.priority === 'high' ? 'Alta' : */}
                             {/* ticket.priority === 'medium' ? 'Média' : 'Baixa'} */}
                          {/* </Badge> */}
                        {/* </div> */}
                        {/* <h3 className="font-medium text-gray-900 mb-1"> */}
                          {/* {ticket.subject} */}
                        {/* </h3> */}
                        {/* <p className="text-sm text-gray-600"> */}
                          {/* {ticket.client} */}
                        {/* </p> */}
                      {/* </div> */}
                      {/* <Badge className={getStatusColor(ticket.status)}> */}
                        {/* <StatusIcon className="h-3 w-3 mr-1" /> */}
                        {/* {ticket.status === 'open' ? 'Aberto' : */}
                         {/* ticket.status === 'in_progress' ? 'Em Andamento' : 'Resolvido'} */}
                      {/* </Badge> */}
                    {/* </div> */}
                    
                    {/* <div className="flex items-center justify-between text-sm text-gray-500"> */}
                      {/* <div className="flex items-center space-x-4"> */}
                        {/* <span> */}
                          {/* Criado: {new Date(ticket.created).toLocaleDateString('pt-BR')} */}
                        {/* </span> */}
                        {/* <div className="flex items-center space-x-1"> */}
                          {/* <User className="h-3 w-3" /> */}
                          {/* <span>{ticket.assignee}</span> */}
                        {/* </div> */}
                      {/* </div> */}
                      {/* <Button variant="ghost" size="sm"> */}
                        {/* Ver Detalhes */}
                      {/* </Button> */}
                    {/* </div> */}
                  {/* </div> */}
                {/* ); */}
              {/* })} */}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Reuniões Agendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* meetings.map((meeting, index) => ( */}
                {/* <div  */}
                  {/* key={index} */}
                  {/* className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200" */}
                {/* > */}
                  {/* <div className="flex items-center justify-between mb-3"> */}
                    {/* <div> */}
                      {/* <h3 className="font-medium text-gray-900"> */}
                        {/* {meeting.client} */}
                      {/* </h3> */}
                      {/* <p className="text-sm text-gray-600"> */}
                        {/* {meeting.type} */}
                      {/* </p> */}
                    {/* </div> */}
                    {/* <Badge variant={meeting.status === 'completed' ? 'default' : 'secondary'}> */}
                      {/* {meeting.status === 'completed' ? 'Concluída' : 'Agendada'} */}
                    {/* </Badge> */}
                  {/* </div> */}
                  
                  {/* <div className="flex items-center justify-between"> */}
                    {/* <div className="flex items-center space-x-4 text-sm text-gray-600"> */}
                      {/* <div className="flex items-center space-x-1"> */}
                        {/* <Calendar className="h-4 w-4" /> */}
                        {/* <span> */}
                          {/* {new Date(meeting.date).toLocaleDateString('pt-BR')} */}
                        {/* </span> */}
                      {/* </div> */}
                      {/* <div className="flex items-center space-x-1"> */}
                        {/* <Clock className="h-4 w-4" /> */}
                        {/* <span>{meeting.time}</span> */}
                      {/* </div> */}
                    {/* </div> */}
                    {/* <Button variant="outline" size="sm"> */}
                      {/* {meeting.status === 'completed' ? 'Ver Ata' : 'Entrar'} */}
                    {/* </Button> */}
                  {/* </div> */}
                {/* </div> */}
              {/* ))} */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Base */}
      <Card>
        <CardHeader>
          <CardTitle>Base de Conhecimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {knowledgeBase.map((article, index) => (
              <div 
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <Badge variant="secondary">
                    {article.category}
                  </Badge>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-2">
                  {article.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{article.views} visualizações</span>
                  <span>
                    Atualizado: {new Date(article.updated).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
