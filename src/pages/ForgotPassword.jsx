import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, ArrowLeft, KeyRound, CheckCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"

const ForgotPassword = () => {
  const navigate = useNavigate()
  
  // Steps: "email" -> "otp" -> "reset" -> "success"
  const [step, setStep] = useState("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  
  const otpRefs = useRef([])

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // Only allow digits
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only keep last digit
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      // Focus appropriate input
      const focusIndex = Math.min(pastedData.length, 5)
      otpRefs.current[focusIndex]?.focus()
    }
  }

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
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
        toast.error(data?.message || "Failed to send OTP")
        setLoading(false)
        return
      }

      toast.success("OTP sent to your email")
      setStep("otp")
      setResendTimer(60) // 60 second cooldown
      setLoading(false)
    } catch (err) {
      toast.error("Something went wrong")
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.message || "Failed to resend OTP")
        setLoading(false)
        return
      }

      toast.success("New OTP sent to your email")
      setOtp(["", "", "", "", "", ""])
      setResendTimer(60)
      setLoading(false)
    } catch (err) {
      toast.error("Something went wrong")
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)

    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          otp: otpCode 
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.message || "Invalid OTP")
        setLoading(false)
        return
      }

      toast.success("OTP verified!")
      setStep("reset")
      setLoading(false)
    } catch (err) {
      toast.error("Something went wrong")
      setLoading(false)
    }
  }

  // Step 3: Reset Password
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
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          otp: otp.join(""),
          newPassword 
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.message || "Failed to reset password")
        setLoading(false)
        return
      }

      toast.success("Password reset successful!")
      setStep("success")
      setLoading(false)
    } catch (err) {
      toast.error("Something went wrong")
      setLoading(false)
    }
  }

  const getStepInfo = () => {
    switch (step) {
      case "email":
        return { icon: Mail, title: "Reset Password", subtitle: "Enter your email to receive a verification code" }
      case "otp":
        return { icon: KeyRound, title: "Verify OTP", subtitle: `Enter the 6-digit code sent to ${email}` }
      case "reset":
        return { icon: Lock, title: "New Password", subtitle: "Create a new password for your account" }
      case "success":
        return { icon: CheckCircle, title: "Success!", subtitle: "Your password has been reset" }
      default:
        return { icon: Mail, title: "Reset Password", subtitle: "" }
    }
  }

  const stepInfo = getStepInfo()

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      <header className="w-full bg-neutral-900/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4">
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

      <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
        <Card className="w-full max-w-xl overflow-hidden border-none bg-neutral-200 shadow-none">
          <CardHeader className="relative bg-slate-800 px-5 sm:px-8 py-5 sm:py-6 text-white">
            <div className="flex items-start gap-3">
              <div className="mt-1 grid h-8 w-8 place-content-center rounded-md bg-white/10">
                <stepInfo.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-4xl font-extrabold leading-none">
                  {stepInfo.title}
                </CardTitle>
                <div className="mt-1 text-sm text-white/80">
                  {stepInfo.subtitle}
                </div>
              </div>
            </div>
            
            {/* Step indicator */}
            {step !== "success" && (
              <div className="mt-4 flex items-center gap-2">
                {["email", "otp", "reset"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step === s ? "bg-white text-slate-800" : 
                      ["email", "otp", "reset"].indexOf(step) > i ? "bg-green-500 text-white" :
                      "bg-white/20 text-white/60"
                    }`}>
                      {["email", "otp", "reset"].indexOf(step) > i ? "✓" : i + 1}
                    </div>
                    {i < 2 && (
                      <div className={`w-12 h-0.5 ${
                        ["email", "otp", "reset"].indexOf(step) > i ? "bg-green-500" : "bg-white/20"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent className="px-4 sm:px-10 py-6 sm:py-8">
            {/* Step 1: Email */}
            {step === "email" && (
              <form className="space-y-5" onSubmit={handleRequestOtp}>
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
                  {loading ? "Sending..." : "Send OTP Code"}
                </Button>

                <p className="text-center text-[11px] font-semibold text-neutral-800">
                  <Link to="/login" className="text-blue-700 flex items-center justify-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Back to Login
                  </Link>
                </p>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <form className="space-y-5" onSubmit={handleVerifyOtp}>
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-neutral-800">Enter 6-Digit Code</label>
                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-md border-neutral-400 bg-neutral-100 text-center text-lg sm:text-xl font-bold"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="mt-2 h-11 w-full rounded-md bg-[#5B89B1] text-white hover:bg-[#4a7294]"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-neutral-600 mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    className={`text-sm font-semibold ${
                      resendTimer > 0 ? "text-neutral-400" : "text-blue-700 hover:underline"
                    }`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>

                <p className="text-center text-[11px] font-semibold text-neutral-800">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-blue-700 flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="h-3 w-3" /> Change Email
                  </button>
                </p>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === "reset" && (
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

            {/* Step 4: Success */}
            {step === "success" && (
              <div className="text-center space-y-5">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <p className="text-neutral-600">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="h-11 w-full rounded-md bg-[#5B89B1] text-white hover:bg-[#4a7294]"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default ForgotPassword
