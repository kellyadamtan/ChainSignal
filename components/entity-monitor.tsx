"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Shield, TrendingUp, Users, Zap, Search, RefreshCw, Eye, AlertCircle } from "lucide-react"
import { useFeatureAccess } from "@/hooks/use-subscription"
import { Paywall } from "./paywall"

interface EntityClassification {
  address: string
  entityType: string
  confidence: number
  riskScore: number
  isAnomaly: boolean
  probabilities: Record<string, number>
  timestamp: string
}

interface EntityStats {
  totalClassified: number
  highRiskEntities: number
  anomaliesDetected: number
  topEntityTypes: Array<{ type: string; count: number }>
}

export function EntityMonitor() {
  const [classifications, setClassifications] = useState<EntityClassification[]>([])
  const [stats, setStats] = useState<EntityStats>({
    totalClassified: 0,
    highRiskEntities: 0,
    anomaliesDetected: 0,
    topEntityTypes: [],
  })
  const [searchAddress, setSearchAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<EntityClassification | null>(null)

  const hasEntityAccess = useFeatureAccess("entityClassification")

  useEffect(() => {
    // Simulate real-time entity classifications
    const interval = setInterval(() => {
      generateMockClassification()
    }, 5000)

    // Load initial data
    loadInitialData()

    return () => clearInterval(interval)
  }, [])

  const loadInitialData = () => {
    // Generate some initial mock data
    const mockClassifications: EntityClassification[] = [
      {
        address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        entityType: "miner",
        confidence: 0.95,
        riskScore: 0.1,
        isAnomaly: false,
        probabilities: { miner: 0.95, exchange: 0.03, retail: 0.02 },
        timestamp: new Date().toISOString(),
      },
      {
        address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
        entityType: "exchange",
        confidence: 0.88,
        riskScore: 0.2,
        isAnomaly: false,
        probabilities: { exchange: 0.88, institutional: 0.08, defi: 0.04 },
        timestamp: new Date().toISOString(),
      },
      {
        address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        entityType: "mixer",
        confidence: 0.76,
        riskScore: 0.9,
        isAnomaly: true,
        probabilities: { mixer: 0.76, unknown: 0.15, gambling: 0.09 },
        timestamp: new Date().toISOString(),
      },
    ]

    setClassifications(mockClassifications)
    updateStats(mockClassifications)
  }

  const generateMockClassification = () => {
    const entityTypes = ["exchange", "miner", "mixer", "gambling", "defi", "institutional", "retail"]
    const randomType = entityTypes[Math.floor(Math.random() * entityTypes.length)]
    const confidence = 0.5 + Math.random() * 0.5
    const riskScore =
      randomType === "mixer" || randomType === "gambling" ? 0.7 + Math.random() * 0.3 : Math.random() * 0.4

    const newClassification: EntityClassification = {
      address: generateRandomAddress(),
      entityType: randomType,
      confidence,
      riskScore,
      isAnomaly: Math.random() < 0.1,
      probabilities: generateProbabilities(randomType),
      timestamp: new Date().toISOString(),
    }

    setClassifications((prev) => [newClassification, ...prev.slice(0, 49)]) // Keep last 50
    updateStats([newClassification, ...classifications])
  }

  const generateRandomAddress = () => {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    let result = ""
    for (let i = 0; i < 34; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const generateProbabilities = (mainType: string) => {
    const probs: Record<string, number> = {}
    const types = ["exchange", "miner", "mixer", "gambling", "defi", "institutional", "retail", "unknown"]

    types.forEach((type) => {
      if (type === mainType) {
        probs[type] = 0.5 + Math.random() * 0.5
      } else {
        probs[type] = Math.random() * 0.3
      }
    })

    // Normalize probabilities
    const sum = Object.values(probs).reduce((a, b) => a + b, 0)
    Object.keys(probs).forEach((key) => {
      probs[key] = probs[key] / sum
    })

    return probs
  }

  const updateStats = (classificationList: EntityClassification[]) => {
    const totalClassified = classificationList.length
    const highRiskEntities = classificationList.filter((c) => c.riskScore > 0.7).length
    const anomaliesDetected = classificationList.filter((c) => c.isAnomaly).length

    const typeCounts: Record<string, number> = {}
    classificationList.forEach((c) => {
      typeCounts[c.entityType] = (typeCounts[c.entityType] || 0) + 1
    })

    const topEntityTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setStats({
      totalClassified,
      highRiskEntities,
      anomaliesDetected,
      topEntityTypes,
    })
  }

  const handleSearch = async () => {
    if (!searchAddress.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/entity-classification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: searchAddress.trim() }),
      })

      if (response.ok) {
        const result = await response.json()
        setClassifications((prev) => [result, ...prev.slice(0, 49)])
        setSelectedEntity(result)
        updateStats([result, ...classifications])
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEntityIcon = (entityType: string) => {
    const icons = {
      exchange: TrendingUp,
      miner: Zap,
      mixer: AlertTriangle,
      gambling: AlertCircle,
      defi: Shield,
      institutional: Users,
      retail: Users,
      unknown: Eye,
    }
    const Icon = icons[entityType as keyof typeof icons] || Eye
    return <Icon className="h-4 w-4" />
  }

  const getEntityColor = (entityType: string, riskScore: number) => {
    if (riskScore > 0.7) return "destructive"
    if (riskScore > 0.4) return "secondary"
    return "default"
  }

  const getRiskLevel = (riskScore: number) => {
    if (riskScore > 0.7) return "High"
    if (riskScore > 0.4) return "Medium"
    return "Low"
  }

  if (!hasEntityAccess) {
    return (
      <Paywall
        feature="entityClassification"
        title="Entity Classification"
        description="Identify and classify Bitcoin addresses using advanced machine learning algorithms. Track exchanges, miners, mixers, and other entity types in real-time."
        minTier="pro"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Classified</p>
                <p className="text-2xl font-bold">{stats.totalClassified}</p>
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
                <p className="text-2xl font-bold">{stats.highRiskEntities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Anomalies</p>
                <p className="text-2xl font-bold">{stats.anomaliesDetected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Top Entity</p>
                <p className="text-lg font-bold">{stats.topEntityTypes[0]?.type || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Entity Classification Search</CardTitle>
          <CardDescription>Enter a Bitcoin address to classify its entity type and risk level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter Bitcoin address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="live-feed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live-feed">Live Feed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="details">Entity Details</TabsTrigger>
        </TabsList>

        <TabsContent value="live-feed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Entity Classifications</CardTitle>
              <CardDescription>Live stream of Bitcoin address entity classifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {classifications.map((classification, index) => (
                  <div
                    key={`${classification.address}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedEntity(classification)}
                  >
                    <div className="flex items-center space-x-3">
                      {getEntityIcon(classification.entityType)}
                      <div>
                        <p className="font-mono text-sm">{classification.address.slice(0, 20)}...</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(classification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getEntityColor(classification.entityType, classification.riskScore)}>
                        {classification.entityType}
                      </Badge>
                      <Badge variant="outline">{(classification.confidence * 100).toFixed(0)}%</Badge>
                      {classification.isAnomaly && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Anomaly
                        </Badge>
                      )}
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
                <CardTitle>Entity Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topEntityTypes.map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getEntityIcon(item.type)}
                        <span className="capitalize">{item.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={(item.count / stats.totalClassified) * 100} className="w-20" />
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>High Risk Entities</span>
                    <Badge variant="destructive">{stats.highRiskEntities}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Anomalies Detected</span>
                    <Badge variant="secondary">{stats.anomaliesDetected}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Risk Coverage</span>
                    <Badge variant="default">
                      {((stats.highRiskEntities / stats.totalClassified) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedEntity ? (
            <Card>
              <CardHeader>
                <CardTitle>Entity Classification Details</CardTitle>
                <CardDescription>Detailed analysis for {selectedEntity.address}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Classification</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Entity Type:</span>
                        <Badge variant={getEntityColor(selectedEntity.entityType, selectedEntity.riskScore)}>
                          {selectedEntity.entityType}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span>{(selectedEntity.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <Badge
                          variant={
                            selectedEntity.riskScore > 0.7
                              ? "destructive"
                              : selectedEntity.riskScore > 0.4
                                ? "secondary"
                                : "default"
                          }
                        >
                          {getRiskLevel(selectedEntity.riskScore)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Probability Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedEntity.probabilities)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([type, prob]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="capitalize text-sm">{type}:</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={prob * 100} className="w-16" />
                              <span className="text-xs">{(prob * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {selectedEntity.isAnomaly && (
                  <div className="p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-semibold text-red-700 dark:text-red-300">Anomaly Detected</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      This entity exhibits unusual behavior patterns that deviate from typical{" "}
                      {selectedEntity.entityType} characteristics.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select an entity from the live feed or search for an address to view detailed classification
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
