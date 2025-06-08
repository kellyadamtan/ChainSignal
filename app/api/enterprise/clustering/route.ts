import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    // Check if user has enterprise access
    const { searchParams } = new URL(request.url)
    const enterpriseId = searchParams.get("enterprise_id")

    if (!enterpriseId) {
      return NextResponse.json({ error: "Enterprise ID required" }, { status: 400 })
    }

    // Fetch clustering results from database
    const clusteringResults = await sql`
      SELECT 
        cluster_id,
        wallet_count,
        total_volume,
        avg_risk_score,
        dominant_entity_type,
        created_at
      FROM enterprise_clustering_results 
      WHERE enterprise_id = ${enterpriseId}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (clusteringResults.length === 0) {
      // Return mock data for demo
      return NextResponse.json({
        clusters: {
          algorithm: "dbscan",
          labels: [0, 1, 2, 0, 1, 3, 2, 0, 1, 2],
          n_clusters: 4,
          n_outliers: 0,
        },
        analysis: {
          cluster_0: {
            size: 25,
            total_volume: 5000,
            avg_transaction_count: 150,
            avg_balance: 200,
            dominant_entity_type: "exchange",
            avg_risk_score: 0.3,
            risk_level: "low",
          },
          cluster_1: {
            size: 18,
            total_volume: 12000,
            avg_transaction_count: 75,
            avg_balance: 667,
            dominant_entity_type: "whale",
            avg_risk_score: 0.7,
            risk_level: "high",
          },
          cluster_2: {
            size: 32,
            total_volume: 3200,
            avg_transaction_count: 45,
            avg_balance: 100,
            dominant_entity_type: "retail",
            avg_risk_score: 0.2,
            risk_level: "low",
          },
          cluster_3: {
            size: 8,
            total_volume: 2400,
            avg_transaction_count: 200,
            avg_balance: 300,
            dominant_entity_type: "mixer",
            avg_risk_score: 0.9,
            risk_level: "critical",
          },
        },
        insights: {
          summary: {
            total_clusters: 4,
            total_wallets: 83,
            total_volume: 22600,
            avg_cluster_size: 20.75,
          },
          risk_distribution: {
            low: 57,
            medium: 0,
            high: 18,
            critical: 8,
          },
          entity_distribution: {
            exchange: 25,
            whale: 18,
            retail: 32,
            mixer: 8,
          },
          recommendations: [
            {
              type: "security",
              priority: "high",
              message: "Monitor 1 critical risk cluster closely",
              clusters: ["cluster_3"],
            },
            {
              type: "analysis",
              priority: "medium",
              message: "Investigate whale cluster for institutional activity",
              clusters: ["cluster_1"],
            },
          ],
        },
        algorithm_used: "dbscan",
        feature_count: 15,
        wallet_count: 83,
        timestamp: new Date().toISOString(),
      })
    }

    // Process real clustering results
    const result = clusteringResults[0]
    return NextResponse.json({
      clusters: JSON.parse(result.clusters || "{}"),
      analysis: JSON.parse(result.analysis || "{}"),
      insights: JSON.parse(result.insights || "{}"),
      algorithm_used: result.algorithm_used,
      feature_count: result.feature_count,
      wallet_count: result.wallet_count,
      timestamp: result.created_at,
    })
  } catch (error) {
    console.error("Enterprise clustering error:", error)
    return NextResponse.json({ error: "Failed to fetch clustering data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { algorithm, features, enterprise_id } = await request.json()

    if (!enterprise_id) {
      return NextResponse.json({ error: "Enterprise ID required" }, { status: 400 })
    }

    // In a real implementation, this would trigger the Python clustering service
    // For now, return mock results
    const mockResults = {
      clusters: {
        algorithm,
        labels: Array.from({ length: 100 }, () => Math.floor(Math.random() * 8)),
        n_clusters: 8,
        n_outliers: 5,
      },
      analysis: {},
      insights: {
        summary: {
          total_clusters: 8,
          total_wallets: 100,
          total_volume: 50000,
          avg_cluster_size: 12.5,
        },
        risk_distribution: {
          low: 60,
          medium: 25,
          high: 12,
          critical: 3,
        },
        entity_distribution: {
          exchange: 20,
          whale: 8,
          retail: 45,
          mixer: 5,
          institutional: 15,
          miner: 7,
        },
        recommendations: [],
      },
      algorithm_used: algorithm,
      feature_count: features.length,
      wallet_count: 100,
    }

    // Store results in database
    await sql`
      INSERT INTO enterprise_clustering_results (
        enterprise_id, algorithm_used, feature_count, wallet_count,
        clusters, analysis, insights, created_at
      ) VALUES (
        ${enterprise_id}, ${algorithm}, ${features.length}, 100,
        ${JSON.stringify(mockResults.clusters)},
        ${JSON.stringify(mockResults.analysis)},
        ${JSON.stringify(mockResults.insights)},
        NOW()
      )
    `

    return NextResponse.json(mockResults)
  } catch (error) {
    console.error("Enterprise clustering analysis error:", error)
    return NextResponse.json({ error: "Failed to run clustering analysis" }, { status: 500 })
  }
}
