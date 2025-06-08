"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Shield, TrendingDown, TrendingUp, Activity, Target } from "lucide-react"
import { useFeatureAccess } from "@/hooks/use-subscription"
import { Paywall } from "./paywall"

interface RiskMetrics {
  overallRiskScore: number
  highRiskTransactions: number
  suspiciousPatterns: number
  complianceScore: number
  riskTrend: "up" | "down" | "stable"
}

interface RiskAlert {
  id: string
  type: "high_risk_entity" | "suspicious_pattern" | "compliance_violation" | "anomaly"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  timestamp: string
  address?: string
  amount?: number
}

export function RiskDashboard() {
  const hasRiskAccess = useFeatureAccess("riskMonitoring")

  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    overallRiskScore: 0.35,
    highRiskTransactions: 12,
    suspiciousPatterns: 3,
    complianceScore: 0.92,
    riskTrend: "stable",
  })

  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])

  useEffect(() => {
    if (!hasRiskAccess) return
    // Load initial risk data
    loadRiskData()

    // Simulate real-time risk updates
    const interval = setInterval(() => {
      updateRiskMetrics()
      generateRiskAlert()
    }, 10000)

    return () => clearInterval(interval)
  }, [hasRiskAccess])

  if (!hasRiskAccess) {
    return (
      <Paywall
        feature="riskMonitoring"
        title="Risk Monitoring"
        description="Advanced risk assessment and compliance monitoring for Bitcoin transactions. Get real-time alerts for suspicious activities and regulatory violations."
        minTier="pro"
      />
    )
  }

  const loadRiskData = () => {
    const mockAlerts: RiskAlert[] = [
      {
        id: "1",
        type: "high_risk_entity",
        severity: "high",
        title: "High-Risk Mixer Detected",
        description: "Large transaction from known mixing service",
        timestamp: new Date().toISOString(),
        address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        amount: 15.5,
      },
      {
        id: "2",
        type: "suspicious_pattern",
        severity: "medium",
        title: "Unusual Transaction Pattern",
        description: "Rapid succession of round-number transactions",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        amount: 10.0,
      },
      {
        id: "3",
        type: "compliance_violation",
        severity: "critical",
        title: "OFAC Sanctioned Address",
        description: "Transaction involving sanctioned entity",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
        amount: 25.8,
      },
    ]

    setRiskAlerts(mockAlerts)
  }

  const updateRiskMetrics = () => {
    setRiskMetrics((prev) => ({
      ...prev,
      overallRiskScore: Math.max(0, Math.min(1, prev.overallRiskScore + (Math.random() - 0.5) * 0.1)),
      highRiskTransactions: prev.highRiskTransactions + Math.floor(Math.random() * 3),
      suspiciousPatterns: prev.suspiciousPatterns + (Math.random() < 0.3 ? 1 : 0),
      complianceScore: Math.max(0.8, Math.min(1, prev.complianceScore + (Math.random() - 0.5) * 0.05)),
    }))
  }

  const generateRiskAlert = () => {
    if (Math.random() < 0.3) {
      // 30% chance of new alert
      const alertTypes = ["high_risk_entity", "suspicious_pattern", "compliance_violation", "anomaly"] as const
      const severities = ["low", "medium", "high", "critical"] as const

      const newAlert: RiskAlert = {
        id: Date.now().toString(),
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        title: generateAlertTitle(),
        description: generateAlertDescription(),
        timestamp: new Date().toISOString(),
        address: generateRandomAddress(),
        amount: Math.random() * 50,
      }

      setRiskAlerts((prev) => [newAlert, ...prev.slice(0, 19)]) // Keep last 20 alerts
    }
  }

  const generateAlertTitle = () => {
    const titles = [
      "Suspicious Transaction Pattern",
      "High-Risk Entity Interaction",
      "Compliance Flag Triggered",
      "Anomalous Behavior Detected",
      "Large Value Transfer Alert",
      "Mixer Service Activity",
      "Rapid Transaction Sequence",
    ]
    return titles[Math.floor(Math.random() * titles.length)]
  }

  const generateAlertDescription = () => {
    const descriptions = [
      "Unusual transaction timing patterns detected",
      "Interaction with high-risk entity identified",
      "Transaction exceeds compliance thresholds",
      "Behavioral anomaly in transaction flow",
      "Large value transfer to unknown entity",
      "Potential money laundering activity",
      "Suspicious consolidation pattern",
    ]
    return descriptions[Math.floor(Math.random() * descriptions.length)]
  }

  const generateRandomAddress = () => {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    let result = ""
    for (let i = 0; i < 34; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Activity className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getRiskLevel = (score: number) => {
    if (score > 0.8) return { level: "Critical", color: "text-red-500" }
    if (score > 0.6) return { level: "High", color: "text-orange-500" }
    if (score > 0.4) return { level: "Medium", color: "text-yellow-500" }
    return { level: "Low", color: "text-green-500" }
  }

  const riskLevel = getRiskLevel(riskMetrics.overallRiskScore)

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Risk</p>
                <p className={`text-2xl font-bold ${riskLevel.color}`}>{riskLevel.level}</p>
                <p className="text-xs text-muted-foreground">{(riskMetrics.overallRiskScore * 100).toFixed(1)}%</p>
              </div>
              <div className="relative">
                <Progress value={riskMetrics.overallRiskScore * 100} className="w-16 h-16 rotate-90" />
                {riskMetrics.riskTrend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-red-500 absolute top-6 left-6" />
                ) : riskMetrics.riskTrend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-green-500 absolute top-6 left-6" />
                ) : (
                  <Activity className="h-4 w-4 text-blue-500 absolute top-6 left-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Risk TXs</p>
                <p className="text-2xl font-bold">{riskMetrics.highRiskTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Suspicious Patterns</p>
                <p className="text-2xl font-bold">{riskMetrics.suspiciousPatterns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold">{(riskMetrics.complianceScore * 100).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Risk Alerts</CardTitle>
              <CardDescription>Live monitoring of high-risk activities and compliance violations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {riskAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      {alert.address && (
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="font-mono bg-muted px-2 py-1 rounded">{alert.address.slice(0, 20)}...</span>
                          {alert.amount && <span className="font-semibold">{alert.amount.toFixed(2)} BTC</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Suspicious Pattern Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Round Number Transactions</span>
                    <Badge variant="secondary">8 detected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rapid Succession Patterns</span>
                    <Badge variant="secondary">3 detected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Unusual Timing Patterns</span>
                    <Badge variant="secondary">5 detected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Consolidation Anomalies</span>
                    <Badge variant="destructive">2 detected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entity Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: "Mixers", risk: 0.9, count: 5 },
                    { type: "Gambling", risk: 0.7, count: 12 },
                    { type: "Unknown", risk: 0.5, count: 23 },
                    { type: "Exchanges", risk: 0.2, count: 45 },
                    { type: "Miners", risk: 0.1, count: 67 },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm">{item.type}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={item.risk * 100} className="w-20" />
                        <span className="text-xs w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
              <CardDescription>AML/KYC compliance status and regulatory requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Compliance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>OFAC Screening</span>
                      <Badge variant="default">✓ Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AML Monitoring</span>
                      <Badge variant="default">✓ Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sanctions Check</span>
                      <Badge variant="default">✓ Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>PEP Screening</span>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Violations</h4>
                  <div className="space-y-2">
                    <div className="p-2 border border-red-200 rounded bg-red-50 dark:bg-red-950">
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">OFAC Sanctioned Address</p>
                      <p className="text-xs text-red-600 dark:text-red-400">2 hours ago</p>
                    </div>
                    <div className="p-2 border border-orange-200 rounded bg-orange-50 dark:bg-orange-950">
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">High-Risk Jurisdiction</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">5 hours ago</p>
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
