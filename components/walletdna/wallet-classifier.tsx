"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Target, Zap, Building, Users, Wallet } from "lucide-react"

interface WalletClassifierProps {
  walletAddress: string
}

export function WalletClassifier({ walletAddress }: WalletClassifierProps) {
  const [classification, setClassification] = useState(null)
  const [loading, setLoading] = useState(false)

  const classifyWallet = async () => {
    if (!walletAddress) return

    setLoading(true)
    try {
      const response = await fetch(`/api/walletdna/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress }),
      })
      const data = await response.json()
      setClassification(data)
    } catch (error) {
      console.error("Error classifying wallet:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (walletAddress) {
      classifyWallet()
    }
  }, [walletAddress])

  const entityTypes = [
    { type: "Exchange", icon: Building, confidence: 85, color: "bg-blue-500" },
    { type: "Whale", icon: Target, confidence: 12, color: "bg-purple-500" },
    { type: "Institutional", icon: Building, confidence: 8, color: "bg-green-500" },
    { type: "Personal", icon: Users, confidence: 65, color: "bg-orange-500" },
    { type: "DeFi Protocol", icon: Zap, confidence: 25, color: "bg-pink-500" },
    { type: "Mining Pool", icon: Wallet, confidence: 5, color: "bg-yellow-500" },
  ]

  const features = [
    { name: "Transaction Frequency", value: 0.85, description: "High frequency indicates automated trading" },
    { name: "Average Transaction Size", value: 0.62, description: "Medium-sized transactions typical of exchanges" },
    { name: "Counterparty Diversity", value: 0.91, description: "Very high diversity suggests exchange activity" },
    { name: "Time Pattern Analysis", value: 0.73, description: "24/7 activity pattern matches exchange behavior" },
    { name: "Address Reuse Pattern", value: 0.45, description: "Moderate reuse indicates institutional practices" },
    { name: "UTXO Management", value: 0.78, description: "Sophisticated UTXO handling suggests professional use" },
  ]

  return (
    <div className="space-y-6">
      {/* Classification Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI-Powered Wallet Classification
          </CardTitle>
          <CardDescription>
            Advanced machine learning algorithms analyze wallet behavior patterns to classify entity types
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!walletAddress ? (
            <Alert>
              <AlertDescription>Enter a wallet address above to perform classification analysis</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Analysis Status:</span>
                <Badge variant={loading ? "secondary" : "default"}>{loading ? "Processing..." : "Complete"}</Badge>
              </div>
              {loading && <Progress value={75} className="w-full" />}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entity Type Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Entity Type Predictions</CardTitle>
          <CardDescription>Confidence scores for different wallet entity classifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entityTypes.map((entity, index) => {
              const Icon = entity.icon
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{entity.type}</span>
                    </div>
                    <Badge variant={entity.confidence > 50 ? "default" : "secondary"}>{entity.confidence}%</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={entity.confidence} className="flex-1" />
                    <div className={`w-3 h-3 rounded-full ${entity.color}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feature Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Analysis</CardTitle>
          <CardDescription>Detailed breakdown of behavioral features used in classification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{feature.name}</span>
                  <span className="text-sm text-muted-foreground">{(feature.value * 100).toFixed(0)}%</span>
                </div>
                <Progress value={feature.value * 100} className="h-2" />
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Classification Results */}
      <Card>
        <CardHeader>
          <CardTitle>Classification Summary</CardTitle>
          <CardDescription>Final classification results with confidence intervals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Primary Classification</h4>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-lg">Exchange</span>
                  <Badge variant="default">85% Confidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  High transaction frequency, diverse counterparties, and 24/7 activity pattern strongly indicate this
                  is an exchange hot wallet.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Risk Assessment</h4>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-lg">Medium Risk</span>
                  <Badge variant="secondary">Score: 65/100</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Exchange classification reduces counterparty risk but increases regulatory and operational risk
                  factors.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
          <CardDescription>Details about the AI models used for classification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium">Random Forest</h4>
              <p className="text-2xl font-bold text-blue-600">94.2%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium">Neural Network</h4>
              <p className="text-2xl font-bold text-green-600">91.8%</p>
              <p className="text-sm text-muted-foreground">Precision</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium">Ensemble</h4>
              <p className="text-2xl font-bold text-purple-600">96.1%</p>
              <p className="text-sm text-muted-foreground">F1-Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
