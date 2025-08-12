# iFood Merchant Status Service

## Overview
This service converts the N8N workflow `[MERCHANT-STATUS]` to code, checking if stores are open based on their opening hours and updating their status in the database.

## Features
- ✅ Fetches opening hours from iFood API
- ✅ Calculates if stores are currently open
- ✅ Updates merchant status in Supabase database
- ✅ Scheduled checks (configurable interval)
- ✅ Manual status checks via API
- ✅ Single merchant or bulk status updates

## Available Implementations

### 1. Python Service
- **Location**: `python_services/ifood_merchant_status_service.py`
- **Port**: 9004 (configurable via `STATUS_SERVICE_PORT`)
- **Run**: `python python_services/ifood_merchant_status_service.py`

### 2. Node.js/TypeScript Service
- **Location**: `ifood-token-service/src/ifoodMerchantStatusService.ts`
- **Port**: 9002 (shared with token service)
- **Run**: Already integrated with the main token service

## API Endpoints

### Check All Merchants Status
```http
POST http://localhost:9002/merchant-status/check
```

Response:
```json
{
  "success": true,
  "totalMerchants": 10,
  "checked": 8,
  "updated": 3,
  "errors": []
}
```

### Check Single Merchant Status
```http
GET http://localhost:9002/merchant-status/{merchantId}
```

Response:
```json
{
  "merchantId": "12345",
  "isOpen": true,
  "statusMessage": "Aberto até 23:00:00",
  "currentTime": "20:30:00",
  "openingTime": "10:00:00",
  "closingTime": "23:00:00"
}
```

### Start Scheduler
```http
POST http://localhost:9002/merchant-status/start-scheduler
Content-Type: application/json

{
  "intervalMinutes": 1
}
```

Response:
```json
{
  "success": true,
  "message": "Scheduler started with 1 minute interval"
}
```

## How It Works

1. **Fetch Merchants**: Gets all merchants from the `ifood_merchants` table
2. **Get Token**: Retrieves the access token for each merchant's user
3. **Fetch Opening Hours**: Calls iFood API to get the merchant's opening hours
4. **Calculate Status**: Determines if the store is currently open based on:
   - Current time
   - Day of week
   - Opening hours schedule
5. **Update Database**: Updates the `status` field in the database (true = open, false = closed)

## Opening Hours Logic

The service handles various scenarios:
- **Normal hours**: Opens and closes on the same day
- **Cross-midnight**: Opens late and closes after midnight
- **No schedule**: Marks as closed if no schedule for current day

## Environment Variables

Required in `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
STATUS_SERVICE_PORT=9004  # For Python service
```

## Database Schema

Expects the following table structure:
```sql
ifood_merchants (
  id: uuid,
  merchant_id: string,
  user_id: string,
  name: string,
  status: boolean,  -- true = open, false = closed
  created_at: timestamp
)
```

## Scheduler

The service can run automatic checks:
- Default interval: 1 minute (matching N8N workflow)
- Configurable via API
- Runs in background thread (Python) or using node-schedule (Node.js)

## Integration with Frontend

To use in your React app:

```typescript
// Check all merchants
const checkAllStatuses = async () => {
  const response = await fetch('http://localhost:9002/merchant-status/check', {
    method: 'POST'
  });
  const result = await response.json();
  console.log(`Updated ${result.updated} merchant statuses`);
};

// Check single merchant
const checkMerchantStatus = async (merchantId: string) => {
  const response = await fetch(`http://localhost:9002/merchant-status/${merchantId}`);
  const status = await response.json();
  console.log(`Merchant ${merchantId} is ${status.isOpen ? 'open' : 'closed'}`);
};

// Start scheduler
const startScheduler = async () => {
  const response = await fetch('http://localhost:9002/merchant-status/start-scheduler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intervalMinutes: 5 })
  });
  const result = await response.json();
  console.log(result.message);
};
```

## Testing

### Test Single Merchant
```bash
curl http://localhost:9002/merchant-status/YOUR_MERCHANT_ID
```

### Test All Merchants
```bash
curl -X POST http://localhost:9002/merchant-status/check
```

### Start Scheduler (1 minute interval)
```bash
curl -X POST http://localhost:9002/merchant-status/start-scheduler \
  -H "Content-Type: application/json" \
  -d '{"intervalMinutes": 1}'
```

## Notes
- The service respects rate limits by processing merchants in batches
- Only updates status if it has changed to minimize database writes
- Logs all operations for debugging
- Handles timezone correctly (uses local server time)