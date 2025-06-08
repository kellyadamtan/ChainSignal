"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  BarChart3,
  Activity,
  Shield,
  Search,
  Loader2,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

interface AIAnalysisResult {
  walletAddress: string
  analysisTimestamp: string
  classification: {
    entityType: string
    confidence: number
    riskScore: number
    probabilities: Record<string, number>
  }
  forecasting?: {
    volumeForecast?: {
      dates: string[]
      predicted: number[]
      lowerBound: number[]
      upperBound: number[]
    }
    frequencyForecast?: {
      dates: string[]
      predicted: number[]
      lowerBound: number[]
      upperBound: number[]
    }
  }
  anomalyDetection?: {
    recentTransactionsAnalyzed: number
    anomaliesFound: number
    details: Array<{
      isAnomaly: boolean
      anomalyScore: number
      riskLevel: string
      confidence: number
    }>
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

export function AIAnalysisDashboard() {
  const [walletAddress, setWalletAddress] = useState("")
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeWallet = async () => {
    if (!walletAddress.trim()) {
      setError("Please enter a wallet address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/wallet-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: walletAddress.trim(),
          includeForecasting: true,
          includeAnomalyDetection: true,
          includeAIInsights: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "text-red-500 bg-red-50 border-red-200"
      case "high":
        return "text-orange-500 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-500 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-500 bg-green-50 border-green-200"
      default:
        return "text-gray-500 bg-gray-50 border-gray-200"
    }
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "exchange":
        return <BarChart3 className="h-5 w-5 text-blue-500" />
      case "miner":
        return <Zap className="h-5 w-5 text-purple-500" />
      case "whale":
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case "mixer":
        return <Shield className="h-5 w-5 text-pink-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const prepareForecastData = (forecast: any) => {
    if (!forecast) return []
    return forecast.dates.map((date: string, index: number) => ({
      date,
      predicted: forecast.predicted[index],
      lowerBound: forecast.lowerBound[index],
      upperBound: forecast.upperBound[index],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Analysis Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-500" />
            <span>AI-Powered Wallet Analysis</span>
          </CardTitle>
          <CardDescription>
            Comprehensive wallet behavior analysis using ONNX, Prophet forecasting, and Isolation Forest anomaly
            detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="wallet-address">Bitcoin Wallet Address</Label>
              <Input
                id="wallet-address"
                placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && analyzeWallet()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={analyzeWallet} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
          {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Risk Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg border ${getRiskColor(analysisResult.riskSummary.riskLevel)}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{analysisResult.riskSummary.riskLevel.toUpperCase()}</span>
                        <span className="text-sm">
                          {(analysisResult.riskSummary.overallRiskScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={analysisResult.riskSummary.overallRiskScore * 100} className="mt-2" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Classification Risk:</span>
                        <span>{(analysisResult.riskSummary.components.classificationRisk * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Anomaly Risk:</span>
                        <span>{(analysisResult.riskSummary.components.anomalyRisk * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Entity Classification */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Entity Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      {getEntityIcon(analysisResult.classification.entityType)}
                      <div>
                        <div className="font-semibold capitalize">{analysisResult.classification.entityType}</div>
                        <div className="text-sm text-muted-foreground">
                          {(analysisResult.classification.confidence * 100).toFixed(1)}% confidence
                        </div>
                      </div>
                    </div>
                    <Progress value={analysisResult.classification.confidence * 100} />
                  </div>
                </CardContent>
              </Card>

              {/* Models Used */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">AI Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisResult.modelsUsed.map((model) => (
                      <Badge key={model} variant="secondary" className="mr-2 mb-2">
                        {model.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.riskSummary.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Target className="h-4 w-4 mt-0.5 text-blue-500" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Entity Classification Probabilities</CardTitle>
                <CardDescription>ONNX Neural Network classification results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analysisResult.classification.probabilities)
                    .sort(([, a], [, b]) => b - a)
                    .map(([entityType, probability]) => (
                      <div key={entityType} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getEntityIcon(entityType)}
                          <span className="capitalize">{entityType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={probability * 100} className="w-24" />
                          <span className="text-sm w-12">{(probability * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-4">
            {analysisResult.forecasting && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Volume Forecast */}
                {analysisResult.forecasting.volumeForecast && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Volume Forecast</CardTitle>
                      <CardDescription>Prophet time-series forecasting</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={prepareForecastData(analysisResult.forecasting.volumeForecast)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="upperBound"
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.2}
                          />
                          <Area
                            type="monotone"
                            dataKey="lowerBound"
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.2}
                          />
                          <Line type="monotone" dataKey="predicted" stroke="#8884d8" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Frequency Forecast */}
                {analysisResult.forecasting.frequencyForecast && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction Frequency Forecast</CardTitle>
                      <CardDescription>Prophet time-series forecasting</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={prepareForecastData(analysisResult.forecasting.frequencyForecast)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="predicted" stroke="#82ca9d" strokeWidth={2} />
                          <Line type="monotone" dataKey="upperBound" stroke="#82ca9d" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="lowerBound" stroke="#82ca9d" strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            {analysisResult.anomalyDetection && (
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Detection Results</CardTitle>
                  <CardDescription>Isolation Forest anomaly detection on recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {analysisResult.anomalyDetection.recentTransactionsAnalyzed}
                      </div>
                      <div className="text-sm text-muted-foreground">Transactions Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {analysisResult.anomalyDetection.anomaliesFound}
                      </div>
                      <div className="text-sm text-muted-foreground">Anomalies Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {(
                          (analysisResult.anomalyDetection.anomaliesFound /
                            analysisResult.anomalyDetection.recentTransactionsAnalyzed) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">Anomaly Rate</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {analysisResult.anomalyDetection.details.map((detail, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          detail.isAnomaly ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {detail.isAnomaly ? (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            ) : (
                              <Shield className="h-4 w-4 text-green-500" />
                            )}
                            <span className="font-medium">Transaction {index + 1}</span>
                            <Badge variant={detail.isAnomaly ? "destructive" : "default"}>{detail.riskLevel}</Badge>
                          </div>
                          <div className="text-sm">
                            Score: {detail.anomalyScore.toFixed(3)} | Confidence: {(detail.confidence * 100).toFixed(1)}
                            %
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {analysisResult.aiInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <span>AI-Generated Insights</span>
                  </CardTitle>
                  <CardDescription>
                    Generated by {analysisResult.aiInsights.modelUsed} at{" "}
                    {new Date(analysisResult.aiInsights.generatedAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{analysisResult.aiInsights.summary}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
