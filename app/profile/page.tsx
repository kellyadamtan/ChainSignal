import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Chrome, Github, Linkedin, MessageCircle } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal information here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="john.doe@example.com" disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>Update Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="2fa">Two-Factor Authentication</Label>
                <Switch id="2fa" />
              </div>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Connected Accounts</h3>
                <p className="text-sm text-muted-foreground">Manage your social login connections</p>
              </div>
              <div className="space-y-3">
                {[
                  { provider: "Google", icon: Chrome, connected: true, email: "john.doe@gmail.com" },
                  { provider: "GitHub", icon: Github, connected: false, email: null },
                  { provider: "Discord", icon: MessageCircle, connected: false, email: null },
                  { provider: "LinkedIn", icon: Linkedin, connected: false, email: null },
                ].map((account) => {
                  const Icon = account.icon
                  return (
                    <div key={account.provider} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <div>
                          <p className="font-medium">{account.provider}</p>
                          {account.connected && account.email && (
                            <p className="text-sm text-muted-foreground">{account.email}</p>
                          )}
                        </div>
                      </div>
                      <Button variant={account.connected ? "destructive" : "outline"} size="sm">
                        {account.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
