import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Menu,
  X,
  Mail,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  Check,
  BadgePercent,
  Wallet,
  ShieldCheck,
  Truck,
  Timer,
  CreditCard,
  Building2,
  Lock,
  ArrowLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import Toast from "@/components/ui/toast"
import { API_BASE_URL } from "@/lib/auth"

const Landing = () => {
  const tabs = useMemo(
    () => [
      { key: "overview", label: "Overview" },
      { key: "exploded", label: "Exploded view" },
      { key: "navigation", label: "Navigation system" },
      { key: "propulsion", label: "Propulsion" },
      { key: "cutterhead", label: "Cutterhead" },
      { key: "muck", label: "Muck Removal System" },
    ],
    []
  )

  const [activeTab, setActiveTab] = useState("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})
  const location = useLocation()
  const [toastMessage, setToastMessage] = useState(location.state?.message || '')

  // Meeting booking
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [meetingLoading, setMeetingLoading] = useState(false)
  const [meetingForm, setMeetingForm] = useState({
    name: "", email: "", phone: "", preferredDate: "", preferredTime: "", message: ""
  })
  const [rentalOpen, setRentalOpen] = useState(false)

  // Payment modal
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentPackage, setPaymentPackage] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [paymentStep, setPaymentStep] = useState(1)
  const [paymentForm, setPaymentForm] = useState({
    name: "", email: "", phone: "", cardNumber: "", expiry: "", cvv: "", bkashNumber: "", nagadNumber: "", bankName: ""
  })
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const packagePrices = {
    "Starter Lease": "৳ 7,50,000",
    "Growth Lease": "৳ 5,90,000",
    "Enterprise Lease": "Custom",
  }

  const openPayment = (packageName) => {
    setPaymentPackage(packageName)
    setPaymentMethod(null)
    setPaymentStep(1)
    setPaymentForm({ name: "", email: "", phone: "", cardNumber: "", expiry: "", cvv: "", bkashNumber: "", nagadNumber: "", bankName: "" })
    setPaymentProcessing(false)
    setPaymentSuccess(false)
    setPaymentOpen(true)
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    setPaymentProcessing(true)
    setTimeout(() => {
      setPaymentProcessing(false)
      setPaymentSuccess(true)
    }, 2500)
  }

  const [serviceChatOpen, setServiceChatOpen] = useState(false)
  const [serviceChatInput, setServiceChatInput] = useState("")
  const [serviceChatMessages, setServiceChatMessages] = useState([
    { role: "bot", text: "Hi! I’m the MTBM service assistant. Ask me anything about rentals, pricing, or support." }
  ])

  const handleMeetingChange = (e) => {
    setMeetingForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleMeetingSubmit = async (e) => {
    e.preventDefault()
    setMeetingLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingForm),
      })
      const data = await res.json()
      if (res.ok) {
        setToastMessage("Meeting request sent! Check your email for confirmation.")
        setMeetingOpen(false)
        setMeetingForm({ name: "", email: "", phone: "", preferredDate: "", preferredTime: "", message: "" })
      } else {
        setToastMessage(data.message || "Failed to send. Please try again.")
      }
    } catch {
      setToastMessage("Server is not reachable. Please try again later.")
    } finally {
      setMeetingLoading(false)
    }
  }

  const handleRentalCta = (packageName) => {
    openPayment(packageName)
  }

  const getServiceReply = (question) => {
    const normalized = question
      .toLowerCase()
      .replace(/[^a-z0-9\u0980-\u09ff\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    const has = (...terms) => terms.some((t) => normalized.includes(t))
    const hasBanglaScript = /[\u0980-\u09ff]/.test(question)
    const banglishHints = [
      "eta",
      "kivabe",
      "ki vabe",
      "kaj kore",
      "koto",
      "dorkar",
      "thakbe",
      "ache",
      "booking",
      "price koto",
      "rent koto",
      "support hobe",
    ]
    const hasBanglish = banglishHints.some((t) => normalized.includes(t))
    const isEnglishOnly = !hasBanglaScript && !hasBanglish

    const reply = {
      en: {
        whatIs: "This is the MTBM (Micro Tunnel Boring Machine) rental/service system. It’s used for underground utility tunneling.",
        howWorks:
          "It cuts soil with a cutterhead, stays on track using navigation sensors, and removes muck via slurry/screw systems while installing pipe segments.",
        greet: "Hello! How can I help you with MTBM rentals or service today?",
        price: "Rental starts from monthly packages. We provide a detailed quote based on project length and site conditions.",
        emi: "Yes, EMI is available for 3–12 months depending on the package.",
        package: "We offer Starter (30 days), Growth (90 days), and Enterprise (custom) rental packages.",
        support: "Onsite engineer support and operator training are included in Growth and Enterprise packages.",
        maintenance: "Regular maintenance and priority support are included based on the package.",
        delivery: "We can deliver and set up within 72 hours after confirmation.",
        location: "We support projects across Bangladesh with nationwide delivery and setup.",
        availability: "Availability depends on your dates and project scope. Share your timeline and we’ll confirm quickly.",
        booking: "To book, please share your project location, duration, and preferred start date.",
        contact: "Email: bored.tunnelers.bd@gmail.com — we respond quickly.",
        mtbm: "MTBM stands for Micro Tunnel Boring Machine, used for underground utility tunnels with minimal surface disruption.",
        fallback: "Thanks! Please share your project location and duration, and we’ll guide you further.",
      },
      bn: {
        whatIs: "এটা MTBM (Micro Tunnel Boring Machine) সার্ভিস/রেন্টাল সিস্টেম। এটি ভূগর্ভে পাইপলাইন/টানেল বসাতে ব্যবহার হয়।",
        howWorks:
          "মেশিনটি কাটারহেড দিয়ে মাটি কাটে, নেভিগেশন সিস্টেম দিয়ে সোজা পথ ধরে, আর স্লারি/স্ক্রু সিস্টেমে মাটি বের করে। পাইপ সেকশন বসিয়ে টানেল সম্পন্ন হয়।",
        greet: "হ্যালো! MTBM রেন্টাল/সার্ভিস বিষয়ে কী জানতে চান?",
        price: "রেন্টাল শুরু হয় মাসিক প্যাকেজ থেকে। প্রজেক্টের সময়কাল ও সাইট কন্ডিশন অনুযায়ী বিস্তারিত কোট দেওয়া হয়।",
        emi: "জি, প্যাকেজ অনুযায়ী ৩–১২ মাসের EMI/কিস্তি সুবিধা আছে।",
        package: "আমাদের Starter (৩০ দিন), Growth (৯০ দিন), এবং Enterprise (কাস্টম) প্যাকেজ আছে।",
        support: "Growth ও Enterprise প্যাকেজে onsite engineer support এবং operator training থাকে।",
        maintenance: "রেগুলার মেইনটেনেন্স ও প্রাইওরিটি সাপোর্ট প্যাকেজ অনুযায়ী অন্তর্ভুক্ত থাকে।",
        delivery: "কনফার্মেশন হলে ৭২ ঘণ্টার মধ্যে ডেলিভারি ও সেটআপ করা যায়।",
        location: "বাংলাদেশের যেকোনো জায়গায় আমরা ডেলিভারি ও সেটআপ সাপোর্ট দিই।",
        availability: "আপনার তারিখ ও প্রজেক্ট স্কোপ অনুযায়ী availability নিশ্চিত করা হয়। timeline দিলে দ্রুত জানিয়ে দেবো।",
        booking: "Booking করতে হলে project location, duration, আর preferred start date জানান।",
        contact: "Email: bored.tunnelers.bd@gmail.com — দ্রুত রিপ্লাই পাবেন।",
        mtbm: "MTBM মানে Micro Tunnel Boring Machine — এটি ভূগর্ভে ইউটিলিটি টানেল বানাতে ব্যবহার হয়।",
        fallback: "ধন্যবাদ! আপনার প্রজেক্ট লোকেশন ও ডিউরেশন জানালে আরও সাহায্য করতে পারবো।",
      },
      banglish: {
        whatIs: "Eta MTBM (Micro Tunnel Boring Machine) rental/service system. Eta underground pipeline/tunnel er jonno use hoy.",
        howWorks:
          "Cutterhead diye mati kate, navigation system diye track follow kore, ar slurry/screw system diye muck ber kore. Pipe segment boshano hoy.",
        greet: "Hi! MTBM rental/service niye ki jante chan?",
        price: "Rental monthly package theke start. Project duration ar site condition onujayi detailed quote dey.",
        emi: "Haan, package onujayi 3–12 maser EMI/kisti ache.",
        package: "Starter (30 days), Growth (90 days), ar Enterprise (custom) package ache.",
        support: "Growth ar Enterprise package e onsite engineer support ar operator training thake.",
        maintenance: "Regular maintenance ar priority support package onujayi include thake.",
        delivery: "Confirmation er por 72 ghontar moddhe delivery/setup kora jay.",
        location: "Bangladesh er jekono jaygay delivery/setup support diye thaki.",
        availability: "Apnar date ar project scope onujayi availability confirm kora hoy. Timeline dile quickly janabo.",
        booking: "Booking er jonno project location, duration, ar preferred start date janan.",
        contact: "Email: bored.tunnelers.bd@gmail.com — quickly reply paben.",
        mtbm: "MTBM mane Micro Tunnel Boring Machine — underground utility tunnel er jonno use hoy.",
        fallback: "Thanks! Project location ar duration janale better guide korte parbo.",
      },
    }

    const lang = hasBanglaScript ? "bn" : hasBanglish ? "banglish" : "en"
    const r = reply[lang]

    if (has("eta ki", "what is this", "what is it", "ki eta", "what is", "ki?")) return r.whatIs
    if (
      has(
        "kivabe kaj kore",
        "ki vabe kaj kore",
        "how does it work",
        "how it works",
        "work kore kivabe"
      )
    ) return r.howWorks
    if (has("hello", "hi", "assalam", "salam", "hey", "yo", "হ্যালো", "হাই", "আসসালাম")) return r.greet
    if (has("who are you", "who r u", "আপনি কে", "apni ke", "tumi ke", "who you")) {
      return lang === "en"
        ? "I’m the MTBM service assistant. I can help with rentals, pricing, EMI, and support."
        : lang === "bn"
          ? "আমি MTBM সার্ভিস অ্যাসিস্ট্যান্ট। রেন্টাল, প্রাইসিং, EMI ও সাপোর্ট বিষয়ে সাহায্য করি।"
          : "Ami MTBM service assistant. Rental, pricing, EMI ar support niye help kori."
    }
    if (has("help", "support", "help me", "sahajjo", "সাহায্য", "help lagbe")) {
      return lang === "en"
        ? "Tell me what you need: rental price, EMI, booking, delivery, or support."
        : lang === "bn"
          ? "কী জানতে চান বলুন: রেন্টাল প্রাইস, EMI, বুকিং, ডেলিভারি, বা সাপোর্ট।"
          : "Ki jante chan bolen: rental price, EMI, booking, delivery, ba support.";
    }
    if (has("working hours", "office time", "koto khon", "সময়", "office")) {
      return lang === "en"
        ? "We respond quickly during business hours. You can also email us anytime."
        : lang === "bn"
          ? "বিজনেস আওয়ারে দ্রুত রিপ্লাই পাওয়া যায়। যেকোনো সময় ইমেইল করতে পারেন।"
          : "Business hour e quick reply pai. Jekono shomoy email korte paren.";
    }
    if (has("price", "cost", "rate", "rent", "ভাড়া", "দাম", "মূল্য")) return r.price
    if (has("emi", "installment", "কিস্তি", "ইএমআই")) return r.emi
    if (has("package", "plan", "প্যাকেজ", "প্ল্যান")) return r.package
    if (has("details", "detail", "information", "info", "বিস্তারিত", "ডিটেইলস", "detail chai", "details chai")) {
      return lang === "en"
        ? "Packages: Starter (30 days, remote monitoring, 2-day training), Growth (90 days, onsite engineer, spare kits, priority maintenance), Enterprise (custom, dedicated field team, 24/7 monitoring). Services: delivery & setup, safety compliance, maintenance, and EMI options."
        : lang === "bn"
          ? "প্যাকেজ ডিটেইলস: Starter (৩০ দিন, রিমোট মনিটরিং, ২ দিনের ট্রেনিং), Growth (৯০ দিন, onsite engineer, spare kits, priority maintenance), Enterprise (কাস্টম, ডেডিকেটেড টিম, 24/7 মনিটরিং)। সার্ভিস: ডেলিভারি ও সেটআপ, সেফটি কমপ্লায়েন্স, মেইনটেনেন্স, EMI অপশন।"
          : "Package details: Starter (30 din, remote monitoring, 2-day training), Growth (90 din, onsite engineer, spare kits, priority maintenance), Enterprise (custom, dedicated team, 24/7 monitoring). Service: delivery/setup, safety compliance, maintenance, EMI option.";
    }
    if (has("support", "engineer", "training", "সাপোর্ট", "ইঞ্জিনিয়ার", "ট্রেনিং")) return r.support
    if (has("maintenance", "service", "মেইনটেনেন্স", "সার্ভিস")) return r.maintenance
    if (has("delivery", "setup", "time", "ডেলিভারি", "সেটআপ", "সময়")) return r.delivery
    if (has("location", "site", "dhaka", "district", "লোকেশন", "সাইট", "ঢাকা", "জেলা")) return r.location
    if (has("availability", "available", "slot", "পাওয়া যাবে")) return r.availability
    if (has("book", "booking", "confirm", "বুকিং", "কনফার্ম")) return r.booking
    if (has("contact", "email", "phone", "call", "যোগাযোগ", "ইমেইল", "ফোন")) return r.contact
    if (has("what is mtbm", "mtbm", "এমটিবিএম")) return r.mtbm

    return r.fallback
  }

  const handleServiceSend = (e) => {
    e.preventDefault()
    const text = serviceChatInput.trim()
    if (!text) return
    setServiceChatMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "bot", text: getServiceReply(text) },
    ])
    setServiceChatInput("")
  }

  const handleServiceQuick = (text) => {
    setServiceChatMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "bot", text: getServiceReply(text) },
    ])
  }

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      <header className="w-full bg-neutral-900/80">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 sm:px-6 py-3 sm:py-4">
          <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-full bg-neutral-800">
            <img
              src="/assets/mtbm/logo.png"
              alt="MTBM logo"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 overflow-x-auto">
            <div className="mx-auto flex min-w-max items-center justify-center gap-2 lg:gap-3">
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={
                      "h-9 rounded-md px-3 lg:px-5 text-xs lg:text-sm font-semibold transition-colors " +
                      (isActive
                        ? "bg-[#5B89B1] text-black"
                        : "bg-neutral-200 text-neutral-900 hover:bg-neutral-300")
                    }>
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </nav>

          <div className="flex-1 md:flex-none" />

          <Button
            onClick={() => setMeetingOpen(true)}
            className="hidden sm:inline-flex h-9 rounded-md bg-orange-500 px-4 lg:px-5 text-sm text-white hover:bg-orange-600 cursor-pointer">
            Book a Meeting
          </Button>
          <Button
            asChild
            className="hidden sm:inline-flex h-9 rounded-md bg-[#5B89B1] px-4 lg:px-6 text-sm text-black hover:bg-[#4a7294]">
            <Link to="/login">Sign in</Link>
          </Button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white hover:bg-neutral-800 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-800 px-4 py-3 space-y-2">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => { setActiveTab(tab.key); setMobileMenuOpen(false); }}
                  className={
                    "block w-full text-left rounded-md px-4 py-2 text-sm font-semibold transition-colors " +
                    (isActive
                      ? "bg-[#5B89B1] text-black"
                      : "text-neutral-300 hover:bg-neutral-800")
                  }>
                  {tab.label}
                </button>
              )
            })}
            <button onClick={() => { setMeetingOpen(true); setMobileMenuOpen(false); }} className="block w-full text-center rounded-md px-4 py-2 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600">
              Book a Meeting
            </button>
            <Link to="/login" className="block w-full text-center rounded-md px-4 py-2 text-sm font-semibold bg-[#5B89B1] text-black hover:bg-[#4a7294]" onClick={() => setMobileMenuOpen(false)}>
              Sign in to dashboard
            </Link>
          </div>
        )}
      </header>

      <main className="w-full">
        {activeTab === "overview" && (
          <div className="w-full">
            <div className="mx-auto w-full max-w-7xl px-6 py-10">
              <section className="grid gap-6 sm:gap-8 md:grid-cols-2 md:items-center">
                <div className="pt-4 sm:pt-8 group cursor-pointer">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-400 md:text-3xl transition-transform duration-300 md:group-hover:scale-110 origin-left">
                    Bangladesh&apos;s 1st home-
                    <br />
                    grown Micro Tunnel Boring
                    <br />
                    Machine (MTBM)
                    <svg
                      className="ml-2 inline-block h-5 w-6"
                      viewBox="0 0 300 200"
                      xmlns="http://www.w3.org/2000/svg"
                      role="img"
                      aria-label="Bangladesh flag"
                    >
                      <title>Bangladesh</title>
                      <rect width="300" height="200" fill="#006A4E" />
                      <circle cx="140" cy="100" r="48" fill="#F42A41" />
                    </svg>
                  </h1>
                </div>

                <div className="flex justify-center md:justify-end group cursor-pointer">
                  <img
                    src="/assets/mtbm/landing/overview-hero.png.jpeg"
                    alt="MTBM"
                    className="w-full max-w-xl transition-transform duration-300 md:group-hover:scale-110 origin-right"
                  />
                </div>
              </section>
            </div>

            <section className="w-full bg-black text-white">
              <div className="grid w-full gap-0 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                <video
                  className="w-full h-full bg-black"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/assets/mtbm/landing/Animation.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                <div className="px-6 py-12 max-w-7xl flex flex-col items-center text-center">
                  <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-white animate-in fade-in slide-in-from-left-8 duration-700">
                    Introduction to
                    <br />
                    Micro Tunnel Boring
                    <br />
                    Machine (MTBM)
                  </h2>
                  <button
                    onClick={() => toggleSection("overview-intro")}
                    className="inline-block mt-5 px-5 py-2.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold animate-in fade-in slide-in-from-left-8 duration-700 delay-150"
                  >
                    {expandedSections["overview-intro"] ? "See Less" : "See More"}
                  </button>
                  {expandedSections["overview-intro"] && (
                    <p className="mt-5 max-w-md text-sm leading-6 text-neutral-300">
                      A Micro Tunnel Boring Machine (MTBM) is a stack,
                      remotely operated machine that works deep
                      underground for utilities water, sewer, gas, comms
                      without disturbing the surface, using laser guidance
                      for precision, making it safer, for urban areas,
                      crossings under railways and environmentally
                      sensitive spots by excavating soil and installing pipe
                      sections simultaneously.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Rental Option */}
            {rentalOpen && (
              <section className="w-full bg-neutral-950 border-t border-neutral-800">
                <div className="mx-auto w-full max-w-7xl px-6 py-12">
                  <>
                    <div className="grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 flex flex-col">
                    <h3 className="text-lg font-bold">Starter Lease</h3>
                    <p className="text-sm text-neutral-400 mt-1">Short-term pilot projects</p>
                    <div className="mt-6 text-3xl font-extrabold text-white">৳ 7.5L<span className="text-xs font-semibold text-neutral-400">/month</span></div>
                    <ul className="mt-6 space-y-3 text-sm text-neutral-300">
                      <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-0.5" />Up to 30 days deployment</li>
                      <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-0.5" />Remote monitoring dashboard</li>
                      <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-0.5" />Operator training (2 days)</li>
                    </ul>
                    <div className="mt-6 rounded-xl bg-neutral-800/60 p-4 text-xs text-neutral-300">
                      <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-orange-400" />EMI available for 3-6 months</div>
                    </div>
                    <Button
                      onClick={() => handleRentalCta("Starter Lease")}
                      className="mt-6 bg-orange-500 text-white hover:bg-orange-600"
                    >
                      Pay Now
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-orange-500/50 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 flex flex-col shadow-[0_0_40px_rgba(255,122,0,0.15)]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">Growth Lease</h3>
                      <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-300">Most Popular</span>
                    </div>
                    <p className="text-sm text-neutral-400 mt-1">Standard utility & city projects</p>
                    <div className="mt-6 text-3xl font-extrabold text-white">৳ 5.9L<span className="text-xs font-semibold text-neutral-400">/month</span></div>
                    <ul className="mt-6 space-y-3 text-sm text-neutral-300">
                      <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-0.5" />Up to 90 days deployment</li>
                      <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-0.5" />Onsite engineer support</li>
                      <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-0.5" />Spare kits included</li>
                      <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-0.5" />Priority maintenance</li>
                    </ul>
                    <div className="mt-6 grid gap-3">
                      <div className="rounded-xl bg-orange-500/10 border border-orange-500/40 p-4 text-xs text-orange-200">
                        <div className="flex items-center gap-2"><BadgePercent className="h-4 w-4" />Special discount for government & NGO projects</div>
                      </div>
                      <div className="rounded-xl bg-neutral-800/60 p-4 text-xs text-neutral-300">
                        <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-orange-400" />EMI available for 6-12 months</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRentalCta("Growth Lease")}
                      className="mt-6 bg-orange-500 text-white hover:bg-orange-600"
                    >
                      Pay Now
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 flex flex-col">
                    <h3 className="text-lg font-bold">Enterprise Lease</h3>
                    <p className="text-sm text-neutral-400 mt-1">Large infrastructure programs</p>
                    <div className="mt-6 text-3xl font-extrabold text-white">Custom<span className="text-xs font-semibold text-neutral-400">/month</span></div>
                    <ul className="mt-6 space-y-3 text-sm text-neutral-300">
                      <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-0.5" />Multi-site deployment</li>
                      <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-0.5" />Dedicated field team</li>
                      <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-0.5" />Custom cutterhead setup</li>
                      <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-0.5" />24/7 monitoring</li>
                    </ul>
                    <div className="mt-6 rounded-xl bg-neutral-800/60 p-4 text-xs text-neutral-300">
                      <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-orange-400" />EMI & milestone billing available</div>
                    </div>
                    <Button
                      onClick={() => handleRentalCta("Enterprise Lease")}
                      className="mt-6 bg-neutral-100 text-neutral-900 hover:bg-white"
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
                    <div className="flex items-center gap-3 text-sm text-neutral-200">
                      <Truck className="h-5 w-5 text-orange-400" />
                      Nationwide delivery & setup
                    </div>
                  </div>
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
                    <div className="flex items-center gap-3 text-sm text-neutral-200">
                      <ShieldCheck className="h-5 w-5 text-orange-400" />
                      Safety compliance & insurance
                    </div>
                  </div>
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
                    <div className="flex items-center gap-3 text-sm text-neutral-200">
                      <Timer className="h-5 w-5 text-orange-400" />
                      Fast deployment in 72 hours
                    </div>
                  </div>
                </div>
                  </>
                </div>
              </section>
            )}

            {/* Contact & Address */}
            <section className="w-full border-t border-neutral-800 bg-neutral-950">
              <div className="mx-auto w-full max-w-7xl px-6 py-10">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                  <div className="order-1 sm:order-none">
                    <Button
                      onClick={() => setRentalOpen((prev) => !prev)}
                      className="h-9 rounded-md bg-[#5B89B1] px-4 text-sm text-black hover:bg-[#4a7294]"
                    >
                      {rentalOpen ? "Hide Rental Options" : "Rental Options"}
                    </Button>
                  </div>
                  <a
                    href="mailto:bored.tunnelers.bd@gmail.com"
                    className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-full bg-neutral-800 group-hover:bg-[#5B89B1]/20 flex items-center justify-center transition-colors">
                      <Mail className="h-5 w-5 text-[#5B89B1]" />
                    </div>
                    <span className="text-sm">bored.tunnelers.bd@gmail.com</span>
                  </a>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-[#5B89B1]" />
                    </div>
                    <span className="text-sm">116(Kha), Tejgaon Industrial Area, Dhaka, Bangladesh -1208</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setServiceChatOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-md bg-neutral-800 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
                  >
                    <MessageSquare className="h-4 w-4 text-orange-400" />
                    Service
                  </button>
                </div>
              </div>
            </section>

            {serviceChatOpen && (
              <div className="fixed bottom-4 right-4 z-50 w-[92vw] max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <MessageSquare className="h-4 w-4 text-orange-400" />
                    Service Assistant
                  </div>
                  <button
                    type="button"
                    onClick={() => setServiceChatOpen(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-3">
                  {serviceChatMessages.map((msg, idx) => (
                    <div
                      key={`${msg.role}-${idx}`}
                      className={
                        "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-5 " +
                        (msg.role === "user"
                          ? "ml-auto bg-[#5B89B1] text-black"
                          : "bg-neutral-800 text-neutral-200")
                      }
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 px-4 pb-3">
                  {[
                    "Rental price?",
                    "EMI available?",
                    "Engineer support?",
                    "Delivery time?",
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleServiceQuick(q)}
                      className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-300 hover:border-neutral-500"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleServiceSend} className="border-t border-neutral-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={serviceChatInput}
                      onChange={(e) => setServiceChatInput(e.target.value)}
                      placeholder="Type your question..."
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {activeTab === "exploded" && (
          <section className="w-full">
            <img
              src="/assets/mtbm/landing/exploded.png.jpeg"
              alt="Exploded view"
              className="w-full"
            />
          </section>
        )}

        {activeTab === "navigation" && (
          <section className="w-full">
            <div className="mx-auto w-full max-w-7xl px-6 py-10">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight animate-in fade-in slide-in-from-left-12 duration-700">
                  <span className="text-orange-500">NAVIGATION</span>
                  <br />
                  <span className="text-neutral-200">SYSTEM</span>
                </h1>
              </div>

              <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_3fr_1fr] lg:items-start">
                <div className="flex flex-col items-start">
                  <button
                    onClick={() => toggleSection("nav-intro")}
                    className="inline-block mb-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold"
                  >
                    {expandedSections["nav-intro"] ? "See Less" : "See More"}
                  </button>
                  {expandedSections["nav-intro"] && (
                    <p className="max-w-xl text-sm italic leading-7 text-neutral-400">
                      The navigation system of a micro tunnel boring machine (MTBM) is a
                      sophisticated arrangement of sensors and controls, primarily
                      designed to ensure the precise alignment and trajectory of the
                      machine within the tunneling project. It incorporates a
                      combination of laser guidance, gyroscopes, and inclinometers to
                      accurately determine the machine&apos;s position and orientation.
                      Laser guidance systems provide real-time feedback on the MTBM&apos;s
                      position in relation to a predefined tunnel path, enabling
                      adjustments to maintain the desired course.
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <div className="w-full max-w-6xl overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40">
                    <img
                      src="/assets/mtbm/landing/navigation.png.jpeg"
                      alt="Navigation system screen"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-start">
                  <button
                    onClick={() => toggleSection("nav-details")}
                    className="inline-block mb-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold"
                  >
                    {expandedSections["nav-details"] ? "See Less" : "See More"}
                  </button>
                  {expandedSections["nav-details"] && (
                    <p className="max-w-xl text-sm italic leading-7 text-neutral-400">
                      Gyroscopes and inclinometers help monitor the machine&apos;s pitch and
                      roll angles, ensuring that it remains on a stable and level
                      trajectory. This navigation system plays a crucial role in avoiding
                      deviations, reducing the risk of misalignment, and ensuring the
                      MTBM&apos;s successful advancement through the underground environment.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "propulsion" && (
          <section className="grid gap-6 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center text-center">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight animate-in fade-in slide-in-from-left-12 duration-700">
                <span className="text-neutral-500">PRO</span>
                <span className="text-orange-500">PULSION</span>
              </h1>

              <button
                onClick={() => toggleSection("prop-details")}
                className="mt-8 inline-block px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold"
              >
                {expandedSections["prop-details"] ? "See Less" : "See More"}
              </button>

              {expandedSections["prop-details"] && (
                <p className="mt-6 max-w-xl text-sm italic leading-7 text-neutral-400">
                  The propulsion system of a micro tunnel boring machine (MTBM) is a
                  complex mechanism designed for the controlled advancement of the
                  machine through the underground environment. It typically employs a
                  combination of hydraulic motors, gear drives, and thrust jacks to
                  provide the necessary thrust and rotation to the cutterhead. The
                  hydraulic motors are responsible for the rotation of the cutterhead,
                  allowing the cutting tools to bore through the geological material
                  efficiently. Thrust jacks generate the axial force required to propel
                  the MTBM forward, while the gear drives ensure the synchronized
                  movement of the cutterhead and the entire machine. This propulsion
                  system relies on precise control systems to adapt to changing
                  geological conditions, optimizing the rate of excavation and ensuring
                  the safe and efficient progression of the MTBM along the tunnel
                  path.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <img
                src="/assets/mtbm/landing/propulsion.png.jpeg"
                alt="Propulsion system"
                className="w-full h-auto object-contain"
              />
            </div>
          </section>
        )}

        {activeTab === "cutterhead" && (
          <section className="grid gap-6 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center text-center">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight animate-in fade-in slide-in-from-left-12 duration-700">
                <span className="text-neutral-500">CUTTER</span>
                <span className="text-orange-500">HEAD</span>
              </h1>

              <button
                onClick={() => toggleSection("cutter-details")}
                className="mt-8 inline-block px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold"
              >
                {expandedSections["cutter-details"] ? "See Less" : "See More"}
              </button>

              {expandedSections["cutter-details"] && (
                <p className="mt-6 max-w-xl text-sm italic leading-7 text-neutral-400">
                  The cutterhead of a micro tunnel boring machine (MTBM) serves as
                  the primary excavation component, featuring cutting tools such as
                  carbide disc cutters and roller cutters. This apparatus is
                  designed with adaptability in mind, as the configuration and tool
                  choice depend on the geological conditions at the tunneling site.
                  Driven by hydraulic or electric motors, the cutterhead rotates,
                  applying pressure and thrust to cut through abrasive materials like
                  rock or soil. Advanced monitoring and control systems enable
                  real-time adjustments, optimizing the cutting process. Maintenance
                  and replacement of worn tools are essential to sustain cutting
                  efficiency. The cutterhead is integral to successful tunneling
                  projects, with its design tailored to specific project requirements
                  and geological factors.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-8 lg:pt-10">
              <img
                src="/assets/mtbm/landing/cutterhead.png.jpeg"
                alt="Cutterhead"
                className="w-full max-w-md"
              />
            </div>
          </section>
        )}

        {activeTab === "muck" && (
          <section className="grid gap-6 sm:gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center text-center">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight animate-in fade-in slide-in-from-left-12 duration-700">
                <span className="text-orange-500">MUCK</span>
                <span className="text-neutral-500"> REMOVAL</span>
                <br />
                <span className="text-orange-500">SYSTEM</span>
              </h1>

              <button
                onClick={() => toggleSection("muck-intro")}
                className="mt-8 inline-block px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold"
              >
                {expandedSections["muck-intro"] ? "See Less" : "See More"}
              </button>
              {expandedSections["muck-intro"] && (
                <p className="mt-6 max-w-xl text-sm italic leading-7 text-neutral-400">
                  The muck removal system in a micro tunnel boring machine (MTBM) is
                  a crucial component responsible for the efficient transport of
                  excavated material, known as muck, from the tunnel face to the
                  surface. This system typically comprises a slurry or screw
                  conveyor, and it must be designed to handle the specific
                  geotechnical characteristics of the muck encountered during
                  tunneling. The muck removal process is often aided by pumps,
                  augers, and settling tanks, which separate solids from the slurry
                  for efficient disposal or reuse. Efficient muck removal is
                  paramount in maintaining the tunneling process&apos;s productivity and
                  preventing clogs and blockages. The design and configuration of the
                  muck removal system must align with the geological conditions and
                  project requirements to ensure seamless excavation and material
                  transport.
                </p>
              )}
            </div>

            <div className="pt-8 lg:pt-10 flex flex-col items-end">
              <img
                src="/assets/mtbm/landing/muck-removal.png.jpeg"
                alt="Muck removal system"
                className="w-full max-w-3xl"
              />
            </div>
          </section>
        )}
      </main>

      {/* Meeting Booking Modal */}
      {meetingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setMeetingOpen(false)}>
          <div
            className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMeetingOpen(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Book a Meeting</h2>
            <p className="text-sm text-neutral-400 mb-6">Fill in your details and we'll get back to you.</p>

            <form onSubmit={handleMeetingSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input name="name" type="text" required placeholder="Your Name *" value={meetingForm.name} onChange={handleMeetingChange}
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input name="email" type="email" required placeholder="Your Email *" value={meetingForm.email} onChange={handleMeetingChange}
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input name="phone" type="tel" placeholder="Phone (optional)" value={meetingForm.phone} onChange={handleMeetingChange}
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input name="preferredDate" type="date" required value={meetingForm.preferredDate} onChange={handleMeetingChange}
                    className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 [color-scheme:dark]" />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input name="preferredTime" type="time" required value={meetingForm.preferredTime} onChange={handleMeetingChange}
                    className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 [color-scheme:dark]" />
                </div>
              </div>

              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <textarea name="message" placeholder="Message (optional)" rows={3} value={meetingForm.message} onChange={handleMeetingChange}
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none" />
              </div>

              <button type="submit" disabled={meetingLoading}
                className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {meetingLoading ? "Sending..." : "Send Meeting Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SSLCommerz-style Payment Modal */}
      {paymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={() => setPaymentOpen(false)}>
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                {paymentStep > 1 && !paymentSuccess && (
                  <button onClick={() => { setPaymentStep(1); setPaymentMethod(null); }} className="text-neutral-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-400" /> Secure Payment
                  </h2>
                  <p className="text-xs text-neutral-400">Powered by SSLCommerz</p>
                </div>
              </div>
              <button onClick={() => setPaymentOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="mx-6 mt-4 rounded-xl bg-neutral-800/60 border border-neutral-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400">Package</p>
                  <p className="text-sm font-semibold text-white">{paymentPackage}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-400">Amount</p>
                  <p className="text-lg font-bold text-orange-400">{packagePrices[paymentPackage]}<span className="text-xs text-neutral-400 font-normal">/month</span></p>
                </div>
              </div>
            </div>

            {/* Success Screen */}
            {paymentSuccess && (
              <div className="px-6 py-10 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
                <p className="text-sm text-neutral-400 mt-2">Your {paymentPackage} rental has been confirmed. Check your email for details.</p>
                <p className="text-xs text-neutral-500 mt-3">Transaction ID: MTBM-{Date.now().toString(36).toUpperCase()}</p>
                <Button onClick={() => setPaymentOpen(false)} className="mt-6 bg-orange-500 text-white hover:bg-orange-600">Done</Button>
              </div>
            )}

            {/* Processing Screen */}
            {paymentProcessing && !paymentSuccess && (
              <div className="px-6 py-10 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-white">Processing Payment...</h3>
                <p className="text-sm text-neutral-400 mt-1">Please wait, do not close this window.</p>
              </div>
            )}

            {/* Step 1: Choose Payment Method */}
            {paymentStep === 1 && !paymentProcessing && !paymentSuccess && (
              <div className="px-6 py-5 space-y-4">
                <p className="text-sm font-semibold text-neutral-300">Select Payment Method</p>

                {/* Cards */}
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Cards</p>
                  <button
                    onClick={() => { setPaymentMethod("visa"); setPaymentStep(2); }}
                    className="w-full flex items-center gap-4 rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 hover:border-orange-500/50 hover:bg-neutral-800 transition-all group"
                  >
                    <div className="h-10 w-14 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-blue-700">VISA</div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">Visa Card</p>
                      <p className="text-xs text-neutral-400">Credit / Debit</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-orange-400" />
                  </button>
                  <button
                    onClick={() => { setPaymentMethod("mastercard"); setPaymentStep(2); }}
                    className="w-full flex items-center gap-4 rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 hover:border-orange-500/50 hover:bg-neutral-800 transition-all group"
                  >
                    <div className="h-10 w-14 rounded-lg bg-white flex items-center justify-center">
                      <div className="flex -space-x-2"><div className="h-6 w-6 rounded-full bg-red-500" /><div className="h-6 w-6 rounded-full bg-yellow-400 opacity-80" /></div>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">Mastercard</p>
                      <p className="text-xs text-neutral-400">Credit / Debit</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-orange-400" />
                  </button>
                </div>

                {/* Mobile Banking */}
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Mobile Banking</p>
                  <button
                    onClick={() => { setPaymentMethod("bkash"); setPaymentStep(2); }}
                    className="w-full flex items-center gap-4 rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 hover:border-orange-500/50 hover:bg-neutral-800 transition-all group"
                  >
                    <div className="h-10 w-14 rounded-lg bg-[#E2136E] flex items-center justify-center text-xs font-bold text-white">bKash</div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">bKash</p>
                      <p className="text-xs text-neutral-400">Mobile wallet</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-orange-400" />
                  </button>
                  <button
                    onClick={() => { setPaymentMethod("nagad"); setPaymentStep(2); }}
                    className="w-full flex items-center gap-4 rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 hover:border-orange-500/50 hover:bg-neutral-800 transition-all group"
                  >
                    <div className="h-10 w-14 rounded-lg bg-[#F6921E] flex items-center justify-center text-xs font-bold text-white">Nagad</div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">Nagad</p>
                      <p className="text-xs text-neutral-400">Mobile wallet</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-orange-400" />
                  </button>
                </div>

                {/* Internet Banking */}
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Internet Banking</p>
                  {["Dutch-Bangla Bank", "BRAC Bank", "City Bank", "Eastern Bank"].map((bank) => (
                    <button
                      key={bank}
                      onClick={() => { setPaymentMethod("bank"); setPaymentForm((p) => ({ ...p, bankName: bank })); setPaymentStep(2); }}
                      className="w-full flex items-center gap-4 rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 hover:border-orange-500/50 hover:bg-neutral-800 transition-all group"
                    >
                      <div className="h-10 w-14 rounded-lg bg-neutral-700 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-neutral-300" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white">{bank}</p>
                        <p className="text-xs text-neutral-400">Internet Banking</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-orange-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Payment Details Form */}
            {paymentStep === 2 && !paymentProcessing && !paymentSuccess && (
              <form onSubmit={handlePaymentSubmit} className="px-6 py-5 space-y-4">
                <p className="text-sm font-semibold text-neutral-300">
                  {paymentMethod === "bkash" ? "bKash Payment" : paymentMethod === "nagad" ? "Nagad Payment" : paymentMethod === "bank" ? `${paymentForm.bankName}` : paymentMethod === "visa" ? "Visa Card" : "Mastercard"}
                </p>

                {/* Common fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative col-span-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input type="text" required placeholder="Full Name *" value={paymentForm.name}
                      onChange={(e) => setPaymentForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input type="email" required placeholder="Email *" value={paymentForm.email}
                      onChange={(e) => setPaymentForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input type="tel" required placeholder="Phone *" value={paymentForm.phone}
                      onChange={(e) => setPaymentForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                </div>

                {/* Card fields */}
                {(paymentMethod === "visa" || paymentMethod === "mastercard") && (
                  <div className="space-y-3">
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <input type="text" required placeholder="Card Number *" maxLength={19} value={paymentForm.cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim()
                          setPaymentForm((p) => ({ ...p, cardNumber: v }))
                        }}
                        className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 tracking-widest" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" required placeholder="MM/YY *" maxLength={5} value={paymentForm.expiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "")
                          if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 4)
                          setPaymentForm((p) => ({ ...p, expiry: v }))
                        }}
                        className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-center tracking-widest" />
                      <input type="text" required placeholder="CVV *" maxLength={4} value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "") }))}
                        className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-center tracking-widest" />
                    </div>
                  </div>
                )}

                {/* bKash field */}
                {paymentMethod === "bkash" && (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#E2136E]" />
                    <input type="tel" required placeholder="bKash Number (01XXXXXXXXX) *" value={paymentForm.bkashNumber}
                      onChange={(e) => setPaymentForm((p) => ({ ...p, bkashNumber: e.target.value }))}
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#E2136E] focus:outline-none focus:ring-1 focus:ring-[#E2136E]" />
                  </div>
                )}

                {/* Nagad field */}
                {paymentMethod === "nagad" && (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#F6921E]" />
                    <input type="tel" required placeholder="Nagad Number (01XXXXXXXXX) *" value={paymentForm.nagadNumber}
                      onChange={(e) => setPaymentForm((p) => ({ ...p, nagadNumber: e.target.value }))}
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#F6921E] focus:outline-none focus:ring-1 focus:ring-[#F6921E]" />
                  </div>
                )}

                {/* Bank — no extra field, just submit */}

                <button type="submit"
                  className="w-full rounded-lg bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" />
                  Pay {packagePrices[paymentPackage]}
                </button>

                <div className="flex items-center justify-center gap-4 pt-2">
                  <Lock className="h-3 w-3 text-green-400" />
                  <span className="text-[10px] text-neutral-500">256-bit SSL Encrypted</span>
                  <span className="text-[10px] text-neutral-500">•</span>
                  <span className="text-[10px] text-neutral-500">PCI DSS Compliant</span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Landing
