"use client"

import type React from "react"

import { signIn, getProviders } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Github, Mail, MessageCircle, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const providerIcons = {
  google: Mail,
  github: Github,
  discord: MessageCircle,
  twitter: Twitter,
  linkedin: Linkedin,
}

export default function SignIn() {
  const [providers, setProviders] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const error = searchParams.get("error")

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    fetchProviders()
  }, [])

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        console.error("Sign in error:", result.error)
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = (providerId: string) => {
    signIn(providerId, { callbackUrl })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Sign in to ChainSignal</CardTitle>
            <CardDescription>Choose your preferred sign in method</CardDescription>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                Authentication failed. Please try again.
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Credentials Sign In */}
            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in with Email"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              <p>Test credentials: admin@chainsignal.com / Adamtgi123$</p>
            </div>

            <Separator />

            {/* OAuth Providers */}
            <div className="space-y-3">
              {providers &&
                Object.values(providers).map((provider: any) => {
                  if (provider.id === "credentials") return null

                  const Icon = providerIcons[provider.id as keyof typeof providerIcons] || Mail

                  return (
                    <Button
                      key={provider.id}
                      variant="outline"
                      className="w-full"
                      onClick={() => handleOAuthSignIn(provider.id)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      Continue with {provider.name}
                    </Button>
                  )
                })}
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link href="/signup" className="text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
