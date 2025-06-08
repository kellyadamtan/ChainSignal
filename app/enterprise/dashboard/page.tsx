"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, TrendingUp, Shield, Eye, Network, Activity } from "lucide-react"

import { EnterprisePaywall } from "@/components/enterprise-paywall"
import ComplianceRulesPanel from "@/components/enterprise/compliance-rules-panel"
import WalletIntelligencePanel from "@/components/enterprise/wallet-intelligence-panel"
import DarkPoolDetectionPanel from "@/components/enterprise/dark-pool-detection-panel"
import ArbitrageOpportunitiesPanel from "@/components/enterprise/arbitrage-opportunities-panel"
import ClusteringAnalysisPanel from "@/components/enterprise/clustering-analysis-panel"

export default function EnterpriseDashboard() {
  const { data: session, status } = useSession()
  const [enterpriseData, setEnterpriseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("compliance")

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      redirect("/auth/signin?callbackUrl=/enterprise/dashboard")
    }

    if (status === "authenticated") {
      // Fetch enterprise data
      fetchEnterpriseData()
    }
  }, [status, session])

  const fetchEnterpriseData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/enterprise/dashboard")
      const data = await response.json()

      if (data.success) {
        setEnterpriseData(data)
      } else {
        console.error("Failed to fetch enterprise data:", data.error)
      }
    } catch (error) {
      console.error("Error fetching enterprise data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Loading enterprise dashboard...</h2>
        </div>
      </div>
    )
  }

  // Show paywall if user is not on enterprise tier
  if (session?.user?.subscriptionTier !== "enterprise") {
    return (
      <EnterprisePaywall
        title="Enterprise Dashboard"
        description="Access advanced blockchain analytics and compliance tools designed for institutional clients"
        feature="enterpriseAnalytics"
      />
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Enterprise Dashboard</h1>
        <p className="text-muted-foreground">
          Advanced blockchain analytics and compliance tools for institutional clients
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Compliance Alerts</CardTitle>
            <CardDescription>Active regulatory monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">12</div>
              <Badge variant="destructive" className="ml-2">
                3 Critical
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Dark Pool Events</CardTitle>
            <CardDescription>OTC transaction monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">7</div>
              <Badge className="ml-2">4 New</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Arbitrage Opportunities</CardTitle>
            <CardDescription>Cross-exchange spreads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">5</div>
              <Badge variant="outline" className="ml-2">
                $12,450 Potential
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="mb-8 border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-500">High-Risk Activity Detected</AlertTitle>
        <AlertDescription>
          Unusual transaction patterns detected in cluster #23. Multiple high-value transfers to known mixer services.
          <Button variant="outline" size="sm" className="ml-4">
            Investigate
          </Button>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden md:inline">Wallet Intelligence</span>
          </TabsTrigger>
          <TabsTrigger value="darkpool" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Dark Pool</span>
          </TabsTrigger>
          <TabsTrigger value="arbitrage" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden md:inline">Arbitrage</span>
          </TabsTrigger>
          <TabsTrigger value="clustering" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden md:inline">Clustering</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          <ComplianceRulesPanel />
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          <WalletIntelligencePanel />
        </TabsContent>

        <TabsContent value="darkpool" className="space-y-4">
          <DarkPoolDetectionPanel />
        </TabsContent>

        <TabsContent value="arbitrage" className="space-y-4">
          <ArbitrageOpportunitiesPanel />
        </TabsContent>

        <TabsContent value="clustering" className="space-y-4">
          <ClusteringAnalysisPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
