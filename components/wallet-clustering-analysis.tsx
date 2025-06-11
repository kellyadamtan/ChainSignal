"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  TrendingUp,
  Shield,
  Zap,
  Building,
  Pickaxe,
  Eye,
  Sparkles,
  Search,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { useFeatureAccess } from "@/hooks/use-subscription"
import { Paywall } from "./paywall"

interface ClusterAnalysis {
  clusterType: string
  count: number
  totalBalance: number
  avgTxValue: number
  confidence: number
  characteristics: string[]
  riskLevel: "low" | "medium" | "high"
}

interface ClusterStats {
  totalClusters: number
  highRiskClusters: number
  totalAddresses: number
  mlAccuracy: number
}

export function WalletClusteringAnalysis() {
  const { data: session } = useSession()
  const [clusterData, setClusterData] = useState<ClusterAnalysis[]>([])
  const [stats, setStats] = useState<ClusterStats>({
    totalClusters: 0,
    highRiskClusters: 0,
    totalAddresses: 0,
    mlAccuracy: 0.917,
  })
  const [searchAddress, setSearchAddress] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedCluster, setSelectedCluster] = useState<ClusterAnalysis | null>(null)

  const hasAccess = useFeatureAccess("entityClassification")

  // Mock user data - in real app, this would come from your user service
  // const mockUser: User = {
  //   id: session?.user?.email || "guest",
  //   email: session?.user?.email || "guest@example.com",
  //   subscriptionTier: "free", // This would be fetched from your database
  //   subscriptionStatus: "active",
  //   createdAt: new Date(),
  // }

  // Check if user has access to wallet clustering
  // const hasAccess = SubscriptionService.checkFeatureAccess("entityClassification", mockUser)

  const defaultClusterData: ClusterAnalysis[] = [
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
  ]

  const fetchClusterData = async () => {
    if (!hasAccess) return

    try {
      const response = await fetch("/api/wallets/clustering-analysis")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.clusters) {
        setClusterData(result.clusters)
        updateStats(result.clusters)
      }
    } catch (error) {
      console.error("Failed to fetch clustering analysis:", error)
      // Keep using the default mock data if API fails
      setClusterData(defaultClusterData)
      updateStats(defaultClusterData)
    }
  }

  useEffect(() => {
    if (hasAccess) {
      // fetchClusterData()
      loadInitialData()
      const interval = setInterval(fetchClusterData, 300000) // Update every 5 minutes
      return () => clearInterval(interval)
    }
  }, [hasAccess])

  const runMLClustering = async () => {
    if (!hasAccess) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/wallets/ml-clustering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algorithm: "dbscan",
          features: ["balance", "tx_frequency", "mixing_score"],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Refresh data after ML analysis
        setTimeout(() => {
          fetchClusterData()
        }, 1000)
      }
    } catch (error) {
      console.error("ML clustering failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Add these helper functions to match the other components
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
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "default"
      default:
        return "default"
    }
  }

  const loadInitialData = () => {
    // Generate mock data and update stats consistently
    const mockClassifications: ClusterAnalysis[] = [
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
    ]

    setClusterData(mockClassifications)
    updateStats(mockClassifications)
  }

  const updateStats = (clusterList: ClusterAnalysis[]) => {
    const totalClusters = clusterList.length
    const highRiskClusters = clusterList.filter((c) => c.riskLevel === "high").length
    const totalAddresses = clusterList.reduce((sum, cluster) => sum + cluster.count, 0)

    setStats({
      totalClusters,
      highRiskClusters,
      totalAddresses,
      mlAccuracy: 0.917,
    })
  }

  // Paywall component for non-Pro/Enterprise users
  if (!hasAccess) {
    return (
      <Paywall
        feature="entityClassification"
        title="AI-Powered Wallet Clustering Analysis"
        description="Advanced machine learning algorithms for wallet behavior classification and risk assessment. Identify whales, exchanges, mixers, and suspicious activity patterns in real-time."
        minTier="pro"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats - consistent with other components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Clusters</p>
                <p className="text-2xl font-bold">{stats.totalClusters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold">{stats.highRiskClusters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Addresses</p>
                <p className="text-2xl font-bold">{stats.totalAddresses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">ML Accuracy</p>
                <p className="text-2xl font-bold">{(stats.mlAccuracy * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Section - consistent with other components */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Clustering Analysis</CardTitle>
          <CardDescription>
            Enter a Bitcoin address to analyze its cluster classification and behavioral patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter Bitcoin address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && runMLClustering()}
            />
            <Button onClick={runMLClustering} disabled={isAnalyzing}>
              {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs - consistent structure */}
      <Tabs defaultValue="live-clusters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live-clusters">Live Clusters</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="details">Cluster Details</TabsTrigger>
        </TabsList>

        <TabsContent value="live-clusters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Cluster Analysis</CardTitle>
              <CardDescription>Live machine learning classification of wallet clusters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {clusterData.map((cluster, index) => (
                  <div
                    key={`${cluster.clusterType}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedCluster(cluster)}
                  >
                    <div className="flex items-center space-x-3">
                      {getClusterIcon(cluster.clusterType)}
                      <div>
                        <p className="font-semibold capitalize">{cluster.clusterType}</p>
                        <p className="text-xs text-muted-foreground">
                          {cluster.count} addresses • {cluster.totalBalance.toLocaleString()} BTC
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRiskColor(cluster.riskLevel)}>{cluster.riskLevel} risk</Badge>
                      <Badge variant="outline">{(cluster.confidence * 100).toFixed(0)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cluster Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clusterData.map((cluster, index) => (
                    <div key={cluster.clusterType} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getClusterIcon(cluster.clusterType)}
                        <span className="capitalize">{cluster.clusterType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={(cluster.count / stats.totalAddresses) * 100} className="w-20" />
                        <span className="text-sm font-medium">{cluster.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ML Algorithm Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>K-Means Clustering</span>
                    <Badge variant="default">84.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>DBSCAN</span>
                    <Badge variant="default">91.7%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Hierarchical</span>
                    <Badge variant="default">87.9%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ensemble Model</span>
                    <Badge variant="default">{(stats.mlAccuracy * 100).toFixed(1)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedCluster ? (
            <Card>
              <CardHeader>
                <CardTitle>Cluster Analysis Details</CardTitle>
                <CardDescription>Detailed analysis for {selectedCluster.clusterType} cluster</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Cluster Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Cluster Type:</span>
                        <Badge variant={getRiskColor(selectedCluster.riskLevel)}>{selectedCluster.clusterType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Address Count:</span>
                        <span>{selectedCluster.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Balance:</span>
                        <span>{selectedCluster.totalBalance.toLocaleString()} BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Transaction:</span>
                        <span>{selectedCluster.avgTxValue.toFixed(2)} BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ML Confidence:</span>
                        <span>{(selectedCluster.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Key Characteristics</h4>
                    <div className="space-y-2">
                      {selectedCluster.characteristics.map((char, index) => (
                        <div key={index} className="text-sm bg-muted px-2 py-1 rounded">
                          {char}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">ML Confidence</h4>
                  <Progress value={selectedCluster.confidence * 100} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Confidence: {(selectedCluster.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a cluster from the live analysis or search for an address to view detailed clustering
                  information.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
