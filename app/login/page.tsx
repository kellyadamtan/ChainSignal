"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // For now, redirect to signup page
    // In the future, this could be a dedicated login page
    router.push("/signup")
  }, [router])

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Redirecting to sign up...</h2>
      </div>
    </div>
  )
}
