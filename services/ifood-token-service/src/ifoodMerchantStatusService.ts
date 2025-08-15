/**
 * iFood Merchant Status Service
 * Converts N8N workflow [MERCHANT-STATUS] to TypeScript code
 * Checks if stores are open and updates their status in the database
 */

import axios from 'axios';
import { supabase, getTokenForUser } from './ifoodTokenService.js';
import * as schedule from 'node-schedule';

interface OpeningHours {
  id?: string;
  dayOfWeek: string;
  start: string; // HH:MM:SS
  end?: string;  // HH:MM:SS
  duration?: number; // minutes
}

interface MerchantStatus {
  merchantId: string;
  isOpen: boolean;
  statusMessage: string;
  currentTime: string;
  openingTime: string;
  closingTime: string;
}

interface Merchant {
  id: string;
  merchant_id: string;
  user_id: string;
  name: string;
  status: boolean;
}

export class IFoodMerchantStatusService {
  private static IFOOD_STATUS_URL = 'https://merchant-api.ifood.com.br/merchant/v1.0/merchants/{merchantId}/status';
  private static IFOOD_HOURS_URL = 'https://merchant-api.ifood.com.br/merchant/v1.0/merchants/{merchantId}/opening-hours';
  
  // Day mapping
  private static DAY_MAP: { [key: string]: number } = {
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
    'SATURDAY': 6,
    'SUNDAY': 0
  };

  /**
   * Get all merchants from database
   */
  static async getAllMerchants(): Promise<Merchant[]> {
    try {
      const { data, error } = await supabase
        .from('ifood_merchants')
        .select('*');

      if (error) {
        console.error('Error fetching merchants:', error);
        return [];
      }

      console.log(`Found ${data?.length || 0} merchants in database`);
      return data || [];
    } catch (error) {
      console.error('Error fetching merchants:', error);
      return [];
    }
  }

