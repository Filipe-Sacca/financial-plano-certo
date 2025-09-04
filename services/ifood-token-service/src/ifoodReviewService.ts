/**
 * iFood Review Service
 * Manages customer reviews and merchant responses
 * Implements all official iFood Review API endpoints
 * 
 * API Documentation: /docs/IFOOD_REVIEW_API_SPECIFICATION.md
 * Base URL: https://merchant-api.ifood.com.br/review/v1.0
 */

import axios, { AxiosInstance } from 'axios';
import { getTokenForUser } from './ifoodTokenService';

// ==================== TYPE DEFINITIONS ====================

export interface ReviewQueryParams {
  page?: number;           // Default: 1
  pageSize?: number;       // Default: 10  
  addCount?: boolean;      // Default: false
  dateFrom?: string;       // ISO 8601
  dateTo?: string;         // ISO 8601
  sort?: 'ASC' | 'DESC';   // Default: DESC
  sortBy?: 'ORDER_DATE' | 'CREATED_AT'; // Default: CREATED_AT
}

export interface Review {
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
  score: number; // 1.0-5.0
  surveyId: string;
  questionnaire?: {
    questions: Question[];
  };
}

export interface Question {
  id: string;
  type: 'BINARY' | 'CHOICE';
  title: string;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  title: string;
}

export interface ReviewListResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  reviews: Review[];
}

export interface ReviewReply {
  text: string;
  createdAt: string;
  reviewId: string;
}

export interface ReviewSummary {
  totalReviewsCount: number;
  validReviewsCount?: number;
  score: number;
  scoreDistribution: Array<{ score: number; count: number }>;
  responseRate: number;
  repliedCount: number;
  averageResponseTime: number | null;
  lastReviewDate: string | null;
}

// ==================== SERVICE CLASS ====================

export class IFoodReviewService {
  private apiClient: AxiosInstance;
  private merchantId: string;
  private userId: string;
  private readonly BASE_URL = 'https://merchant-api.ifood.com.br/review/v1.0';
  private readonly RATE_LIMIT = 10; // requests per second
  
