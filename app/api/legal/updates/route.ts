import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

export async function GET() {
  try {
    const updatesDir = path.join(process.cwd(), "public/legal/updates")

    // Check if directory exists
    if (!fs.existsSync(updatesDir)) {
      return NextResponse.json([])
    }

    const files = fs.readdirSync(updatesDir)
    const updates = files
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const filePath = path.join(updatesDir, file)
        const fileContent = fs.readFileSync(filePath, "utf8")
        const { data, content } = matter(fileContent)

        return {
          date: file.replace(".md", ""),
          version: data.version || "v1.0",
          summary: content.split("\n")[1]?.replace("**Summary**: ", "") || "",
          url: `/legal/updates/${file.replace(".md", "")}`,
          content: content,
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(updates)
  } catch (error) {
    console.error("Error fetching legal updates:", error)
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 })
  }
}
