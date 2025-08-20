-- ====================================================================
-- iFood Orders Module - Database Schema
-- Created: 18/08/2025
-- Purpose: Support for iFood orders polling, acknowledgment and processing
-- ====================================================================

-- Table: ifood_orders
-- Purpose: Store orders received from iFood virtual bag
CREATE TABLE IF NOT EXISTS ifood_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ifood_order_id VARCHAR(100) UNIQUE NOT NULL,
    merchant_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    
    -- Order Status Management
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    -- Possible values: 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED'
    
    -- Order Data (from iFood API)
    order_data JSONB NOT NULL,
    virtual_bag_data JSONB,
    
    -- Customer Information (extracted from order_data)
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_address JSONB,
    
    -- Financial Information
    total_amount DECIMAL(10,2),
    delivery_fee DECIMAL(10,2),
    payment_method VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Cancellation Details
    cancellation_reason TEXT,
    cancelled_by VARCHAR(50), -- 'CUSTOMER', 'IFOOD', 'MERCHANT'
    
    -- Foreign Key Constraints
    CONSTRAINT fk_ifood_orders_merchant 
        FOREIGN KEY (merchant_id, user_id) 
        REFERENCES ifood_merchants(merchant_id, user_id)
        ON DELETE CASCADE
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_ifood_orders_merchant_status 
    ON ifood_orders(merchant_id, status);
    
CREATE INDEX IF NOT EXISTS idx_ifood_orders_created_at 
    ON ifood_orders(created_at);
    
CREATE INDEX IF NOT EXISTS idx_ifood_orders_ifood_order_id 
    ON ifood_orders(ifood_order_id);
    
CREATE INDEX IF NOT EXISTS idx_ifood_orders_user_id 
    ON ifood_orders(user_id);

-- ====================================================================

-- Table: ifood_events
-- Purpose: Track events received from polling and their acknowledgment status
CREATE TABLE IF NOT EXISTS ifood_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    merchant_id VARCHAR(100),
    
    -- Event Classification
    event_type VARCHAR(50) NOT NULL,
    -- Possible values: 'ORDER_PLACED', 'ORDER_CONFIRMED', 'ORDER_CANCELLED', 'ORDER_DELIVERED', etc.
    
    event_category VARCHAR(50),
    -- Categories: 'ORDER', 'CATALOG', 'MERCHANT', 'PICKING', etc.
    
    -- Event Data
    event_data JSONB NOT NULL,
    raw_response JSONB, -- Original API response for debugging
    
    -- Polling Information
    polling_batch_id UUID, -- Reference to polling_log entry
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Acknowledgment Tracking
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledgment_attempts INTEGER DEFAULT 0,
    acknowledgment_success BOOLEAN DEFAULT FALSE,
    acknowledgment_response JSONB,
    
    -- Processing Status
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_status VARCHAR(50) DEFAULT 'PENDING',
    -- Values: 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED'
    
    processing_error TEXT,
    processing_attempts INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_ifood_events_event_id 
    ON ifood_events(event_id);
    
CREATE INDEX IF NOT EXISTS idx_ifood_events_user_acknowledged 
    ON ifood_events(user_id, acknowledged_at);
    
CREATE INDEX IF NOT EXISTS idx_ifood_events_merchant_type 
    ON ifood_events(merchant_id, event_type);
    
CREATE INDEX IF NOT EXISTS idx_ifood_events_processing_status 
    ON ifood_events(processing_status, created_at);
    
CREATE INDEX IF NOT EXISTS idx_ifood_events_acknowledgment_success 
    ON ifood_events(acknowledgment_success, acknowledgment_attempts);

-- ====================================================================

-- Table: ifood_polling_log
-- Purpose: Audit trail and performance monitoring for polling operations
CREATE TABLE IF NOT EXISTS ifood_polling_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Polling Execution Details
    polling_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    polling_duration_ms INTEGER,
    
    -- Events Statistics
    events_received INTEGER DEFAULT 0,
    events_processed INTEGER DEFAULT 0,
    events_acknowledged INTEGER DEFAULT 0,
    events_failed INTEGER DEFAULT 0,
    
    -- API Performance
    api_response_time_ms INTEGER,
    api_status_code INTEGER,
    api_error_message TEXT,
    
    -- Execution Status
    success BOOLEAN NOT NULL DEFAULT FALSE,
    error_message TEXT,
    error_details JSONB,
    
    -- Headers sent (for debugging)
    request_headers JSONB,
    response_headers JSONB,
    
    -- Merchant Filter (x-polling-merchants header value)
    merchant_filter TEXT,
    
    -- Performance Metrics
    memory_usage_mb DECIMAL(10,2),
    cpu_usage_percent DECIMAL(5,2),
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Next polling scheduled time (for monitoring)
    next_polling_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for Performance and Monitoring
