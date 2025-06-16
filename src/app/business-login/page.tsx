import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignInForm } from "../../components/signin-form"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--dark-sapphire)]">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-[var(--light-gray)]">Sign in to your To The Pub account</p>
          </div>

          {/* Sign In Card */}
          <Card className="bg-white border-[var(--light-gray)] shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-[var(--dark-sapphire)]">Sign In</CardTitle>
              <CardDescription className="text-center text-[var(--charcoal-gray)]">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignInForm />
            </CardContent>
          </Card>

          {/* Additional Links */}
          <div className="text-center space-y-4">
            <p className="text-gray-300 text-sm">
              Don't have an account?{" "}
              <Link href="/business-signup" className="text-[var(--vibrant-teal)] hover:text-[var(--vibrant-teal)]/80 font-medium transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
