const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3"
const API_KEY = "CG-mEc7dodYKrCTDjBRn6xhSoJC"

export interface BitcoinMarketData {
  id: string
  symbol: string
  name: string
  image: {
    thumb: string
    small: string
    large: string
  }
  market_data: {
    current_price: {
      usd: number
    }
    price_change_24h: number
    price_change_percentage_24h: number
    market_cap: {
      usd: number
    }
    market_cap_change_percentage_24h: number
    total_volume: {
      usd: number
    }
    ath: {
      usd: number
    }
    ath_change_percentage: {
      usd: number
    }
    atl: {
      usd: number
    }
    atl_change_percentage: {
      usd: number
    }
    circulating_supply: number
    max_supply: number
  }
  last_updated: string
}

export interface HistoricalData {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

export interface GlobalData {
  data: {
    active_cryptocurrencies: number
    market_cap_percentage: {
      btc: number
    }
    total_market_cap: {
      usd: number
    }
    total_volume: {
      usd: number
    }
  }
}

export async function fetchBitcoinMarketData(): Promise<BitcoinMarketData> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      {
        headers: {
          "x-cg-demo-api-key": API_KEY,
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching Bitcoin market data:", error)
    throw error
  }
}

export async function fetchHistoricalData(days = 30): Promise<HistoricalData> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      {
        headers: {
          "x-cg-demo-api-key": API_KEY,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching historical data:", error)
    throw error
  }
}

export async function fetchGlobalData(): Promise<GlobalData> {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/global`, {
      headers: {
        "x-cg-demo-api-key": API_KEY,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching global data:", error)
    throw error
  }
}