CREATE INDEX IF NOT EXISTS idx_ifood_polling_log_user_timestamp 
    ON ifood_polling_log(user_id, polling_timestamp);
    
CREATE INDEX IF NOT EXISTS idx_ifood_polling_log_success 
    ON ifood_polling_log(success, polling_timestamp);
    
CREATE INDEX IF NOT EXISTS idx_ifood_polling_log_performance 
    ON ifood_polling_log(api_response_time_ms, polling_timestamp);
    
CREATE INDEX IF NOT EXISTS idx_ifood_polling_log_events_received 
    ON ifood_polling_log(events_received, polling_timestamp);

-- ====================================================================

-- Table: ifood_acknowledgment_batches
-- Purpose: Track acknowledgment batch operations (max 2000 events per batch)
CREATE TABLE IF NOT EXISTS ifood_acknowledgment_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Batch Details
    batch_size INTEGER NOT NULL,
    event_ids TEXT[], -- Array of event IDs in this batch
    
    -- Execution Details
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    success BOOLEAN DEFAULT FALSE,
    successful_acknowledgments INTEGER DEFAULT 0,
    failed_acknowledgments INTEGER DEFAULT 0,
    failed_event_ids TEXT[], -- Array of failed event IDs
    
    -- API Response
    api_response_time_ms INTEGER,
    api_status_code INTEGER,
    api_response JSONB,
    api_error_message TEXT,
    
    -- Retry Information
    retry_attempts INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance Metrics
    processing_duration_ms INTEGER
);

-- Indexes for Batch Tracking
CREATE INDEX IF NOT EXISTS idx_ifood_acknowledgment_batches_user_id 
    ON ifood_acknowledgment_batches(user_id, started_at);
    
CREATE INDEX IF NOT EXISTS idx_ifood_acknowledgment_batches_success 
    ON ifood_acknowledgment_batches(success, completed_at);
    
CREATE INDEX IF NOT EXISTS idx_ifood_acknowledgment_batches_retry 
    ON ifood_acknowledgment_batches(next_retry_at, retry_attempts);

-- ====================================================================

-- Table: ifood_virtual_bag_imports
-- Purpose: Track virtual bag import operations and their status
CREATE TABLE IF NOT EXISTS ifood_virtual_bag_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    merchant_id VARCHAR(100) NOT NULL,
    
    -- Import Details
    ifood_order_id VARCHAR(100) NOT NULL,
    virtual_bag_data JSONB NOT NULL,
    import_source VARCHAR(50) DEFAULT 'POLLING', -- 'POLLING', 'WEBHOOK', 'MANUAL'
    
    -- Processing Status
    import_status VARCHAR(50) DEFAULT 'PENDING',
    -- Values: 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DUPLICATE'
    
    -- Timestamps
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    error_details JSONB,
    
    -- Order Reference (after successful import)
    order_id UUID REFERENCES ifood_orders(id),
    
    -- Performance Metrics
    processing_duration_ms INTEGER,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Virtual Bag Tracking
CREATE INDEX IF NOT EXISTS idx_ifood_virtual_bag_imports_order_id 
    ON ifood_virtual_bag_imports(ifood_order_id);
    
CREATE INDEX IF NOT EXISTS idx_ifood_virtual_bag_imports_status 
    ON ifood_virtual_bag_imports(import_status, received_at);
    
CREATE INDEX IF NOT EXISTS idx_ifood_virtual_bag_imports_merchant 
    ON ifood_virtual_bag_imports(merchant_id, user_id);

-- ====================================================================

-- Views for Monitoring and Analytics

-- View: Polling Performance Dashboard
CREATE OR REPLACE VIEW v_polling_performance AS
SELECT 
    DATE_TRUNC('hour', polling_timestamp) as hour,
    user_id,
    COUNT(*) as total_polls,
    COUNT(CASE WHEN success THEN 1 END) as successful_polls,
    AVG(api_response_time_ms) as avg_response_time_ms,
    AVG(events_received) as avg_events_per_poll,
    AVG(polling_duration_ms) as avg_processing_time_ms,
    MAX(events_received) as max_events_received
FROM ifood_polling_log
WHERE polling_timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', polling_timestamp), user_id
ORDER BY hour DESC;

-- View: Event Processing Status
CREATE OR REPLACE VIEW v_event_processing_status AS
SELECT 
    user_id,
    merchant_id,
    event_type,
    COUNT(*) as total_events,
    COUNT(CASE WHEN acknowledgment_success THEN 1 END) as acknowledged_events,
    COUNT(CASE WHEN processing_status = 'COMPLETED' THEN 1 END) as processed_events,
    COUNT(CASE WHEN processing_status = 'FAILED' THEN 1 END) as failed_events,
    AVG(acknowledgment_attempts) as avg_acknowledgment_attempts,
    MAX(created_at) as last_event_received
