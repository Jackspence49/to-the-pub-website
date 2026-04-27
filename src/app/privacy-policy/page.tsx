export const metadata = {
  title: "Privacy Policy | To The Pub",
  description: "Privacy Policy for To The Pub",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl px-4 py-16 md:px-6">

        <h1 className="mb-2 text-4xl font-bold">Privacy Policy — To The Pub</h1>
        <p className="mb-10 text-sm text-muted-foreground">Last updated: April 26, 2026</p>

        <div className="space-y-10 text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p>
              To The Pub (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the To The Pub mobile application (the
              &quot;App&quot;). This Privacy Policy explains what information we collect, how we use it, and your
              rights in relation to it. By using the App, you agree to the practices described here.
            </p>
            <p>
              Contact:{" "}
              <a href="mailto:tothepub.contact@gmail.com" className="text-[var(--vibrant-teal)] hover:underline">
                tothepub.contact@gmail.com
              </a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong className="text-foreground">Account registration:</strong> email address and password when you create an account.</li>
                <li><strong className="text-foreground">Profile information:</strong> any details you optionally add to your profile.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong className="text-foreground">Location data:</strong> with your permission, we access your device&apos;s GPS to show
                  bars and events near you. Coordinates are transmitted to our server solely to compute your
                  distance from nearby venues (Haversine calculation) and are returned as part of the response.
                  They are never written to a database or log file. If you deny permission, the App falls back
                  to a default location.
                </li>
                <li>
                  <strong className="text-foreground">Usage data:</strong> general interaction data (e.g., which bars or events you view)
                  to improve the App&apos;s experience.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">2.3 Information We Do Not Collect</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>We do not collect precise background location.</li>
                <li>We do not sell your personal data to third parties.</li>
                <li>We do not use your data for advertising profiling.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-6 text-left font-semibold text-foreground">Purpose</th>
                    <th className="py-2 pr-6 text-left font-semibold text-foreground">Data Used</th>
                    <th className="py-2 text-left font-semibold text-foreground">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 pr-6">Finding bars and events near you</td>
                    <td className="py-2 pr-6">Location coordinates</td>
                    <td className="py-2">Transient — discarded after the API response is sent; never stored</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6">Authenticating your account</td>
                    <td className="py-2 pr-6">Email address, secure token</td>
                    <td className="py-2">Stored for the life of your account</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6">Improving the App</td>
                    <td className="py-2 pr-6">Anonymised usage data</td>
                    <td className="py-2">Retained in aggregate only</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6">Responding to support requests</td>
                    <td className="py-2 pr-6">Email address</td>
                    <td className="py-2">Retained while your account is active</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Data Storage &amp; Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Authentication tokens are stored securely on your device using Expo Secure Store (iOS
                Keychain / Android Keystore) and are never stored in plain text.
              </li>
              <li>
                Data transmitted between the App and our servers is encrypted in transit via HTTPS.
              </li>
              <li>
                We retain account data for as long as your account is active. You may request deletion at
                any time (see Section 6).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Third-Party Services</h2>
            <p>
              The App uses the following third-party services, each governed by their own privacy policies:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong className="text-foreground">Expo / EAS</strong> (build and update infrastructure) —{" "}
                <a href="https://expo.dev/privacy" className="text-[var(--vibrant-teal)] hover:underline" target="_blank" rel="noopener noreferrer">
                  expo.dev/privacy
                </a>
              </li>
              <li>
                <strong className="text-foreground">Apple App Store / Google Play</strong> (distribution) — subject to their respective
                platform policies
              </li>
            </ul>
            <p>
              We do not integrate third-party analytics SDKs, advertising networks, or social login
              providers at this time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
            <p>
              Depending on your jurisdiction (e.g., GDPR, CCPA), you may have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data.</li>
              <li>Delete your account and associated data.</li>
              <li>Withdraw consent to location access at any time via your device settings.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:tothepub.contact@gmail.com" className="text-[var(--vibrant-teal)] hover:underline">
                tothepub.contact@gmail.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Children&apos;s Privacy</h2>
            <p>
              The App is not directed at children under 18. We do not knowingly collect personal
              information from anyone under 18. If you believe a minor has provided us with personal data,
              please contact us and we will delete it promptly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Changes to This Policy</h2>
            <p>
              We may update this policy periodically. We will notify you of material changes by updating
              the &quot;Last updated&quot; date above and, where appropriate, through an in-app notice. Continued
              use of the App after changes constitutes acceptance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">9. Contact</h2>
            <p>To The Pub</p>
            <p>
              Email:{" "}
              <a href="mailto:tothepub.contact@gmail.com" className="text-[var(--vibrant-teal)] hover:underline">
                tothepub.contact@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
