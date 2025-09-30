# iFood Token Service - Clean Endpoints

## Summary of Changes
All product, category, menu item, order, review, and shipping endpoints have been removed.
Only merchant basic info and token management endpoints remain.

## Remaining Endpoints

### Token Management (8 endpoints)
- `POST /token` - Get or create token
- `GET /token/user/:userId` - Get token for user
- `POST /token/refresh` - Refresh expired token
- `POST /token/force-refresh/:clientId` - Force refresh token
- `POST /token/update-all-expired` - Update all expired tokens
- `POST /token/scheduler/start` - Start token refresh scheduler
- `POST /token/scheduler/stop` - Stop token refresh scheduler
- `GET /token/scheduler/status` - Get scheduler status

### Merchant Management (7 endpoints)
- `GET /merchants/:merchantId` - Get merchant details
- `POST /merchants/sync-all` - Sync all merchants
- `POST /merchants/refresh` - Refresh merchant data
- `PUT /merchants/:merchantId/opening-hours` - Update opening hours
- `POST /merchants/:merchantId/interruptions` - Create interruption
- `GET /merchants/:merchantId/interruptions` - Get interruptions
- `DELETE /merchants/:merchantId/interruptions/:interruptionId` - Delete interruption

### Utility Endpoints (3 endpoints)
- `GET /` - Root endpoint with API documentation
- `GET /api/users/tokens` - Get all user tokens (debugging)
- `GET /health` - Health check

## Removed Service Files
- ifoodProductService.ts
- ifoodOrderService.ts
- ifoodPollingService.ts
- ifoodEventService.ts
- ifoodReviewService.ts
- ifoodShippingService.ts
- migrateShipping.ts
- productSyncScheduler.ts
- utils/pollingUtils.ts

## Configuration
- Port: 6000 (configured in .env)
- CORS: Configured for frontend on port 5000
- Database: Supabase configured with credentials from .env