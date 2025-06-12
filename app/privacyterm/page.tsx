import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Lock, Database, Scale, Mail, AlertTriangle } from "lucide-react"

export default function PrivacyTermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy & Terms of Service</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline">Last Updated: January 2025</Badge>
            <Badge variant="secondary">Applicable To: ChainSignal.biz.id and WalletDNA™ Services</Badge>
          </div>
        </div>

        {/* Privacy Policy Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              1. Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data We Collect */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                1.1 Data We Collect
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>Account Data:</strong> Email, username, and tier (Pro/Enterprise)
                </li>
                <li>
                  <strong>Wallet Data</strong> (Self-Custody Only):
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Public addresses (never private keys)</li>
                    <li>• Transaction history (read-only via API)</li>
                    <li>• On-chain analytics metadata</li>
                  </ul>
                </li>
                <li>
                  <strong>News Preferences:</strong> Saved alerts and watched keywords
                </li>
                <li>
                  <strong>Usage Data:</strong> IP, device info, and cookies (opt-out available)
                </li>
              </ul>
            </div>

            <Separator />

            {/* How We Use Data */}
            <div>
              <h3 className="text-lg font-semibold mb-3">1.2 How We Use Data</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">Purpose</th>
                      <th className="border border-border p-2 text-left">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2">Deliver core analytics</td>
                      <td className="border border-border p-2">Performance of contract</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2">Improve algorithms</td>
                      <td className="border border-border p-2">Legitimate interest</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2">Fraud prevention</td>
                      <td className="border border-border p-2">Legal obligation</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2">Marketing (opt-in)</td>
                      <td className="border border-border p-2">Consent</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Separator />

            {/* Data Sharing */}
            <div>
              <h3 className="text-lg font-semibold mb-3">1.3 Data Sharing</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong className="text-green-600">Never Sold</strong> to third parties
                </li>
                <li>
                  <strong>Limited Sharing</strong> with:
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Regulated custodians (for Enterprise vaults)</li>
                    <li>• Compliance providers (e.g., Chainalysis for AML)</li>
                    <li>• Infrastructure partners (AWS, Neon DB) under GDPR contracts</li>
                  </ul>
                </li>
              </ul>
            </div>

            <Separator />

            {/* Security Measures */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                1.4 Security Measures
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>Encryption:</strong> AES-256 for data at rest, TLS 1.3 for transit
                </li>
                <li>
                  <strong>Access Controls:</strong> Role-based permissions + 2FA enforcement
                </li>
                <li>
                  <strong>Audits:</strong> Annual penetration testing by Cure53
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Terms of Service Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              2. Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* WalletDNA Usage */}
            <div>
              <h3 className="text-lg font-semibold mb-3">2.1 WalletDNA™ Usage</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Self-Custody:</strong> You retain full control of private keys. We cannot:
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Recover lost keys</li>
                    <li>• Reverse transactions</li>
                    <li>• Access funds without explicit PSBT approval</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-red-600">Prohibited:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Mixing illicit funds (OFAC-sanctioned addresses blocked)</li>
                    <li>• Automated scraping without API plan</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* API & Data Rights */}
            <div>
              <h3 className="text-lg font-semibold mb-3">2.2 API & Data Rights</h3>
              <div className="space-y-3">
                <div>
                  <strong>Tier Limits:</strong>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-sm border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-2 text-left">Tier</th>
                          <th className="border border-border p-2 text-left">Requests/Min</th>
                          <th className="border border-border p-2 text-left">Alerts</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-2">Free</td>
                          <td className="border border-border p-2">10</td>
                          <td className="border border-border p-2">3</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">Pro</td>
                          <td className="border border-border p-2">500</td>
                          <td className="border border-border p-2">50</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">Enterprise</td>
                          <td className="border border-border p-2">Custom</td>
                          <td className="border border-border p-2">Unlimited</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-sm">
                  <strong>Ownership:</strong> You retain rights to your wallet data; we anonymize analytics.
                </p>
              </div>
            </div>

            <Separator />

            {/* Liability */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                2.3 Liability
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>No Warranty:</strong> Market predictions are probabilistic, not financial advice.
                </li>
                <li>
                  <strong>Cap on Damages:</strong> Liability limited to 6 months of subscription fees.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Policy */}
        <Card>
          <CardHeader>
            <CardTitle>3. Cookie Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Essential:</strong> Session cookies for login (cannot opt out)
              </li>
              <li>
                <strong>Analytical:</strong> Matomo for anonymized usage stats (opt-out in settings)
              </li>
              <li>
                <strong>Marketing:</strong> Google Ads (disabled by default for EU/GDPR)
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card>
          <CardHeader>
            <CardTitle>4. Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Governing Law:</strong> Singapore (for international arbitration)
              </li>
              <li>
                <strong>Process:</strong> 30-day mediation → Binding arbitration via AAA
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Updates & Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              5. Updates & Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Changes:</strong> 30-day notice via email for material updates
              </li>
              <li>
                <strong>DPO Contact:</strong>{" "}
                <a href="mailto:privacy@chainsignal.biz.id" className="text-primary hover:underline">
                  privacy@chainsignal.biz.id
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* User Acknowledgment */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">User Acknowledgment</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  By using ChainSignal, you confirm you're ≥18 years old and accept automated decision-making for risk
                  scoring.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
