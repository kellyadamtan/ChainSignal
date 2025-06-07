interface CoinCapAsset {
  id: string
  rank: string
  symbol: string
  name: string
  supply: string
  maxSupply: string
  marketCapUsd: string
  volumeUsd24Hr: string
  priceUsd: string
  changePercent24Hr: string
  vwap24Hr: string
}

interface CoinCapResponse<T> {
  data: T
  timestamp: number
}

interface RateLimitInfo {
  remaining: number | null
  reset: Date | null
  limit: number | null
}

class CoinCapAPI {
  private baseUrl: string
  private apiKey: string
  private label: string
  private rateLimitInfo: RateLimitInfo = {
    remaining: null,
    reset: null,
    limit: null,
  }

  constructor() {
    this.baseUrl = "https://api.coincap.io/v2"
    this.apiKey = "15ffe1ad7f39eb0c30c8ff3de8254dbe79585219bd801c31c4e0f3961ac7cb43"
    this.label = "ChainSignal"
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<CoinCapResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const requestId = crypto.randomUUID()

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "User-Agent": this.label,
          "X-Request-Id": requestId,
        },
        next: { revalidate: 60 },
      })

      // Update rate limit tracking
      this.updateRateLimitInfo(response.headers)

      if (!response.ok) {
        throw new Error(`CoinCap API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`CoinCap API Error [${endpoint}] [${requestId}]:`, error)
      throw error
    }
  }

  private updateRateLimitInfo(headers: Headers) {
    const remaining = headers.get("x-ratelimit-remaining")
    const reset = headers.get("x-ratelimit-reset")
    const limit = headers.get("x-ratelimit-limit")

    this.rateLimitInfo = {
      remaining: remaining ? Number(remaining) : null,
      reset: reset ? new Date(Number(reset) * 1000) : null,
      limit: limit ? Number(limit) : null,
    }
  }

  // Public API methods
  async getBitcoinData(): Promise<CoinCapAsset> {
    const response = await this.request<CoinCapAsset>("/assets/bitcoin")
    return response.data
  }

  async getAsset(id: string): Promise<CoinCapAsset> {
    const response = await this.request<CoinCapAsset>(`/assets/${id}`)
    return response.data
  }

  async getAssets(limit = 100): Promise<CoinCapAsset[]> {
    const response = await this.request<CoinCapAsset[]>("/assets", {
      limit: limit.toString(),
    })
    return response.data
  }

  async getHistoricalData(
    assetId: string,
    interval: "m1" | "m5" | "m15" | "m30" | "h1" | "h2" | "h6" | "h12" | "d1" = "d1",
    start?: number,
    end?: number,
  ) {
    const params: Record<string, string> = { interval }

    if (start) params.start = start.toString()
    if (end) params.end = end.toString()

    const response = await this.request(`/assets/${assetId}/history`, params)
    return response.data
  }

  getRateLimitInfo(): RateLimitInfo {
    return { ...this.rateLimitInfo }
  }

  isRateLimited(): boolean {
    return this.rateLimitInfo.remaining !== null && this.rateLimitInfo.remaining < 10
  }
}

// Singleton instance
export const coinCapAPI = new CoinCapAPI()
