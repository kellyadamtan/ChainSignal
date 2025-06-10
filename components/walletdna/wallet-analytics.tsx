"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, Activity, AlertTriangle } from "lucide-react"

interface WalletAnalyticsProps {
  walletData: any
}

export function WalletAnalytics({ walletData }: WalletAnalyticsProps) {
  // Mock data for demonstration
  const activityData = [
    { date: "2024-01", transactions: 45, volume: 2.3 },
    { date: "2024-02", transactions: 52, volume: 3.1 },
    { date: "2024-03", transactions: 38, volume: 1.8 },
    { date: "2024-04", transactions: 67, volume: 4.2 },
    { date: "2024-05", transactions: 71, volume: 5.1 },
    { date: "2024-06", transactions: 59, volume: 3.7 },
  ]

  const entityDistribution = [
    { name: "Exchange", value: 35, color: "#8884d8" },
    { name: "Personal", value: 45, color: "#82ca9d" },
    { name: "Institutional", value: 15, color: "#ffc658" },
    { name: "Unknown", value: 5, color: "#ff7300" },
  ]

  const riskFactors = [
    { factor: "Transaction Frequency", score: 25, description: "Low frequency indicates lower risk" },
    { factor: "Counterparty Diversity", score: 60, description: "High diversity increases risk" },
    { factor: "Exchange Exposure", score: 40, description: "Moderate exchange interaction" },
    { factor: "Mixing Services", score: 85, description: "High usage of privacy tools" },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.7 BTC</div>
            <p className="text-xs text-muted-foreground">$1.2M USD equivalent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Counterparties</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">High diversity score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Medium</div>
            <Progress value={65} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Activity</CardTitle>
            <CardDescription>Monthly transaction count and volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="transactions" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="volume" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entity Distribution</CardTitle>
            <CardDescription>Counterparty entity classification</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={entityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {entityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Factor Analysis</CardTitle>
          <CardDescription>Detailed breakdown of risk components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskFactors.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{factor.factor}</span>
                  <Badge variant={factor.score > 70 ? "destructive" : factor.score > 40 ? "secondary" : "default"}>
                    {factor.score}/100
                  </Badge>
                </div>
                <Progress value={factor.score} className="h-2" />
                <p className="text-sm text-muted-foreground">{factor.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Behavioral Patterns</CardTitle>
          <CardDescription>AI-detected wallet behavior patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Transaction Timing</h4>
              <p className="text-sm text-muted-foreground">Most active during business hours (9 AM - 5 PM UTC)</p>
              <Badge variant="outline">Business Pattern</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Amount Distribution</h4>
              <p className="text-sm text-muted-foreground">
                Frequent small transactions with occasional large transfers
              </p>
              <Badge variant="outline">Mixed Usage</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Privacy Behavior</h4>
              <p className="text-sm text-muted-foreground">Moderate use of privacy-enhancing techniques</p>
              <Badge variant="secondary">Privacy Conscious</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Network Participation</h4>
              <p className="text-sm text-muted-foreground">Active in Lightning Network and DeFi protocols</p>
              <Badge variant="default">Multi-Protocol</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
