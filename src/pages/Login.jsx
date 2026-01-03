import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Toast from "@/components/ui/toast"

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [toastMessage, setToastMessage] = useState(location.state?.message || '')
  const [selectedRole, setSelectedRole] = useState(null)
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

      <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-10">
        <Card className="w-full max-w-4xl border-none bg-neutral-200 text-neutral-900 shadow-none">
          <CardHeader className="pb-0">
            <CardTitle className="text-3xl font-bold text-center">Welcome!</CardTitle>
            <p className="text-center text-sm text-neutral-600">Please enter your details</p>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div className="space-y-4 md:px-6">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 bg-white text-neutral-900 font-semibold"
                  type="button">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 48 48"
                      aria-hidden="true">
                      <path
                        fill="#FFC107"
                        d="M43.611 20.083H42V20H24v8h11.303C33.563 32.655 29.214 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.354 4.337-17.694 10.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.193 0-9.533-3.318-11.292-7.946l-6.52 5.02C9.494 39.556 16.227 44 24 44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611 20.083H42V20H24v8h11.303a11.96 11.96 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                      />
                    </svg>
                  </span>
                  Log in with Google
                </Button>

                <div className="flex items-center gap-4 text-sm text-neutral-600">
                  <div className="h-px flex-1 bg-neutral-400" />
                  <span>or</span>
                  <div className="h-px flex-1 bg-neutral-400" />
                </div>

                <div className="pb-4">
                  <p className="text-sm font-semibold text-neutral-800 mb-3">Select Your Role:</p>
                  <div className="flex gap-2">
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
                  </div>
                </div>

                <Input type="email" placeholder="Email" className="bg-neutral-100" />
                <Input type="password" placeholder="Password" className="bg-neutral-100" />

                <div className="flex items-center gap-3 pt-1">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm text-neutral-800">
                    Remember for 30 days
                  </label>
                </div>

                <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white" type="button" onClick={() => {
                  if (!selectedRole) {
                    alert('Please select a role to continue');
                    return;
                  }
                  const dashboardRoutes = {
                    engineer: '/engineer',
                    technician: '/technician'
                  };
                  navigate(dashboardRoutes[selectedRole], { state: { message: 'Successfully logged in' } });
                }}>
                  Log in
                </Button>

                <Toast message={toastMessage} onClose={() => setToastMessage('')} />

                <p className="text-center text-sm text-neutral-800">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="text-blue-700 font-semibold">
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="md:px-6">
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