import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

interface EntityClassificationRequest {
  address: string
  transactionData?: any
}

interface EntityClassificationResult {
  address: string
  entityType: string
  confidence: number
  riskScore: number
  isAnomaly: boolean
  probabilities: Record<string, number>
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const body: EntityClassificationRequest = await request.json()
    const { address, transactionData } = body

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // In a real implementation, you would fetch transaction data from your database
    // For now, we'll use mock data or the provided transactionData
    const addressData = transactionData || (await fetchAddressData(address))

    // Call Python entity classifier
    const classificationResult = await classifyEntity(addressData)

    const result: EntityClassificationResult = {
      address,
      entityType: classificationResult.entity_type,
      confidence: classificationResult.confidence,
      riskScore: classificationResult.risk_score,
      isAnomaly: classificationResult.is_anomaly,
      probabilities: classificationResult.probabilities,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Entity classification error:", error)
    return NextResponse.json({ error: "Failed to classify entity" }, { status: 500 })
  }
}

async function fetchAddressData(address: string) {
  // Mock implementation - in reality, this would query your blockchain database
  return {
    total_received: Math.random() * 1000000000000,
    total_sent: Math.random() * 1000000000000,
    tx_count: Math.floor(Math.random() * 10000),
    first_seen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    last_seen: new Date(),
    counterparties: Array.from({ length: Math.floor(Math.random() * 1000) }, (_, i) => i),
    transactions: Array.from({ length: 100 }, () => ({
      amount: Math.random() * 100000000,
      timestamp: Date.now() / 1000,
      input_count: Math.floor(Math.random() * 5) + 1,
      output_count: Math.floor(Math.random() * 5) + 1,
    })),
  }
}

async function classifyEntity(addressData: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "lib", "entity-classifier.py")
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
          const classificationResult = JSON.parse(lastLine)
          resolve(classificationResult)
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${parseError}`))
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${error}`))
      }
    })

    // Send address data to Python script
    python.stdin.write(JSON.stringify(addressData))
    python.stdin.end()
  })
}

export async function GET() {
  return NextResponse.json({
    message: "Entity Classification API",
    endpoints: {
      "POST /api/entity-classification": "Classify a Bitcoin address entity type",
    },
  })
}
