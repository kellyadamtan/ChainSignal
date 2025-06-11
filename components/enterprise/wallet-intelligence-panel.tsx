"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, ExternalLink, AlertTriangle, Shield } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type WalletIntelligence = {
  id: string
  wallet_address: string
  entity_type: string
  entity_confidence: number
  risk_score: number
  behavioral_features: any
  flow_analysis: any
  last_analyzed: string
}

export default function WalletIntelligencePanel() {
  const [wallets, setWallets] = useState<WalletIntelligence[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/enterprise/wallet-intelligence")
        const data = await response.json()

        if (data.success) {
          setWallets(data.wallets)
        }
      } catch (error) {
        console.error("Error fetching wallet intelligence data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getEntityTypeBadge = (type: string) => {
    switch (type) {
      case "exchange":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Exchange
          </Badge>
        )
      case "mixer":
        return <Badge variant="destructive">Mixer</Badge>
      case "whale":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            Whale
          </Badge>
        )
      case "institutional":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Institutional
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getRiskBadge = (score: number) => {
    if (score >= 0.8) {
      return <Badge variant="destructive">High Risk</Badge>
    } else if (score >= 0.5) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-500">
          Medium Risk
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Low Risk
        </Badge>
      )
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implementation would go here
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wallet Intelligence</h2>
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search wallet address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Exchange Wallets</CardTitle>
            <CardDescription>Identified exchange entities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mixer Services</CardTitle>
            <CardDescription>Privacy-focused services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Whale Wallets</CardTitle>
            <CardDescription>Large holders ({">"}1000 BTC)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Institutional</CardTitle>
            <CardDescription>Corporate/fund entities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Analysis</CardTitle>
          <CardDescription>Entity classification and risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.length > 0 ? (
                wallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell className="font-mono text-xs">
                      {wallet.wallet_address.substring(0, 8)}...
                      {wallet.wallet_address.substring(wallet.wallet_address.length - 8)}
                    </TableCell>
                    <TableCell>{getEntityTypeBadge(wallet.entity_type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={wallet.entity_confidence * 100} className="h-2" />
                        <span className="text-xs">{Math.round(wallet.entity_confidence * 100)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRiskBadge(wallet.risk_score)}
                        <span className="text-xs">{wallet.risk_score.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Shield className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No wallet intelligence data found. Search for a wallet address to analyze.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
