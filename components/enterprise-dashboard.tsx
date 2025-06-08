"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Shield, TrendingUp, AlertTriangle, Network, Eye, Users, Lock, Target } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"
import { useToast } from "@/hooks/use-toast"

interface ClusterAnalysis {
  clusters: any
  analysis: Record<string, any>
  insights: any
  algorithm_used: string
  feature_count: number
  wallet_count: number
}

export function EnterpriseDashboard() {
  const { toast } = useToast()
  const [clusterData, setClusterData] = useState<ClusterAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("dbscan")
  const [complianceAlerts, setComplianceAlerts] = useState([])
  const [darkPoolEvents, setDarkPoolEvents] = useState([])
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState([])

  useEffect(() => {
    fetchEnterpriseData()
  }, [])

  const fetchEnterpriseData = async () => {
    try {
      // Fetch clustering data
      const clusterResponse = await fetch("/api/enterprise/clustering")
      if (clusterResponse.ok) {
        const data = await clusterResponse.json()
        setClusterData(data)
      }

      // Fetch compliance alerts
      const complianceResponse = await fetch("/api/enterprise/compliance/alerts")
      if (complianceResponse.ok) {
        const alerts = await complianceResponse.json()
        setComplianceAlerts(alerts)
      }

      // Fetch dark pool events
      const darkPoolResponse = await fetch("/api/enterprise/dark-pool/events")
      if (darkPoolResponse.ok) {
        const events = await darkPoolResponse.json()
        setDarkPoolEvents(events)
      }

      // Fetch arbitrage opportunities
      const arbitrageResponse = await fetch("/api/enterprise/arbitrage/opportunities")
      if (arbitrageResponse.ok) {
        const opportunities = await arbitrageResponse.json()
        setArbitrageOpportunities(opportunities)
      }
    } catch (error) {
      console.error("Failed to fetch enterprise data:", error)
    }
  }

  const runAdvancedClustering = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/enterprise/clustering/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algorithm: selectedAlgorithm,
          features: ["balance", "tx_frequency", "mixing_score", "institutional_score", "risk_score"],
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setClusterData(result)
        toast({
          title: "Advanced clustering completed",
          description: `Analyzed ${result.wallet_count} wallets using ${result.algorithm_used}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run advanced clustering analysis",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"]

  return (
    <div className="space-y-6">
      {/* Enterprise Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="h-8 w-8 mr-3 text-orange-500" />
            Enterprise Analytics Suite
          </h1>
          <p className="text-muted-foreground">Advanced blockchain intelligence for institutional clients</p>
        </div>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          Enterprise Tier
        </Badge>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallets Analyzed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clusterData?.wallet_count?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceAlerts.length}</div>
            <p className="text-xs text-muted-foreground">3 critical, 12 high priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dark Pool Events</CardTitle>
            <Eye className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{darkPoolEvents.length}</div>
            <p className="text-xs text-muted-foreground">24h detection window</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arbitrage Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{arbitrageOpportunities.length}</div>
            <p className="text-xs text-muted-foreground">Real-time monitoring</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clustering" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="clustering">Advanced Clustering</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Engine</TabsTrigger>
          <TabsTrigger value="intelligence">Wallet Intelligence</TabsTrigger>
          <TabsTrigger value="darkpool">Dark Pool Detection</TabsTrigger>
          <TabsTrigger value="arbitrage">Arbitrage Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="clustering" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Brain className="h-6 w-6 mr-2 text-blue-500" />
                    Advanced Wallet Clustering
                  </CardTitle>
                  <CardDescription>
                    Enterprise-grade clustering with 15+ behavioral features and multiple ML algorithms
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dbscan">DBSCAN</SelectItem>
                      <SelectItem value="kmeans">K-Means</SelectItem>
                      <SelectItem value="hierarchical">Hierarchical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={runAdvancedClustering} disabled={isAnalyzing}>
                    {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {clusterData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Cluster Distribution</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(clusterData.insights?.entity_distribution || {}).map(([key, value]) => ({
                            name: key,
                            value,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(clusterData.insights?.entity_distribution || {}).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Risk Distribution</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.entries(clusterData.insights?.risk_distribution || {}).map(([key, value]) => ({
                          risk: key,
                          count: value,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="risk" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {clusterData?.insights?.recommendations && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">AI Recommendations</h4>
                  <div className="space-y-3">
                    {clusterData.insights.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            rec.priority === "high"
                              ? "bg-red-500"
                              : rec.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant={rec.priority === "high" ? "destructive" : "secondary"}>
                              {rec.priority}
                            </Badge>
                            <span className="text-sm font-medium">{rec.type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{rec.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-6 w-6 mr-2 text-red-500" />
                Regulatory Compliance Engine
              </CardTitle>
              <CardDescription>Real-time AML/KYC screening with customizable rule sets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h4 className="font-semibold mb-4">Active Compliance Rules</h4>
                  <div className="space-y-3">
                    {[
                      { name: "Large Transaction Alert", threshold: "> $10,000", status: "active", triggered: 23 },
                      { name: "Mixer Interaction", threshold: "Any amount", status: "active", triggered: 7 },
                      { name: "Rapid Succession", threshold: "> 5 tx/hour", status: "active", triggered: 12 },
                      { name: "Sanctioned Address", threshold: "Any interaction", status: "active", triggered: 0 },
                    ].map((rule, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">{rule.threshold}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={rule.status === "active" ? "default" : "secondary"}>{rule.status}</Badge>
                          <span className="text-sm">{rule.triggered} alerts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Recent Alerts</h4>
                  <div className="space-y-3">
                    {[
                      { type: "High Value", amount: "$50,000", time: "2 min ago", severity: "critical" },
                      { type: "Mixer Detected", amount: "$2,500", time: "15 min ago", severity: "high" },
                      { type: "Rapid Succession", amount: "$8,000", time: "1 hour ago", severity: "medium" },
                    ].map((alert, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={
                              alert.severity === "critical"
                                ? "destructive"
                                : alert.severity === "high"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {alert.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{alert.time}</span>
                        </div>
                        <p className="text-sm font-medium">{alert.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-6 w-6 mr-2 text-purple-500" />
                Institutional Wallet Intelligence
              </CardTitle>
              <CardDescription>Advanced entity mapping and fund flow analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Entity Classification</h4>
                  <div className="space-y-3">
                    {[
                      { type: "Exchange", count: 45, confidence: 0.94, risk: "medium" },
                      { type: "Institutional", count: 23, confidence: 0.87, risk: "low" },
                      { type: "Whale", count: 12, confidence: 0.91, risk: "high" },
                      { type: "Mixer", count: 8, confidence: 0.89, risk: "critical" },
                      { type: "Miner", count: 67, confidence: 0.96, risk: "low" },
                    ].map((entity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              entity.risk === "critical"
                                ? "bg-red-500"
                                : entity.risk === "high"
                                  ? "bg-orange-500"
                                  : entity.risk === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium">{entity.type}</p>
                            <p className="text-sm text-muted-foreground">{entity.count} wallets</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{(entity.confidence * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">confidence</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Fund Flow Analysis</h4>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Largest Flows (24h)</h5>
                      <div className="space-y-2">
                        {[
                          { from: "Exchange A", to: "Whale Wallet", amount: "1,250 BTC" },
                          { from: "Institutional", to: "Exchange B", amount: "890 BTC" },
                          { from: "Unknown", to: "Mixer", amount: "450 BTC" },
                        ].map((flow, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>
                              {flow.from} → {flow.to}
                            </span>
                            <span className="font-medium">{flow.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Network Statistics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Flows:</span>
                          <span className="font-medium">2,847</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hub Wallets:</span>
                          <span className="font-medium">23</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Connected Components:</span>
                          <span className="font-medium">156</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="darkpool" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-6 w-6 mr-2 text-purple-500" />
                Dark Pool Flow Detection
              </CardTitle>
              <CardDescription>
                Identify institutional OTC activity through statistical anomaly detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h4 className="font-semibold mb-4">Detected Events</h4>
                  <div className="space-y-3">
                    {[
                      {
                        time: "14:23 UTC",
                        amount: "2,500 BTC",
                        confidence: 0.89,
                        pattern: "Large block transfer",
                        exchanges: ["Binance", "Coinbase"],
                      },
                      {
                        time: "12:45 UTC",
                        amount: "1,800 BTC",
                        confidence: 0.76,
                        pattern: "Cross-exchange arbitrage",
                        exchanges: ["Kraken", "Bitstamp"],
                      },
                      {
                        time: "09:15 UTC",
                        amount: "950 BTC",
                        confidence: 0.82,
                        pattern: "Institutional accumulation",
                        exchanges: ["Gemini"],
                      },
                    ].map((event, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{event.pattern}</span>
                          <span className="text-sm text-muted-foreground">{event.time}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold">{event.amount}</span>
                          <Progress value={event.confidence * 100} className="w-24" />
                        </div>
                        <div className="flex items-center space-x-2">
                          {event.exchanges.map((exchange, i) => (
                            <Badge key={i} variant="outline">
                              {exchange}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Detection Metrics</h4>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">24h Summary</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Events Detected:</span>
                          <span className="font-medium">47</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Volume:</span>
                          <span className="font-medium">12,450 BTC</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Confidence:</span>
                          <span className="font-medium">84.2%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Pattern Types</h5>
                      <div className="space-y-2">
                        {[
                          { type: "Block Transfer", count: 23 },
                          { type: "Cross-Exchange", count: 15 },
                          { type: "Accumulation", count: 9 },
                        ].map((pattern, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{pattern.type}</span>
                            <span className="font-medium">{pattern.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arbitrage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 mr-2 text-green-500" />
                Cross-Exchange Arbitrage Monitor
              </CardTitle>
              <CardDescription>Real-time arbitrage opportunity detection across 50+ exchanges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Active Opportunities</h4>
                  <div className="space-y-3">
                    {[
                      {
                        pair: "BTC/USD",
                        buyExchange: "Kraken",
                        sellExchange: "Binance",
                        spread: 2.3,
                        profit: "$1,250",
                        volume: "5.2 BTC",
                      },
                      {
                        pair: "ETH/USD",
                        buyExchange: "Coinbase",
                        sellExchange: "Bitstamp",
                        spread: 1.8,
                        profit: "$890",
                        volume: "12.5 ETH",
                      },
                      {
                        pair: "BTC/EUR",
                        buyExchange: "Bitfinex",
                        sellExchange: "Gemini",
                        spread: 1.5,
                        profit: "$650",
                        volume: "3.1 BTC",
                      },
                    ].map((opp, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{opp.pair}</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {opp.spread}% spread
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Buy: {opp.buyExchange} → Sell: {opp.sellExchange}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-600">{opp.profit}</span>
                          <span className="text-sm">{opp.volume}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">24h Performance</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Opportunities:</span>
                          <span className="font-medium">156</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Spread:</span>
                          <span className="font-medium">1.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Profit:</span>
                          <span className="font-medium text-green-600">$45,230</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Top Exchanges</h5>
                      <div className="space-y-2">
                        {[
                          { exchange: "Binance", opportunities: 45 },
                          { exchange: "Coinbase", opportunities: 38 },
                          { exchange: "Kraken", opportunities: 32 },
                          { exchange: "Bitstamp", opportunities: 28 },
                        ].map((ex, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{ex.exchange}</span>
                            <span className="font-medium">{ex.opportunities}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Risk Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Slippage Risk:</span>
                          <span className="font-medium">Low</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Execution Time:</span>
                          <span className="font-medium">2.3s avg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span className="font-medium text-green-600">94.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
