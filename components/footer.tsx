"use client"

import Link from "next/link"
import { Linkedin, Twitter, Globe, Instagram, Youtube, Github, Facebook } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function Footer() {
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ]

  const currentLanguage = languages[0] // Default to English

  const handleLanguageChange = (languageCode: string) => {
    // In a real implementation, this would handle language switching
    console.log(`Switching to language: ${languageCode}`)
    // You could integrate with next-intl, react-i18next, or similar
  }

  const socialLinks = [
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/tgiinvestama",
      icon: Linkedin,
      color: "hover:text-blue-600",
    },
    {
      name: "X (Twitter)",
      url: "https://www.x.com/tgiinvestama",
      icon: Twitter,
      color: "hover:text-gray-900",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/tgiinvestama",
      icon: Instagram,
      color: "hover:text-pink-600",
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@tgiinvestama",
      icon: Youtube,
      color: "hover:text-red-600",
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/tgiinvestama",
      icon: Facebook,
      color: "hover:text-blue-700",
    },
    {
      name: "GitHub",
      url: "https://github.com/tgiinvestama",
      icon: Github,
      color: "hover:text-gray-900",
    },
  ]

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025{" "}
            <Link
              href="https://www.tgi.biz.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              TGI Technologies
            </Link>
            . All rights reserved. |{" "}
            <Link href="/privacyterm" className="font-medium underline underline-offset-4 hover:text-primary">
              Privacy & Terms
            </Link>
          </p>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-primary">
                <Globe className="h-4 w-4 mr-1" />
                <span className="text-xs">
                  {currentLanguage.flag} {currentLanguage.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {languages.map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className="cursor-pointer"
                >
                  <span className="mr-2">{language.flag}</span>
                  <span>{language.name}</span>
                  {language.code === currentLanguage.code && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          {/* Mobile App Store Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="https://apps.apple.com/app/chainsignal"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
              aria-label="Download on the App Store"
            >
              <div className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg text-sm font-medium">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-xs leading-none">Download on the</span>
                  <span className="text-sm font-semibold leading-none">App Store</span>
                </div>
              </div>
            </Link>

            <Link
              href="https://play.google.com/store/apps/details?id=com.chainsignal.app"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
              aria-label="Get it on Google Play"
            >
              <div className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg text-sm font-medium">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-xs leading-none">GET IT ON</span>
                  <span className="text-sm font-semibold leading-none">Google Play</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const IconComponent = social.icon
              return (
                <Link
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-muted-foreground transition-colors duration-200 ${social.color}`}
                  aria-label={social.name}
                >
                  <IconComponent className="h-5 w-5" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
