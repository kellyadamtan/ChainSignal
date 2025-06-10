"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wallet,
  Shield,
  BarChart3,
  Network,
  AlertTriangle,
  CheckCircle,
  Eye,
  Lock,
  Zap,
  Building,
  Activity,
} from "lucide-react"
import { WalletAnalytics } from "@/components/walletdna/wallet-analytics"
import { WalletClassifier } from "@/components/walletdna/wallet-classifier"
import { TransactionBuilder } from "@/components/walletdna/transaction-builder"
import { ExchangeConnector } from "@/components/walletdna/exchange-connector"
import { OnChainExplorer } from "@/components/walletdna/onchain-explorer"

export default function WalletDNAPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [walletAddress, setWalletAddress] = useState("")
  const [walletData, setWalletData] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyzeWallet = async () => {
    if (!walletAddress) return

    setLoading(true)
    try {
      const response = await fetch(`/api/walletdna/analyze?address=${walletAddress}`)
      const data = await response.json()
      setWalletData(data)
    } catch (error) {
      console.error("Error analyzing wallet:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Wallet className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">WalletDNA™</h1>
          <Badge variant="secondary" className="ml-2">
            Pro/Enterprise
          </Badge>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Proprietary wallet analytics system with secure self-custody Bitcoin wallet, integrated on-chain analytics,
          and comprehensive ecosystem exploration
        </p>
      </div>

      {/* Wallet Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Analyze Wallet Address
          </CardTitle>
          <CardDescription>Enter a Bitcoin address to perform comprehensive WalletDNA™ analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter Bitcoin address (bc1... or 1... or 3...)"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="flex-1"
            />
            <Button onClick={analyzeWallet} disabled={loading || !walletAddress}>
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="classifier">Classifier</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="explorer">Explorer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entity Type</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{walletData?.entityType || "Unknown"}</div>
                <p className="text-xs text-muted-foreground">Confidence: {walletData?.confidence || 0}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{walletData?.riskScore || 0}/100</div>
                <Progress value={walletData?.riskScore || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{walletData?.activityLevel || "Low"}</div>
                <p className="text-xs text-muted-foreground">{walletData?.txCount || 0} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Health</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Secure Self-Custody
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Hardware wallet support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Multi-signature vaults
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Air-gapped signing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Advanced Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Entity clustering
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Behavioral analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Risk assessment
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Ecosystem Gateway
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Exchange connectivity
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    DeFi integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Lightning Network
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <WalletAnalytics walletData={walletData} />
        </TabsContent>

        <TabsContent value="classifier">
          <WalletClassifier walletAddress={walletAddress} />
        </TabsContent>

        <TabsContent value="wallet">
          <TransactionBuilder />
        </TabsContent>

        <TabsContent value="exchanges">
          <ExchangeConnector />
        </TabsContent>

        <TabsContent value="explorer">
          <OnChainExplorer walletAddress={walletAddress} />
        </TabsContent>
      </Tabs>

      {/* Enterprise Features Alert */}
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <strong>Enterprise Features:</strong> Advanced compliance tools, institutional vaults, and white-label
          solutions are available for Enterprise customers.
          <Button variant="link" className="p-0 h-auto ml-2">
            Contact Sales
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
