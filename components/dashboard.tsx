"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  Users,
  Shield,
  Brain,
} from "lucide-react"
import { useTheme } from "next-themes"
import { TransactionVolumeChart } from "./charts/transaction-volume-chart"
import { WalletClusterMap } from "./charts/wallet-cluster-map"
import { MinerFlowChart } from "./charts/miner-flow-chart"
import { AlertBuilder } from "./alert-builder"
import { EnhancedRealTimeMetrics } from "./enhanced-real-time-metrics"
import { WalletClusteringAnalysis } from "./wallet-clustering-analysis"
import { EntityMonitor } from "./entity-monitor"
import { RiskDashboard } from "./risk-dashboard"
import { SubscriptionProvider } from "@/hooks/use-subscription"
import { AIAnalysisDashboard } from "./ai-analysis-dashboard"
import { EnterpriseDashboard } from "./enterprise-dashboard"

interface DbStatusInfo {
  status: "checking" | "connected" | "error"
  lastChecked: Date | null
  responseTime: number | null
  endpoint: string
  errorMessage?: string
}

export function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [activeAlerts, setActiveAlerts] = useState(3)
  const [isConnected, setIsConnected] = useState(false)
  const [dbStatusInfo, setDbStatusInfo] = useState<DbStatusInfo>({
    status: "checking",
    lastChecked: null,
    responseTime: null,
    endpoint: "/api/metrics",
  })

  useEffect(() => {
    // Simulate WebSocket connection
    const timer = setTimeout(() => setIsConnected(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Check database connection status
    const checkDatabaseStatus = async () => {
      const startTime = Date.now()

      try {
        const response = await fetch("/api/metrics")
        const endTime = Date.now()
        const responseTime = endTime - startTime

        if (response.ok) {
          setDbStatusInfo({
            status: "connected",
            lastChecked: new Date(),
            responseTime,
            endpoint: "/api/metrics",
          })
        } else {
          setDbStatusInfo({
            status: "error",
            lastChecked: new Date(),
            responseTime,
            endpoint: "/api/metrics",
            errorMessage: `HTTP ${response.status}: ${response.statusText}`,
          })
        }
      } catch (error) {
        const endTime = Date.now()
        const responseTime = endTime - startTime

        setDbStatusInfo({
          status: "error",
          lastChecked: new Date(),
          responseTime,
          endpoint: "/api/metrics",
          errorMessage: error instanceof Error ? error.message : "Network error",
        })
      }
    }

    checkDatabaseStatus()

    // Check database status every 30 seconds
    const interval = setInterval(checkDatabaseStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date | null) => {
    if (!date) return "Never"
    return date.toLocaleTimeString()
  }

  const getDbStatusBadge = () => {
    const tooltipContent = (
      <div className="space-y-1">
        <div className="font-medium">Database Connection</div>
        <div className="text-xs space-y-1">
          <div>Status: {dbStatusInfo.status}</div>
          <div>Endpoint: {dbStatusInfo.endpoint}</div>
          <div>Last Check: {formatTime(dbStatusInfo.lastChecked)}</div>
          {dbStatusInfo.responseTime && <div>Response Time: {dbStatusInfo.responseTime}ms</div>}
          {dbStatusInfo.errorMessage && <div className="text-red-400">Error: {dbStatusInfo.errorMessage}</div>}
        </div>
      </div>
    )

    switch (dbStatusInfo.status) {
      case "checking":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="ml-2 cursor-help">
                <Database className="h-3 w-3 mr-1" />
                Checking...
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{tooltipContent}</TooltipContent>
          </Tooltip>
        )
      case "connected":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="default" className="bg-green-600 ml-2 cursor-help">
                <CheckCircle className="h-3 w-3 mr-1" />
                DB Connected
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{tooltipContent}</TooltipContent>
          </Tooltip>
        )
      case "error":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive" className="ml-2 cursor-help">
                <AlertCircle className="h-3 w-3 mr-1" />
                DB Error
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{tooltipContent}</TooltipContent>
          </Tooltip>
        )
    }
  }

  return (
    <SubscriptionProvider>
      <TooltipProvider>
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
                  {getDbStatusBadge()}
                </div>

                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {activeAlerts > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                        {activeAlerts}
                      </Badge>
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
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="entity-monitor">
                  <Users className="h-4 w-4 mr-1" />
                  Entities
                </TabsTrigger>
                <TabsTrigger value="risk-dashboard">
                  <Shield className="h-4 w-4 mr-1" />
                  Risk
                </TabsTrigger>
                <TabsTrigger value="ai-analysis">
                  <Brain className="h-4 w-4 mr-1" />
                  AI Analysis
                </TabsTrigger>
                <TabsTrigger value="enterprise">
                  <Shield className="h-4 w-4 mr-1" />
                  Enterprise
                </TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="clusters">Clusters</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Enhanced Real-time Metrics with Bitcoin Price */}
                <EnhancedRealTimeMetrics />

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

              <TabsContent value="entity-monitor" className="space-y-6">
                <EntityMonitor />
              </TabsContent>

              <TabsContent value="risk-dashboard" className="space-y-6">
                <RiskDashboard />
              </TabsContent>

              <TabsContent value="ai-analysis" className="space-y-6">
                <AIAnalysisDashboard />
              </TabsContent>

              <TabsContent value="enterprise" className="space-y-6">
                <EnterpriseDashboard />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </TooltipProvider>
    </SubscriptionProvider>
  )
}
