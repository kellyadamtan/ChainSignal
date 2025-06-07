"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Bell } from "lucide-react"

interface AlertCondition {
  metric: string
  operator: string
  value: string
}

interface Alert {
  id: string
  name: string
  conditions: AlertCondition[]
  channels: string[]
  isActive: boolean
}

export function AlertBuilder() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      name: "Large Transaction Alert",
      conditions: [{ metric: "value", operator: ">", value: "1000" }],
      channels: ["email"],
      isActive: true,
    },
    {
      id: "2",
      name: "Whale Movement",
      conditions: [{ metric: "value", operator: ">", value: "10000" }],
      channels: ["email", "webhook"],
      isActive: true,
    },
  ])

  const [newAlert, setNewAlert] = useState<Omit<Alert, "id">>({
    name: "",
    conditions: [{ metric: "value", operator: ">", value: "" }],
    channels: ["email"],
    isActive: true,
  })

  const addCondition = () => {
    setNewAlert((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { metric: "value", operator: ">", value: "" }],
    }))
  }

  const removeCondition = (index: number) => {
    setNewAlert((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }))
  }

  const updateCondition = (index: number, field: keyof AlertCondition, value: string) => {
    setNewAlert((prev) => ({
      ...prev,
      conditions: prev.conditions.map((cond, i) => (i === index ? { ...cond, [field]: value } : cond)),
    }))
  }

  // Add useEffect to load existing alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/alerts")
        const result = await response.json()

        if (result.alerts) {
          setAlerts(result.alerts)
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error)
      }
    }

    fetchAlerts()
  }, [])

  // Update the saveAlert function
  const saveAlert = async () => {
    if (newAlert.name && newAlert.conditions.every((c) => c.value)) {
      try {
        const response = await fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAlert),
        })

        if (response.ok) {
          const result = await response.json()
          setAlerts((prev) => [...prev, { ...newAlert, id: result.id.toString() }])
          setNewAlert({
            name: "",
            conditions: [{ metric: "value", operator: ">", value: "" }],
            channels: ["email"],
            isActive: true,
          })
        }
      } catch (error) {
        console.error("Failed to save alert:", error)
      }
    }
  }

  // Update the toggleAlert function
  const toggleAlert = async (id: string) => {
    try {
      const alert = alerts.find((a) => a.id === id)
      if (!alert) return

      const response = await fetch("/api/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !alert.isActive }),
      })

      if (response.ok) {
        setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, isActive: !alert.isActive } : alert)))
      }
    } catch (error) {
      console.error("Failed to toggle alert:", error)
    }
  }

  // Update the deleteAlert function
  const deleteAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/alerts?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete alert:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Active Alerts</span>
          </CardTitle>
          <CardDescription>Manage your real-time Bitcoin network alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{alert.name}</h4>
                    <Badge variant={alert.isActive ? "default" : "secondary"}>
                      {alert.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {alert.conditions.map((cond, i) => (
                      <span key={i}>
                        {cond.metric} {cond.operator} {cond.value}
                        {i < alert.conditions.length - 1 && " AND "}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    {alert.channels.map((channel) => (
                      <Badge key={channel} variant="outline" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => toggleAlert(alert.id)}>
                    {alert.isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteAlert(alert.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create New Alert */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Alert</CardTitle>
          <CardDescription>Set up custom alerts for Bitcoin network events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alert-name">Alert Name</Label>
            <Input
              id="alert-name"
              value={newAlert.name}
              onChange={(e) => setNewAlert((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter alert name"
            />
          </div>

          <div className="space-y-4">
            <Label>Conditions</Label>
            {newAlert.conditions.map((condition, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Select value={condition.metric} onValueChange={(value) => updateCondition(index, "metric", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">Transaction Value</SelectItem>
                    <SelectItem value="address">Wallet Address</SelectItem>
                    <SelectItem value="volume">Transaction Volume</SelectItem>
                    <SelectItem value="price">BTC Price</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={condition.operator} onValueChange={(value) => updateCondition(index, "operator", value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=">">{">"}</SelectItem>
                    <SelectItem value="<">{"<"}</SelectItem>
                    <SelectItem value="=">{"="}</SelectItem>
                    <SelectItem value="contains">contains</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={condition.value}
                  onChange={(e) => updateCondition(index, "value", e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                />

                {newAlert.conditions.length > 1 && (
                  <Button variant="outline" size="sm" onClick={() => removeCondition(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button variant="outline" onClick={addCondition} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={saveAlert} className="flex-1">
              Create Alert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
