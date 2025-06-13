"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, FileText, Calendar } from "lucide-react"
import { useSession } from "next-auth/react"

interface LegalUpdate {
  date: string
  version: string
  summary: string
  content: string
  url: string
}

export function LegalUpdateAlert() {
  const [updates, setUpdates] = useState<LegalUpdate[]>([])
  const [showAlert, setShowAlert] = useState(false)
  const [latestUpdate, setLatestUpdate] = useState<LegalUpdate | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        // Mock data for now to avoid API errors
        const mockLatestUpdate = {
          date: "2024-06-01",
          version: "v1.1",
          summary: "Updated terms for WalletDNA™ features",
          content: "Full content here",
          url: "/legal/updates/2024-06-01",
        }

        setUpdates([mockLatestUpdate])
        setLatestUpdate(mockLatestUpdate)

        // Check if user has seen this update
        if (typeof window !== "undefined") {
          const lastSeenUpdate = localStorage.getItem("lastSeenLegalUpdate")
          if (!lastSeenUpdate || lastSeenUpdate !== mockLatestUpdate.date) {
            setShowAlert(true)
          }
        }
      } catch (err) {
        console.error("Error fetching legal updates:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))
      }
    }

    // Only fetch if we're in the browser
    if (typeof window !== "undefined") {
      fetchUpdates()
    }
  }, [])

  const handleAcknowledge = async () => {
    try {
      if (!latestUpdate) {
        setShowAlert(false)
        return
      }

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("lastSeenLegalUpdate", latestUpdate.date)
      }

      setShowAlert(false)
    } catch (err) {
      console.error("Error recording acceptance:", err)
      setShowAlert(false)
    }
  }

  const handleViewChangelog = () => {
    if (typeof window !== "undefined") {
      window.open("/legal/updates", "_blank")
    }
    handleAcknowledge()
  }

  // Don't render anything if there's an error or no updates
  if (error || !latestUpdate || !showAlert) return null

  return (
    <Dialog open={showAlert} onOpenChange={setShowAlert}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Updated Terms & Privacy Policy
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Updated: {new Date(latestUpdate.date).toLocaleDateString()}
            </span>
            <Badge variant="outline">{latestUpdate.version}</Badge>
          </div>

          <p className="text-sm">{latestUpdate.summary}</p>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              We've updated our Privacy Policy and Terms of Service to better serve you. Please review the changes to
              continue using ChainSignal.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleViewChangelog} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            View Full Changelog
          </Button>
          <Button onClick={handleAcknowledge}>Acknowledge & Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
