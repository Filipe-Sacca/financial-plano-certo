import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Star, MessageSquare, AlertCircle, RefreshCw, Send, Calendar, TrendingDown, Clock, Filter } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
  id: string;
  comment?: string;
  createdAt: string;
  discarded: boolean;
  moderated: boolean;
  published: boolean;
  order: {
    id: string;
    shortId: string;
    createdAt: string;
  };
  score: number;
  has_reply?: boolean;
  reply_text?: string;
  reply_created_at?: string;
}

interface ReviewSummary {
  totalReviewsCount: number;
  validReviewsCount: number;
  score: number;
}

interface Props {
  merchantId: string;
  userId: string;
}

const IfoodReviewsManager: React.FC<Props> = ({ merchantId, userId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Filters
  const [filterScore, setFilterScore] = useState<string>('all');
  const [filterReply, setFilterReply] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const API_BASE_URL = 'http://localhost:6000';

  useEffect(() => {
    loadReviews();
    loadSummary();
  }, [merchantId, page, filterScore, filterReply]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        userId,
        page,
        pageSize,
        addCount: true,
        sort: 'DESC',
        sortBy: 'CREATED_AT'
      };

      const response = await axios.get(
        `${API_BASE_URL}/reviews/${merchantId}`,
        { params }
      );

      if (response.data.success) {
        let reviewData = response.data.data.reviews || [];
        
        // Apply local filters
        if (filterScore !== 'all') {
          const scoreFilter = parseInt(filterScore);
          reviewData = reviewData.filter((r: Review) => Math.floor(r.score) === scoreFilter);
        }
        
        if (filterReply === 'replied') {
          reviewData = reviewData.filter((r: Review) => r.has_reply);
        } else if (filterReply === 'not_replied') {
          reviewData = reviewData.filter((r: Review) => !r.has_reply && r.comment);
        }
        
        setReviews(reviewData);
      }
    } catch (err: any) {
      console.error('Error loading reviews:', err);
      setError('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reviews/${merchantId}/summary`,
        { params: { userId } }
      );

      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (err: any) {
      console.error('Error loading summary:', err);
    }
  };

  const syncReviews = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post(
        `${API_BASE_URL}/reviews/${merchantId}/sync`,
        { userId }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        loadReviews();
        loadSummary();
      }
    } catch (err: any) {
      console.error('Error syncing reviews:', err);
      setError('Erro ao sincronizar avaliações');
    } finally {
      setSyncing(false);
    }
  };

  const sendReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    try {
      setSendingReply(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/reviews/${merchantId}/${selectedReview.id}/reply`,
        { userId, replyText: replyText.trim() }
      );

      if (response.data.success) {
        setSuccess('Resposta enviada com sucesso!');
        setSelectedReview(null);
        setReplyText('');
        loadReviews();
      }
    } catch (err: any) {
      console.error('Error sending reply:', err);
      setError(err.response?.data?.message || 'Erro ao enviar resposta');
    } finally {
      setSendingReply(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(score) ? 'fill-current' : ''}`}
      />
    ));
  };

  const needsAttention = reviews.filter(r => 
    r.published && r.comment && !r.has_reply && r.score <= 3
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-6 mb-8">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Avaliações iFood</h2>
            <p className="text-muted-foreground text-lg">
              Gerencie as avaliações e respostas do seu restaurante
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={syncReviews} disabled={syncing} size="lg" className="bg-orange-500 hover:bg-orange-600">
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sincronizar com iFood
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Média Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary ? getScoreColor(summary.score) : 'text-gray-400'}`}>
                {summary ? summary.score.toFixed(1) : '0.0'}
              </div>
              <div className="flex mt-1">
                {renderStars(summary?.score || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.totalReviewsCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.validReviewsCount || 0} válidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Precisam Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {needsAttention.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Sem resposta e nota baixa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Resposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reviews.length > 0 
                  ? Math.round((reviews.filter(r => r.has_reply).length / reviews.filter(r => r.comment).length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Das avaliações com comentário
              </p>
            </CardContent>
          </Card>
        </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filterScore} onValueChange={setFilterScore}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por nota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as notas</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4">4 estrelas</SelectItem>
                <SelectItem value="3">3 estrelas</SelectItem>
                <SelectItem value="2">2 estrelas</SelectItem>
                <SelectItem value="1">1 estrela</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterReply} onValueChange={setFilterReply}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status de resposta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="replied">Respondidas</SelectItem>
                <SelectItem value="not_replied">Sem resposta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Todas ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="attention">
            Precisam Atenção ({needsAttention.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma avaliação encontrada
                </p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`flex ${getScoreColor(review.score)}`}>
                          {renderStars(review.score)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Pedido #{review.order.shortId}
                        </span>
                        {review.has_reply && (
                          <Badge variant="outline" className="text-green-600">
                            Respondida
                          </Badge>
                        )}
                      </div>
                      
                      {review.comment && (
                        <p className="text-sm mb-3">{review.comment}</p>
                      )}

                      {review.has_reply && review.reply_text && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mt-2">
                          <p className="text-xs text-muted-foreground mb-1">
                            Sua resposta:
                          </p>
                          <p className="text-sm">{review.reply_text}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(review.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(review.createdAt), "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>

                    {review.comment && !review.has_reply && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReview(review)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Responder
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Pagination */}
          {reviews.length > 0 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-3 text-sm">
                Página {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={reviews.length < pageSize}
              >
                Próxima
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="attention" className="space-y-4">
          {needsAttention.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma avaliação precisando de atenção!
                </p>
              </CardContent>
            </Card>
          ) : (
            needsAttention.map((review) => (
              <Card key={review.id} className="border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`flex ${getScoreColor(review.score)}`}>
                          {renderStars(review.score)}
                        </div>
                        <Badge variant="destructive">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Precisa atenção
                        </Badge>
                      </div>
                      
                      <p className="text-sm mb-3">{review.comment}</p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Pedido #{review.order.shortId}</span>
                        <span>
                          {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setSelectedReview(review)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Responder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Responder Avaliação</DialogTitle>
            <DialogDescription>
              Sua resposta será visível publicamente no iFood
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex ${getScoreColor(selectedReview.score)}`}>
                    {renderStars(selectedReview.score)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Pedido #{selectedReview.order.shortId}
                  </span>
                </div>
                <p className="text-sm">{selectedReview.comment}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sua resposta
                </label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="min-h-[100px]"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {replyText.length}/1000 caracteres
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReview(null);
                setReplyText('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={sendReply}
              disabled={sendingReply || !replyText.trim()}
            >
              {sendingReply ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Resposta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IfoodReviewsManager;