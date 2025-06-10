"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Network, Search, Activity, Users, ArrowUpRight, ArrowDownLeft } from "lucide-react"

interface OnChainExplorerProps {
  walletAddress: string
}

export function OnChainExplorer({ walletAddress }: OnChainExplorerProps) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock transaction data
  const mockTransactions = [
    {
      txid: "a1b2c3d4e5f6...",
      type: "received",
      amount: 0.05,
      confirmations: 6,
      timestamp: "2024-06-10T10:30:00Z",
      from: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      to: walletAddress,
      fee: 0.00001,
    },
    {
      txid: "f6e5d4c3b2a1...",
      type: "sent",
      amount: 0.02,
      confirmations: 12,
      timestamp: "2024-06-09T15:45:00Z",
      from: walletAddress,
      to: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      fee: 0.00002,
    },
  ]

  const addressClusters = [
    { address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", entity: "Binance", confidence: 95 },
    { address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", entity: "Genesis Block", confidence: 100 },
    { address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", entity: "Unknown", confidence: 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-green-600" />
            On-Chain Explorer & Analytics
          </CardTitle>
          <CardDescription>Comprehensive blockchain analysis and ecosystem exploration tools</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="clusters">Address Clusters</TabsTrigger>
          <TabsTrigger value="network">Network Graph</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>Recent transactions for the analyzed wallet address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          tx.type === "received" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {tx.type === "received" ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.type === "received" ? "Received" : "Sent"} {tx.amount} BTC
                        </p>
                        <p className="text-sm text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground font-mono">{tx.txid}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={tx.confirmations >= 6 ? "default" : "secondary"}>
                        {tx.confirmations} confirmations
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">Fee: {tx.fee} BTC</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Transaction Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input placeholder="Enter transaction ID or block height" className="flex-1" />
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Address Clustering
              </CardTitle>
              <CardDescription>Identified entities and address clusters connected to this wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {addressClusters.map((cluster, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-mono text-sm">{cluster.address}</p>
                      <p className="font-medium">{cluster.entity}</p>
                    </div>
                    <Badge
                      variant={cluster.confidence > 80 ? "default" : cluster.confidence > 50 ? "secondary" : "outline"}
                    >
                      {cluster.confidence}% confidence
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Visualization
              </CardTitle>
              <CardDescription>Interactive graph showing wallet connections and transaction flows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Network graph visualization</p>
                  <p className="text-sm text-gray-500">Interactive 3D graph coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Network Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-sm text-muted-foreground">Total transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Volume Moved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.7 BTC</div>
                <p className="text-sm text-muted-foreground">Lifetime volume</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">First Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2019</div>
                <p className="text-sm text-muted-foreground">5 years ago</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Privacy Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">Medium</div>
                <p className="text-sm text-muted-foreground">65/100 privacy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Exchange Exposure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">35%</div>
                <p className="text-sm text-muted-foreground">Of total volume</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">DeFi Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Low</div>
                <p className="text-sm text-muted-foreground">Minimal DeFi usage</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
