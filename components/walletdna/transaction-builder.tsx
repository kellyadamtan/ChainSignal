"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Shield, Zap, Calculator, Eye, Lock, Plus, Minus, CheckCircle, AlertTriangle } from "lucide-react"

export function TransactionBuilder() {
  const [recipients, setRecipients] = useState([{ address: "", amount: "" }])
  const [feeRate, setFeeRate] = useState("1")
  const [psbt, setPsbt] = useState("")
  const [signed, setSigned] = useState(false)

  const addRecipient = () => {
    setRecipients([...recipients, { address: "", amount: "" }])
  }

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const updateRecipient = (index: number, field: string, value: string) => {
    const updated = recipients.map((recipient, i) => (i === index ? { ...recipient, [field]: value } : recipient))
    setRecipients(updated)
  }

  const buildTransaction = async () => {
    try {
      const response = await fetch("/api/walletdna/build-tx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, feeRate }),
      })
      const data = await response.json()
      setPsbt(data.psbt)
    } catch (error) {
      console.error("Error building transaction:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Secure Transaction Builder
          </CardTitle>
          <CardDescription>Build and sign Bitcoin transactions with advanced security features</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="build" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="build">Build</TabsTrigger>
          <TabsTrigger value="sign">Sign</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="build" className="space-y-6">
          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recipients
                <Button onClick={addRecipient} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`address-${index}`}>Bitcoin Address</Label>
                    <Input
                      id={`address-${index}`}
                      placeholder="bc1q... or 1... or 3..."
                      value={recipient.address}
                      onChange={(e) => updateRecipient(index, "address", e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor={`amount-${index}`}>Amount (BTC)</Label>
                    <Input
                      id={`amount-${index}`}
                      placeholder="0.001"
                      value={recipient.amount}
                      onChange={(e) => updateRecipient(index, "amount", e.target.value)}
                    />
                  </div>
                  {recipients.length > 1 && (
                    <Button onClick={() => removeRecipient(index)} size="sm" variant="outline">
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fee Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Fee Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button variant={feeRate === "1" ? "default" : "outline"} onClick={() => setFeeRate("1")}>
                  Slow (1 sat/vB)
                </Button>
                <Button variant={feeRate === "5" ? "default" : "outline"} onClick={() => setFeeRate("5")}>
                  Normal (5 sat/vB)
                </Button>
                <Button variant={feeRate === "10" ? "default" : "outline"} onClick={() => setFeeRate("10")}>
                  Fast (10 sat/vB)
                </Button>
              </div>
              <div>
                <Label htmlFor="custom-fee">Custom Fee Rate (sat/vB)</Label>
                <Input id="custom-fee" value={feeRate} onChange={(e) => setFeeRate(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Build Transaction */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Amount</Label>
                  <p className="text-2xl font-bold">
                    {recipients.reduce((sum, r) => sum + (Number.parseFloat(r.amount) || 0), 0).toFixed(8)} BTC
                  </p>
                </div>
                <div>
                  <Label>Estimated Fee</Label>
                  <p className="text-2xl font-bold">
                    {((Number.parseFloat(feeRate) * 250) / 100000000).toFixed(8)} BTC
                  </p>
                </div>
              </div>
              <Button onClick={buildTransaction} className="w-full">
                Build Transaction
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sign" className="space-y-6">
          {/* PSBT Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Partially Signed Bitcoin Transaction (PSBT)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {psbt ? (
                <>
                  <Textarea value={psbt} readOnly className="font-mono text-xs" rows={8} />
                  <div className="flex gap-4">
                    <Button className="flex-1">
                      <Shield className="h-4 w-4 mr-2" />
                      Sign with Hardware Wallet
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Lock className="h-4 w-4 mr-2" />
                      Sign with Software Key
                    </Button>
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertDescription>Build a transaction first to generate a PSBT for signing</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Signing Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Hardware Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sign with Ledger, Trezor, or other hardware wallets for maximum security
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Ledger</Badge>
                    <Badge variant="outline">Trezor</Badge>
                    <Badge variant="outline">BitBox</Badge>
                  </div>
                  <Button className="w-full" disabled={!psbt}>
                    Connect Hardware Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  Multi-Signature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Require multiple signatures for enhanced security</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">2-of-3</Badge>
                    <span className="text-sm">Multi-sig vault</span>
                  </div>
                  <Button className="w-full" disabled={!psbt}>
                    Sign with Multi-sig
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Broadcast Transaction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {signed ? (
                <>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Transaction successfully signed and ready for broadcast</AlertDescription>
                  </Alert>
                  <Button className="w-full">Broadcast to Network</Button>
                </>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Complete transaction signing before broadcasting</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent transactions built and broadcast through WalletDNA™</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Transaction #{i}</p>
                      <p className="text-sm text-muted-foreground">0.001 BTC to bc1q...xyz</p>
                    </div>
                    <Badge variant="default">Confirmed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
