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
  const { data: session } = useSession()

  useEffect(() => {
    fetchUpdates()
  }, [])

  const fetchUpdates = async () => {
    try {
      const response = await fetch("/api/legal/updates")
      const data = await response.json()
      setUpdates(data)

      if (data.length > 0) {
        const latest = data[0]
        setLatestUpdate(latest)

        // Check if user has seen this update
        const lastSeenUpdate = localStorage.getItem("lastSeenLegalUpdate")
        if (!lastSeenUpdate || lastSeenUpdate !== latest.date) {
          setShowAlert(true)
        }
      }
    } catch (error) {
      console.error("Error fetching legal updates:", error)
    }
  }

  const handleAcknowledge = async () => {
    if (!latestUpdate || !session?.user?.email) {
      setShowAlert(false)
      return
    }

    try {
      // Record acceptance
      await fetch("/api/legal/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.email,
          documentType: "terms",
          version: latestUpdate.version,
          ipAddress: "", // Will be filled by server
          userAgent: navigator.userAgent,
        }),
      })

      // Mark as seen locally
      localStorage.setItem("lastSeenLegalUpdate", latestUpdate.date)
      setShowAlert(false)
    } catch (error) {
      console.error("Error recording acceptance:", error)
      setShowAlert(false)
    }
  }

  const handleViewChangelog = () => {
    window.open("/legal/updates", "_blank")
    handleAcknowledge()
  }

  if (!showAlert || !latestUpdate) return null

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
