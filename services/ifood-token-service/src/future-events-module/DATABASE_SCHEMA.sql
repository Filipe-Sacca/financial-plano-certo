-- 🔄 SCHEMA DO BANCO DE DADOS PARA MÓDULO DE EVENTOS
-- Para implementação futura do sistema de polling de eventos

-- ========================================
-- Tabela principal de eventos
-- ========================================
CREATE TABLE IF NOT EXISTS ifood_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,          -- ID único do evento do iFood
    merchant_id VARCHAR(255) NOT NULL,              -- ID do merchant
    user_id UUID NOT NULL,                          -- ID do usuário no sistema
    event_type VARCHAR(100) NOT NULL,               -- Tipo do evento (PLACED, CONFIRMED, etc)
    event_group VARCHAR(50) NOT NULL,               -- Grupo do evento (ORDER, DELIVERY, etc)
    order_id VARCHAR(255),                          -- ID do pedido (se aplicável)
    customer_id VARCHAR(255),                       -- ID do cliente (se aplicável)
    event_data JSONB NOT NULL,                      -- Dados completos do evento
    metadata JSONB,                                 -- Metadados adicionais
    processing_status VARCHAR(50) DEFAULT 'PENDING', -- Status do processamento
    acknowledged_at TIMESTAMP,                       -- Quando foi confirmado o recebimento
    processed_at TIMESTAMP,                          -- Quando foi processado
    error_message TEXT,                              -- Mensagem de erro se houver
    retry_count INTEGER DEFAULT 0,                   -- Número de tentativas de processamento
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Data de criação do registro
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Data de última atualização

    -- Índices para melhor performance
    INDEX idx_merchant_user (merchant_id, user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_event_group (event_group),
    INDEX idx_processing_status (processing_status),
    INDEX idx_created_at (created_at),
    INDEX idx_order_id (order_id),

    -- Constraint para evitar duplicatas
    UNIQUE KEY unique_event (event_id, merchant_id)
);

-- ========================================
-- Tabela de sessões de polling
-- ========================================
CREATE TABLE IF NOT EXISTS ifood_polling_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,        -- ID único da sessão
    merchant_id VARCHAR(255) NOT NULL,              -- ID do merchant
    user_id UUID NOT NULL,                          -- ID do usuário
    status VARCHAR(50) DEFAULT 'ACTIVE',            -- Status da sessão (ACTIVE, STOPPED, FAILED)
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Quando iniciou
    stopped_at TIMESTAMP,                           -- Quando parou
    last_poll_at TIMESTAMP,                         -- Último polling executado
    total_polls INTEGER DEFAULT 0,                  -- Total de polls executados
    total_events INTEGER DEFAULT 0,                 -- Total de eventos recebidos
    total_errors INTEGER DEFAULT 0,                 -- Total de erros
    config JSONB,                                   -- Configuração da sessão (filtros, etc)

    INDEX idx_merchant_session (merchant_id, user_id),
    INDEX idx_status (status),
    INDEX idx_last_poll (last_poll_at)
);

-- ========================================
-- Tabela de erros de polling
-- ========================================
CREATE TABLE IF NOT EXISTS ifood_polling_errors (
    id SERIAL PRIMARY KEY,
    merchant_id VARCHAR(255) NOT NULL,              -- ID do merchant
    user_id UUID NOT NULL,                          -- ID do usuário
    session_id VARCHAR(255),                        -- ID da sessão (se aplicável)
    error_type VARCHAR(100),                        -- Tipo do erro
    error_message TEXT NOT NULL,                    -- Mensagem de erro
    error_stack TEXT,                               -- Stack trace completo
    request_data JSONB,                             -- Dados da request que causou o erro
    response_data JSONB,                            -- Resposta recebida (se houver)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_merchant_errors (merchant_id, user_id),
    INDEX idx_session_errors (session_id),
    INDEX idx_error_type (error_type),
    INDEX idx_created_errors (created_at)
);

-- ========================================
-- Tabela de acknowledgments
-- ========================================
CREATE TABLE IF NOT EXISTS ifood_acknowledgments (
    id SERIAL PRIMARY KEY,
    acknowledgment_id VARCHAR(255) UNIQUE,          -- ID do acknowledgment
    event_ids TEXT[] NOT NULL,                      -- Array de IDs de eventos confirmados
    merchant_id VARCHAR(255) NOT NULL,              -- ID do merchant
    user_id UUID NOT NULL,                          -- ID do usuário
    status VARCHAR(50) DEFAULT 'PENDING',           -- Status do acknowledgment
    response_code INTEGER,                          -- Código de resposta do iFood
    response_data JSONB,                            -- Resposta completa do iFood
    attempted_at TIMESTAMP,                         -- Quando foi tentado
    succeeded_at TIMESTAMP,                         -- Quando teve sucesso
    failed_at TIMESTAMP,                            -- Quando falhou
    retry_count INTEGER DEFAULT 0,                  -- Tentativas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_merchant_ack (merchant_id, user_id),
    INDEX idx_status_ack (status),
    INDEX idx_created_ack (created_at)
);

