"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, CheckCircle, XCircle, Edit, Trash } from "lucide-react"

type ComplianceRule = {
  id: string
  rule_name: string
  conditions: any
  action: string
  severity: string
  is_active: boolean
  created_at: string
}

type ComplianceAlert = {
  id: string
  rule_id: string
  wallet_address: string
  amount: number
  risk_score: number
  severity: string
  status: string
  created_at: string
}

export default function ComplianceRulesPanel() {
  const [rules, setRules] = useState<ComplianceRule[]>([])
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [newRuleOpen, setNewRuleOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [rulesRes, alertsRes] = await Promise.all([
          fetch("/api/enterprise/compliance/rules"),
          fetch("/api/enterprise/compliance/alerts"),
        ])

        const rulesData = await rulesRes.json()
        const alertsData = await alertsRes.json()

        if (rulesData.success) {
          setRules(rulesData.rules)
        }

        if (alertsData.success) {
          setAlerts(alertsData.alerts)
        }
      } catch (error) {
        console.error("Error fetching compliance data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "high":
        return (
          <Badge variant="destructive" className="bg-orange-500">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Medium
          </Badge>
        )
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Pending
          </Badge>
        )
      case "reviewed":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Reviewed
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Resolved
          </Badge>
        )
      case "false_positive":
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-500">
            False Positive
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implementation would go here
    setNewRuleOpen(false)
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
        <h2 className="text-2xl font-bold">Compliance Engine</h2>
        <Dialog open={newRuleOpen} onOpenChange={setNewRuleOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Compliance Rule</DialogTitle>
              <DialogDescription>Define a new compliance rule to automatically monitor transactions.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRule}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input id="rule-name" placeholder="Large Transaction Alert" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="condition-field">Condition Field</Label>
                  <Select defaultValue="amount">
                    <SelectTrigger id="condition-field">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">Transaction Amount</SelectItem>
                      <SelectItem value="entity_type">Entity Type</SelectItem>
                      <SelectItem value="tx_frequency">Transaction Frequency</SelectItem>
                      <SelectItem value="sanctioned">Sanctioned Address</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="condition-operator">Operator</Label>
                    <Select defaultValue=">">
                      <SelectTrigger id="condition-operator">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">&gt; Greater than</SelectItem>
                        <SelectItem value="<">&lt; Less than</SelectItem>
                        <SelectItem value="=">= Equal to</SelectItem>
                        <SelectItem value="!=">!= Not equal to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="condition-value">Value</Label>
                    <Input id="condition-value" placeholder="10000" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="action">Action</Label>
                    <Select defaultValue="alert">
                      <SelectTrigger id="action">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alert">Alert</SelectItem>
                        <SelectItem value="block">Block</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="severity">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Rule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Rules</CardTitle>
            <CardDescription>Custom rules for transaction monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length > 0 ? (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.rule_name}</TableCell>
                      <TableCell>{getSeverityBadge(rule.severity)}</TableCell>
                      <TableCell className="capitalize">{rule.action}</TableCell>
                      <TableCell>
                        {rule.is_active ? (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-gray-500 text-gray-500">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No compliance rules found. Create your first rule to start monitoring.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Compliance violations requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-mono text-xs">
                        {alert.wallet_address.substring(0, 8)}...
                        {alert.wallet_address.substring(alert.wallet_address.length - 8)}
                      </TableCell>
                      <TableCell>{alert.amount.toLocaleString()} BTC</TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="text-green-500">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No compliance alerts found. Your monitoring system is working properly.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
