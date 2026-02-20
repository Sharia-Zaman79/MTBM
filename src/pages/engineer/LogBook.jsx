import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Trash2, X, Calendar, Menu } from "lucide-react";
import { useAlerts } from "@/lib/alert-store";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/auth";
import CallTechnicianAction from "@/components/engineer/CallTechnicianAction";
import { TechnicianProfilePopover } from "@/components/TechnicianProfile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

function AlertsPopover() {
  const { alerts, clearAlerts, removeAlert } = useAlerts();
  const visibleAlerts = alerts.filter((a) => a?.type !== "repair");
  const alertCount = visibleAlerts.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-300 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center font-bold">
              {alertCount > 99 ? "99+" : alertCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-gray-900 border-gray-700"
        align="end"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h4 className="font-semibold text-white">Alerts ({alertCount})</h4>
          {alertCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAlerts}
              className="text-gray-400 hover:text-white h-8 px-2"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {alertCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
              <Bell className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No alerts yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {visibleAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} onRemove={removeAlert} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function AlertItem({ alert, onRemove }) {
  const formatTime = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";
    
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    // Show relative time for recent events
    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    
    // For older events, show the date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isRepair = alert?.type === "repair";
  const isNotification = alert?.type === "notification";
  const level = isRepair ? "repair" : isNotification ? "info" : alert?.level;
  const levelColors = {
    warning: "bg-orange-500/20 border-l-orange-500 text-orange-400",
    critical: "bg-red-500/20 border-l-red-500 text-red-400",
    repair: "bg-blue-500/20 border-l-blue-500 text-blue-300",
    info: "bg-blue-500/20 border-l-blue-500 text-blue-300",
  };

  const title = isRepair
    ? alert?.subsystem ?? "Repair Request"
    : isNotification
      ? alert?.title ?? "Notification"
      : alert?.sensorName ?? "Alert";

  const detail = isRepair
    ? alert?.issue ?? ""
    : isNotification
      ? alert?.detail ?? ""
      : `${alert?.sensorType ?? ""}: ${typeof alert?.value === "number" ? alert.value.toFixed(1) : ""}${alert?.unit ?? ""}`;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800 border-l-4 ${
        levelColors[level] ?? levelColors.warning
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm">{title}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              isRepair
                ? "bg-blue-500"
                : level === "critical"
                  ? "bg-red-500"
                  : level === "info"
                    ? "bg-blue-500"
                    : "bg-orange-500"
            } text-white font-medium`}
          >
            {isRepair ? "REPAIR" : level === "critical" ? "CRITICAL" : level === "info" ? "UPDATE" : "WARNING"}
          </span>
        </div>
        {detail ? <p className="text-xs text-gray-400 mt-1">{detail}</p> : null}
        <p className="text-xs text-gray-500 mt-0.5">{formatTime(alert?.timestamp)}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-gray-400 hover:text-white"
        onClick={() => onRemove(alert.id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

const LOCATIONS = [
  "Dhaka",
  "Chittagong",
  "Khulna",
  "Rangpur",
  "Barishal",
  "Sylhet",
  "Mymensingh",
  "Rajshahi",
  "Barisal",
  "Cox's Bazar",
  "Comilla",
  "Gazipur",
  "Narayanganj",
  "Tangail",
  "Jashore",
  "Dinajpur",
  "Bogra",
  "Pabna",
  "Noakhali",
  "Feni"
];

// Date Picker Component
function DatePicker({ value, onChange, placeholder }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8)); // Sep 2025

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const totalDays = daysInMonth(currentMonth);
  const firstDay = firstDayOfMonth(currentMonth);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const handleDateSelect = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const formatted = selectedDate.toLocaleDateString("en-GB");
    onChange(formatted);
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "mm/dd/yyyy"}
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm"
        />
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="px-3 py-2 bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 flex-shrink-0"
        >
          <Calendar className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      {showCalendar && (
        <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
      )}

      {showCalendar && (
        <div className="absolute top-12 left-0 bg-white border border-gray-300 rounded-lg p-4 shadow-xl z-50 w-80">
          {/* Month/Year Selector */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded text-gray-700"
            >
              ❮
            </button>
            <div className="flex gap-2 flex-1 justify-center">
              <select
                value={currentMonth.getMonth()}
                onChange={(e) =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value)))
                }
                className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700"
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={currentMonth.getFullYear()}
                onChange={(e) =>
                  setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth()))
                }
                className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded text-gray-700"
            >
              ❯
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="font-semibold text-gray-600 py-1">{day}</div>
            ))}
            {days.map((day, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => day && handleDateSelect(day)}
                disabled={!day}
                className={`p-2 rounded text-sm ${
                  day
                    ? "hover:bg-gray-200 cursor-pointer text-gray-900 font-medium"
                    : "text-gray-200 cursor-default"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Add Entry Modal
function AddEntryModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    issue: "",
    return: "",
    duration: "",
    company: "",
    location: "Dhaka",
  });
  const [errors, setErrors] = useState({});

  // Calculate duration between two dates
  const calculateDuration = (issueDate, returnDate) => {
    if (!issueDate || !returnDate) return "";

    try {
      // Parse dates in DD/MM/YYYY format
      const [issueDay, issueMonth, issueYear] = issueDate.split("/").map(Number);
      const [returnDay, returnMonth, returnYear] = returnDate.split("/").map(Number);

      const issue = new Date(issueYear, issueMonth - 1, issueDay);
      const returns = new Date(returnYear, returnMonth - 1, returnDay);

      if (issue >= returns) {
        return "Invalid (Return must be after Issue)";
      }

      // Calculate difference
      let months = returnMonth - issueMonth;
      let years = returnYear - issueYear;

      if (returnDay < issueDay) {
        months--;
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      // Format result
      if (years === 0 && months === 0) {
        const days = Math.floor((returns - issue) / (1000 * 60 * 60 * 24));
        return `${days} Day${days !== 1 ? "s" : ""}`;
      } else if (years === 0) {
        return `${months} Month${months !== 1 ? "s" : ""}`;
      } else {
        return `${years} Year${years !== 1 ? "s" : ""} ${months} Month${months !== 1 ? "s" : ""}`;
      }
    } catch (error) {
      return "";
    }
  };

  // Update duration when dates change
  const handleDateChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    // Calculate duration if both dates are present
    if (newFormData.issue && newFormData.return) {
      newFormData.duration = calculateDuration(newFormData.issue, newFormData.return);
    } else {
      newFormData.duration = "";
    }

    setFormData(newFormData);
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.issue.trim() !== "" &&
      formData.return.trim() !== "" &&
      formData.company.trim() !== "" &&
      formData.location.trim() !== ""
    );
  };

  // Validate form on submit
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.issue.trim()) {
      newErrors.issue = "Issue date is required";
    }
    if (!formData.return.trim()) {
      newErrors.return = "Return date is required";
    }
    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      setFormData({ issue: "", return: "", duration: "", company: "", location: "Dhaka" });
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Entry</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Issue Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Issue <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={formData.issue}
              onChange={(value) => handleDateChange("issue", value)}
              placeholder="mm/dd/yyyy"
            />
            {errors.issue && <p className="text-red-500 text-xs mt-1">{errors.issue}</p>}
          </div>

          {/* Return Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Return <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={formData.return}
              onChange={(value) => handleDateChange("return", value)}
              placeholder="mm/dd/yyyy"
            />
            {errors.return && <p className="text-red-500 text-xs mt-1">{errors.return}</p>}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⏱️ Duration
            </label>
            <input
              type="text"
              value={formData.duration}
              disabled
              placeholder="Auto calculated"
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-gray-50 text-sm font-medium"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👥 Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => {
                setFormData({ ...formData, company: e.target.value });
                if (errors.company) setErrors({ ...errors, company: "" });
              }}
              placeholder="Enter Company Name"
              className={`w-full px-3 py-2 border rounded text-gray-900 text-sm ${
                errors.company ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Location <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.location}
              onChange={(e) => {
                setFormData({ ...formData, location: e.target.value });
                if (errors.location) setErrors({ ...errors, location: "" });
              }}
              className={`w-full px-3 py-2 border rounded text-gray-900 text-sm ${
                errors.location ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`flex-1 px-4 py-2 rounded font-medium text-white transition-colors ${
                isFormValid()
                  ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed opacity-50"
              }`}
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main LogBook Page
export default function LogBookPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    let isActive = true;

    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/logbook`);
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load logbook entries");
        }

        if (isActive) {
          const normalized = Array.isArray(data?.entries) ? data.entries : [];
          setEntries(normalized);
        }
      } catch (err) {
        if (isActive) {
          toast.error(err?.message || "Failed to load logbook entries");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchEntries();
    return () => {
      isActive = false;
    };
  }, [API_BASE_URL]);

  const normalizedCompanyQuery = searchQuery.trim().toLowerCase();
  const normalizedLocationQuery = locationQuery.trim().toLowerCase();

  const orderedEntries = [...entries].sort(
    (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
  );

  // Filter entries by company name + location
  const filteredEntries = orderedEntries.filter((entry) => {
    const company = (entry?.company ?? "").toLowerCase();
    const location = (entry?.location ?? "").toLowerCase();

    const companyOk = normalizedCompanyQuery
      ? company.includes(normalizedCompanyQuery)
      : true;
    const locationOk = normalizedLocationQuery
      ? location.includes(normalizedLocationQuery)
      : true;

    return companyOk && locationOk;
  });

  // Calculate pagination based on filtered entries
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntries = filteredEntries.slice(startIndex, endIndex);

  const handleAddEntry = async (formData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logbook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to save entry");
      }

      const created = data?.entry;
      if (created) {
        setEntries((prev) => [created, ...prev]);
        setCurrentPage(1);
      }

      setIsModalOpen(false);
      toast.success("Log entry saved");
    } catch (err) {
      toast.error(err?.message || "Failed to save entry");
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const handleStop = () => {
    const host =
      typeof window !== "undefined" && window.location?.host
        ? window.location.host
        : "localhost";
    toast(`${host} stopped the machine`);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-3 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-4 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 lg:gap-4 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <img src="/assets/mtbm/logo.png" alt="MTBM Logo" className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-full" />
            <div>
              <span className="font-bold text-sm sm:text-base lg:text-xl block">Bored Tunnelers</span>
              <span className="text-xs lg:text-sm text-gray-400 hidden sm:block">MTU Navigation System</span>
            </div>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-2 lg:gap-4">
          <Link to="/engineer"><Button variant="ghost" className="text-gray-400 hover:text-white text-xs lg:text-sm">Dashboard</Button></Link>
          <Link to="/engineer/navigation"><Button variant="ghost" className="text-gray-400 hover:text-white text-xs lg:text-sm">Navigation</Button></Link>
          <Link to="/engineer/sensors"><Button variant="ghost" className="text-gray-400 hover:text-white text-xs lg:text-sm">Sensors</Button></Link>
          <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-bold text-xs lg:text-sm px-3 lg:px-6">Log Book</Button>
          <CallTechnicianAction buttonVariant="ghost" buttonClassName="text-orange-400 hover:text-orange-300" />
          <AlertsPopover />
          <TechnicianProfilePopover className="ml-1" />
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs lg:text-sm px-4 lg:px-6" onClick={handleStop}>Stop</Button>
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white" onClick={handleLogout}><LogOut className="h-5 w-5" /></Button>
        </nav>
        <div className="flex lg:hidden items-center gap-1 sm:gap-2">
          <AlertsPopover />
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 h-8" onClick={handleStop}>Stop</Button>
          <button className="p-2 text-white hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-gray-800 bg-gray-900/95 px-4 py-3 space-y-1 z-50">
          <Link to="/engineer" className="block w-full text-left rounded-md px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
          <Link to="/engineer/navigation" className="block w-full text-left rounded-md px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Navigation</Link>
          <Link to="/engineer/sensors" className="block w-full text-left rounded-md px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Sensors</Link>
          <Link to="/engineer/logbook" className="block w-full text-left rounded-md px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white" onClick={() => setMobileMenuOpen(false)}>Log Book</Link>
          <div className="px-4 py-2.5"><CallTechnicianAction buttonVariant="ghost" buttonClassName="text-orange-400 hover:text-orange-300 w-full justify-start p-0" /></div>
          <div className="flex items-center gap-3 px-4 py-2.5">
            <TechnicianProfilePopover />
            <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-white" onClick={handleLogout}><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 flex flex-col gap-6">
        {/* Title and Add Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold">Recent Entries</h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs lg:text-sm px-4 lg:px-6"
          >
            Add Entry
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search by Company name"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="flex-1 px-3 sm:px-4 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 text-sm placeholder-gray-500"
          />
          <input
            type="text"
            placeholder="Search by Location"
            value={locationQuery}
            onChange={(e) => {
              setLocationQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 text-sm placeholder-gray-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Issue</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Return</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Company</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Location</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-gray-400"
                  >
                    Loading log entries...
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-gray-400"
                  >
                    No log entries yet.
                  </td>
                </tr>
              ) : (
                currentEntries.map((entry) => (
                  <tr
                    key={entry._id ?? entry.id}
                    className="border-b border-gray-700 hover:bg-gray-900/50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-300">{entry.issue}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{entry.return}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{entry.duration}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{entry.company}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{entry.location}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <button 
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❮❮
          </button>
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❮
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button 
              key={num}
              onClick={() => handlePageChange(num)}
              className={`px-3 py-2 rounded ${
                currentPage === num 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {num}
            </button>
          ))}

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❯
          </button>
          <button 
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❯❯
          </button>
        </div>
      </div>

      {/* Add Entry Modal */}
      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEntry}
      />
    </div>
  );
}