-- ========================================
-- Tabela de métricas de polling
-- ========================================
CREATE TABLE IF NOT EXISTS ifood_polling_metrics (
    id SERIAL PRIMARY KEY,
    merchant_id VARCHAR(255) NOT NULL,              -- ID do merchant
    user_id UUID NOT NULL,                          -- ID do usuário
    metric_date DATE NOT NULL,                      -- Data da métrica
    total_polls INTEGER DEFAULT 0,                  -- Total de polls no dia
    total_events INTEGER DEFAULT 0,                 -- Total de eventos recebidos
    total_acknowledgments INTEGER DEFAULT 0,        -- Total de acknowledgments enviados
    total_errors INTEGER DEFAULT 0,                 -- Total de erros
    average_poll_duration_ms INTEGER,               -- Duração média do poll em ms
    average_events_per_poll DECIMAL(10,2),          -- Média de eventos por poll
    success_rate DECIMAL(5,2),                      -- Taxa de sucesso (%)
    uptime_minutes INTEGER,                         -- Tempo ativo em minutos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Uma métrica por dia por merchant/user
    UNIQUE KEY unique_metric (merchant_id, user_id, metric_date),
    INDEX idx_date_metric (metric_date),
    INDEX idx_merchant_metric (merchant_id, user_id)
);

-- ========================================
-- Views úteis
-- ========================================

-- View de eventos pendentes de processamento
CREATE VIEW pending_events AS
SELECT
    e.*,
    m.name as merchant_name
FROM ifood_events e
LEFT JOIN ifood_merchants m ON e.merchant_id = m.id
WHERE e.processing_status = 'PENDING'
ORDER BY e.created_at ASC;

-- View de sessões de polling ativas
CREATE VIEW active_polling_sessions AS
SELECT
    ps.*,
    m.name as merchant_name,
    TIMESTAMPDIFF(MINUTE, ps.last_poll_at, NOW()) as minutes_since_last_poll
FROM ifood_polling_sessions ps
LEFT JOIN ifood_merchants m ON ps.merchant_id = m.id
WHERE ps.status = 'ACTIVE'
ORDER BY ps.last_poll_at DESC;

-- View de métricas do dia
CREATE VIEW today_metrics AS
SELECT
    m.merchant_id,
    m.user_id,
    mer.name as merchant_name,
    m.total_polls,
    m.total_events,
    m.total_acknowledgments,
    m.total_errors,
    m.success_rate,
    m.average_events_per_poll
FROM ifood_polling_metrics m
LEFT JOIN ifood_merchants mer ON m.merchant_id = mer.id
WHERE m.metric_date = CURRENT_DATE;

-- ========================================
-- Stored Procedures úteis
-- ========================================

-- Procedure para limpar eventos antigos
DELIMITER $$
CREATE PROCEDURE cleanup_old_events(IN days_to_keep INT)
BEGIN
    DELETE FROM ifood_events
    WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY)
    AND processing_status IN ('PROCESSED', 'ACKNOWLEDGED');

    DELETE FROM ifood_polling_errors
    WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);

    DELETE FROM ifood_acknowledgments
    WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY)
    AND status = 'SUCCESS';
END$$
DELIMITER ;

-- Procedure para calcular métricas diárias
DELIMITER $$
CREATE PROCEDURE calculate_daily_metrics(IN p_merchant_id VARCHAR(255), IN p_user_id VARCHAR(36))
BEGIN
    INSERT INTO ifood_polling_metrics (
        merchant_id,
        user_id,
        metric_date,
        total_polls,
        total_events,
        total_acknowledgments,
        total_errors,
        success_rate,
        average_events_per_poll
    )
    SELECT
        p_merchant_id,
        p_user_id,
        CURRENT_DATE,
        COUNT(DISTINCT ps.id) as total_polls,
        COUNT(DISTINCT e.id) as total_events,
        COUNT(DISTINCT a.id) as total_acknowledgments,
        COUNT(DISTINCT pe.id) as total_errors,
        CASE
            WHEN COUNT(DISTINCT ps.id) > 0
            THEN (COUNT(DISTINCT ps.id) - COUNT(DISTINCT pe.id)) * 100.0 / COUNT(DISTINCT ps.id)
            ELSE 0
        END as success_rate,
        CASE
            WHEN COUNT(DISTINCT ps.id) > 0
            THEN COUNT(DISTINCT e.id) * 1.0 / COUNT(DISTINCT ps.id)
            ELSE 0
        END as average_events_per_poll
    FROM ifood_polling_sessions ps
    LEFT JOIN ifood_events e ON e.merchant_id = ps.merchant_id AND e.user_id = ps.user_id
        AND DATE(e.created_at) = CURRENT_DATE
    LEFT JOIN ifood_acknowledgments a ON a.merchant_id = ps.merchant_id AND a.user_id = ps.user_id
        AND DATE(a.created_at) = CURRENT_DATE
    LEFT JOIN ifood_polling_errors pe ON pe.merchant_id = ps.merchant_id AND pe.user_id = ps.user_id
        AND DATE(pe.created_at) = CURRENT_DATE
    WHERE ps.merchant_id = p_merchant_id
        AND ps.user_id = p_user_id
        AND DATE(ps.started_at) = CURRENT_DATE
    ON DUPLICATE KEY UPDATE
        total_polls = VALUES(total_polls),
        total_events = VALUES(total_events),
        total_acknowledgments = VALUES(total_acknowledgments),
        total_errors = VALUES(total_errors),
        success_rate = VALUES(success_rate),
        average_events_per_poll = VALUES(average_events_per_poll),
        updated_at = NOW();
END$$
DELIMITER ;