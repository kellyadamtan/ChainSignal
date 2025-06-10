"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Building, Shield, Key, CheckCircle, TrendingUp, Settings, Plus } from "lucide-react"

export function ExchangeConnector() {
  const [connections, setConnections] = useState([
    { id: 1, name: "Binance", status: "connected", balance: "2.45 BTC", permissions: ["read"] },
    { id: 2, name: "Coinbase", status: "disconnected", balance: "0 BTC", permissions: [] },
  ])

  const [showApiForm, setShowApiForm] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState("")

  const exchanges = [
    { name: "Binance", logo: "🟡", supported: true },
    { name: "Coinbase", logo: "🔵", supported: true },
    { name: "Kraken", logo: "🟣", supported: true },
    { name: "Bitfinex", logo: "🟢", supported: true },
    { name: "KuCoin", logo: "🟢", supported: true },
    { name: "Bybit", logo: "🟡", supported: false },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Exchange & DeFi Connectivity
          </CardTitle>
          <CardDescription>
            Securely connect your exchange accounts and DeFi protocols for unified portfolio management
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="exchanges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="defi">DeFi</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="exchanges" className="space-y-6">
          {/* Connected Exchanges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Connected Exchanges
                <Button onClick={() => setShowApiForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Exchange
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {exchanges.find((e) => e.name === connection.name)?.logo}
                      </div>
                      <div>
                        <h4 className="font-medium">{connection.name}</h4>
                        <p className="text-sm text-muted-foreground">{connection.balance}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={connection.status === "connected" ? "default" : "secondary"}>
                        {connection.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {connection.status === "connected" ? "Manage" : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Exchanges */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Exchanges</CardTitle>
              <CardDescription>Connect to major cryptocurrency exchanges with read-only API access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {exchanges.map((exchange) => (
                  <div
                    key={exchange.name}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      exchange.supported ? "hover:bg-gray-50 border-gray-200" : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => exchange.supported && setSelectedExchange(exchange.name)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{exchange.logo}</span>
                      <div>
                        <h4 className="font-medium">{exchange.name}</h4>
                        <Badge variant={exchange.supported ? "default" : "secondary"} className="text-xs">
                          {exchange.supported ? "Supported" : "Coming Soon"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Connection Form */}
          {showApiForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Connect Exchange API
                </CardTitle>
                <CardDescription>Enter your API credentials to connect your exchange account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your API keys are encrypted and stored securely. We only request read-only permissions.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input id="api-key" placeholder="Enter your API key" />
                  </div>
                  <div>
                    <Label htmlFor="api-secret">API Secret</Label>
                    <Input id="api-secret" type="password" placeholder="Enter your API secret" />
                  </div>
                  <div>
                    <Label htmlFor="passphrase">Passphrase (if required)</Label>
                    <Input id="passphrase" placeholder="Enter passphrase" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Connect Exchange
                  </Button>
                  <Button variant="outline" onClick={() => setShowApiForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="defi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                DeFi Protocol Integration
              </CardTitle>
              <CardDescription>
                Connect to decentralized finance protocols for comprehensive portfolio tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Uniswap", type: "DEX", tvl: "$4.2B", status: "connected" },
                  { name: "Aave", type: "Lending", tvl: "$8.1B", status: "available" },
                  { name: "Compound", type: "Lending", tvl: "$2.8B", status: "available" },
                  { name: "MakerDAO", type: "CDP", tvl: "$6.5B", status: "connected" },
                ].map((protocol) => (
                  <div key={protocol.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{protocol.name}</h4>
                      <Badge variant={protocol.status === "connected" ? "default" : "outline"}>{protocol.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{protocol.type}</p>
                    <p className="text-sm font-medium">TVL: {protocol.tvl}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Connection Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-sync Portfolio</Label>
                    <p className="text-sm text-muted-foreground">Automatically sync balances every 5 minutes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Real-time Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified of large balance changes</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Trading Permissions</Label>
                    <p className="text-sm text-muted-foreground">Allow WalletDNA to execute trades (Enterprise only)</p>
                  </div>
                  <Switch disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All API connections use read-only permissions and are encrypted with AES-256
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Security Features</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      End-to-end encryption
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Read-only API access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Regular key rotation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      SOC2 compliance
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Compliance</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      GDPR compliant
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      CCPA compliant
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Regular audits
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Data minimization
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
