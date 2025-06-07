"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Moon,
  Sun,
  Settings,
  Bell,
  TrendingUp,
  Wallet,
  Activity,
  Database,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useTheme } from "next-themes"
import { TransactionVolumeChart } from "./charts/transaction-volume-chart"
import { WalletClusterMap } from "./charts/wallet-cluster-map"
import { MinerFlowChart } from "./charts/miner-flow-chart"
import { AlertBuilder } from "./alert-builder"
import { RealTimeMetrics } from "./real-time-metrics"
import { WalletClusteringAnalysis } from "./wallet-clustering-analysis"

export function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [activeAlerts, setActiveAlerts] = useState(3)
  const [isConnected, setIsConnected] = useState(false)
  const [dbInitialized, setDbInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initResult, setInitResult] = useState<any>(null)

  useEffect(() => {
    // Simulate WebSocket connection
    const timer = setTimeout(() => setIsConnected(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const initializeDatabase = async () => {
    setIsInitializing(true)
    setInitResult(null)

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
      })

      const result = await response.json()

      if (response.ok) {
        setDbInitialized(true)
        setInitResult(result)
        // Refresh the page after a short delay to show success message
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        console.error("Failed to initialize database:", result)
        setInitResult({ error: result.error, details: result.details })
      }
    } catch (error) {
      console.error("Error initializing database:", error)
      setInitResult({ error: "Network error", details: "Failed to connect to database" })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-orange-500" />
                <h1 className="text-2xl font-bold">ChainSignal</h1>
              </div>
              <Badge variant={isConnected ? "default" : "secondary"} className="ml-4">
                {isConnected ? "Live" : "Connecting..."}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {!dbInitialized && !initResult?.success && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={initializeDatabase}
                  disabled={isInitializing}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  <Database className="h-4 w-4 mr-2" />
                  {isInitializing ? "Initializing..." : "Initialize DB"}
                </Button>
              )}

              {initResult?.success && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  DB Ready
                </Badge>
              )}

              {initResult?.error && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  DB Error
                </Badge>
              )}

              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {activeAlerts > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{activeAlerts}</Badge>
                )}
              </Button>

              <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Show initialization result */}
          {initResult && (
            <div className="mt-4">
              {initResult.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 font-medium">{initResult.message}</span>
                  </div>
                  {initResult.details && (
                    <div className="mt-2 text-sm text-green-700">
                      Created {initResult.details.tables_created} tables with {initResult.details.mining_pools} mining
                      pools, {initResult.details.network_metrics} metrics, {initResult.details.transactions}{" "}
                      transactions, and {initResult.details.wallets} wallets.
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-800 font-medium">{initResult.error}</span>
                  </div>
                  {initResult.details && <div className="mt-2 text-sm text-red-700">{initResult.details}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="clusters">Clusters</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Real-time Metrics */}
            <RealTimeMetrics />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TransactionVolumeChart />
              <MinerFlowChart />
            </div>

            {/* Full-width Wallet Cluster Map */}
            <WalletClusterMap />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Advanced Analytics</span>
                  </CardTitle>
                  <CardDescription>Deep dive into Bitcoin network patterns and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionVolumeChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Hash Rate</span>
                    <span className="font-semibold">450 EH/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Difficulty</span>
                    <span className="font-semibold">62.46 T</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mempool Size</span>
                    <span className="font-semibold">2.4 MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Addresses</span>
                    <span className="font-semibold">1.2M</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertBuilder />
          </TabsContent>

          <TabsContent value="clusters" className="space-y-6">
            <WalletClusteringAnalysis />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>Interactive Cluster Visualization</span>
                </CardTitle>
                <CardDescription>AI-powered wallet clustering and behavior analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <WalletClusterMap />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
