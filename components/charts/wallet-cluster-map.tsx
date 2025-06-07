"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface WalletNode {
  id: string
  x: number
  y: number
  size: number
  cluster: "whale" | "active" | "dormant" | "exchange" | "regular" | "miner" | "mixer"
  balance: number
  txCount: number
  avgTxValue: number
  txFrequency: number
  mixingScore?: number
  exchangeScore?: number
}

export function WalletClusterMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<WalletNode[]>([])
  const [zoom, setZoom] = useState(1)
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null)

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await fetch("/api/wallets?limit=100")
        const result = await response.json()

        if (result.wallets) {
          setNodes(result.wallets)
        }
      } catch (error) {
        console.error("Failed to fetch wallet data:", error)
        // Keep sample data as fallback
        const sampleNodes: WalletNode[] = []
        const clusters = ["whale", "active", "dormant", "exchange", "regular"] as const

        for (let i = 0; i < 100; i++) {
          sampleNodes.push({
            id: `wallet_${i}`,
            x: Math.random() * 800,
            y: Math.random() * 400,
            size: Math.random() * 20 + 5,
            cluster: clusters[Math.floor(Math.random() * clusters.length)],
            balance: Math.random() * 1000,
            txCount: Math.floor(Math.random() * 100),
            avgTxValue: Math.random() * 100,
            txFrequency: Math.random(),
          })
        }
        setNodes(sampleNodes)
      }
    }

    fetchWalletData()
    const interval = setInterval(fetchWalletData, 120000) // Update every 2 minutes

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set transform for zoom
    ctx.save()
    ctx.scale(zoom, zoom)

    // Draw nodes
    nodes.forEach((node) => {
      if (selectedCluster && node.cluster !== selectedCluster) return

      // Set color based on cluster
      const colors = {
        whale: "#ef4444", // Red
        active: "#22c55e", // Green
        dormant: "#6b7280", // Gray
        exchange: "#3b82f6", // Blue
        regular: "#f59e0b", // Yellow
        miner: "#8b5cf6", // Purple
        mixer: "#ec4899", // Pink
      }

      ctx.fillStyle = colors[node.cluster]
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI)
      ctx.fill()

      // Add glow effect for whales
      if (node.cluster === "whale") {
        ctx.shadowColor = colors[node.cluster]
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })

    ctx.restore()
  }, [nodes, zoom, selectedCluster])

  const clusterStats = {
    whale: nodes.filter((n) => n.cluster === "whale").length,
    active: nodes.filter((n) => n.cluster === "active").length,
    dormant: nodes.filter((n) => n.cluster === "dormant").length,
    exchange: nodes.filter((n) => n.cluster === "exchange").length,
    regular: nodes.filter((n) => n.cluster === "regular").length,
    miner: nodes.filter((n) => n.cluster === "miner").length,
    mixer: nodes.filter((n) => n.cluster === "mixer").length,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Cluster Visualization</CardTitle>
        <CardDescription>Interactive map showing wallet clusters based on AI analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(zoom * 1.2, 3))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(zoom / 1.2, 0.5))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoom(1)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Button
                variant={selectedCluster === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCluster(null)}
              >
                All
              </Button>
              {Object.entries(clusterStats).map(([cluster, count]) => (
                <Button
                  key={cluster}
                  variant={selectedCluster === cluster ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCluster(cluster)}
                >
                  {cluster} ({count})
                </Button>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="border rounded-lg overflow-hidden">
            <canvas ref={canvasRef} width={800} height={400} className="w-full h-[400px] cursor-crosshair" />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Whale Wallets</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Active Traders</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Dormant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Exchanges</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Regular Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Mining Pools</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span>Mixers/Privacy</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
