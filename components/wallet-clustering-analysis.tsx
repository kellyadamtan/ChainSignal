"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp, Shield, Zap, Building, Pickaxe, Eye } from "lucide-react"

interface ClusterAnalysis {
  clusterType: string
  count: number
  totalBalance: number
  avgTxValue: number
  confidence: number
  characteristics: string[]
  riskLevel: "low" | "medium" | "high"
}

export function WalletClusteringAnalysis() {
  const [clusterData, setClusterData] = useState<ClusterAnalysis[]>([
    {
      clusterType: "whale",
      count: 5,
      totalBalance: 5000,
      avgTxValue: 125.5,
      confidence: 0.92,
      characteristics: ["High balance (>1000 BTC)", "Large transactions", "Market influence"],
      riskLevel: "high",
    },
    {
      clusterType: "miner",
      count: 12,
      totalBalance: 2200,
      avgTxValue: 5.3,
      confidence: 0.88,
      characteristics: ["Regular coinbase transactions", "Pool payouts", "Consistent patterns"],
      riskLevel: "low",
    },
    {
      clusterType: "exchange",
      count: 8,
      totalBalance: 3000,
      avgTxValue: 78.9,
      confidence: 0.85,
      characteristics: ["High transaction volume", "Multiple addresses", "Hot/cold wallet patterns"],
      riskLevel: "medium",
    },
    {
      clusterType: "mixer",
      count: 6,
      totalBalance: 800,
      avgTxValue: 15.7,
      confidence: 0.79,
      characteristics: ["Privacy-focused", "Complex transaction patterns", "CoinJoin usage"],
      riskLevel: "high",
    },
    {
      clusterType: "active",
      count: 25,
      totalBalance: 2500,
      avgTxValue: 45.2,
      confidence: 0.76,
      characteristics: ["Regular activity", "Medium transaction sizes", "DeFi interaction"],
      riskLevel: "low",
    },
    {
      clusterType: "dormant",
      count: 15,
      totalBalance: 1000,
      avgTxValue: 12.8,
      confidence: 0.83,
      characteristics: ["Long inactivity periods", "HODL behavior", "Minimal transactions"],
      riskLevel: "low",
    },
    {
      clusterType: "regular",
      count: 47,
      totalBalance: 1500,
      avgTxValue: 23.4,
      confidence: 0.71,
      characteristics: ["Standard usage patterns", "Moderate activity", "Retail behavior"],
      riskLevel: "low",
    },
  ])

  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const fetchClusterData = async () => {
      try {
        const response = await fetch("/api/wallets/clustering-analysis")
        const result = await response.json()

        if (result.clusters) {
          setClusterData(result.clusters)
        }
      } catch (error) {
        console.error("Failed to fetch clustering analysis:", error)
      }
    }

    fetchClusterData()
    const interval = setInterval(fetchClusterData, 300000) // Update every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const runMLClustering = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/wallets/ml-clustering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ algorithm: "dbscan", features: ["balance", "tx_frequency", "mixing_score"] }),
      })

      if (response.ok) {
        // Refresh data after ML analysis
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    } catch (error) {
      console.error("ML clustering failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getClusterIcon = (type: string) => {
    switch (type) {
      case "whale":
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case "miner":
        return <Pickaxe className="h-5 w-5 text-purple-500" />
      case "exchange":
        return <Building className="h-5 w-5 text-blue-500" />
      case "mixer":
        return <Eye className="h-5 w-5 text-pink-500" />
      case "active":
        return <Zap className="h-5 w-5 text-green-500" />
      case "dormant":
        return <Shield className="h-5 w-5 text-gray-500" />
      default:
        return <Brain className="h-5 w-5 text-yellow-500" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-blue-500" />
                <span>AI-Powered Wallet Clustering Analysis</span>
              </CardTitle>
              <CardDescription>
                Machine learning-based wallet behavior classification and risk assessment
              </CardDescription>
            </div>
            <Button onClick={runMLClustering} disabled={isAnalyzing} className="bg-blue-600 hover:bg-blue-700">
              {isAnalyzing ? "Analyzing..." : "Run ML Analysis"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Cluster Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="algorithms">ML Algorithms</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clusterData.map((cluster) => (
                  <Card key={cluster.clusterType} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getClusterIcon(cluster.clusterType)}
                          <span className="font-semibold capitalize">{cluster.clusterType}</span>
                        </div>
                        <Badge className={getRiskColor(cluster.riskLevel)}>{cluster.riskLevel} risk</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Count:</span>
                          <div className="font-semibold">{cluster.count}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Balance:</span>
                          <div className="font-semibold">{cluster.totalBalance.toLocaleString()} BTC</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Tx:</span>
                          <div className="font-semibold">{cluster.avgTxValue.toFixed(1)} BTC</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <div className="font-semibold">{(cluster.confidence * 100).toFixed(0)}%</div>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-muted-foreground">ML Confidence:</span>
                        <Progress value={cluster.confidence * 100} className="mt-1" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Key Characteristics:</span>
                        <div className="space-y-1">
                          {cluster.characteristics.map((char, index) => (
                            <div key={index} className="text-xs bg-muted px-2 py-1 rounded">
                              {char}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-4">
                {clusterData.map((cluster) => (
                  <Card key={cluster.clusterType}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        {getClusterIcon(cluster.clusterType)}
                        <span className="capitalize">{cluster.clusterType} Wallets</span>
                        <Badge variant="outline">{cluster.count} wallets</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Total Balance</span>
                          <div className="text-2xl font-bold">{cluster.totalBalance.toLocaleString()}</div>
                          <span className="text-sm text-muted-foreground">BTC</span>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Average Transaction</span>
                          <div className="text-2xl font-bold">{cluster.avgTxValue.toFixed(2)}</div>
                          <span className="text-sm text-muted-foreground">BTC</span>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm font-medium">ML Confidence</span>
                          <div className="text-2xl font-bold">{(cluster.confidence * 100).toFixed(0)}%</div>
                          <Progress value={cluster.confidence * 100} className="w-full" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Risk Assessment</span>
                          <Badge className={getRiskColor(cluster.riskLevel)}>
                            {cluster.riskLevel.toUpperCase()} RISK
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="algorithms" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">K-Means Clustering</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Features:</strong> Balance, Transaction Frequency, Average Value
                      </div>
                      <div>
                        <strong>Clusters:</strong> 7 predefined types
                      </div>
                      <div>
                        <strong>Accuracy:</strong> 84.2%
                      </div>
                      <div>
                        <strong>Last Run:</strong> 2 hours ago
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">DBSCAN</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Features:</strong> Mixing Score, Exchange Interaction
                      </div>
                      <div>
                        <strong>Outliers:</strong> 12 detected
                      </div>
                      <div>
                        <strong>Accuracy:</strong> 91.7%
                      </div>
                      <div>
                        <strong>Last Run:</strong> 1 hour ago
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Hierarchical</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Features:</strong> Multi-dimensional behavior
                      </div>
                      <div>
                        <strong>Dendogram:</strong> 15 levels
                      </div>
                      <div>
                        <strong>Accuracy:</strong> 87.9%
                      </div>
                      <div>
                        <strong>Last Run:</strong> 30 minutes ago
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
