import { IFoodTokenService } from './ifoodTokenService';
import dotenv from 'dotenv';

dotenv.config();

export class TokenScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private service: IFoodTokenService;
  private isRunning: boolean = false;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
    this.service = new IFoodTokenService(supabaseUrl, supabaseKey);
  }

  /**
   * Start the automatic token renewal scheduler
   * @param intervalMinutes - Interval in minutes between checks (default: 120 minutes / 2 hours)
   */
  start(intervalMinutes: number = 120): void {
    if (this.isRunning) {
      console.log('⚠️ Token scheduler is already running');
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    
    console.log('🚀 ===================================');
    console.log('⏰ Starting Token Preventive Renewal Scheduler');
    console.log(`📅 Interval: ${intervalMinutes} minutes`);
    console.log(`🔄 Strategy: Renew ALL tokens preventively (before expiration)`);
    console.log(`🕐 Next renewal in: ${intervalMinutes} minutes`);
    console.log('🚀 ===================================');

    // Run immediately on start
    this.checkAndUpdateTokens();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.checkAndUpdateTokens();
    }, intervalMs);

    this.isRunning = true;
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('🛑 Token scheduler stopped');
    }
  }

  /**
   * Check and update all tokens preventively
   */
  private async checkAndUpdateTokens(): Promise<void> {
    try {
      console.log('');
      console.log('🔄 ===================================');
      console.log(`🕐 Preventive token renewal started at ${new Date().toISOString()}`);
      console.log('🔄 ===================================');

      const result = await this.service.updateAllExpiredTokens();

      if (result.success) {
        const data = result.data as any;
        console.log('✅ Preventive token renewal completed successfully');
        console.log(`📊 Statistics:`);
        console.log(`   - Total tokens in database: ${data.total_tokens}`);
        console.log(`   - Tokens renewed: ${data.updated_tokens}`);
        console.log(`   - Failed renewals: ${data.failed_updates}`);
        
        if (data.updated_tokens === data.total_tokens) {
          console.log('💚 All tokens renewed successfully!');
        } else if (data.failed_updates > 0) {
          console.log('⚠️ Some tokens failed to renew:');
          data.errors.forEach((error: string) => console.log(`   - ${error}`));
        }
      } else {
        console.error('❌ Preventive token renewal failed:', result.error);
      }

      console.log('🔄 ===================================');
      console.log(`🕐 Next preventive renewal at ${this.getNextCheckTime()}`);
      console.log('🔄 ===================================');
      console.log('');
    } catch (error) {
      console.error('❌ Unexpected error during preventive token renewal:', error);
    }
  }

  /**
   * Get the next check time based on current interval
   */
  private getNextCheckTime(): string {
    if (!this.intervalId) return 'Scheduler not running';
    
    // Get interval in milliseconds from the stored timeout
    const intervalMs = 120 * 60 * 1000; // Default to 2 hours
    const nextCheck = new Date(Date.now() + intervalMs);
    return nextCheck.toISOString();
  }

  /**
   * Get scheduler status
   */
  getStatus(): { running: boolean; nextCheck: string } {
    return {
      running: this.isRunning,
      nextCheck: this.isRunning ? this.getNextCheckTime() : 'Not scheduled'
    };
  }
}

// Create a singleton instance
export const tokenScheduler = new TokenScheduler();