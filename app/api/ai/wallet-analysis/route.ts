import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

interface WalletAnalysisRequest {
  walletAddress: string
  includeForecasting?: boolean
  includeAnomalyDetection?: boolean
  includeAIInsights?: boolean
}

interface WalletAnalysisResponse {
  walletAddress: string
  analysisTimestamp: string
  classification: {
    entityType: string
    confidence: number
    riskScore: number
    probabilities: Record<string, number>
  }
  forecasting?: {
    volumeForecast?: any
    frequencyForecast?: any
  }
  anomalyDetection?: {
    recentTransactionsAnalyzed: number
    anomaliesFound: number
    details: any[]
  }
  aiInsights?: {
    summary: string
    generatedAt: string
    modelUsed: string
  }
  riskSummary: {
    overallRiskScore: number
    riskLevel: string
    components: {
      classificationRisk: number
      anomalyRisk: number
    }
    recommendations: string[]
  }
  modelsUsed: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: WalletAnalysisRequest = await request.json()
    const { walletAddress, includeForecasting = true, includeAnomalyDetection = true, includeAIInsights = true } = body

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Fetch wallet data (in real implementation, this would come from your database)
    const walletData = await fetchWalletData(walletAddress)

    // Call Python AI microservice
    const analysisResult = await runAIAnalysis(walletAddress, walletData, {
      includeForecasting,
      includeAnomalyDetection,
      includeAIInsights,
    })

    const response: WalletAnalysisResponse = {
      walletAddress,
      analysisTimestamp: new Date().toISOString(),
      classification: analysisResult.classification,
      riskSummary: analysisResult.risk_summary,
      modelsUsed: analysisResult.models_used,
    }

    if (includeForecasting && analysisResult.forecasting) {
      response.forecasting = analysisResult.forecasting
    }

    if (includeAnomalyDetection && analysisResult.anomaly_detection) {
      response.anomalyDetection = analysisResult.anomaly_detection
    }

    if (includeAIInsights && analysisResult.ai_insights) {
      response.aiInsights = analysisResult.ai_insights
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("AI wallet analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze wallet" }, { status: 500 })
  }
}

async function fetchWalletData(walletAddress: string) {
  // Mock implementation - in reality, this would query your blockchain database
  const mockData = {
    wallet_address: walletAddress,
    transaction_count: Math.floor(Math.random() * 1000) + 50,
    total_volume: Math.random() * 100 + 10,
    activity_span_days: Math.floor(Math.random() * 1000) + 30,
    counterparties: Array.from({ length: Math.floor(Math.random() * 100) + 10 }, (_, i) => `addr_${i}`),
    transaction_timestamps: Array.from({ length: 100 }, (_, i) => Date.now() / 1000 - i * 86400),
    transactions: Array.from({ length: 100 }, (_, i) => ({
      amount: Math.random() * 10 + 0.1,
      timestamp: Date.now() / 1000 - i * 86400,
      input_count: Math.floor(Math.random() * 5) + 1,
      output_count: Math.floor(Math.random() * 5) + 1,
      fee: Math.random() * 0.001 + 0.0001,
      counterparty: `addr_${i % 20}`,
    })),
    transaction_history: Array.from({ length: 100 }, (_, i) => ({
      timestamp: Date.now() / 1000 - i * 86400,
      volume: Math.random() * 10 + 0.1,
      amount: Math.random() * 10 + 0.1,
    })),
  }

  return mockData
}

async function runAIAnalysis(walletAddress: string, walletData: any, options: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "lib", "ai-microservice.py")
    const python = spawn("python3", [pythonScript])

    let result = ""
    let error = ""

    python.stdout.on("data", (data) => {
      result += data.toString()
    })

    python.stderr.on("data", (data) => {
      error += data.toString()
    })

    python.on("close", (code) => {
      if (code === 0) {
        try {
          // Parse the result from Python script
          const lines = result.trim().split("\n")
          const lastLine = lines[lines.length - 1]
          const analysisResult = JSON.parse(lastLine)
          resolve(analysisResult)
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${parseError}`))
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${error}`))
      }
    })

    // Send data to Python script
    const inputData = {
      wallet_address: walletAddress,
      wallet_data: walletData,
      options: options,
    }
    python.stdin.write(JSON.stringify(inputData))
    python.stdin.end()
  })
}

export async function GET() {
  return NextResponse.json({
    message: "AI Wallet Analysis API",
    endpoints: {
      "POST /api/ai/wallet-analysis": "Comprehensive wallet behavior analysis using AI models",
    },
    models: {
      classification: "ONNX Runtime + Custom Neural Network",
      forecasting: "Prophet Time Series",
      anomaly_detection: "Isolation Forest",
      insights: "Groq AI (Mixtral-8x7b)",
    },
  })
}
