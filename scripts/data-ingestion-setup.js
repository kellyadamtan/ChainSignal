// Data ingestion setup and configuration
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function setupDataIngestion() {
  console.log("🚀 Setting up ChainSignal data ingestion...")

  try {
    // Test database connection
    const result = await sql`SELECT NOW() as current_time`
    console.log("✅ Database connection successful:", result[0].current_time)

    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `

    console.log("📊 Available tables:")
    tables.forEach((table) => {
      console.log(`  - ${table.table_name}`)
    })

    // Check user data
    const users = await sql`SELECT email, subscription_tier FROM users`
    console.log("👥 Users in database:")
    users.forEach((user) => {
      console.log(`  - ${user.email} (${user.subscription_tier})`)
    })

    // Check Bitcoin addresses
    const addresses = await sql`
      SELECT address, entity_type, risk_score 
      FROM bitcoin_addresses 
      LIMIT 5
    `
    console.log("🏦 Sample Bitcoin addresses:")
    addresses.forEach((addr) => {
      console.log(`  - ${addr.address} (${addr.entity_type}, risk: ${addr.risk_score})`)
    })

    // Check wallet clusters
    const clusters = await sql`
      SELECT cluster_id, entity_type, confidence_score 
      FROM wallet_clusters 
      LIMIT 3
    `
    console.log("🔗 Wallet clusters:")
    clusters.forEach((cluster) => {
      console.log(`  - ${cluster.cluster_id} (${cluster.entity_type}, confidence: ${cluster.confidence_score})`)
    })

    // Check mining pools
    const pools = await sql`
      SELECT name, hash_rate, blocks_mined 
      FROM mining_pools 
      LIMIT 3
    `
    console.log("⛏️ Mining pools:")
    pools.forEach((pool) => {
      console.log(`  - ${pool.name} (${pool.hash_rate} H/s, ${pool.blocks_mined} blocks)`)
    })

    // Check compliance rules
    const rules = await sql`
      SELECT name, rule_type, severity 
      FROM compliance_rules 
      LIMIT 3
    `
    console.log("🛡️ Compliance rules:")
    rules.forEach((rule) => {
      console.log(`  - ${rule.name} (${rule.rule_type}, ${rule.severity})`)
    })

    // Check arbitrage opportunities
    const arbitrage = await sql`
      SELECT exchange_pair, price_difference, profit_potential 
      FROM arbitrage_opportunities 
      LIMIT 3
    `
    console.log("💰 Arbitrage opportunities:")
    arbitrage.forEach((opp) => {
      console.log(`  - ${opp.exchange_pair} ($${opp.price_difference}, ${opp.profit_potential}% profit)`)
    })

    console.log("✅ Data ingestion setup completed successfully!")

    return {
      status: "success",
      tables_count: tables.length,
      users_count: users.length,
      addresses_count: addresses.length,
      clusters_count: clusters.length,
    }
  } catch (error) {
    console.error("❌ Error during data ingestion setup:", error)
    throw error
  }
}

// Run the setup
setupDataIngestion()