FROM ifood_events
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY user_id, merchant_id, event_type;

-- View: Orders Status Dashboard  
CREATE OR REPLACE VIEW v_orders_status_dashboard AS
SELECT 
    user_id,
    merchant_id,
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    MIN(created_at) as first_order,
    MAX(created_at) as last_order
FROM ifood_orders
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY user_id, merchant_id, status;

-- ====================================================================

-- Functions for Maintenance and Monitoring

-- Function: Clean old polling logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_polling_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ifood_polling_log 
    WHERE polling_timestamp < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO ifood_polling_log (user_id, success, error_message, events_received)
    VALUES ('SYSTEM', TRUE, 'Cleanup completed: ' || deleted_count || ' old records removed', 0);
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get polling health status
CREATE OR REPLACE FUNCTION get_polling_health_status(input_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'user_id', input_user_id,
        'last_successful_poll', MAX(CASE WHEN success THEN polling_timestamp END),
        'last_failed_poll', MAX(CASE WHEN NOT success THEN polling_timestamp END),
        'polls_last_hour', COUNT(CASE WHEN polling_timestamp >= NOW() - INTERVAL '1 hour' THEN 1 END),
        'success_rate_last_24h', 
            ROUND(
                (COUNT(CASE WHEN success AND polling_timestamp >= NOW() - INTERVAL '24 hours' THEN 1 END) * 100.0) / 
                NULLIF(COUNT(CASE WHEN polling_timestamp >= NOW() - INTERVAL '24 hours' THEN 1 END), 0), 
                2
            ),
        'avg_response_time_ms', AVG(api_response_time_ms),
        'total_events_today', SUM(events_received),
        'status', CASE 
            WHEN MAX(polling_timestamp) < NOW() - INTERVAL '2 minutes' THEN 'OFFLINE'
            WHEN COUNT(CASE WHEN NOT success AND polling_timestamp >= NOW() - INTERVAL '5 minutes' THEN 1 END) > 0 THEN 'ERROR'
            ELSE 'HEALTHY'
        END
    ) INTO result
    FROM ifood_polling_log 
    WHERE user_id = input_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================

-- Triggers for automatic timestamp updates

-- Update timestamp trigger for ifood_orders
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ifood_orders_updated_at
    BEFORE UPDATE ON ifood_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ifood_events_updated_at
    BEFORE UPDATE ON ifood_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ifood_virtual_bag_imports_updated_at
    BEFORE UPDATE ON ifood_virtual_bag_imports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================

-- Initial Data and Configuration

-- Create polling configuration table
CREATE TABLE IF NOT EXISTS ifood_polling_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    
    -- Polling Settings
    polling_enabled BOOLEAN DEFAULT TRUE,
    polling_interval_seconds INTEGER DEFAULT 30,
    max_events_per_poll INTEGER DEFAULT 1000,
    
    -- Acknowledgment Settings  
    acknowledgment_enabled BOOLEAN DEFAULT TRUE,
    max_events_per_acknowledgment INTEGER DEFAULT 2000,
    acknowledgment_retry_attempts INTEGER DEFAULT 3,
    acknowledgment_retry_delay_ms INTEGER DEFAULT 1000,
    
    -- Performance Settings
    api_timeout_ms INTEGER DEFAULT 10000,
    batch_processing_size INTEGER DEFAULT 100,
    
    -- Merchant Filtering
    merchant_filter TEXT[], -- Array of merchant IDs to poll
    filter_mode VARCHAR(20) DEFAULT 'INCLUDE', -- 'INCLUDE', 'EXCLUDE', 'ALL'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER trigger_ifood_polling_config_updated_at
    BEFORE UPDATE ON ifood_polling_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- Comments for Documentation

COMMENT ON TABLE ifood_orders IS 'Stores orders received from iFood virtual bag with full order lifecycle tracking';
COMMENT ON TABLE ifood_events IS 'Tracks all events received from iFood polling with acknowledgment status and processing results';
COMMENT ON TABLE ifood_polling_log IS 'Audit trail and performance monitoring for polling operations';
COMMENT ON TABLE ifood_acknowledgment_batches IS 'Tracks batch acknowledgment operations with detailed success/failure analytics';
COMMENT ON TABLE ifood_virtual_bag_imports IS 'Monitors virtual bag import operations and their processing status';
COMMENT ON TABLE ifood_polling_config IS 'Per-user configuration for polling behavior and performance tuning';

-- ====================================================================
-- Schema Version Tracking

INSERT INTO ifood_polling_config (user_id, polling_enabled) 
VALUES ('00000000-0000-0000-0000-000000000000', FALSE)
ON CONFLICT (user_id) DO NOTHING;

-- End of Schema