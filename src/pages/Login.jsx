import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Toast from "@/components/ui/toast"
import { toast } from "sonner"
import { googleLogin, login } from "@/lib/auth"

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [toastMessage, setToastMessage] = useState(location.state?.message || '')
  const [selectedRole, setSelectedRole] = useState(null)
  const selectedRoleRef = useRef(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const dashboardRoutes = {
    engineer: '/engineer',
    technician: '/technician',
    admin: '/admin'
  }

  useEffect(() => {
    selectedRoleRef.current = selectedRole
  }, [selectedRole])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          const role = selectedRoleRef.current
          if (!role) {
            toast.error('Please select a role to continue')
            return
          }

          try {
            await googleLogin({ credential: response.credential, role })
          } catch (err) {
            toast.error(err?.message || 'Google login failed')
            return
          }

          navigate(dashboardRoutes[role], { state: { message: 'Successfully logged in' } })
        },
      })

      const buttonHost = document.getElementById('google-signin-button')
      if (buttonHost && buttonHost.childNodes.length === 0) {
        window.google.accounts.id.renderButton(buttonHost, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 360,
        })
      }
    }

    if (window.google?.accounts?.id) {
      initializeGoogle()
      return
    }

    const existingScript = document.querySelector('script[data-google-identity="true"]')
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogle, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    script.onload = initializeGoogle
    document.body.appendChild(script)
  }, [GOOGLE_CLIENT_ID, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedRole) {
      toast.error('Please select a role to continue')
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      toast.error('Email is required')
      return
    }

    const emailLooksValid = /^\S+@\S+\.\S+$/.test(normalizedEmail)
    if (!emailLooksValid) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!password) {
      toast.error('Password is required')
      return
    }

    try {
      await login({ email: normalizedEmail, password, role: selectedRole })
    } catch (err) {
      toast.error(err?.message || 'Login failed')
      return
    }

    navigate(dashboardRoutes[selectedRole], { state: { message: 'Successfully logged in' } })
  }
  return (
    <div className="min-h-screen w-full bg-neutral-950 text-foreground">
      <header className="w-full bg-neutral-900/80">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-4">
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
        <Card className="w-full max-w-4xl border-none bg-neutral-200 text-neutral-900 shadow-none">
          <CardHeader className="pb-0">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">Welcome!</CardTitle>
            <p className="text-center text-sm text-neutral-600">Please enter your details</p>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div className="space-y-4 sm:px-4 md:px-6">
                {GOOGLE_CLIENT_ID ? (
                  <div
                    id="google-signin-button"
                    className="w-full flex justify-center"
                  />
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 bg-white text-neutral-900 font-semibold"
                    type="button"
                    disabled
                  >
                    Log in with Google (not configured)
                  </Button>
                )}

                <div className="flex items-center gap-4 text-sm text-neutral-600">
                  <div className="h-px flex-1 bg-neutral-400" />
                  <span>or</span>
                  <div className="h-px flex-1 bg-neutral-400" />
                </div>

                <div className="pb-4">
                  <p className="text-sm font-semibold text-neutral-800 mb-3">Select Your Role:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => setSelectedRole('engineer')}
                      className={`flex-1 h-9 rounded-md px-4 ${
                        selectedRole === 'engineer'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-neutral-300 text-neutral-900 hover:bg-neutral-400'
                      }`}
                    >
                      Engineer
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setSelectedRole('technician')}
                      className={`flex-1 h-9 rounded-md px-4 ${
                        selectedRole === 'technician'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-neutral-300 text-neutral-900 hover:bg-neutral-400'
                      }`}
                    >
                      Technician
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setSelectedRole('admin')}
                      className={`flex-1 h-9 rounded-md px-4 ${
                        selectedRole === 'admin'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-neutral-300 text-neutral-900 hover:bg-neutral-400'
                      }`}
                    >
                      Admin
                    </Button>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <Input
                    type="email"
                    placeholder="Email"
                    className="bg-neutral-100"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="bg-neutral-100"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />

                  <div className="flex items-center gap-3 pt-1">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-sm text-neutral-800">
                      Remember for 30 days
                    </label>
                  </div>

                  <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white" type="submit">
                    Log in
                  </Button>
                </form>

                <Toast message={toastMessage} onClose={() => setToastMessage('')} />

                <p className="text-center text-sm text-neutral-800">
                  <Link to="/forgot-password" className="text-blue-700 font-semibold">
                    Forgot password?
                  </Link>
                </p>

                <p className="text-center text-sm text-neutral-800">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="text-blue-700 font-semibold">
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="hidden md:block md:px-6">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-300">
                  <img
                    src="/assets/mtbm/login-hero.jpg"
                    alt="Login illustration"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
export default Login;