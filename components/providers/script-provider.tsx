"use client"

import Script from "next/script"

export function ScriptProvider() {
  const handleCookieYesError = (e: Error) => {
    console.error("CookieYes script failed to load:", e)
  }

  return (
    <>
      {/* CookieYes Banner Script - Load with proper error handling */}
      <Script
        id="cookieyes"
        src="https://cdn-cookieyes.com/client_data/691a2f876ef768929cb0d286/script.js"
        strategy="afterInteractive"
        onError={handleCookieYesError}
      />
    </>
  )
}
