import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Mail, Lock, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  
  const [step, setStep] = useState(token ? "reset" : "email") // "email" or "reset"
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      toast.error("Email is required")
      setLoading(false)
      return
    }

    const emailLooksValid = /^\S+@\S+\.\S+$/.test(normalizedEmail)
    if (!emailLooksValid) {
      toast.error("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.message || "Failed to send reset link")
        setLoading(false)
        return
      }

      toast.success("Reset link sent to your email")
      setEmail("")
      setLoading(false)
    } catch (err) {
      toast.error("Something went wrong")
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!newPassword) {
      toast.error("New password is required")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (!confirmPassword) {
      toast.error("Please confirm your password")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.message || "Failed to reset password")
        setLoading(false)
        return
      }

      toast.success("Password reset successful! Redirecting to login...")
      setTimeout(() => navigate("/login"), 2000)
      setLoading(false)
    } catch (err) {
      toast.error("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      <header className="w-full bg-neutral-900/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800">
              <img
                src="/assets/mtbm/logo.png"
                alt="MTBM logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <div className="text-lg font-semibold text-white">MTBM</div>
              <div className="text-xs text-neutral-300">Dashboard System</div>
            </div>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-10">
        <Card className="w-full max-w-xl overflow-hidden border-none bg-neutral-200 shadow-none">
          <CardHeader className="relative bg-slate-800 px-8 py-6 text-white">
            <div className="flex items-start gap-3">
              <div className="mt-1 grid h-8 w-8 place-content-center rounded-md bg-white/10">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-4xl font-extrabold leading-none">
                  {step === "email" ? "Reset Password" : "New Password"}
                </CardTitle>
                <div className="mt-1 text-sm text-white/80">
                  {step === "email" ? "Enter your email to receive a reset link" : "Enter your new password"}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-10 py-8">
            {step === "email" ? (
              <form className="space-y-5" onSubmit={handleRequestReset}>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-800">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      className="h-10 rounded-md border-neutral-400 bg-neutral-100 pl-10 text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-md bg-[#5B89B1] text-white hover:bg-[#4a7294]"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <p className="text-center text-[11px] font-semibold text-neutral-800">
                  <Link to="/login" className="text-blue-700 flex items-center justify-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Back to Login
                  </Link>
                </p>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleResetPassword}>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-800">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-10 rounded-md border-neutral-400 bg-neutral-100 pl-10 text-sm"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-800">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-10 rounded-md border-neutral-400 bg-neutral-100 pl-10 text-sm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-md bg-[#5B89B1] text-white hover:bg-[#4a7294]"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>

                <p className="text-center text-[11px] font-semibold text-neutral-800">
                  <Link to="/login" className="text-blue-700 flex items-center justify-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Back to Login
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default ForgotPassword
