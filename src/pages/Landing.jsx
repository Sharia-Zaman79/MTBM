import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import Toast from "@/components/ui/toast"

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
    </div>
  )
}

export default Landing
