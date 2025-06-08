-- Enterprise Features Database Schema
-- Advanced clustering, compliance, dark pool detection, and arbitrage monitoring

-- Enterprise clustering results table
CREATE TABLE IF NOT EXISTS enterprise_clustering_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL,
    algorithm_used VARCHAR(50) NOT NULL,
    feature_count INTEGER NOT NULL,
    wallet_count INTEGER NOT NULL,
    clusters JSONB NOT NULL,
    analysis JSONB NOT NULL,
    insights JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance rules table
CREATE TABLE IF NOT EXISTS compliance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    conditions JSONB NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('alert','block','review')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance alerts table
CREATE TABLE IF NOT EXISTS compliance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL,
    rule_id UUID REFERENCES compliance_rules(id),
    transaction_id UUID,
    wallet_address VARCHAR(64),
    amount DECIMAL(16, 8),
    risk_score DECIMAL(3, 2),
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','false_positive')),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID
);

-- Dark pool events table
CREATE TABLE IF NOT EXISTS dark_pool_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL,
    transaction_id UUID,
    amount DECIMAL(16, 8) NOT NULL,
    confidence_score DECIMAL(3, 2) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL,
    exchanges_involved JSONB,
    metadata JSONB,
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Arbitrage opportunities table
CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL,
    currency_pair VARCHAR(20) NOT NULL,
    buy_exchange VARCHAR(50) NOT NULL,
    sell_exchange VARCHAR(50) NOT NULL,
    buy_price DECIMAL(16, 8) NOT NULL,
    sell_price DECIMAL(16, 8) NOT NULL,
    spread_percentage DECIMAL(5, 2) NOT NULL,
    estimated_profit DECIMAL(16, 8),
    volume_available DECIMAL(16, 8),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enterprise wallet intelligence table
CREATE TABLE IF NOT EXISTS enterprise_wallet_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL,
    wallet_address VARCHAR(64) NOT NULL,
    entity_type VARCHAR(50),
    entity_confidence DECIMAL(3, 2),
    risk_score DECIMAL(3, 2),
    behavioral_features JSONB,
    flow_analysis JSONB,
    last_analyzed TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(enterprise_id, wallet_address)
);

-- Enterprise flow tracking table
CREATE TABLE IF NOT EXISTS enterprise_flow_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL,
    from_address VARCHAR(64) NOT NULL,
    to_address VARCHAR(64) NOT NULL,
    total_amount DECIMAL(16, 8) NOT NULL,
    transaction_count INTEGER NOT NULL,
    first_seen TIMESTAMPTZ NOT NULL,
    last_seen TIMESTAMPTZ NOT NULL,
    flow_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(enterprise_id, from_address, to_address)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enterprise_clustering_enterprise_id ON enterprise_clustering_results(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_clustering_created_at ON enterprise_clustering_results(created_at);

CREATE INDEX IF NOT EXISTS idx_compliance_rules_enterprise_id ON compliance_rules(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_active ON compliance_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_compliance_alerts_enterprise_id ON compliance_alerts(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_created_at ON compliance_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_severity ON compliance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_status ON compliance_alerts(status);

CREATE INDEX IF NOT EXISTS idx_dark_pool_events_enterprise_id ON dark_pool_events(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_dark_pool_events_detected_at ON dark_pool_events(detected_at);
CREATE INDEX IF NOT EXISTS idx_dark_pool_events_confidence ON dark_pool_events(confidence_score);

CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_enterprise_id ON arbitrage_opportunities(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_expires_at ON arbitrage_opportunities(expires_at);
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_spread ON arbitrage_opportunities(spread_percentage);

CREATE INDEX IF NOT EXISTS idx_enterprise_wallet_intelligence_enterprise_id ON enterprise_wallet_intelligence(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_wallet_intelligence_address ON enterprise_wallet_intelligence(wallet_address);
CREATE INDEX IF NOT EXISTS idx_enterprise_wallet_intelligence_entity_type ON enterprise_wallet_intelligence(entity_type);

CREATE INDEX IF NOT EXISTS idx_enterprise_flow_tracking_enterprise_id ON enterprise_flow_tracking(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_flow_tracking_from_address ON enterprise_flow_tracking(from_address);
CREATE INDEX IF NOT EXISTS idx_enterprise_flow_tracking_to_address ON enterprise_flow_tracking(to_address);

-- Insert sample compliance rules
INSERT INTO compliance_rules (enterprise_id, rule_name, conditions, action, severity) VALUES
('00000000-0000-0000-0000-000000000001', 'Large Transaction Alert', '{"field": "amount", "operator": ">", "value": 10000}', 'alert', 'high'),
('00000000-0000-0000-0000-000000000001', 'Mixer Interaction', '{"field": "entity_type", "operator": "=", "value": "mixer"}', 'alert', 'critical'),
('00000000-0000-0000-0000-000000000001', 'Rapid Succession', '{"field": "tx_frequency", "operator": ">", "value": 5}', 'review', 'medium'),
('00000000-0000-0000-0000-000000000001', 'Sanctioned Address', '{"field": "sanctioned", "operator": "=", "value": true}', 'block', 'critical')
ON CONFLICT DO NOTHING;

-- Insert sample dark pool events
INSERT INTO dark_pool_events (enterprise_id, amount, confidence_score, pattern_type, exchanges_involved) VALUES
('00000000-0000-0000-0000-000000000001', 2500.00, 0.89, 'Large block transfer', '["Binance", "Coinbase"]'),
('00000000-0000-0000-0000-000000000001', 1800.00, 0.76, 'Cross-exchange arbitrage', '["Kraken", "Bitstamp"]'),
('00000000-0000-0000-0000-000000000001', 950.00, 0.82, 'Institutional accumulation', '["Gemini"]')
ON CONFLICT DO NOTHING;

-- Insert sample arbitrage opportunities
INSERT INTO arbitrage_opportunities (enterprise_id, currency_pair, buy_exchange, sell_exchange, buy_price, sell_price, spread_percentage, estimated_profit, volume_available, expires_at) VALUES
('00000000-0000-0000-0000-000000000001', 'BTC/USD', 'Kraken', 'Binance', 43200.00, 44250.00, 2.43, 1250.00, 5.2, NOW() + INTERVAL '5 minutes'),
('00000000-0000-0000-0000-000000000001', 'ETH/USD', 'Coinbase', 'Bitstamp', 2450.00, 2495.00, 1.84, 890.00, 12.5, NOW() + INTERVAL '3 minutes'),
('00000000-0000-0000-0000-000000000001', 'BTC/EUR', 'Bitfinex', 'Gemini', 39800.00, 40400.00, 1.51, 650.00, 3.1, NOW() + INTERVAL '7 minutes')
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_compliance_rules_updated_at 
    BEFORE UPDATE ON compliance_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
