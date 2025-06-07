import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Create all tables with proper error handling
    await sql`
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
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_value ON transactions(value)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(hash)`

    await sql`
      CREATE TABLE IF NOT EXISTS blocks (
          id SERIAL PRIMARY KEY,
          height INTEGER UNIQUE NOT NULL,
          hash VARCHAR(64) UNIQUE NOT NULL,
          previous_hash VARCHAR(64),
          merkle_root VARCHAR(64),
          timestamp TIMESTAMPTZ NOT NULL,
          difficulty NUMERIC(20, 0),
          nonce BIGINT,
          transaction_count INTEGER NOT NULL,
          size_bytes INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_blocks_height ON blocks(height)`
    await sql`CREATE INDEX IF NOT EXISTS idx_blocks_timestamp ON blocks(timestamp)`

    await sql`
      CREATE TABLE IF NOT EXISTS wallets (
          id SERIAL PRIMARY KEY,
          address VARCHAR(64) UNIQUE NOT NULL,
          balance DECIMAL(16, 8) DEFAULT 0,
          transaction_count INTEGER DEFAULT 0,
          avg_tx_value DECIMAL(16, 8) DEFAULT 0,
          tx_frequency DECIMAL(8, 4) DEFAULT 0,
          dormancy_period INTEGER DEFAULT 0,
          exchange_interaction_score DECIMAL(3, 2) DEFAULT 0,
          mixing_score DECIMAL(3, 2) DEFAULT 0,
          first_seen TIMESTAMPTZ,
          last_active TIMESTAMPTZ,
          cluster_type VARCHAR(20) DEFAULT 'regular',
          cluster_confidence DECIMAL(3, 2) DEFAULT 0.5,
          ml_cluster_id INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address)`
    await sql`CREATE INDEX IF NOT EXISTS idx_wallets_cluster_type ON wallets(cluster_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_wallets_balance ON wallets(balance)`
    await sql`CREATE INDEX IF NOT EXISTS idx_wallets_last_active ON wallets(last_active)`

    await sql`
      CREATE TABLE IF NOT EXISTS alerts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          name VARCHAR(255) NOT NULL,
          conditions JSONB NOT NULL,
          channels TEXT[] NOT NULL,
          alert_type VARCHAR(20) DEFAULT 'recurring',
          is_active BOOLEAN DEFAULT true,
          last_triggered TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON alerts(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id)`

    await sql`
      CREATE TABLE IF NOT EXISTS mining_pools (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          hash_rate_percentage DECIMAL(5, 2),
          blocks_mined_24h INTEGER DEFAULT 0,
          total_blocks_mined INTEGER DEFAULT 0,
          last_block_timestamp TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS network_metrics (
          id SERIAL PRIMARY KEY,
          metric_name VARCHAR(50) NOT NULL,
          metric_value NUMERIC(30, 8) NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_network_metrics_timestamp ON network_metrics(timestamp)`
    await sql`CREATE INDEX IF NOT EXISTS idx_network_metrics_name_timestamp ON network_metrics(metric_name, timestamp)`

    // Insert sample mining pools data - using static values to avoid parameter issues
    await sql`
      INSERT INTO mining_pools (name, hash_rate_percentage, blocks_mined_24h) VALUES
      ('Antpool', 18.5, 45),
      ('Foundry USA', 16.2, 38),
      ('F2Pool', 13.8, 32),
      ('Binance Pool', 11.4, 28),
      ('ViaBTC', 9.7, 24),
      ('Poolin', 8.3, 20),
      ('Others', 22.1, 53)
      ON CONFLICT (name) DO UPDATE SET
        hash_rate_percentage = EXCLUDED.hash_rate_percentage,
        blocks_mined_24h = EXCLUDED.blocks_mined_24h
    `

    // Insert network metrics using static values
    await sql`INSERT INTO network_metrics (metric_name, metric_value, timestamp) VALUES ('btc_price', 43250.00, NOW())`
    await sql`INSERT INTO network_metrics (metric_name, metric_value, timestamp) VALUES ('hash_rate', 450.2, NOW())`
    await sql`INSERT INTO network_metrics (metric_name, metric_value, timestamp) VALUES ('difficulty', 62.46, NOW())`
    await sql`INSERT INTO network_metrics (metric_name, metric_value, timestamp) VALUES ('mempool_size', 2.4, NOW())`
    await sql`INSERT INTO network_metrics (metric_name, metric_value, timestamp) VALUES ('active_addresses', 1234567, NOW())`

    // Insert sample transactions using static values to avoid parameter binding issues
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_0_abc123', 45.67, 0.0001, 2, 3, NOW() - INTERVAL '1 hour')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_1_def456', 12.34, 0.0002, 1, 2, NOW() - INTERVAL '2 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_2_ghi789', 89.12, 0.0003, 3, 4, NOW() - INTERVAL '3 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_3_jkl012', 23.45, 0.0001, 2, 2, NOW() - INTERVAL '4 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_4_mno345', 67.89, 0.0004, 1, 3, NOW() - INTERVAL '5 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_5_pqr678', 34.56, 0.0002, 4, 2, NOW() - INTERVAL '6 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_6_stu901', 78.90, 0.0005, 2, 4, NOW() - INTERVAL '7 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_7_vwx234', 56.78, 0.0003, 3, 1, NOW() - INTERVAL '8 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_8_yza567', 90.12, 0.0006, 1, 5, NOW() - INTERVAL '9 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_9_bcd890', 43.21, 0.0002, 2, 3, NOW() - INTERVAL '10 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_10_efg123', 65.43, 0.0004, 3, 2, NOW() - INTERVAL '11 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_11_hij456', 87.65, 0.0001, 1, 4, NOW() - INTERVAL '12 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_12_klm789', 21.09, 0.0003, 4, 1, NOW() - INTERVAL '13 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_13_nop012', 54.32, 0.0005, 2, 5, NOW() - INTERVAL '14 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_14_qrs345', 76.54, 0.0002, 3, 3, NOW() - INTERVAL '15 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_15_tuv678', 98.76, 0.0006, 1, 2, NOW() - INTERVAL '16 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_16_wxy901', 32.10, 0.0001, 2, 4, NOW() - INTERVAL '17 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_17_zab234', 65.87, 0.0004, 4, 1, NOW() - INTERVAL '18 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_18_cde567', 43.65, 0.0003, 3, 5, NOW() - INTERVAL '19 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_19_fgh890', 87.43, 0.0002, 1, 3, NOW() - INTERVAL '20 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_20_ijk123', 21.65, 0.0005, 2, 2, NOW() - INTERVAL '21 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_21_lmn456', 54.87, 0.0001, 4, 4, NOW() - INTERVAL '22 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_22_opq789', 76.21, 0.0003, 3, 1, NOW() - INTERVAL '23 hours')`
    await sql`INSERT INTO transactions (hash, value, fee, input_count, output_count, timestamp) VALUES ('tx_23_rst012', 98.54, 0.0006, 1, 5, NOW() - INTERVAL '24 hours')`

    // Insert sample wallets using static values
    await sql`INSERT INTO wallets (address, balance, transaction_count, avg_tx_value, cluster_type, last_active) VALUES ('wallet_whale_1', 1500.50, 45, 33.34, 'whale', NOW() - INTERVAL '1 day')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, avg_tx_value, cluster_type, last_active) VALUES ('wallet_whale_2', 2300.75, 67, 34.34, 'whale', NOW() - INTERVAL '2 days')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, avg_tx_value, cluster_type, last_active) VALUES ('wallet_whale_3', 1800.25, 89, 20.23, 'whale', NOW() - INTERVAL '3 days')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_active_1', 450.30, 123, 'active', NOW() - INTERVAL '1 hour')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_active_2', 320.80, 98, 'active', NOW() - INTERVAL '2 hours')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_active_3', 680.45, 156, 'active', NOW() - INTERVAL '3 hours')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_active_4', 290.60, 87, 'active', NOW() - INTERVAL '4 hours')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_active_5', 520.90, 134, 'active', NOW() - INTERVAL '5 hours')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_exchange_1', 890.40, 234, 'exchange', NOW() - INTERVAL '30 minutes')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_exchange_2', 1200.80, 345, 'exchange', NOW() - INTERVAL '1 hour')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_exchange_3', 750.60, 189, 'exchange', NOW() - INTERVAL '2 hours')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_dormant_1', 120.30, 12, 'dormant', NOW() - INTERVAL '45 days')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_dormant_2', 85.70, 8, 'dormant', NOW() - INTERVAL '60 days')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_dormant_3', 200.50, 15, 'dormant', NOW() - INTERVAL '90 days')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_regular_1', 45.80, 23, 'regular', NOW() - INTERVAL '1 day')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_regular_2', 67.40, 34, 'regular', NOW() - INTERVAL '2 days')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_regular_3', 89.20, 45, 'regular', NOW() - INTERVAL '3 days')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_regular_4', 123.60, 56, 'regular', NOW() - INTERVAL '4 days')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_regular_5', 156.90, 67, 'regular', NOW() - INTERVAL '5 days')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, cluster_type, last_active) VALUES ('wallet_regular_6', 78.30, 29, 'regular', NOW() - INTERVAL '6 days')`

    // Add miner wallets
    await sql`INSERT INTO wallets (address, balance, transaction_count, avg_tx_value, cluster_type, last_active) VALUES ('wallet_miner_1', 850.40, 156, 5.45, 'miner', NOW() - INTERVAL '2 hours')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, avg_tx_value, cluster_type, last_active) VALUES ('wallet_miner_2', 920.80, 178, 5.17, 'miner', NOW() - INTERVAL '4 hours')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, avg_tx_value, cluster_type, last_active) VALUES ('wallet_miner_3', 780.60, 143, 5.46, 'miner', NOW() - INTERVAL '6 hours')`

    // Add mixer wallets
    await sql`INSERT INTO wallets (address, balance, transaction_count, avg_tx_value, mixing_score, cluster_type, last_active) VALUES ('wallet_mixer_1', 340.20, 89, 3.82, 0.95, 'mixer', NOW() - INTERVAL '1 hour')`
    await sql`INSERT INTO wallets (address, balance, transaction_count, avg_tx_value, mixing_score, cluster_type, last_active) VALUES ('wallet_mixer_2', 290.50, 76, 3.83, 0.87, 'mixer', NOW() - INTERVAL '3 hours')`

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully with sample data",
      details: {
        tables_created: 6,
        mining_pools: 7,
        network_metrics: 5,
        transactions: 24,
        wallets: 25,
      },
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
