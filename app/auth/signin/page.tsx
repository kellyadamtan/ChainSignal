"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn, getProviders, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github, Mail, Chrome, MessageCircle, Twitter, Linkedin, ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

const providerIcons = {
  google: Chrome,
  github: Github,
  discord: MessageCircle,
  twitter: Twitter,
  linkedin: Linkedin,
}

const providerColors = {
  google: "bg-red-500 hover:bg-red-600",
  github: "bg-gray-900 hover:bg-gray-800",
  discord: "bg-indigo-500 hover:bg-indigo-600",
  twitter: "bg-blue-500 hover:bg-blue-600",
  linkedin: "bg-blue-700 hover:bg-blue-800",
}

export default function SignInPage() {
  const [providers, setProviders] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const errorParam = searchParams.get("error")

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    fetchProviders()

    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push(callbackUrl)
      }
    }
    checkSession()
  }, [callbackUrl, router])

  useEffect(() => {
    if (errorParam) {
      switch (errorParam) {
        case "OAuthSignin":
          setError("Error occurred during OAuth sign in")
          break
        case "OAuthCallback":
          setError("Error occurred during OAuth callback")
          break
        case "OAuthCreateAccount":
          setError("Could not create OAuth account")
          break
        case "EmailCreateAccount":
          setError("Could not create email account")
          break
        case "Callback":
          setError("Error occurred during callback")
          break
        case "OAuthAccountNotLinked":
          setError("OAuth account is not linked to any user")
          break
        case "EmailSignin":
          setError("Check your email for a sign in link")
          break
        case "CredentialsSignin":
          setError("Invalid credentials")
          break
        case "SessionRequired":
          setError("Please sign in to access this page")
          break
        default:
          setError("An error occurred during sign in")
      }
    }
  }, [errorParam])

  const handleOAuthSignIn = async (providerId: string) => {
    setLoading(true)
    setError("")
    try {
      await signIn(providerId, { callbackUrl })
    } catch (error) {
      setError("Failed to sign in with " + providerId)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push(callbackUrl)
      }
    } catch (error) {
      setError("An error occurred during sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to ChainSignal
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your ChainSignal account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Choose your preferred sign in method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* OAuth Providers */}
            <div className="space-y-3">
              {providers &&
                Object.values(providers)
                  .filter((provider: any) => provider.id !== "credentials")
                  .map((provider: any) => {
                    const Icon = providerIcons[provider.id as keyof typeof providerIcons] || Mail
                    const colorClass =
                      providerColors[provider.id as keyof typeof providerColors] || "bg-gray-600 hover:bg-gray-700"

                    return (
                      <Button
                        key={provider.name}
                        variant="outline"
                        className={`w-full ${colorClass} text-white border-0`}
                        onClick={() => handleOAuthSignIn(provider.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Icon className="w-4 h-4 mr-2" />
                        )}
                        Continue with {provider.name}
                      </Button>
                    )
                  })}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Sign in with Email
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Link href="/auth/forgot-password" className="text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
