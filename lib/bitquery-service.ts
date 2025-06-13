import { GraphQLClient } from "graphql-request"

// Bitquery API configuration
const BITQUERY_ENDPOINT = "https://graphql.bitquery.io"
const BITQUERY_STREAMING = "wss://streaming.bitquery.io/graphql"
const BITQUERY_API_KEY = process.env.BITQUERY_API_KEY || "a68ab159-71e6-4981-ad5a-665e3bb56b18"

// Create GraphQL client with authentication
const client = new GraphQLClient(BITQUERY_ENDPOINT, {
  headers: {
    "X-API-KEY": BITQUERY_API_KEY,
  },
})

// Hash rate calculation constants
const BITCOIN_BLOCK_TARGET_TIME = 600 // 10 minutes in seconds
const DIFFICULTY_1_TARGET = BigInt("0x00000000FFFF0000000000000000000000000000000000000000000000000000")
const TERAHASH = 1000000000000 // 1 TH/s = 1,000,000,000,000 hashes

export interface BlockData {
  height: number
  timestamp: string
  difficulty: number
  hash: string
  size: number
  weight: number
  transactionCount: number
}

export interface HashRateData {
  timestamp: string
  hashRate: number // in TH/s
  difficulty: number
  blockHeight: number
  blockTime: number // in seconds
}

export interface MiningPoolData {
  pool: string
  hashrate: number // percentage
  blocks: number
  lastBlock?: string
}

/**
 * Fetch recent Bitcoin blocks with difficulty data
 */
export async function fetchBitcoinBlocks(limit = 100): Promise<BlockData[]> {
  const query = `
    {
      bitcoin(network: bitcoin) {
        blocks(options: {desc: "height", limit: ${limit}}) {
          height
          timestamp { iso8601 }
          difficulty
          hash
          size
          weight
          transactionCount
        }
      }
    }
  `

  try {
    const response = await client.request(query)
    return response.bitcoin.blocks.map((block: any) => ({
      height: block.height,
      timestamp: block.timestamp.iso8601,
      difficulty: block.difficulty,
      hash: block.hash,
      size: block.size,
      weight: block.weight,
      transactionCount: block.transactionCount,
    }))
  } catch (error) {
    console.error("Error fetching Bitcoin blocks from Bitquery:", error)
    throw new Error("Failed to fetch Bitcoin blocks")
  }
}

/**
 * Calculate hash rate from block data
 */
export function calculateHashRate(blocks: BlockData[]): HashRateData[] {
  // Sort blocks by height in descending order
  const sortedBlocks = [...blocks].sort((a, b) => b.height - a.height)

  const hashRateData: HashRateData[] = []

  for (let i = 0; i < sortedBlocks.length - 1; i++) {
    const currentBlock = sortedBlocks[i]
    const previousBlock = sortedBlocks[i + 1]

    // Calculate block time in seconds
    const currentTimestamp = new Date(currentBlock.timestamp).getTime() / 1000
    const previousTimestamp = new Date(previousBlock.timestamp).getTime() / 1000
    const blockTime = currentTimestamp - previousTimestamp

    // Calculate hash rate in TH/s
    // Hash rate = difficulty * 2^32 / block time / 10^12
    const hashRate = (currentBlock.difficulty * Math.pow(2, 32)) / blockTime / TERAHASH

    hashRateData.push({
      timestamp: currentBlock.timestamp,
      hashRate: Number.parseFloat(hashRate.toFixed(2)),
      difficulty: currentBlock.difficulty,
      blockHeight: currentBlock.height,
      blockTime: blockTime,
    })
  }

  return hashRateData
}

/**
 * Fetch mining pool distribution data
 */
export async function fetchMiningPoolDistribution(days = 7): Promise<MiningPoolData[]> {
  const query = `
    {
      bitcoin(network: bitcoin) {
        blocks(
          date: {since: "${new Date(Date.now() - days * 86400000).toISOString()}", till: "${new Date().toISOString()}"}
          options: {desc: "count", limit: 10}
        ) {
          miner {
            name
            address
          }
          count
        }
      }
    }
  `

  try {
    const response = await client.request(query)
    const totalBlocks = response.bitcoin.blocks.reduce((sum: number, item: any) => sum + item.count, 0)

    return response.bitcoin.blocks.map((item: any) => {
      const poolName = item.miner.name || `Unknown (${item.miner.address.substring(0, 8)}...)`
      const percentage = (item.count / totalBlocks) * 100

      return {
        pool: poolName,
        hashrate: Number.parseFloat(percentage.toFixed(1)),
        blocks: item.count,
      }
    })
  } catch (error) {
    console.error("Error fetching mining pool distribution from Bitquery:", error)
    throw new Error("Failed to fetch mining pool distribution")
  }
}

/**
 * Fetch historical hash rate data
 */
export async function fetchHistoricalHashRate(days = 30): Promise<{ date: string; hashRate: number }[]> {
  const query = `
    {
      bitcoin(network: bitcoin) {
        blocks(
          date: {since: "${new Date(Date.now() - days * 86400000).toISOString()}", till: "${new Date().toISOString()}"}
          options: {desc: "date.date"}
        ) {
          date { date }
          difficulty
          blockCount
        }
      }
    }
  `

  try {
    const response = await client.request(query)

    return response.bitcoin.blocks.map((item: any) => {
      // Average blocks per day
      const avgBlocksPerDay = item.blockCount
      // Expected blocks per day (144 = 24h / 10min)
      const expectedBlocksPerDay = 144
      // Adjustment factor based on actual vs expected block production
      const adjustmentFactor = expectedBlocksPerDay / avgBlocksPerDay

      // Hash rate = difficulty * 2^32 / (10 minutes in seconds) / 10^12 * adjustment factor
      const hashRate = ((item.difficulty * Math.pow(2, 32)) / BITCOIN_BLOCK_TARGET_TIME / TERAHASH) * adjustmentFactor

      return {
        date: item.date.date,
        hashRate: Number.parseFloat(hashRate.toFixed(2)),
      }
    })
  } catch (error) {
    console.error("Error fetching historical hash rate from Bitquery:", error)
    throw new Error("Failed to fetch historical hash rate")
  }
}

/**
 * Detect hash rate anomalies
 */
export function detectHashRateAnomalies(hashRateData: HashRateData[], thresholdPercent = 15): HashRateData[] {
  if (hashRateData.length < 2) return []

  const anomalies: HashRateData[] = []
  const avgHashRate = hashRateData.reduce((sum, data) => sum + data.hashRate, 0) / hashRateData.length
  const threshold = avgHashRate * (thresholdPercent / 100)

  for (const data of hashRateData) {
    if (Math.abs(data.hashRate - avgHashRate) > threshold) {
      anomalies.push(data)
    }
  }

  return anomalies
}
