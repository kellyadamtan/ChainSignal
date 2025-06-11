"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: "Server Configuration Error",
      description: "There is a problem with the server configuration. Please contact support.",
    },
    AccessDenied: {
      title: "Access Denied",
      description: "You do not have permission to sign in. Please contact an administrator.",
    },
    Verification: {
      title: "Verification Failed",
      description: "The verification token has expired or has already been used.",
    },
    OAuthSignin: {
      title: "OAuth Sign-in Error",
      description: "Error in constructing an authorization URL. Please try again.",
    },
    OAuthCallback: {
      title: "OAuth Callback Error",
      description: "Error in handling the response from the OAuth provider.",
    },
    OAuthCreateAccount: {
      title: "Account Creation Failed",
      description: "Could not create your account. Please try again or contact support.",
    },
    EmailCreateAccount: {
      title: "Email Account Creation Failed",
      description: "Could not create email account. Please try again.",
    },
    Callback: {
      title: "Callback Error",
      description: "Error in the OAuth callback handler. Please try signing in again.",
    },
    OAuthAccountNotLinked: {
      title: "Account Not Linked",
      description: "The email on the account is already linked, but not with this OAuth account.",
    },
    EmailSignin: {
      title: "Email Sign-in Failed",
      description: "Sending the verification email failed. Please try again.",
    },
    CredentialsSignin: {
      title: "Invalid Credentials",
      description: "The email or password you entered is incorrect. Please try again.",
    },
    SessionRequired: {
      title: "Session Required",
      description: "You must be signed in to access this page.",
    },
    Default: {
      title: "Authentication Error",
      description: "An error occurred during authentication. Please try again.",
    },
  }

  const errorInfo = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold text-gray-900">{errorInfo.title}</CardTitle>
            <CardDescription className="mt-2 text-sm text-gray-600">{errorInfo.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-xs text-gray-500">Error Code: {error}</p>
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/auth/signin">Try Again</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
