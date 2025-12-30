import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"

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
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 py-4">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-800">
            <img
              src="/assets/mtbm/logo.png"
              alt="MTBM logo"
              className="h-full w-full object-cover"
            />
          </div>

          <nav className="flex-1 overflow-x-auto">
            <div className="mx-auto flex min-w-max items-center justify-center gap-3">
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={
                      "h-9 rounded-md px-5 text-sm font-semibold transition-colors " +
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

          <Button
            asChild
            className="h-9 rounded-md bg-[#5B89B1] px-6 text-black hover:bg-[#4a7294]">
            <Link to="/login">Sign in to dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        {activeTab === "overview" && (
          <div className="w-full">
            <section className="grid gap-8 md:grid-cols-2 md:items-center">
              <div className="pt-8">
                <h1 className="text-2xl font-semibold text-neutral-400 md:text-3xl">
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

              <div className="flex justify-end">
                <img
                  src="/assets/mtbm/landing/overview-hero.png.jpeg"
                  alt="MTBM"
                  className="w-full max-w-xl"
                />
              </div>
            </section>

            <section className="mt-10 bg-neutral-200 text-neutral-900">
              <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold leading-tight text-slate-800">
                    Introduction to
                    <br />
                    Micro Tunnel Boring
                    <br />
                    Machine (MTBM)
                  </h2>
                  <button
                    onClick={() => toggleSection("overview-intro")}
                    className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold"
                  >
                    {expandedSections["overview-intro"] ? "See Less" : "See More"}
                  </button>
                  {expandedSections["overview-intro"] && (
                    <p className="mt-4 max-w-sm text-xs leading-5 text-neutral-600">
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

                <div className="flex justify-center md:justify-end">
                  <div className="aspect-video w-full max-w-xl bg-black" />
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "exploded" && (
          <section className="w-full">
            <img
              src="/assets/mtbm/landing/exploded.png"
              alt="Exploded view"
              className="w-full"
            />
          </section>
        )}

        {activeTab === "navigation" && (
          <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h1 className="text-6xl font-extrabold tracking-tight">
                <span className="text-orange-500">NAVIGATION</span>
                <br />
                <span className="text-neutral-200">SYSTEM</span>
              </h1>

              <div className="mt-8">
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
            </div>

            <div className="pt-10 lg:pt-14">
              <img
                src="/assets/mtbm/landing/navigation.png"
                alt="Navigation system screen"
                className="w-full max-w-xl"
              />
              <button
                onClick={() => toggleSection("nav-details")}
                className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold"
              >
                {expandedSections["nav-details"] ? "See Less" : "See More"}
              </button>
              {expandedSections["nav-details"] && (
                <p className="mt-4 max-w-xl text-sm italic leading-7 text-neutral-400">
                  Gyroscopes and inclinometers help monitor the machine&apos;s pitch and
                  roll angles, ensuring that it remains on a stable and level
                  trajectory. This navigation system plays a crucial role in avoiding
                  deviations, reducing the risk of misalignment, and ensuring the
                  MTBM&apos;s successful advancement through the underground environment.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "propulsion" && (
          <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h1 className="text-6xl font-extrabold tracking-tight">
                <span className="text-neutral-500">PRO</span>
                <span className="text-orange-500">PULSION</span>
              </h1>

              <div className="mt-6">
                <img
                  src="/assets/mtbm/landing/propulsion.png"
                  alt="Propulsion system"
                  className="w-full max-w-2xl"
                />
              </div>
            </div>

            <div className="pt-14 lg:pt-20">
              <button
                onClick={() => toggleSection("prop-details")}
                className="inline-block mb-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold"
              >
                {expandedSections["prop-details"] ? "See Less" : "See More"}
              </button>
              {expandedSections["prop-details"] && (
                <p className="max-w-xl text-sm italic leading-7 text-neutral-400">
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
          </section>
        )}

        {activeTab === "cutterhead" && (
          <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <h1 className="text-6xl font-extrabold tracking-tight">
                <span className="text-neutral-500">CUTTER</span>
                <span className="text-orange-500">HEAD</span>
              </h1>

              <div className="mt-8">
                <button
                  onClick={() => toggleSection("cutter-details")}
                  className="inline-block mb-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold"
                >
                  {expandedSections["cutter-details"] ? "See Less" : "See More"}
                </button>
                {expandedSections["cutter-details"] && (
                  <p className="max-w-xl text-sm italic leading-7 text-neutral-400">
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
            </div>

            <div className="flex justify-end pt-8 lg:pt-10">
              <img
                src="/assets/mtbm/landing/cutterhead.png"
                alt="Cutterhead"
                className="w-full max-w-xl"
              />
            </div>
          </section>
        )}

        {activeTab === "muck" && (
          <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <h1 className="text-6xl font-extrabold tracking-tight">
                <span className="text-orange-500">MUCK</span>
                <span className="text-neutral-500"> REMOVAL</span>
                <br />
                <span className="text-orange-500">SYSTEM</span>
              </h1>

              <div className="mt-8">
                <button
                  onClick={() => toggleSection("muck-intro")}
                  className="inline-block mb-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold"
                >
                  {expandedSections["muck-intro"] ? "See Less" : "See More"}
                </button>
                {expandedSections["muck-intro"] && (
                  <p className="max-w-xl text-sm italic leading-7 text-neutral-400">
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
            </div>

            <div className="pt-8 lg:pt-10">
              <img
                src="/assets/mtbm/landing/muck-removal.png"
                alt="Muck removal system"
                className="w-full max-w-xl"
              />
              <button
                onClick={() => toggleSection("muck-details")}
                className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-semibold"
              >
                {expandedSections["muck-details"] ? "See Less" : "See More"}
              </button>
              {expandedSections["muck-details"] && (
                <p className="mt-4 max-w-xl text-sm italic leading-7 text-neutral-400">
                  The muck removal process is often aided by pumps, augers, and
                  settling tanks, which separate solids from the slurry for efficient
                  disposal or reuse. Efficient muck removal is paramount in maintaining
                  the tunneling process&apos;s productivity and preventing clogs and
                  blockages. The design and configuration of the muck removal system
                  must align with the geological conditions and project requirements to
                  ensure seamless excavation and material transport.
                </p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default Landing
