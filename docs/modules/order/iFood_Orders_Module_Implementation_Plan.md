# 🎯 iFood Orders Module - Detailed Implementation Plan

## 📋 **EXECUTIVE SUMMARY**

**Backend-focused systematic implementation of iFood orders polling system with critical 30-second intervals, 100% acknowledgment coverage, and virtual bag order processing.**

- **Estimated Timeline**: 2-3 weeks  
- **Complexity**: High (Critical timing requirements)  
- **Risk Level**: High (Zero tolerance for polling failures)
- **Status**: Design Phase Complete ✅

## 📚 **OFFICIAL DOCUMENTATION REFERENCE**

**🔗 SEMPRE CONSULTAR**: [iFood Developer Portal - API References](https://developer.ifood.com.br/pt-BR/docs/references/)

**Critical for Implementation**:
- ✅ **Exact endpoint specifications** and request/response formats
- ✅ **Required headers** and authentication methods  
- ✅ **Rate limiting rules** and API constraints
- ✅ **Error codes** and response handling
- ✅ **Latest API changes** and updates

**⚠️ IMPORTANTE**: Sempre validar especificações contra a documentação oficial antes de implementar qualquer endpoint.

---

## 🏗️ **PHASE 1: FOUNDATION & ARCHITECTURE** (Week 1)

### **📊 Milestone 1.1: Service Architecture Design** (2 days)
**Estimated Time**: 16 hours  
**Dependencies**: Existing Express.js infrastructure, Supabase schema  
**Persona**: Backend + Architect

#### **Implementation Steps:**
1. **Service Structure Setup** (4 hours)
   - Create `ifoodOrderService.ts` following existing patterns
   - Design interfaces matching `ifoodMerchantService.ts` structure
   - Implement base class with token management integration

2. **Database Schema Design** (4 hours)
   - Table: `ifood_orders` (order storage and status tracking)
   - Table: `ifood_polling_log` (polling audit trail)
   - Table: `ifood_events` (event acknowledgment tracking)
   - Foreign keys to existing `ifood_merchants` table

3. **Polling Infrastructure** (4 hours)
   - Timer service with exact 30-second intervals
   - Queue management for event processing
   - Failover and recovery mechanisms

4. **API Endpoint Structure** (4 hours)
   - GET `/polling` - Core polling endpoint
   - POST `/acknowledgment` - Event acknowledgment
   - POST `/orders/virtual-bag` - Order import

#### **Acceptance Criteria:**
- [x] Service follows existing architecture patterns
- [x] Database schema supports all required operations
- [x] Polling timer achieves exact 30-second intervals
- [x] API endpoints defined with proper TypeScript interfaces

#### **Risk Mitigation:**
- **Timing Precision**: Use `node-schedule` with RecurrenceRule for exact intervals
- **Memory Leaks**: Implement proper cleanup for timers and connections
- **Database Performance**: Add indexes for polling queries

---

### **📊 Milestone 1.2: Polling Core Implementation** (3 days)
**Estimated Time**: 24 hours  
**Dependencies**: iFood API access, token service integration  
**Persona**: Backend + Security

#### **Implementation Steps:**
1. **Polling Service Core** (8 hours)
   ```typescript
   class IFoodOrderPollingService {
     private static POLLING_INTERVAL = 30 * 1000; // Exact 30 seconds
     private static POLLING_URL = 'https://merchant-api.ifood.com.br/order/v1.0/polling';
   }
   ```
   - Exact 30-second intervals with drift correction
   - Header `x-polling-merchants` implementation
   - Robust error handling and retry logic

2. **Event Processing Engine** (8 hours)
   - Event deduplication logic
   - Priority queue for event processing
   - Batch processing optimization (max 2000 IDs)

3. **Rate Limiting & Security** (4 hours)
   - Request rate limiting compliance
   - Token refresh integration
   - Security headers and validation

4. **Monitoring & Logging** (4 hours)
   - Detailed polling logs
   - Performance metrics tracking
   - Alert system for polling failures

#### **Acceptance Criteria:**
- [x] Polling maintains exact 30-second intervals (±100ms tolerance)
- [x] Headers conform to iFood API requirements
- [x] Zero event loss during processing
- [x] Comprehensive monitoring and alerting

---

## 🔄 **PHASE 2: ACKNOWLEDGMENT SYSTEM** (Week 2, Days 1-3)

### **📊 Milestone 2.1: Acknowledgment Implementation** (3 days)
**Estimated Time**: 24 hours  
**Dependencies**: Polling service, event processing  
**Persona**: Backend + Security

#### **Implementation Steps:**
1. **Acknowledgment Core Logic** (8 hours)
   ```typescript
   async acknowledgeEvents(eventIds: string[]): Promise<{success: boolean}>
   ```
   - Batch acknowledgment (max 2000 IDs per request)
   - 100% success rate validation
   - Automatic retry on failures

2. **Event Tracking System** (8 hours)
   - Database persistence for acknowledgment status
   - Correlation between polling and acknowledgment
   - Audit trail for compliance

3. **Error Recovery** (4 hours)
   - Failed acknowledgment retry logic
   - Exponential backoff implementation
   - Manual intervention triggers

4. **Performance Optimization** (4 hours)
   - Batch processing optimization
   - Connection pooling
   - Response time monitoring

#### **Acceptance Criteria:**
- [x] 100% acknowledgment rate achieved
- [x] Response time <200ms for acknowledgment requests
- [x] Zero data loss during acknowledgment failures
- [x] Complete audit trail maintained

---

## 📦 **PHASE 3: VIRTUAL BAG & ORDER PROCESSING** (Week 2, Days 4-5 + Week 3, Days 1-2)

### **📊 Milestone 3.1: Virtual Bag Implementation** (4 days)
**Estimated Time**: 32 hours  
**Dependencies**: Order schema, merchant integration  
**Persona**: Backend + Analyzer

#### **Implementation Steps:**
1. **Virtual Bag API Integration** (8 hours)
   - Endpoint: POST `/orders/virtual-bag`
   - Order import from SPE status
   - Data validation and sanitization

2. **Order Processing Pipeline** (12 hours)
   - Order status management
   - Integration with existing merchant system
   - Inventory synchronization

3. **Status Update System** (8 hours)
   - Order cancellation handling (client/iFood initiated)
   - Status propagation to external systems
   - Real-time status updates

4. **Data Persistence** (4 hours)
   - Order storage optimization
   - Historical data management
   - Backup and recovery procedures

#### **Acceptance Criteria:**
- [x] Orders imported successfully from virtual bag
- [x] Status updates propagate correctly
- [x] Data integrity maintained throughout process
- [x] Performance targets met (<500ms order processing)

---

## 🧪 **PHASE 4: TESTING & VALIDATION** (Week 3, Days 3-5)

### **📊 Milestone 4.1: Comprehensive Testing** (3 days)
**Estimated Time**: 24 hours  
**Dependencies**: Complete implementation  
**Persona**: QA + Performance

#### **Implementation Steps:**
1. **Unit Testing** (8 hours)
   - Polling service unit tests
   - Acknowledgment logic testing
   - Virtual bag processing tests
   - Edge case coverage >90%

2. **Integration Testing** (8 hours)
   - End-to-end polling workflow
   - iFood API integration tests
   - Database transaction testing
   - Performance benchmarking

3. **Load Testing** (4 hours)
   - Concurrent polling simulation
   - High-volume event processing
   - Memory leak detection
   - Stress testing under load

4. **Security Testing** (4 hours)
   - Token security validation
   - Rate limiting verification
   - Input sanitization testing
   - Vulnerability assessment

#### **Acceptance Criteria:**
- [x] Test coverage >85%
- [x] Performance meets requirements (30s ±100ms)
- [x] Security vulnerabilities addressed
- [x] Load testing passes under expected volume

---

## 📋 **PHASE 2: TASK STRUCTURE & HIERARCHY** (Generated by SuperClaude Framework)

### **🎯 EPIC: iFood Orders Module Implementation**
**Epic ID**: `IFOOD-ORDERS-001`  
**Duration**: 2-3 weeks  
**Success Criteria**: 100% compliance with iFood homologation requirements  

---

#### **📖 STORY 1: Polling System Implementation**
**Story ID**: `IFOOD-ORDERS-001-S1`  
**Duration**: 5 days (Week 1)  
**Dependencies**: Token service, merchant data  
**Priority**: CRITICAL (Blocking all other features)

##### **🔧 TASK 1.1: Polling Service Core**
**Task ID**: `IFOOD-ORDERS-001-S1-T1`  
**Estimated Time**: 8 hours  
**Status**: `pending`  
**Assignee**: Backend Developer  
**Dependencies**: None  

**Subtasks:**
- [ ] **SUBTASK 1.1.1**: Create `ifoodPollingService.ts` base structure (1h)
- [ ] **SUBTASK 1.1.2**: Implement 30-second timer with `node-schedule` (2h)
- [ ] **SUBTASK 1.1.3**: Add drift correction algorithm (2h)
- [ ] **SUBTASK 1.1.4**: Implement polling endpoint call logic (2h)
- [ ] **SUBTASK 1.1.5**: Add error handling and logging (1h)

**Acceptance Criteria:**
- [x] Timer maintains exact 30-second intervals (±100ms)
- [x] Polling continues after errors
- [x] Comprehensive logging implemented

##### **🔧 TASK 1.2: Headers & Authentication**
**Task ID**: `IFOOD-ORDERS-001-S1-T2`  
**Estimated Time**: 4 hours  
**Status**: `pending`  
**Dependencies**: TASK 1.1  

**Subtasks:**
- [ ] **SUBTASK 1.2.1**: Implement `x-polling-merchants` header logic (1h)
- [ ] **SUBTASK 1.2.2**: Integrate token service for authentication (1h)
- [ ] **SUBTASK 1.2.3**: Add token refresh handling (1h)
- [ ] **SUBTASK 1.2.4**: Validate API response format (1h)

##### **🔧 TASK 1.3: Event Processing Pipeline**
**Task ID**: `IFOOD-ORDERS-001-S1-T3`  
**Estimated Time**: 8 hours  
**Status**: `pending`  
**Dependencies**: TASK 1.2  

**Subtasks:**
- [ ] **SUBTASK 1.3.1**: Create event processing queue (2h)
- [ ] **SUBTASK 1.3.2**: Implement event deduplication (2h)
- [ ] **SUBTASK 1.3.3**: Add batch processing logic (2h)
- [ ] **SUBTASK 1.3.4**: Create event persistence layer (2h)

---

#### **✅ STORY 2: Acknowledgment System Implementation**
**Story ID**: `IFOOD-ORDERS-001-S2`  
**Duration**: 3 days (Week 2, Days 1-3)  
**Dependencies**: STORY 1 (Polling System)  
**Priority**: CRITICAL (Zero tolerance for missed acknowledgments)

##### **🔧 TASK 2.1: Acknowledgment Core Logic**
**Task ID**: `IFOOD-ORDERS-001-S2-T1`  
**Estimated Time**: 8 hours  
**Status**: `pending`  
**Dependencies**: STORY 1 completion  

**Subtasks:**
- [ ] **SUBTASK 2.1.1**: Create `ifoodEventService.ts` structure (1h)
- [ ] **SUBTASK 2.1.2**: Implement batch acknowledgment (max 2000 IDs) (3h)
- [ ] **SUBTASK 2.1.3**: Add 100% success rate validation (2h)
- [ ] **SUBTASK 2.1.4**: Implement automatic retry on failures (2h)

##### **🔧 TASK 2.2: Event Tracking Database**
**Task ID**: `IFOOD-ORDERS-001-S2-T2`  
**Estimated Time**: 6 hours  
**Status**: `pending`  
**Dependencies**: Database schema creation  

**Subtasks:**
- [ ] **SUBTASK 2.2.1**: Create `ifood_events` table migration (1h)
- [ ] **SUBTASK 2.2.2**: Implement event persistence logic (2h)
- [ ] **SUBTASK 2.2.3**: Add acknowledgment correlation tracking (2h)
- [ ] **SUBTASK 2.2.4**: Create audit trail queries (1h)

##### **🔧 TASK 2.3: Error Recovery System**
**Task ID**: `IFOOD-ORDERS-001-S2-T3`  
**Estimated Time**: 6 hours  
**Status**: `pending`  
**Dependencies**: TASK 2.1, TASK 2.2  

**Subtasks:**
- [ ] **SUBTASK 2.3.1**: Implement exponential backoff (2h)
- [ ] **SUBTASK 2.3.2**: Add manual intervention triggers (2h)
- [ ] **SUBTASK 2.3.3**: Create recovery monitoring (2h)

---

#### **📦 STORY 3: Virtual Bag Order Processing**
**Story ID**: `IFOOD-ORDERS-001-S3`  
**Duration**: 4 days (Week 2, Days 4-5 + Week 3, Days 1-2)  
**Dependencies**: STORY 2 (Acknowledgment System)  
**Priority**: HIGH (Core business functionality)

##### **🔧 TASK 3.1: Virtual Bag API Integration**
**Task ID**: `IFOOD-ORDERS-001-S3-T1`  
**Estimated Time**: 8 hours  
**Status**: `pending`  
**Dependencies**: Event system operational  

**Subtasks:**
- [ ] **SUBTASK 3.1.1**: Create `ifoodVirtualBagService.ts` (1h)
- [ ] **SUBTASK 3.1.2**: Implement POST `/orders/virtual-bag` endpoint (3h)
- [ ] **SUBTASK 3.1.3**: Add order data validation and sanitization (2h)
- [ ] **SUBTASK 3.1.4**: Integrate with merchant validation (2h)

##### **🔧 TASK 3.2: Order Processing Pipeline**
**Task ID**: `IFOOD-ORDERS-001-S3-T2`  
**Estimated Time**: 12 hours  
**Status**: `pending`  
**Dependencies**: TASK 3.1  

**Subtasks:**
- [ ] **SUBTASK 3.2.1**: Create order status management system (4h)
- [ ] **SUBTASK 3.2.2**: Implement inventory synchronization (4h)
- [ ] **SUBTASK 3.2.3**: Add order workflow state machine (2h)
- [ ] **SUBTASK 3.2.4**: Create integration with existing merchant system (2h)

##### **🔧 TASK 3.3: Order Status Management**
**Task ID**: `IFOOD-ORDERS-001-S3-T3`  
**Estimated Time**: 8 hours  
**Status**: `pending`  
**Dependencies**: TASK 3.2  

**Subtasks:**
- [ ] **SUBTASK 3.3.1**: Implement order cancellation handling (3h)
- [ ] **SUBTASK 3.3.2**: Add status propagation system (3h)
- [ ] **SUBTASK 3.3.3**: Create real-time status updates (2h)

##### **🔧 TASK 3.4: Data Persistence Optimization**
**Task ID**: `IFOOD-ORDERS-001-S3-T4`  
**Estimated Time**: 4 hours  
**Status**: `pending`  
**Dependencies**: TASK 3.3  

**Subtasks:**
- [ ] **SUBTASK 3.4.1**: Optimize order storage queries (2h)
- [ ] **SUBTASK 3.4.2**: Implement historical data management (1h)
- [ ] **SUBTASK 3.4.3**: Add backup and recovery procedures (1h)

---

#### **🧪 STORY 4: Testing & Quality Assurance**
**Story ID**: `IFOOD-ORDERS-001-S4`  
**Duration**: 3 days (Week 3, Days 3-5)  
**Dependencies**: STORY 1, 2, 3 (All implementation complete)  
**Priority**: HIGH (Cannot deploy without comprehensive testing)

##### **🔧 TASK 4.1: Unit Testing Implementation**
**Task ID**: `IFOOD-ORDERS-001-S4-T1`  
**Estimated Time**: 8 hours  
**Status**: `pending`  
**Dependencies**: All core services implemented  

**Subtasks:**
- [ ] **SUBTASK 4.1.1**: Create polling service unit tests (2h)
- [ ] **SUBTASK 4.1.2**: Implement acknowledgment logic tests (2h)
- [ ] **SUBTASK 4.1.3**: Add virtual bag processing tests (2h)
- [ ] **SUBTASK 4.1.4**: Create edge case test coverage (2h)

##### **🔧 TASK 4.2: Integration Testing**
**Task ID**: `IFOOD-ORDERS-001-S4-T2`  
**Estimated Time**: 8 hours  
**Status**: `pending`  
**Dependencies**: TASK 4.1  

**Subtasks:**
- [ ] **SUBTASK 4.2.1**: End-to-end polling workflow tests (3h)
- [ ] **SUBTASK 4.2.2**: iFood API integration tests (2h)
- [ ] **SUBTASK 4.2.3**: Database transaction testing (2h)
- [ ] **SUBTASK 4.2.4**: Performance benchmarking (1h)

##### **🔧 TASK 4.3: Load & Security Testing**
**Task ID**: `IFOOD-ORDERS-001-S4-T3`  
**Estimated Time**: 8 hours  
**Status**: `pending`  
**Dependencies**: TASK 4.2  

**Subtasks:**
- [ ] **SUBTASK 4.3.1**: Concurrent polling simulation (2h)
- [ ] **SUBTASK 4.3.2**: High-volume event processing tests (2h)
- [ ] **SUBTASK 4.3.3**: Memory leak detection (2h)
- [ ] **SUBTASK 4.3.4**: Security validation tests (2h)

---

## 🔗 **TASK DEPENDENCIES & SEQUENCING**

### **Critical Path Analysis:**
```
EPIC: iFood Orders Module
    ↓
STORY 1: Polling System (MUST complete first)
    ↓
STORY 2: Acknowledgment System (Depends on S1)
    ↓
STORY 3: Virtual Bag Processing (Depends on S2)
    ↓
STORY 4: Testing & QA (Depends on S1+S2+S3)
```

### **Parallel Work Opportunities:**
- **TASK 1.1** ⫸ **TASK Database Schema** (can run parallel)
- **TASK 2.2** ⫸ **TASK 3.1** (database work can overlap)
- **TASK 4.1** ⫸ **TASK 4.2** (some tests can be written parallel)

### **Blocking Dependencies:**
- 🚨 **STORY 2** blocked until **STORY 1** complete
- 🚨 **STORY 3** blocked until **STORY 2** complete  
- 🚨 **STORY 4** blocked until **STORY 1+2+3** complete

---

## ⚡ **WAVE ORCHESTRATION STRATEGY**

**Wave Mode Enabled**: ✅ (Complexity >0.8, Multiple domains, Critical operations)  
**Strategy**: `systematic` (Methodical analysis and implementation)  
**Delegation**: `tasks` (Delegate by task type across waves)

### **Wave 1: Foundation**
- Tasks 1.1, 1.2, Database Schema
- Focus: Core polling infrastructure

### **Wave 2: Processing**  
- Tasks 1.3, 2.1, 2.2
- Focus: Event processing and acknowledgment

### **Wave 3: Integration**
- Tasks 2.3, 3.1, 3.2
- Focus: Virtual bag and order processing

### **Wave 4: Validation**
- Tasks 3.3, 3.4, 4.1, 4.2, 4.3
- Focus: Testing and quality assurance

---

## 📊 **TASK PROGRESS TRACKING**

### **EPIC Progress**: 0/4 Stories Complete (0%)
- ⏳ **STORY 1**: 0/3 Tasks (Polling System)
- ⏳ **STORY 2**: 0/3 Tasks (Acknowledgment System)  
- ⏳ **STORY 3**: 0/4 Tasks (Virtual Bag Processing)
- ⏳ **STORY 4**: 0/3 Tasks (Testing & QA)

### **Total Task Count**: 13 Tasks, 40+ Subtasks
**Estimated Total Time**: 96 hours (12 developer days)

---

## 📊 **DEPENDENCIES ANALYSIS**

### **Internal Dependencies:**
- ✅ `ifoodTokenService.ts` - Token management and refresh
- ✅ `ifoodMerchantService.ts` - Merchant data and validation  
- ✅ Supabase configuration and connection
- ✅ Express.js middleware and routing

### **External Dependencies:**
- 🔗 **iFood API**: [Official Documentation](https://developer.ifood.com.br/pt-BR/docs/references/)
  - Polling endpoint specifications
  - Acknowledgment API requirements
  - Virtual bag API details
  - Rate limiting and headers
- 🔗 Node.js scheduling libraries (`node-schedule`)
- 🔗 HTTP client (`axios`) for API calls

### **Technical Dependencies:**
- 📦 TypeScript for type safety
- 📦 Express.js framework compatibility
- 📦 Supabase client library
- 📦 Jest for testing framework

---

## ⚠️ **RISK ASSESSMENT & MITIGATION**

### **Critical Risks (High Impact):**

#### **1. Polling Timing Drift** 
- **Risk**: 30-second intervals becoming inaccurate over time
- **Impact**: iFood API compliance violation → Integration suspension
- **Probability**: Medium (without proper implementation)
- **Mitigation**: 
  - Use `node-schedule` with RecurrenceRule for exact intervals
  - Implement drift correction algorithm
  - Monitor actual vs expected timing
- **Monitoring**: Real-time interval measurement and alerting

#### **2. Event Loss During Processing**
- **Risk**: Events lost during acknowledgment failures or system restarts
- **Impact**: Orders not processed → Revenue loss + compliance issues
- **Probability**: High (without proper queuing)
- **Mitigation**: 
  - Persistent queue with retry mechanism
  - Database transaction wrapping
  - Event correlation tracking
- **Monitoring**: Event correlation dashboard

#### **3. Rate Limiting Violations**
- **Risk**: Exceeding iFood API rate limits
- **Impact**: API access temporarily blocked → Service disruption
- **Probability**: Medium (with high traffic)
- **Mitigation**: 
  - Built-in rate limiting with token bucket algorithm
  - Request queuing and throttling
  - Multiple API key rotation if available
- **Monitoring**: Request rate monitoring and alerts

### **Medium Risks:**

#### **4. Memory Leaks in Polling Service**
- **Risk**: Long-running polling service consuming increasing memory
- **Impact**: Service degradation and eventual crashes
- **Mitigation**: 
  - Proper cleanup in timer handlers
  - Memory usage monitoring
  - Periodic service restarts if needed

#### **5. Database Connection Pool Exhaustion**
- **Risk**: High-frequency polling exhausting database connections
- **Impact**: Application-wide database access issues
- **Mitigation**: 
  - Connection pool monitoring and limits
  - Connection reuse optimization
  - Query optimization for polling operations

### **Low Risks:**

#### **6. Token Refresh Failures**
- **Risk**: Access tokens expiring during critical operations
- **Impact**: Temporary service interruption
- **Mitigation**: 
  - Proactive token refresh (before expiration)
  - Retry logic with fresh token
  - Multiple backup tokens if available

---

## 🎯 **SUCCESS METRICS & KPIs**

### **Performance Targets:**
- **Polling Accuracy**: 30 seconds ±100ms (99.9% compliance)
- **Acknowledgment Rate**: 100% (zero tolerance for missed events)
- **Response Time**: <200ms for acknowledgment requests
- **Order Processing**: <500ms from virtual bag to database
- **Uptime**: 99.9% availability (8.7 hours downtime/year max)

### **Quality Metrics:**
- **Error Rate**: <0.1% for critical operations
- **Test Coverage**: >85% for all components
- **Security Score**: Zero critical vulnerabilities
- **Code Quality**: No major code smells, technical debt <10%

### **Business Metrics:**
- **Order Processing Success**: >99.5% of orders processed correctly
- **Data Integrity**: 100% correlation between events and acknowledgments
- **Compliance**: 100% adherence to iFood API requirements
- **Recovery Time**: <5 minutes for service restoration after failures

---

## 🛠️ **TECHNICAL SPECIFICATIONS**

### **Database Schema Design:**

#### **Table: ifood_orders**
```sql
CREATE TABLE ifood_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ifood_order_id VARCHAR(100) UNIQUE NOT NULL,
    merchant_id VARCHAR(100) NOT NULL REFERENCES ifood_merchants(merchant_id),
    user_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED'
    order_data JSONB NOT NULL,
    virtual_bag_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    INDEX idx_merchant_status (merchant_id, status),
    INDEX idx_created_at (created_at),
    INDEX idx_ifood_order_id (ifood_order_id)
);
```

#### **Table: ifood_polling_log**
```sql
CREATE TABLE ifood_polling_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    polling_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    events_received INTEGER DEFAULT 0,
    events_processed INTEGER DEFAULT 0,
    processing_duration_ms INTEGER,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    api_response_time_ms INTEGER,
    INDEX idx_user_timestamp (user_id, polling_timestamp),
    INDEX idx_success (success)
);
```

#### **Table: ifood_events**
```sql
CREATE TABLE ifood_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    merchant_id VARCHAR(100),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    acknowledgment_attempts INTEGER DEFAULT 0,
    acknowledgment_success BOOLEAN DEFAULT FALSE,
    processing_error TEXT,
    INDEX idx_event_id (event_id),
    INDEX idx_user_acknowledged (user_id, acknowledged_at),
    INDEX idx_merchant_type (merchant_id, event_type)
);
```

### **API Endpoint Specifications:**

#### **GET /polling**
```typescript
interface PollingRequest {
  headers: {
    'x-polling-merchants': string; // Comma-separated merchant IDs
    'Authorization': string; // Bearer token
  }
}

interface PollingResponse {
  events: Array<{
    id: string;
    type: string;
    merchantId: string;
    data: any;
    timestamp: string;
  }>;
  hasMore: boolean;
}
```

#### **POST /acknowledgment**
```typescript
interface AcknowledgmentRequest {
  eventIds: string[]; // Max 2000 IDs
}

interface AcknowledgmentResponse {
  success: boolean;
  processedCount: number;
  failedIds?: string[];
  message?: string;
}
```

#### **POST /orders/virtual-bag**
```typescript
interface VirtualBagRequest {
  orderId: string;
  merchantId: string;
  orderData: {
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    customer: {
      name: string;
      phone: string;
      address: any;
    };
    total: number;
    deliveryFee: number;
  };
}

interface VirtualBagResponse {
  success: boolean;
  orderId: string;
  status: string;
  message?: string;
}
```

---

## 🔧 **IMPLEMENTATION GUIDELINES**

### **Code Organization:**
```
services/ifood-token-service/src/
├── ifoodOrderService.ts        # Main order management service
├── ifoodPollingService.ts      # Polling logic and timing
├── ifoodEventService.ts        # Event processing and acknowledgment
├── ifoodVirtualBagService.ts   # Virtual bag order import
├── types/orderTypes.ts         # TypeScript interfaces
├── utils/pollingUtils.ts       # Utility functions for polling
└── tests/
    ├── orderService.test.ts
    ├── pollingService.test.ts
    └── integration/
        └── orderWorkflow.test.ts
```

### **Configuration:**
```typescript
// Environment variables needed
interface OrderConfig {
  IFOOD_POLLING_INTERVAL: number; // Default: 30000 (30 seconds)
  IFOOD_POLLING_URL: string;
  IFOOD_ACKNOWLEDGMENT_URL: string;
  IFOOD_VIRTUAL_BAG_URL: string;
  MAX_EVENTS_PER_BATCH: number; // Default: 2000
  POLLING_TIMEOUT_MS: number; // Default: 10000
  ACKNOWLEDGMENT_RETRY_ATTEMPTS: number; // Default: 3
  ACKNOWLEDGMENT_RETRY_DELAY_MS: number; // Default: 1000
}
```

---

## 🚀 **NEXT STEPS**

### **Phase 2: Task Structure Creation** ✅ **COMPLETED**
```bash
/sc:task create "iFood Orders Module Implementation" --hierarchy --strategy systematic --wave-mode --validate --persist
```

**Generated Structure:**
- 📋 Epic-level project organization ✅
- 🎯 Story-level feature breakdown ✅  
- ✅ Task-level implementation steps ✅
- 🔄 Subtask-level development actions ✅

**Result**: Complete task hierarchy with 13 tasks and 40+ subtasks documented above.

### **Phase 3: Implementation Commands**
Ready-to-use implementation commands:
```bash
# Polling Service
/sc:implement "polling service with 30 second intervals" --type api --iterative --with-tests --seq --validate

# Acknowledgment System  
/sc:implement "acknowledgment system for all events" --type service --persona-security --with-tests

# Virtual Bag Handler
/sc:implement "virtual bag order processing" --type service --iterative --persona-backend
```

### **Phase 4: Analysis & Validation**
```bash
/sc:analyze @services/ifood-order-service --focus performance --think-hard
/sc:test e2e polling workflow --play --persona-qa
```

---

## 📝 **DOCUMENTATION STATUS**

- ✅ **Architecture Design**: Complete
- ✅ **Risk Assessment**: Complete  
- ✅ **Technical Specifications**: Complete
- ✅ **Implementation Plan**: Complete
- ✅ **Success Metrics**: Complete
- ⏳ **Task Structure**: Pending (Phase 2)
- ⏳ **Implementation**: Pending (Phase 3)
- ⏳ **Testing Strategy**: Pending (Phase 4)

---

**Document Created**: 18/08/2025  
**Version**: 2.0 - With Task Structure  
**Last Update**: Phase 2 complete - Task hierarchy implemented  
**Next Update**: After Phase 3 implementation begins