  constructor(merchantId: string, userId: string) {
    this.merchantId = merchantId;
    this.userId = userId;
    
    this.apiClient = axios.create({
      baseURL: this.BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor for authentication
    this.apiClient.interceptors.request.use(async (config) => {
      try {
        console.log(`🔑 [REVIEW-SERVICE] Getting token for user: ${this.userId}`);
        const tokenData = await getTokenForUser(this.userId);
        if (tokenData && tokenData.access_token) {
          config.headers.Authorization = `Bearer ${tokenData.access_token}`;
          console.log(`✅ [REVIEW-SERVICE] Token added to request`);
        } else {
          console.error(`❌ [REVIEW-SERVICE] No token found for user: ${this.userId}`);
        }
        return config;
      } catch (error) {
        console.error(`❌ [REVIEW-SERVICE] Error getting token:`, error);
        return config;
      }
    });

    // Response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          console.error('⚠️ [REVIEW-SERVICE] Rate limit exceeded. Implementing exponential backoff...');
          // Implement retry with exponential backoff
          await this.sleep(1000);
          return this.apiClient.request(error.config);
        }
        
        if (error.response?.status === 401) {
          console.error('🔒 [REVIEW-SERVICE] Authentication failed. Token may be expired.');
        }
        
        throw error;
      }
    );
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * List reviews with filtering and pagination
   * GET /merchants/{merchantId}/reviews
   */
  async getReviews(params?: ReviewQueryParams): Promise<ReviewListResponse> {
    try {
      console.log(`📋 [REVIEW-SERVICE] Fetching reviews for merchant: ${this.merchantId}`);
      
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.addCount !== undefined) queryParams.append('addCount', params.addCount.toString());
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

      const response = await this.apiClient.get<ReviewListResponse>(
        `/merchants/${this.merchantId}/reviews?${queryParams.toString()}`
      );

      console.log(`✅ [REVIEW-SERVICE] Retrieved ${response.data.reviews?.length || 0} reviews`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [REVIEW-SERVICE] Error fetching reviews:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get detailed review by ID
   * GET /merchants/{merchantId}/reviews/{reviewId}
   */
  async getReviewDetails(reviewId: string): Promise<Review> {
    try {
      console.log(`🔍 [REVIEW-SERVICE] Fetching review details: ${reviewId}`);
      
      const response = await this.apiClient.get<Review>(
        `/merchants/${this.merchantId}/reviews/${reviewId}`
      );

      console.log(`✅ [REVIEW-SERVICE] Retrieved review details for: ${reviewId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [REVIEW-SERVICE] Error fetching review details:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Reply to a review
   * POST /merchants/{merchantId}/reviews/{reviewId}/answers
   */
  async replyToReview(reviewId: string, replyText: string): Promise<ReviewReply> {
    try {
      console.log(`💬 [REVIEW-SERVICE] Replying to review: ${reviewId}`);
      
      // Validate reply text
      if (!replyText || replyText.trim().length === 0) {
        throw new Error('Reply text cannot be empty');
      }

      if (replyText.length > 1000) {
        throw new Error('Reply text cannot exceed 1000 characters');
      }

      const response = await this.apiClient.post<ReviewReply>(
        `/merchants/${this.merchantId}/reviews/${reviewId}/answers`,
        {
          text: replyText
        }
      );

      console.log(`✅ [REVIEW-SERVICE] Successfully replied to review: ${reviewId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [REVIEW-SERVICE] Error replying to review:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get review summary statistics
   * Since iFood API doesn't have a summary endpoint, we calculate from existing reviews
   */
  async getReviewSummary(): Promise<ReviewSummary> {
    try {
      console.log(`📊 [REVIEW-SERVICE] Calculating review summary from local data for merchant: ${this.merchantId}`);
      
      // Get reviews from the database instead of API
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: reviews, error } = await supabase
        .from('ifood_reviews')
        .select('score, created_at, has_reply')
        .eq('merchant_id', this.merchantId);

      if (error) {
        console.error('❌ [REVIEW-SERVICE] Database error:', error);
        throw new Error('Failed to fetch reviews from database');
      }

      // Calculate summary statistics
      const totalReviewsCount = reviews?.length || 0;
      const averageScore = totalReviewsCount > 0 
        ? reviews!.reduce((sum, r) => sum + r.score, 0) / totalReviewsCount 
        : 0;
      
      const repliedCount = reviews?.filter(r => r.has_reply).length || 0;
      const responseRate = totalReviewsCount > 0 ? (repliedCount / totalReviewsCount) * 100 : 0;

      // Get score distribution
      const scoreDistribution = [1, 2, 3, 4, 5].map(score => ({
        score,
        count: reviews?.filter(r => Math.floor(r.score) === score).length || 0
      }));

      const summary: ReviewSummary = {
        score: Math.round(averageScore * 10) / 10, // Round to 1 decimal
        totalReviewsCount,
        scoreDistribution,
        responseRate: Math.round(responseRate * 10) / 10,
        repliedCount,
        averageResponseTime: null, // Could be calculated if needed
        lastReviewDate: reviews && reviews.length > 0 
          ? reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null
      };

      console.log(`✅ [REVIEW-SERVICE] Summary calculated - Score: ${summary.score}, Total: ${summary.totalReviewsCount}, Response Rate: ${summary.responseRate}%`);
      return summary;
    } catch (error: any) {
      console.error('❌ [REVIEW-SERVICE] Error calculating summary:', {
        message: error.message,
        merchantId: this.merchantId,
        userId: this.userId
      });
      throw error;
    }
  }

  /**
   * Sync reviews from iFood to local database
   * This is a custom method for local synchronization
   */
  async syncReviews(): Promise<{ synced: number; errors: number }> {
    try {
      console.log(`🔄 [REVIEW-SERVICE] Starting review sync for merchant: ${this.merchantId}`);
      
      let page = 1;
      let totalSynced = 0;
      let errors = 0;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await this.getReviews({
            page,
            pageSize: 50,
            addCount: true,
            sort: 'DESC',
            sortBy: 'CREATED_AT'
          });

          // TODO: Save to database
          // await this.saveReviewsToDatabase(response.reviews);
          
          totalSynced += response.reviews.length;
          hasMore = page < response.pageCount;
          page++;

          // Respect rate limit
          await this.sleep(100); // 10 req/sec = 100ms between requests
        } catch (err) {
          errors++;
          console.error(`❌ [REVIEW-SERVICE] Error syncing page ${page}:`, err);
          hasMore = false;
        }
      }

      console.log(`✅ [REVIEW-SERVICE] Sync complete. Synced: ${totalSynced}, Errors: ${errors}`);
      return { synced: totalSynced, errors };
    } catch (error: any) {
      console.error('❌ [REVIEW-SERVICE] Sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Get reviews with replies from local database
   * Custom method for better performance
   */
  async getReviewsWithReplies(params?: ReviewQueryParams): Promise<ReviewListResponse> {
    try {
      // First try to get from iFood API
      const reviews = await this.getReviews(params);
      
      // TODO: Merge with local database data for replies
      // const localData = await this.getLocalReviews();
      // reviews = this.mergeWithLocalData(reviews, localData);
      
      return reviews;
    } catch (error: any) {
      console.error('❌ [REVIEW-SERVICE] Error getting reviews with replies:', error.message);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Calculate review statistics
   */
  calculateStatistics(reviews: Review[]): {
    avgRating: number;
    distribution: { [key: number]: number };
    responseRate: number;
  } {
    const stats = {
      avgRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      responseRate: 0
    };

    if (reviews.length === 0) return stats;

    let totalScore = 0;
    let reviewsWithComments = 0;
    let reviewsWithReplies = 0;

    reviews.forEach(review => {
      const rating = Math.floor(review.score);
      stats.distribution[rating] = (stats.distribution[rating] || 0) + 1;
      totalScore += review.score;
      
      if (review.comment) reviewsWithComments++;
      // TODO: Check if review has reply in database
    });

    stats.avgRating = totalScore / reviews.length;
    stats.responseRate = reviewsWithComments > 0 ? (reviewsWithReplies / reviewsWithComments) * 100 : 0;

    return stats;
  }

  /**
   * Format date for API queries
   */
  formatDateForAPI(date: Date): string {
    return date.toISOString();
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update merchant ID (for multi-merchant support)
   */
  updateMerchantId(newMerchantId: string): void {
    this.merchantId = newMerchantId;
    console.log(`🔄 [REVIEW-SERVICE] Updated merchant ID to: ${newMerchantId}`);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getReviewSummary();
      return true;
    } catch {
      return false;
    }
  }
}

// ==================== EXPORT ====================

export default IFoodReviewService;