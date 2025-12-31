import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Building2, Lock, Mail, User, Wrench } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from 'react-router-dom'

const Signup = () => {
	const [accountType, setAccountType] = useState("engineer")

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
								"h-9 rounded-md px-6 " +
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
								"h-9 rounded-md px-6 " +
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
								"h-9 rounded-md px-6 " +
								(accountType === "admin"
									? "bg-[#5B89B1] text-white hover:bg-[#4a7294]"
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
										<form className="space-y-5">
							<div className="space-y-2">
								<label className="text-xs font-semibold text-neutral-800">Full Name</label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
									<Input
										type="text"
										placeholder="Enter your full name"
										className="h-10 rounded-md border-neutral-400 bg-neutral-100 pl-10 text-sm"
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
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-xs font-semibold text-neutral-800">Organization</label>
								<div className="relative">
									<Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
									<Input
										type="text"
										placeholder="Your company name"
										className="h-10 rounded-md border-neutral-400 bg-neutral-100 pl-10 text-sm"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-xs font-semibold text-neutral-800">Password</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
									<Input
										type="password"
										placeholder="••••••••"
										className="h-10 rounded-md border-neutral-400 bg-neutral-100 pl-10 text-sm"
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
									/>
								</div>
							</div>

							<Button
								type="button"
								className="mt-2 h-11 w-full rounded-md bg-[#5B89B1] text-white hover:bg-[#4a7294]"
								onClick={() => navigate('/login', { state: { message: 'Successfully signed up' } })}
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
