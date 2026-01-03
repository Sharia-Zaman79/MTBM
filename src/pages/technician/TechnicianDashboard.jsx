import { useState } from "react";
import { LogOut, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TechnicianDashboard = () => {
  const [activeTab, setActiveTab] = useState("repair-alerts");
  const navigate = useNavigate();

  // Mock data for repair alerts
  const repairAlerts = [
    {
      id: 1,
      subsystem: "Cutterhead",
      issue: "Overheating detected",
      timestamp: "10 mins ago",
      status: "pending",
    },
    {
      id: 2,
      subsystem: "Cutterhead",
      issue: "Blade wearing off",
      timestamp: "2 hours ago",
      status: "pending",
    },
    {
      id: 3,
      subsystem: "Slurry Pump",
      issue: "Leakage detected",
      timestamp: "1 week ago",
      status: "pending",
    },
  ];

  // Mock data for component wear
  const componentWear = [
    { component: "Cutter Blades", usage: 60 },
    { component: "Hydraulic Seals", usage: 50 },
    { component: "Drive Gearbox", usage: 76 },
    { component: "Slurry Pump", usage: 65 },
    { component: "Steering Platform", usage: 20 },
  ];

  // Mock data for repair jobs
  const repairJobs = [
    {
      id: 1,
      title: "Slurry System Leak",
      subsystem: "Muck Removal System",
      priority: "High",
      repairType: "Pipe Replacement",
      eta: "2 hrs",
      status: "In Progress",
      statusColor: "bg-orange-500",
    },
    {
      id: 2,
      title: "Blade wear-off",
      subsystem: "Cutterhead",
      priority: "High",
      repairType: "Blade Replacement",
      eta: "2 hrs",
      status: "Done",
      statusColor: "bg-green-500",
    },
  ];

  const handleAccept = (id) => {
    alert(`Accepted repair alert #${id}`);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const getWearColor = (usage) => {
    if (usage <= 30) return "bg-green-500";
    if (usage <= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Header */}
      <header className="w-full border-b border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-800">
              <img
                src="/assets/mtbm/logo.png"
                alt="MTBM logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold">Bored Tunnelers</h1>
              <p className="text-xs text-neutral-400">Technician Dashboard</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("repair-alerts")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "repair-alerts"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Repair Alerts
            </button>
            <button
              onClick={() => setActiveTab("component-wear")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "component-wear"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Component Wear
            </button>
            <button
              onClick={() => setActiveTab("repair-jobs")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "repair-jobs"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Repair Jobs
            </button>

            {/* Alerts and Settings Icons */}
            <button className="ml-8 p-2 text-neutral-400 hover:text-white transition-colors">
              <Bell size={20} />
            </button>

            <button className="p-2 text-neutral-400 hover:text-white transition-colors">
              <Settings size={20} />
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="ml-4 flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold transition-colors hover:bg-red-700"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        {/* Repair Alerts Tab */}
        {activeTab === "repair-alerts" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-xs font-bold">⚠</span>
              </div>
              <h2 className="text-2xl font-bold">Active Repair Alerts</h2>
            </div>

            <div className="space-y-4">
              {repairAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg bg-neutral-700 px-6 py-4"
                >
                  <div>
                    <h3 className="font-semibold text-white">
                      Subsystem: {alert.subsystem}
                    </h3>
                    <p className="text-sm text-neutral-300">
                      {alert.issue} • {alert.timestamp}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAccept(alert.id)}
                    className="rounded-md bg-green-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-600"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Component Wear Tab */}
        {activeTab === "component-wear" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold">⚙</span>
              </div>
              <h2 className="text-2xl font-bold">Component Wear Status</h2>
            </div>

            <div className="space-y-6">
              {componentWear.map((item, index) => (
                <div key={index}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{item.component}</h3>
                    <span className="rounded-md bg-neutral-600 px-3 py-1 text-sm font-semibold text-white">
                      {item.usage}% used
                    </span>
                  </div>
                  <div className="h-8 w-full overflow-hidden rounded-md bg-neutral-700">
                    <div className="flex h-full">
                      <div
                        className={`${getWearColor(item.usage)} transition-all duration-300`}
                        style={{ width: `${item.usage}%` }}
                      />
                      <div className="flex-1 bg-neutral-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Repair Jobs Tab */}
        {activeTab === "repair-jobs" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔧</span>
              <h2 className="text-2xl font-bold">Repair Job Log</h2>
            </div>

            <div className="space-y-4">
              {repairJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg bg-gradient-to-r from-neutral-600 to-neutral-700 p-6 border-l-4 border-blue-500"
                >
                  {/* Header with Title and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Job #{job.id} — {job.title}
                      </h3>
                    </div>
                    <button
                      className={`rounded-md ${job.statusColor} px-6 py-2 font-semibold text-white transition-colors hover:opacity-90`}
                    >
                      {job.status}
                    </button>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-2 gap-8 mb-4">
                    {/* Left Side */}
                    <div className="space-y-2">
                      <p className="text-sm text-neutral-300">
                        <span className="font-semibold">Subsystem:</span> {job.subsystem}
                      </p>
                      <p className="text-sm text-neutral-300">
                        <span className="font-semibold">Priority:</span> {job.priority}
                      </p>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-2">
                      <p className="text-sm text-neutral-300">
                        <span className="font-semibold">Repair Type:</span> {job.repairType}
                      </p>
                      <p className="text-sm text-neutral-300">
                        <span className="font-semibold">ETA:</span> {job.eta}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="rounded-md bg-neutral-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-600">
                      Update Status
                    </button>
                    <button className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-900 flex items-center gap-2">
                      <span>✓</span> Mark Fixed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TechnicianDashboard;
