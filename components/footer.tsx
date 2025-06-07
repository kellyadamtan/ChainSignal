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
            . All rights reserved.
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
    </footer>
  )
}
