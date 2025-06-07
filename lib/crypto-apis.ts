interface CryptoAPIsAssetData {
  assetId: string
  name: string
  typeIsCrypto: boolean
  cryptoData: {
    priceUsd: number
    marketCapUsd: number
    volumeUsd24h: number
    changePercent24h: number
    supply: number
    maxSupply: number
  }
}

interface CryptoAPIsResponse<T> {
  apiVersion: string
  requestId: string
  context: string
  data: T
}

interface RateLimitInfo {
  remaining: number | null
  reset: Date | null
  limit: number | null
}

class CryptoAPIsService {
  private baseUrl: string
  private apiKey: string
  private apiKeyName: string
  private rateLimitInfo: RateLimitInfo = {
    remaining: null,
    reset: null,
    limit: null,
  }

  constructor() {
    this.baseUrl = "https://rest.cryptoapis.io"
    this.apiKey = "ea11823ae3d37a9012f6c73915c00f4f2c3ab0b5"
    this.apiKeyName = "ChainSignal"
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<CryptoAPIsResponse<T>> {
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
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
          "X-API-Key-Name": this.apiKeyName,
          "X-Request-Id": requestId,
        },
        next: { revalidate: 60 },
      })

      // Update rate limit tracking
      this.updateRateLimitInfo(response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Crypto APIs Error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Crypto APIs Error [${endpoint}] [${requestId}]:`, error)
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
  async getBitcoinData(): Promise<CryptoAPIsAssetData> {
    const response = await this.request<CryptoAPIsAssetData>("/v2/market-data/assets/btc")
    return response.data
  }

  async getAssetData(assetId: string): Promise<CryptoAPIsAssetData> {
    const response = await this.request<CryptoAPIsAssetData>(`/v2/market-data/assets/${assetId.toLowerCase()}`)
    return response.data
  }

  async getOHLCVData(
    assetId: string,
    period: "1day" | "1hour" | "30min" | "15min" | "5min" | "1min" = "1day",
    timeStart?: string,
    timeEnd?: string,
  ) {
    const params: Record<string, string> = { period }

    if (timeStart) params.timeStart = timeStart
    if (timeEnd) params.timeEnd = timeEnd

    const response = await this.request(`/v2/market-data/assets/${assetId.toLowerCase()}/ohlcv`, params)
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
export const cryptoAPIsService = new CryptoAPIsService()
