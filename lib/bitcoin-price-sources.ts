interface BitcoinPriceData {
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  supply: number
  maxSupply: number
  timestamp: number
  source: string
}

class BitcoinPriceSources {
  private readonly BITCOIN_SUPPLY = 19500000 // Approximate current supply
  private readonly BITCOIN_MAX_SUPPLY = 21000000

  // CoinGecko API (Free tier, reliable)
  async fetchFromCoinGecko(): Promise<BitcoinPriceData> {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true",
      { next: { revalidate: 60 } },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.bitcoin) {
      throw new Error("Invalid CoinGecko response format")
    }

    return {
      price: data.bitcoin.usd,
      change24h: data.bitcoin.usd_24h_change || 0,
      volume24h: data.bitcoin.usd_24h_vol || 0,
      marketCap: data.bitcoin.usd_market_cap || 0,
      supply: this.BITCOIN_SUPPLY,
      maxSupply: this.BITCOIN_MAX_SUPPLY,
      timestamp: Date.now(),
      source: "coingecko",
    }
  }

  // CoinDesk API (Free, reliable for price only)
  async fetchFromCoinDesk(): Promise<BitcoinPriceData> {
    const response = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json", {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`CoinDesk API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.bpi?.USD?.rate_float) {
      throw new Error("Invalid CoinDesk response format")
    }

    const price = data.bpi.USD.rate_float

    return {
      price,
      change24h: 0, // CoinDesk doesn't provide 24h change
      volume24h: 0, // CoinDesk doesn't provide volume
      marketCap: price * this.BITCOIN_SUPPLY,
      supply: this.BITCOIN_SUPPLY,
      maxSupply: this.BITCOIN_MAX_SUPPLY,
      timestamp: Date.now(),
      source: "coindesk",
    }
  }

  // Coinbase API (Free, exchange rate)
  async fetchFromCoinbase(): Promise<BitcoinPriceData> {
    const response = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=BTC", {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.data?.rates?.USD) {
      throw new Error("Invalid Coinbase response format")
    }

    const price = Number.parseFloat(data.data.rates.USD)

    return {
      price,
      change24h: 0, // Coinbase exchange rates don't include 24h change
      volume24h: 0, // Coinbase exchange rates don't include volume
      marketCap: price * this.BITCOIN_SUPPLY,
      supply: this.BITCOIN_SUPPLY,
      maxSupply: this.BITCOIN_MAX_SUPPLY,
      timestamp: Date.now(),
      source: "coinbase",
    }
  }

  // Binance API (Free, comprehensive)
  async fetchFromBinance(): Promise<BitcoinPriceData> {
    const response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.lastPrice) {
      throw new Error("Invalid Binance response format")
    }

    const price = Number.parseFloat(data.lastPrice)
    const change24h = Number.parseFloat(data.priceChangePercent) || 0
    const volume24h = Number.parseFloat(data.quoteVolume) || 0

    return {
      price,
      change24h,
      volume24h,
      marketCap: price * this.BITCOIN_SUPPLY,
      supply: this.BITCOIN_SUPPLY,
      maxSupply: this.BITCOIN_MAX_SUPPLY,
      timestamp: Date.now(),
      source: "binance",
    }
  }

  // Main method with fallback chain
  async fetchPriceWithFallback(): Promise<BitcoinPriceData> {
    const sources = [
      { name: "CoinGecko", fetch: () => this.fetchFromCoinGecko() },
      { name: "Binance", fetch: () => this.fetchFromBinance() },
      { name: "Coinbase", fetch: () => this.fetchFromCoinbase() },
      { name: "CoinDesk", fetch: () => this.fetchFromCoinDesk() },
    ]

    let lastError: Error | null = null

    for (const source of sources) {
      try {
        console.log(`Attempting to fetch Bitcoin price from ${source.name}...`)
        const data = await source.fetch()
        console.log(`Successfully fetched Bitcoin price from ${source.name}: $${data.price}`)
        return data
      } catch (error) {
        console.warn(`Failed to fetch from ${source.name}:`, error instanceof Error ? error.message : error)
        lastError = error instanceof Error ? error : new Error(String(error))
        continue
      }
    }

    // If all sources fail, throw the last error
    throw lastError || new Error("All Bitcoin price sources failed")
  }

  // Method to check which sources are working
  async checkSourceStatus() {
    const sources = [
      { name: "CoinGecko", fetch: () => this.fetchFromCoinGecko() },
      { name: "Binance", fetch: () => this.fetchFromBinance() },
      { name: "Coinbase", fetch: () => this.fetchFromCoinbase() },
      { name: "CoinDesk", fetch: () => this.fetchFromCoinDesk() },
    ]

    const results = await Promise.allSettled(
      sources.map(async (source) => {
        const startTime = Date.now()
        try {
          const data = await source.fetch()
          const responseTime = Date.now() - startTime
          return {
            name: source.name,
            status: "success" as const,
            price: data.price,
            responseTime,
            error: null,
          }
        } catch (error) {
          const responseTime = Date.now() - startTime
          return {
            name: source.name,
            status: "error" as const,
            price: null,
            responseTime,
            error: error instanceof Error ? error.message : String(error),
          }
        }
      }),
    )

    return results.map((result) => (result.status === "fulfilled" ? result.value : result.reason))
  }
}

export const bitcoinPriceSources = new BitcoinPriceSources()
