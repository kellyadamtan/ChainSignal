"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Network, BarChart3, Download, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ClusteringResult = {
  id: string
  algorithm_used: string
  feature_count: number
  wallet_count: number
  clusters: any
  analysis: any
  insights: any
  created_at: string
}

export default function ClusteringAnalysisPanel() {
  const [results, setResults] = useState<ClusteringResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("DBSCAN")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/enterprise/clustering")
        const data = await response.json()

        if (data.success) {
          setResults(data.results)
        }
      } catch (error) {
        console.error("Error fetching clustering data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getAlgorithmBadge = (algorithm: string) => {
    switch (algorithm) {
      case "DBSCAN":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            DBSCAN
          </Badge>
        )
      case "K-means":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            K-means
          </Badge>
        )
      case "Hierarchical":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            Hierarchical
          </Badge>
        )
      default:
        return <Badge variant="outline">{algorithm}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleRunClustering = async () => {
    // Implementation would go here
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Get the most recent result
  const latestResult = results.length > 0 ? results[0] : null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wallet Clustering</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DBSCAN">DBSCAN</SelectItem>
              <SelectItem value="K-means">K-means</SelectItem>
              <SelectItem value="Hierarchical">Hierarchical</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRunClustering}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Clustering
          </Button>
        </div>
      </div>

      {latestResult && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Wallets</CardTitle>
                <CardDescription>Analyzed addresses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{latestResult.wallet_count.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Clusters</CardTitle>
                <CardDescription>Identified groups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Object.keys(latestResult.clusters).length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Features</CardTitle>
                <CardDescription>Behavioral indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{latestResult.feature_count}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quality Score</CardTitle>
                <CardDescription>Silhouette coefficient</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">{latestResult.analysis.silhouette_score}</div>
                  <Progress value={latestResult.analysis.silhouette_score * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cluster Analysis</CardTitle>
                <CardDescription>Wallet grouping by behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cluster</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(latestResult.clusters).map(([clusterId, clusterData]: [string, any]) => (
                      <TableRow key={clusterId}>
                        <TableCell className="font-medium">{clusterId}</TableCell>
                        <TableCell>{clusterData.type}</TableCell>
                        <TableCell>{clusterData.size} wallets</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={clusterData.confidence * 100} className="h-2" />
                            <span className="text-xs">{Math.round(clusterData.confidence * 100)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Network className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Analysis findings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Key Findings</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {latestResult.insights.key_findings.map((finding: string, i: number) => (
                        <li key={i} className="text-sm">
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Risk Assessment</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-red-50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">High Risk</div>
                        <div className="font-semibold">{latestResult.insights.risk_assessment.high_risk_wallets}</div>
                      </div>
                      <div className="bg-amber-50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">Medium Risk</div>
                        <div className="font-semibold">{latestResult.insights.risk_assessment.medium_risk_wallets}</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">Low Risk</div>
                        <div className="font-semibold">{latestResult.insights.risk_assessment.low_risk_wallets}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Recommendations</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {latestResult.insights.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-sm">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Full Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
