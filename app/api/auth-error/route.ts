import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const error = searchParams.get("error") || "Unknown"

    const errorMessages: Record<string, string> = {
      Configuration: "There is a problem with the server configuration.",
      AccessDenied: "You do not have permission to sign in.",
      Verification: "The verification token has expired or has already been used.",
      Default: "An error occurred during authentication.",
      OAuthSignin: "Error in constructing an authorization URL.",
      OAuthCallback: "Error in handling the response from an OAuth provider.",
      OAuthCreateAccount: "Could not create OAuth account in the database.",
      EmailCreateAccount: "Could not create email account in the database.",
      Callback: "Error in the OAuth callback handler route.",
      OAuthAccountNotLinked: "The email on the account is already linked, but not with this OAuth account.",
      EmailSignin: "Sending the e-mail with the verification token failed.",
      CredentialsSignin: "The authorize callback returned null in the Credentials provider.",
      SessionRequired: "The content of this page requires you to be signed in at all times.",
      Unknown: "An unknown error occurred during authentication.",
    }

    const message = errorMessages[error] || errorMessages.Unknown

    return NextResponse.json(
      {
        success: false,
        error: error,
        message: message,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("Auth error API error:", err)
    return NextResponse.json(
      {
        success: false,
        error: "InternalError",
        message: "An internal server error occurred while processing the authentication error.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
