import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Building2, Image, Lock, Mail, User, Wrench } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { useNavigate } from 'react-router-dom'
import { toast } from "sonner"
import { signup, uploadAvatar } from "@/lib/auth"

const Signup = () => {
	const [accountType, setAccountType] = useState("engineer")
	const [fullName, setFullName] = useState("")
	const [email, setEmail] = useState("")
	const [otp, setOtp] = useState("")
	const [otpSent, setOtpSent] = useState(false)
	const [otpVerified, setOtpVerified] = useState(false)
	const [organization, setOrganization] = useState("")
	const [photoFile, setPhotoFile] = useState(null)
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [sendingOtp, setSendingOtp] = useState(false)
	const [verifyingOtp, setVerifyingOtp] = useState(false)
	const photoInputRef = useRef(null)

	const accountLabel = useMemo(() => {
		switch (accountType) {
			case "technician":
				return "Technician"
			case "admin":
				return "Admin"
			case "engineer":
			default:
				return "Engineer"
		}
	}, [accountType])

	const navigate = useNavigate()

	const handleSendOtp = async () => {
		const normalizedEmail = email.trim().toLowerCase()
		if (!normalizedEmail) {
			toast.error("Email address is required")
			return
		}

		const emailRegex = /^\S+@\S+\.\S+$/
		if (!emailRegex.test(normalizedEmail)) {
			toast.error("Please enter a valid email address")
			return
		}

		setSendingOtp(true)
		try {
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
			console.log('Sending OTP to:', apiUrl)
			
			const response = await fetch(`${apiUrl}/api/otp/send-otp`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: normalizedEmail }),
			})

			console.log('Response status:', response.status)
			const data = await response.json()
			console.log('Response data:', data)

			if (!response.ok) {
				throw new Error(data.message || 'Failed to send OTP')
			}

			toast.success('OTP sent to your email. Check your inbox!')
			setOtpSent(true)
		} catch (err) {
			console.error('OTP Send Error:', err)
			toast.error(err?.message || 'Network error. Please check if the server is running.')
		} finally {
			setSendingOtp(false)
		}
	}

	const handleVerifyOtp = async () => {
		const normalizedEmail = email.trim().toLowerCase()
		const normalizedOtp = otp.trim()

		if (!normalizedOtp) {
			toast.error("OTP is required")
			return
		}

		if (!/^\d{6}$/.test(normalizedOtp)) {
			toast.error("OTP must be 6 digits")
			return
		}

		setVerifyingOtp(true)
		try {
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
			console.log('Verifying OTP...')
			
			const response = await fetch(`${apiUrl}/api/otp/verify-otp`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: normalizedEmail, otp: normalizedOtp }),
			})

			console.log('Verify response status:', response.status)
			const data = await response.json()
			console.log('Verify response data:', data)

			if (!response.ok) {
				throw new Error(data.message || 'OTP verification failed')
			}

			toast.success('Email verified successfully! ✓')
			setOtpVerified(true)
		} catch (err) {
			console.error('OTP Verify Error:', err)
			toast.error(err?.message || 'Network error. Please try again.')
		} finally {
			setVerifyingOtp(false)
		}
	}

	const handleSubmit = async (event) => {
		event.preventDefault()

		if (!fullName.trim()) {
			toast.error("Full name is required")
			return
		}

		const normalizedEmail = email.trim().toLowerCase()
		if (!normalizedEmail) {
			toast.error("Email address is required")
			return
		}

		const emailLooksValid = /^\S+@\S+\.\S+$/.test(normalizedEmail)
		if (!emailLooksValid) {
			toast.error("Please enter a valid email address")
			return
		}

		// Admin doesn't need email verification
		if (accountType !== 'admin' && !otpVerified) {
			toast.error("Please verify your email with OTP first")
			return
		}

		if (!organization.trim()) {
			toast.error("Organization is required")
			return
		}

		if (!password) {
			toast.error("Password is required")
			return
		}

		if (!confirmPassword) {
			toast.error("Please confirm your password")
			return
		}

		if (password !== confirmPassword) {
			toast.error("Passwords do not match")
			return
		}

		try {
			let uploadedPhotoUrl
			if (photoFile) {
				const result = await uploadAvatar(photoFile)
				uploadedPhotoUrl = result?.url
			}

			await signup({
				email: normalizedEmail,
				password,
				role: accountType,
				fullName: fullName.trim(),
				organization: organization.trim(),
				photoUrl: uploadedPhotoUrl,
				emailVerified: true,
			})
		} catch (err) {
			toast.error(err?.message || 'Signup failed')
			return
		}

		navigate('/login', { state: { message: 'Successfully signed up' } })
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

					<div className="flex items-center gap-3">
						<Button
							type="button"
							onClick={() => setAccountType("technician")}
							className={
								"h-9 rounded-md px-4 " +
								(accountType === "technician"
									? "bg-[#5B89B1] text-white hover:bg-[#4a7294]"
									: "bg-neutral-200 text-neutral-900 hover:bg-neutral-300")
							}>
							Technician
						</Button>
						<Button
							type="button"
							onClick={() => setAccountType("engineer")}
							className={
								"h-9 rounded-md px-4 " +
								(accountType === "engineer"
									? "bg-[#5B89B1] text-white hover:bg-[#4a7294]"
									: "bg-neutral-200 text-neutral-900 hover:bg-neutral-300")
							}>
							Engineer
						</Button>
						<Button
							type="button"
							onClick={() => setAccountType("admin")}
							className={
								"h-9 rounded-md px-4 " +
								(accountType === "admin"
									? "bg-purple-600 text-white hover:bg-purple-700"
									: "bg-neutral-200 text-neutral-900 hover:bg-neutral-300")
							}>
							Admin
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-10">
				<Card className="w-full max-w-xl overflow-hidden border-none bg-neutral-200 shadow-none">
					<CardHeader className="relative bg-slate-800 px-8 py-6 text-white">
						<div className="flex items-start gap-3">
							<div className="mt-1 grid h-8 w-8 place-content-center rounded-md bg-white/10">
								<Wrench className="h-5 w-5" />
							</div>
							<div>
								<CardTitle className="text-4xl font-extrabold leading-none">Sign Up</CardTitle>
								<div className="mt-1 text-sm text-white/80">{accountLabel} Account</div>
							</div>
						</div>

						<img
							src="/assets/mtbm/bolt.png"
							alt=""
							className="pointer-events-none absolute -right-4 -top-6 h-28 w-28 rotate-12 opacity-95"
						/>
					</CardHeader>

					<CardContent className="px-10 py-8">
						<form className="space-y-5" onSubmit={handleSubmit}>
							<div className="space-y-2">
								<label className="text-xs font-semibold text-neutral-800">Full Name</label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
									<Input
										type="text"
										placeholder="Enter your full name"
										className="h-10 rounded-md border-neutral-400 bg-neutral-100 pl-10 text-sm"
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										required
										autoComplete="name"
									/>
								</div>
							</div>

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
										disabled={otpVerified && accountType !== 'admin'}
									/>
								</div>
								{accountType !== 'admin' && !otpVerified && (
									<Button
										type="button"
										onClick={handleSendOtp}
										disabled={sendingOtp || !email.trim()}
										className="mt-2 h-9 w-full rounded-md bg-[#5B89B1] text-white hover:bg-[#4a7294]"
									>
										{sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send Verification Code"}
									</Button>
								)}
								{accountType !== 'admin' && otpVerified && (
									<p className="text-xs text-green-600 font-medium mt-1">✓ Email verified</p>
								)}
								{accountType === 'admin' && (
									<p className="text-xs text-purple-600 font-medium mt-1">Admin accounts don't require email verification</p>
								)}
							</div>

							{accountType !== 'admin' && otpSent && !otpVerified && (
								<div className="space-y-2">
									<label className="text-xs font-semibold text-neutral-800">Enter Verification Code</label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
										<Input
											type="text"
											placeholder="6-digit code"
											className="h-10 rounded-md border-neutral-400 bg-neutral-100 pl-10 text-sm"
											value={otp}
											onChange={(e) => setOtp(e.target.value)}
											maxLength={6}
											required
										/>
									</div>
									<Button
										type="button"
										onClick={handleVerifyOtp}
										disabled={verifyingOtp || otp.length !== 6}
										className="mt-2 h-9 w-full rounded-md bg-green-600 text-white hover:bg-green-700"
									>
										{verifyingOtp ? "Verifying..." : "Verify Code"}
									</Button>
									<p className="text-[11px] text-neutral-600">Check your email inbox for the verification code. It expires in 10 minutes.</p>
								</div>
							)}

							<div className="space-y-2">
								<label className="text-xs font-semibold text-neutral-800">Organization</label>
								<div className="relative">
									<Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
									<Input
										type="text"
										placeholder="Your company name"
										className="h-10 rounded-md border-neutral-400 bg-neutral-100 pl-10 text-sm"
										value={organization}
										onChange={(e) => setOrganization(e.target.value)}
										required
										autoComplete="organization"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-xs font-semibold text-neutral-800">Photo (Optional)</label>
								<input
									ref={photoInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
								/>
								<div className="h-10 w-full rounded-md border border-neutral-400 bg-neutral-100 px-3 text-sm text-neutral-700 flex items-center justify-between">
									<span className="flex items-center gap-2">
										<User className="h-4 w-4 text-neutral-700" />
										<span>{photoFile ? "Photo selected" : "Choose a photo"}</span>
									</span>
									<button
										type="button"
										onClick={() => photoInputRef.current?.click()}
										className="cursor-pointer hover:text-neutral-900"
									>
										<Image className="h-4 w-4 text-neutral-700" />
									</button>
								</div>
								<p className="text-[11px] text-neutral-600">Max size 2MB. If you skip this, a default icon will be used.</p>
							</div>

							<div className="space-y-2">
								<label className="text-xs font-semibold text-neutral-800">Password</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
									<Input
										type="password"
										placeholder="••••••••"
										className="h-10 rounded-md border-neutral-400 bg-neutral-100 pl-10 text-sm"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
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
								className="mt-2 h-11 w-full rounded-md bg-[#5B89B1] text-white hover:bg-[#4a7294]"
							>
								Create {accountLabel} Account
							</Button>

							<p className="text-center text-[11px] font-semibold text-neutral-800">
								Already have an account?{" "}
								<Link to="/login" className="text-blue-700">
									Sign in
								</Link>
							</p>
						</form>
					</CardContent>
				</Card>
			</main>
		</div>
	)
}

export default Signup
