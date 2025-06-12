-- Initialize the ChainSignal database with all required tables and data

-- First, run the main database schema
-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for NextAuth
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create accounts table for OAuth
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_account_id)
);

-- Create verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Bitcoin transactions table
CREATE TABLE IF NOT EXISTS bitcoin_transactions (
  id SERIAL PRIMARY KEY,
  txid VARCHAR(64) UNIQUE NOT NULL,
  block_height INTEGER,
  timestamp TIMESTAMP,
  input_count INTEGER,
  output_count INTEGER,
  total_input_value BIGINT,
  total_output_value BIGINT,
  fee BIGINT,
  size INTEGER,
  weight INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bitcoin addresses table
CREATE TABLE IF NOT EXISTS bitcoin_addresses (
  id SERIAL PRIMARY KEY,
  address VARCHAR(62) UNIQUE NOT NULL,
  address_type VARCHAR(20),
  first_seen TIMESTAMP,
  last_seen TIMESTAMP,
  total_received BIGINT DEFAULT 0,
  total_sent BIGINT DEFAULT 0,
  balance BIGINT DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  entity_type VARCHAR(50),
  risk_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet clusters table
CREATE TABLE IF NOT EXISTS wallet_clusters (
  id SERIAL PRIMARY KEY,
  cluster_id VARCHAR(64) UNIQUE NOT NULL,
  addresses TEXT[],
  total_balance BIGINT,
  transaction_count INTEGER,
  entity_type VARCHAR(50),
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mining pools table
CREATE TABLE IF NOT EXISTS mining_pools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  addresses TEXT[],
  hash_rate BIGINT,
  blocks_mined INTEGER DEFAULT 0,
  last_block_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enterprise features tables
CREATE TABLE IF NOT EXISTS compliance_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50),
  conditions JSONB,
  severity VARCHAR(20) DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_alerts (
  id SERIAL PRIMARY KEY,
  rule_id INTEGER REFERENCES compliance_rules(id),
  address VARCHAR(62),
  transaction_id VARCHAR(64),
  alert_data JSONB,
  severity VARCHAR(20),
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
  id SERIAL PRIMARY KEY,
  exchange_pair VARCHAR(100),
  price_difference DECIMAL(10,4),
  volume_24h BIGINT,
  profit_potential DECIMAL(8,4),
  risk_level VARCHAR(20),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dark_pool_events (
  id SERIAL PRIMARY KEY,
  transaction_hash VARCHAR(64),
  addresses TEXT[],
  volume BIGINT,
  confidence_score DECIMAL(3,2),
  event_type VARCHAR(50),
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bitcoin_transactions_txid ON bitcoin_transactions(txid);
CREATE INDEX IF NOT EXISTS idx_bitcoin_transactions_block_height ON bitcoin_transactions(block_height);
CREATE INDEX IF NOT EXISTS idx_bitcoin_addresses_address ON bitcoin_addresses(address);
CREATE INDEX IF NOT EXISTS idx_bitcoin_addresses_entity_type ON bitcoin_addresses(entity_type);
CREATE INDEX IF NOT EXISTS idx_wallet_clusters_cluster_id ON wallet_clusters(cluster_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_status ON compliance_alerts(status);

-- Insert test user with Enterprise subscription
INSERT INTO users (email, name, password_hash, subscription_tier) 
VALUES (
  'admin@chainsignal.com', 
  'Admin User', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
  'enterprise'
) ON CONFLICT (email) DO UPDATE SET 
  subscription_tier = 'enterprise',
  updated_at = CURRENT_TIMESTAMP;

-- Insert sample Bitcoin addresses with entity classifications
INSERT INTO bitcoin_addresses (address, address_type, entity_type, risk_score, total_received, total_sent, balance, transaction_count) VALUES
('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'p2pkh', 'genesis', 0.00, 5000000000, 0, 5000000000, 1),
('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', 'p2sh', 'exchange', 0.15, 150000000000, 149000000000, 1000000000, 15420),
('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'p2wpkh', 'personal', 0.05, 50000000, 45000000, 5000000, 23),
('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', 'p2pkh', 'mixer', 0.85, 200000000, 200000000, 0, 1250),
('3FupnQyzu11ChzZXQ4cQqQN9FZtbSoab7i', 'p2sh', 'mining_pool', 0.10, 500000000000, 495000000000, 5000000000, 8500)
ON CONFLICT (address) DO NOTHING;

-- Insert sample wallet clusters
INSERT INTO wallet_clusters (cluster_id, addresses, total_balance, transaction_count, entity_type, confidence_score) VALUES
('cluster_001', ARRAY['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'], 5000000000, 1, 'genesis', 1.00),
('cluster_002', ARRAY['3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', '1ExAmpLe1234567890123456789012345'], 1000000000, 15420, 'exchange', 0.95),
('cluster_003', ARRAY['bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'], 5000000, 23, 'personal', 0.80)
ON CONFLICT (cluster_id) DO NOTHING;

-- Insert sample mining pools
INSERT INTO mining_pools (name, addresses, hash_rate, blocks_mined) VALUES
('AntPool', ARRAY['3FupnQyzu11ChzZXQ4cQqQN9FZtbSoab7i', '1AntPoolAddress123456789012345678'], 25000000000000000, 1250),
('F2Pool', ARRAY['1F2PoolAddress123456789012345678901', '3F2PoolSecondAddress12345678901234'], 18000000000000000, 980),
('Foundry USA', ARRAY['1FoundryUSAAddress1234567890123456', '3FoundryUSASecondAddr123456789012'], 22000000000000000, 1150)
ON CONFLICT (name) DO NOTHING;

-- Insert sample compliance rules
INSERT INTO compliance_rules (name, description, rule_type, conditions, severity) VALUES
('High Value Transaction Alert', 'Alert for transactions over 100 BTC', 'transaction_value', '{"threshold": 10000000000}', 'high'),
('Mixer Detection', 'Detect transactions involving known mixers', 'entity_type', '{"entity_types": ["mixer", "tumbler"]}', 'critical'),
('Rapid Transaction Pattern', 'Detect addresses with unusually high transaction frequency', 'transaction_frequency', '{"threshold": 100, "timeframe": "1h"}', 'medium')
ON CONFLICT (name) DO NOTHING;

-- Insert sample arbitrage opportunities
INSERT INTO arbitrage_opportunities (exchange_pair, price_difference, volume_24h, profit_potential, risk_level, expires_at) VALUES
('Binance-Coinbase', 125.50, 15000000000, 0.25, 'low', NOW() + INTERVAL '1 hour'),
('Kraken-Bitstamp', 89.75, 8500000000, 0.18, 'medium', NOW() + INTERVAL '45 minutes'),
('Gemini-KuCoin', 156.25, 12000000000, 0.31, 'low', NOW() + INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- Insert sample dark pool events
INSERT INTO dark_pool_events (transaction_hash, addresses, volume, confidence_score, event_type) VALUES
('a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890', ARRAY['1DarkPool1234567890123456789012345', '3DarkPool2ndAddr123456789012345678'], 50000000000, 0.85, 'large_transfer'),
('b2c3d4e5f6789012345678901234567890123456789012345678901234567890a1', ARRAY['bc1qdarkpool123456789012345678901234567890123456789012345'], 25000000000, 0.72, 'obfuscated_transfer')
ON CONFLICT (transaction_hash) DO NOTHING;

COMMIT;
