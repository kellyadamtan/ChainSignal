-- ChainSignal Database Schema for Bitcoin Analytics
-- This script creates the necessary tables for the Bitcoin analytics platform

-- Create database (if using PostgreSQL/Neon)
-- CREATE DATABASE chainsignal;

-- Transactions table for storing Bitcoin transaction data
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(64) UNIQUE NOT NULL,
    block_height INTEGER,
    value DECIMAL(16, 8) NOT NULL,
    fee DECIMAL(16, 8),
    input_count INTEGER NOT NULL,
    output_count INTEGER NOT NULL,
    size_bytes INTEGER,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_value ON transactions(value);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(hash);

-- Blocks table for storing Bitcoin block data
CREATE TABLE IF NOT EXISTS blocks (
    id SERIAL PRIMARY KEY,
    height INTEGER UNIQUE NOT NULL,
    hash VARCHAR(64) UNIQUE NOT NULL,
    previous_hash VARCHAR(64),
    merkle_root VARCHAR(64),
    timestamp TIMESTAMPTZ NOT NULL,
    difficulty BIGINT,
    nonce BIGINT,
    transaction_count INTEGER NOT NULL,
    size_bytes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_blocks_height ON blocks(height);
CREATE INDEX IF NOT EXISTS idx_blocks_timestamp ON blocks(timestamp);

-- Wallets table for storing wallet information and clustering
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    address VARCHAR(64) UNIQUE NOT NULL,
    balance DECIMAL(16, 8) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    first_seen TIMESTAMPTZ,
    last_active TIMESTAMPTZ,
    cluster_type VARCHAR(20) DEFAULT 'regular',
    cluster_confidence DECIMAL(3, 2) DEFAULT 0.5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for wallet queries
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_wallets_cluster_type ON wallets(cluster_type);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON wallets(balance);
CREATE INDEX IF NOT EXISTS idx_wallets_last_active ON wallets(last_active);

-- Alerts table for storing user-defined alerts
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- Would reference users table in production
    name VARCHAR(255) NOT NULL,
    conditions JSONB NOT NULL,
    channels TEXT[] NOT NULL,
    alert_type VARCHAR(20) DEFAULT 'recurring', -- 'single' or 'recurring'
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for alert queries
CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);

-- Mining pools table for tracking mining pool statistics
CREATE TABLE IF NOT EXISTS mining_pools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    hash_rate_percentage DECIMAL(5, 2),
    blocks_mined_24h INTEGER DEFAULT 0,
    total_blocks_mined INTEGER DEFAULT 0,
    last_block_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Network metrics table for storing aggregated network statistics
CREATE TABLE IF NOT EXISTS network_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(50) NOT NULL,
    metric_value DECIMAL(20, 8) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for time-series queries
CREATE INDEX IF NOT EXISTS idx_network_metrics_timestamp ON network_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_network_metrics_name_timestamp ON network_metrics(metric_name, timestamp);

-- Create materialized view for hourly transaction metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_transaction_metrics AS
SELECT 
    date_trunc('hour', timestamp) AS hour,
    COUNT(*) AS transaction_count,
    SUM(value) AS total_value,
    AVG(value) AS avg_value,
    MAX(value) AS max_value,
    MIN(value) AS min_value,
    SUM(fee) AS total_fees,
    AVG(fee) AS avg_fee
FROM transactions
GROUP BY date_trunc('hour', timestamp)
ORDER BY hour;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_hourly_metrics_hour ON hourly_transaction_metrics(hour);

-- Create materialized view for daily wallet cluster statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_cluster_stats AS
SELECT 
    date_trunc('day', updated_at) AS day,
    cluster_type,
    COUNT(*) AS wallet_count,
    SUM(balance) AS total_balance,
    AVG(balance) AS avg_balance,
    SUM(transaction_count) AS total_transactions
FROM wallets
GROUP BY date_trunc('day', updated_at), cluster_type
ORDER BY day, cluster_type;

-- Create index on daily cluster stats
CREATE INDEX IF NOT EXISTS idx_daily_cluster_stats_day ON daily_cluster_stats(day);

-- Insert sample mining pool data
INSERT INTO mining_pools (name, hash_rate_percentage, blocks_mined_24h) VALUES
('Antpool', 18.5, 45),
('Foundry USA', 16.2, 38),
('F2Pool', 13.8, 32),
('Binance Pool', 11.4, 28),
('ViaBTC', 9.7, 24),
('Poolin', 8.3, 20),
('Others', 22.1, 53)
ON CONFLICT DO NOTHING;

-- Insert sample network metrics
INSERT INTO network_metrics (metric_name, metric_value, timestamp) VALUES
('btc_price', 43250.00, NOW()),
('hash_rate', 450200000000000000000, NOW()),
('difficulty', 62460000000000, NOW()),
('mempool_size', 2400000, NOW()),
('active_addresses', 1234567, NOW())
ON CONFLICT DO NOTHING;

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY hourly_transaction_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_cluster_stats;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update wallet updated_at timestamp
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wallet_update_timestamp
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_wallet_timestamp();

-- Create trigger to update alert updated_at timestamp
CREATE OR REPLACE FUNCTION update_alert_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alert_update_timestamp
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_timestamp();

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO chainsignal_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO chainsignal_user;

COMMIT;

-- Display table information
SELECT 
    schemaname,
    tablename,
    attname,
    typename
FROM pg_tables t
JOIN pg_attribute a ON a.attrelid = (schemaname||'.'||tablename)::regclass
JOIN pg_type ty ON ty.oid = a.atttypid
WHERE schemaname = 'public' 
    AND tablename IN ('transactions', 'blocks', 'wallets', 'alerts', 'mining_pools', 'network_metrics')
    AND a.attnum > 0
ORDER BY tablename, a.attnum;
