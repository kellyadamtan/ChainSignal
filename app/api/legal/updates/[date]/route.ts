import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

export async function GET(request: Request, { params }: { params: { date: string } }) {
  try {
    const { date } = params
    const filePath = path.join(process.cwd(), "public/legal/updates", `${date}.md`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Update not found" }, { status: 404 })
    }

    const fileContent = fs.readFileSync(filePath, "utf8")
    const { data, content } = matter(fileContent)

    return NextResponse.json({
      date,
      version: data.version || "v1.0",
      content,
      metadata: data,
    })
  } catch (error) {
    console.error("Error fetching legal update:", error)
    return NextResponse.json({ error: "Failed to fetch update" }, { status: 500 })
  }
}
