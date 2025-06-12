import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Shield, Scale } from "lucide-react"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

async function getLegalUpdates() {
  const updatesDir = path.join(process.cwd(), "public/legal/updates")

  if (!fs.existsSync(updatesDir)) {
    return []
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
        content: content,
        title: content.split("\n")[0]?.replace("## ", "") || "Legal Update",
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return updates
}

export default async function LegalUpdatesPage() {
  const updates = await getLegalUpdates()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Legal Document Updates</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track all changes to our Privacy Policy, Terms of Service, and Cookie Policy. We maintain full transparency
            about how our legal documents evolve.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{updates.length}</p>
                  <p className="text-sm text-muted-foreground">Total Updates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-sm text-muted-foreground">Transparency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">GDPR</p>
                  <p className="text-sm text-muted-foreground">Compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Updates Timeline */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Update History</h2>

          {updates.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No legal updates available.</p>
              </CardContent>
            </Card>
          ) : (
            updates.map((update, index) => (
              <Card key={update.date} className={index === 0 ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {update.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {index === 0 && <Badge variant="default">Latest</Badge>}
                      <Badge variant="outline">{update.version}</Badge>
                      <Badge variant="secondary">{new Date(update.date).toLocaleDateString()}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: update.content
                          .replace(/^## .+$/gm, "") // Remove title (already in header)
                          .replace(
                            /\*\*Summary\*\*: (.+)$/gm,
                            '<div class="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mb-4"><strong>Summary:</strong> $1</div>',
                          )
                          .replace(/### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                          .replace(/- (.+)$/gm, "<li>$1</li>")
                          .replace(/(\n<li>.*<\/li>\n)/gs, '<ul class="list-disc list-inside space-y-1 mb-4">$1</ul>'),
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