  /**
   * Fetch merchant status from iFood API
   */
  static async fetchMerchantStatus(
    merchantId: string,
    accessToken: string
  ): Promise<{ success: boolean; data: any }> {
    try {
      const response = await axios.get(
        this.IFOOD_STATUS_URL.replace('{merchantId}', merchantId),
        {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(`Error fetching merchant status: ${error.message}`);
      return { success: false, data: { error: error.message } };
    }
  }

  /**
   * Fetch opening hours from iFood API
   */
  static async fetchOpeningHours(
    merchantId: string,
    accessToken: string
  ): Promise<{ success: boolean; hours: OpeningHours[] }> {
    try {
      const response = await axios.get(
        this.IFOOD_HOURS_URL.replace('{merchantId}', merchantId),
        {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = response.data;
      let hours: OpeningHours[] = [];

      // Extract shifts/periods from response
      if (data.shifts) {
        hours = data.shifts;
      } else if (data.periods) {
        hours = data.periods;
      } else if (Array.isArray(data)) {
        hours = data;
      } else {
        console.warn(`Unknown opening hours format: ${Object.keys(data)}`);
      }

      return { success: true, hours };
    } catch (error: any) {
      console.error(`Error fetching opening hours: ${error.message}`);
      return { success: false, hours: [] };
    }
  }

  /**
   * Parse time string to Date object
   */
  private static parseTime(timeStr: string): Date {
    const [hours, minutes, seconds = 0] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
  }

  /**
   * Add minutes to a time string
   */
  private static addMinutesToTime(startTime: string, durationMinutes: number): string {
    const start = this.parseTime(startTime);
    const endTime = new Date(start.getTime() + durationMinutes * 60000);
    return `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}:${String(endTime.getSeconds()).padStart(2, '0')}`;
  }

  /**
   * Calculate if merchant is currently open based on opening hours
   * Also returns if we're within business hours
   */
  static calculateIfOpen(openingHours: OpeningHours[]): MerchantStatus & { withinBusinessHours: boolean } {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Find today's schedule
    let todaySchedule: OpeningHours | undefined;
    for (const period of openingHours) {
      const dayOfWeek = period.dayOfWeek;
      if (this.DAY_MAP[dayOfWeek] === currentDay) {
        todaySchedule = period;
        break;
      }
    }

    if (!todaySchedule) {
      return {
        merchantId: '',
        isOpen: false,
        statusMessage: 'Não há funcionamento hoje',
        currentTime,
        openingTime: '',
        closingTime: '',
        withinBusinessHours: false
      };
    }

    // Calculate opening and closing times
    const startTime = todaySchedule.start || '00:00:00';
    const duration = todaySchedule.duration || 0;
    const endTime = todaySchedule.end || this.addMinutesToTime(startTime, duration);

    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    const current = this.parseTime(currentTime);

    // Check if currently within business hours
    let withinBusinessHours = false;
    let isOpen = false;
    let statusMessage = '';

    if (start <= end) {
      // Normal hours (doesn't cross midnight)
      withinBusinessHours = current >= start && current <= end;
      isOpen = withinBusinessHours; // For now, assuming iFood status matches business hours
      
      if (withinBusinessHours) {
        statusMessage = `Dentro do horário de funcionamento (até ${endTime})`;
      } else if (current < start) {
        statusMessage = `Fora do horário - Abrirá às ${startTime}`;
      } else {
        statusMessage = `Fora do horário - Fechou às ${endTime}`;
      }
    } else {
      // Crosses midnight
      withinBusinessHours = current >= start || current <= end;
      isOpen = withinBusinessHours;
      
      if (withinBusinessHours) {
        statusMessage = `Dentro do horário de funcionamento (até ${endTime})`;
      } else {
        statusMessage = `Fora do horário - Abrirá às ${startTime}`;
      }
    }

    return {
      merchantId: '',
      isOpen,
      statusMessage,
      currentTime,
      openingTime: startTime,
      closingTime: endTime,
      withinBusinessHours
    };
  }

  /**
   * Update merchant status in database
   */
  static async updateMerchantStatus(
    merchantId: string,
    isOpen: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ifood_merchants')
        .update({ status: isOpen })
        .eq('merchant_id', merchantId);

      if (error) {
        console.error(`Failed to update status: ${error.message}`);
        return false;
      }

      console.log(`Updated merchant ${merchantId} status to ${isOpen}`);
      return true;
    } catch (error: any) {
      console.error(`Error updating merchant status: ${error.message}`);
      return false;
    }
  }

  /**
   * Check status for a single merchant
   */
  static async checkSingleMerchantStatus(merchantId: string): Promise<MerchantStatus | null> {
    try {
      // Get merchant data
      const { data: merchants, error } = await supabase
        .from('ifood_merchants')
        .select('*')
        .eq('merchant_id', merchantId)
        .single();

      if (error || !merchants) {
        console.error('Merchant not found');
        return null;
      }

      const merchant = merchants as Merchant;

      // Get token
      const tokenData = await getTokenForUser(merchant.user_id);
      if (!tokenData || !tokenData.access_token) {
        console.error('No access token found');
        return null;
      }

      // Fetch opening hours
      const { success, hours } = await this.fetchOpeningHours(
        merchantId,
        tokenData.access_token
      );

      if (!success || hours.length === 0) {
        console.error('Could not fetch opening hours');
        return null;
      }

      // Calculate status
      const status = this.calculateIfOpen(hours);
      status.merchantId = merchantId;

      // Fetch actual iFood status
      const { success: statusSuccess, data: ifoodStatus } = await this.fetchMerchantStatus(
        merchantId,
        tokenData.access_token
      );

      const isActuallyOpen = statusSuccess && ifoodStatus?.state === 'OPEN';

      // Logic: Only update database if store is closed on iFood while within business hours
      if (status.withinBusinessHours && !isActuallyOpen) {
        // Store is closed on iFood during business hours - update database
        if (merchant.status !== false) {
          await this.updateMerchantStatus(merchantId, false);
          console.log(`⚠️ Merchant ${merchantId} is CLOSED during business hours`);
        }
      } else if (isActuallyOpen && !merchant.status) {
        // Store is open on iFood - update database if it was marked as closed
        await this.updateMerchantStatus(merchantId, true);
        console.log(`✅ Merchant ${merchantId} is OPEN - updating database`);
      }
      // If store is closed outside business hours or open during business hours - do nothing

      return status;
    } catch (error: any) {
      console.error(`Error checking merchant status: ${error.message}`);
      return null;
    }
  }

  /**
   * Main method to check all merchant statuses
   * Replicates the N8N workflow [MERCHANT-STATUS]:
   * 1. Get all merchants from database
   * 2. For each merchant:
   *    - Fetch opening hours from iFood
   *    - Calculate if currently open
   *    - Update status in database
   */
  static async checkAllMerchantStatuses(): Promise<{
    success: boolean;
    totalMerchants: number;
    checked: number;
    updated: number;
    errors: any[];
  }> {
    try {
      console.log('Starting merchant status check...');

      // Get all merchants
      const merchants = await this.getAllMerchants();
      if (!merchants || merchants.length === 0) {
        return {
          success: false,
          totalMerchants: 0,
          checked: 0,
          updated: 0,
          errors: [{ error: 'No merchants found' }]
        };
      }

      const results = {
        success: true,
        totalMerchants: merchants.length,
        checked: 0,
        updated: 0,
        errors: [] as any[]
      };

      // Process merchants in batches to avoid rate limiting
      const batchSize = 5;
      for (let i = 0; i < merchants.length; i += batchSize) {
        const batch = merchants.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (merchant) => {
            try {
              const merchantId = merchant.merchant_id;
              const userId = merchant.user_id;
              const currentStatus = merchant.status;

              // Skip if no merchant_id or user_id
              if (!merchantId || !userId) {
                return;
              }

              results.checked++;

              // Get token for this merchant's user
              const tokenData = await getTokenForUser(userId);
              if (!tokenData || !tokenData.access_token) {
                console.warn(`No token found for merchant ${merchantId}`);
                results.errors.push({
                  merchantId,
                  error: 'No access token'
                });
                return;
              }

              // Fetch opening hours
              const { success, hours } = await this.fetchOpeningHours(
                merchantId,
                tokenData.access_token
              );

              if (!success || hours.length === 0) {
                console.warn(`Could not fetch opening hours for ${merchantId}`);
                return;
              }

              // Calculate if within business hours
              const status = this.calculateIfOpen(hours);
              status.merchantId = merchantId;

              // Fetch actual iFood status
              const { success: statusSuccess, data: ifoodStatus } = await this.fetchMerchantStatus(
                merchantId,
                tokenData.access_token
              );

              const isActuallyOpen = statusSuccess && ifoodStatus?.state === 'OPEN';

              // Apply business logic:
              // 1. If store is CLOSED on iFood during business hours -> Update DB to closed
              // 2. If store is OPEN on iFood -> Update DB to open (if it was closed)
              // 3. If store is CLOSED outside business hours -> Do nothing
              
              if (status.withinBusinessHours && !isActuallyOpen) {
                // Store is closed during business hours - this is a problem!
                if (currentStatus !== false) {
                  if (await this.updateMerchantStatus(merchantId, false)) {
                    results.updated++;
                    console.log(`⚠️ Merchant ${merchantId}: FECHADO durante horário comercial - ${status.statusMessage}`);
                  }
                }
              } else if (isActuallyOpen) {
                // Store is open on iFood
                if (currentStatus !== true) {
                  if (await this.updateMerchantStatus(merchantId, true)) {
                    results.updated++;
                    console.log(`✅ Merchant ${merchantId}: ABERTO no iFood - ${status.statusMessage}`);
                  }
                }
              } else if (!status.withinBusinessHours && !isActuallyOpen) {
                // Store is closed outside business hours - this is expected
                console.log(`💤 Merchant ${merchantId}: Fechado fora do horário - ${status.statusMessage}`);
              }
            } catch (error: any) {
              console.error(`Error processing merchant ${merchant.merchant_id}: ${error.message}`);
              results.errors.push({
                merchantId: merchant.merchant_id,
                error: error.message
              });
            }
          })
        );

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < merchants.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Status check complete: ${results.checked} checked, ${results.updated} updated`);
      return results;
    } catch (error: any) {
      const errorMsg = `Error in status check: ${error.message}`;
      console.error(errorMsg);
      return {
        success: false,
        totalMerchants: 0,
        checked: 0,
        updated: 0,
        errors: [{ error: errorMsg }]
      };
    }
  }

  /**
   * Start scheduled status checks
   */
  static startScheduler(intervalMinutes: number = 1): void {
    console.log(`Starting scheduler with ${intervalMinutes} minute interval`);

    // Schedule the job
    const rule = new schedule.RecurrenceRule();
    rule.minute = new schedule.Range(0, 59, intervalMinutes);

    schedule.scheduleJob(rule, async () => {
      console.log(`Running scheduled status check at ${new Date().toISOString()}`);
      await this.checkAllMerchantStatuses();
    });

    console.log('Scheduler started successfully');
  }
}

// Export for use in other modules
export default IFoodMerchantStatusService;