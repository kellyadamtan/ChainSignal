// Bitcoin Data Ingestion Pipeline
// This script simulates real-time Bitcoin data ingestion

class BitcoinDataIngestion {
  constructor() {
    this.transactions = []
    this.blocks = []
    this.wallets = new Map()
  }

  // Simulate WebSocket connection to Bitcoin network
  async connectToNetwork() {
    console.log("🔗 Connecting to Bitcoin network...")

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("✅ Connected to Bitcoin network")
    return true
  }

  // Generate sample transaction data
  generateTransaction() {
    const tx = {
      hash: this.generateHash(),
      value: Math.random() * 1000,
      inputs: Math.floor(Math.random() * 5) + 1,
      outputs: Math.floor(Math.random() * 5) + 1,
      timestamp: new Date(),
      fee: Math.random() * 0.001,
      size: Math.floor(Math.random() * 1000) + 250,
    }

    return tx
  }

  // Generate sample block data
  generateBlock() {
    const block = {
      height: this.blocks.length + 800000,
      hash: this.generateHash(),
      timestamp: new Date(),
      transactions: Math.floor(Math.random() * 3000) + 1000,
      size: Math.floor(Math.random() * 1000000) + 500000,
      difficulty: 62460000000000,
      nonce: Math.floor(Math.random() * 4294967295),
    }

    return block
  }

  // Generate random hash
  generateHash() {
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
  }

  // Process incoming transaction
  async processTransaction(tx) {
    this.transactions.push(tx)

    // Update wallet statistics
    const walletId = tx.hash.substring(0, 8)
    if (!this.wallets.has(walletId)) {
      this.wallets.set(walletId, {
        address: walletId,
        balance: 0,
        txCount: 0,
        lastActive: new Date(),
      })
    }

    const wallet = this.wallets.get(walletId)
    wallet.balance += tx.value
    wallet.txCount += 1
    wallet.lastActive = new Date()

    console.log(`📊 Processed transaction: ${tx.hash.substring(0, 8)}... (${tx.value.toFixed(4)} BTC)`)
  }

  // Process incoming block
  async processBlock(block) {
    this.blocks.push(block)
    console.log(`🧱 Processed block #${block.height} with ${block.transactions} transactions`)
  }

  // Analyze wallet clusters using simple heuristics
  analyzeWalletClusters() {
    const clusters = {
      whale: [],
      active: [],
      dormant: [],
      exchange: [],
      regular: [],
    }

    for (const [address, wallet] of this.wallets) {
      const daysSinceActive = (Date.now() - wallet.lastActive.getTime()) / (1000 * 86400)

      if (wallet.balance > 1000) {
        clusters.whale.push(wallet)
      } else if (wallet.txCount > 100) {
        clusters.active.push(wallet)
      } else if (daysSinceActive > 30) {
        clusters.dormant.push(wallet)
      } else if (wallet.txCount > 50 && wallet.balance > 100) {
        clusters.exchange.push(wallet)
      } else {
        clusters.regular.push(wallet)
      }
    }

    return clusters
  }

  // Start the ingestion pipeline
  async start() {
    await this.connectToNetwork()

    console.log("🚀 Starting data ingestion pipeline...")

    // Simulate real-time data ingestion
    const txInterval = setInterval(() => {
      const tx = this.generateTransaction()
      this.processTransaction(tx)
    }, 2000) // New transaction every 2 seconds

    const blockInterval = setInterval(() => {
      const block = this.generateBlock()
      this.processBlock(block)
    }, 30000) // New block every 30 seconds

    // Analyze clusters every 60 seconds
    const clusterInterval = setInterval(() => {
      const clusters = this.analyzeWalletClusters()
      console.log("🔍 Wallet cluster analysis:")
      console.log(`  Whales: ${clusters.whale.length}`)
      console.log(`  Active: ${clusters.active.length}`)
      console.log(`  Dormant: ${clusters.dormant.length}`)
      console.log(`  Exchange: ${clusters.exchange.length}`)
      console.log(`  Regular: ${clusters.regular.length}`)
    }, 60000)

    // Run for 5 minutes then stop
    setTimeout(() => {
      clearInterval(txInterval)
      clearInterval(blockInterval)
      clearInterval(clusterInterval)

      console.log("⏹️ Data ingestion pipeline stopped")
      console.log(`📈 Final statistics:`)
      console.log(`  Total transactions: ${this.transactions.length}`)
      console.log(`  Total blocks: ${this.blocks.length}`)
      console.log(`  Total wallets: ${this.wallets.size}`)
    }, 300000) // 5 minutes
  }
}

// Start the ingestion pipeline
const pipeline = new BitcoinDataIngestion()
pipeline.start()
