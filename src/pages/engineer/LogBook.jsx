import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, X, Calendar } from "lucide-react";

// Dummy data for log entries
const dummyLogData = [
  { id: 1, issue: "27 AUG", return: "27 NOV", duration: "3 Month", company: "BD Govt", location: "Dhaka" },
  { id: 2, issue: "27 NOV", return: "27 APR", duration: "5 Month", company: "China Railway", location: "Chittagong" },
  { id: 3, issue: "27 APR", return: "27 SEP", duration: "5 Month", company: "Sinohydro", location: "Khulna" },
  { id: 4, issue: "27 SEP", return: "27 APR", duration: "7 Month", company: "Japan Tunneling Co.", location: "Rangpur" },
  { id: 5, issue: "27 APR", return: "27 OCT", duration: "6 Month", company: "Bouygues Construction", location: "Barishal" },
  { id: 6, issue: "27 OCT", return: "27 APR", duration: "6 Month", company: "Hochtief", location: "Dhaka" },
  { id: 7, issue: "27 APR", return: "27 JUL", duration: "3 Month", company: "Vinci Construction", location: "Chittagong" },
  { id: 8, issue: "27 JUL", return: "27 FEB", duration: "7 Month", company: "Strabag", location: "Khulna" },
  { id: 9, issue: "27 FEB", return: "27 APR", duration: "2 Month", company: "Salini Impregilo", location: "Rangpur" },
  { id: 10, issue: "27 APR", return: "27 AUG", duration: "4 Month", company: "Skanska", location: "Barishal" },
];

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
    duration: "Auto Calculated",
    company: "",
    location: "Dhaka",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ issue: "", return: "", duration: "Auto Calculated", company: "", location: "Dhaka" });
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
              📅 Issue
            </label>
            <DatePicker
              value={formData.issue}
              onChange={(value) => setFormData({ ...formData, issue: value })}
              placeholder="mm/dd/yyyy"
            />
          </div>

          {/* Return Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Return
            </label>
            <DatePicker
              value={formData.return}
              onChange={(value) => setFormData({ ...formData, return: value })}
              placeholder="mm/dd/yyyy"
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-gray-50 text-sm"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👥 Company Name
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Enter Company Name"
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Location
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
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
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
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
  const [entries, setEntries] = useState(dummyLogData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddEntry = (formData) => {
    const newEntry = {
      id: entries.length + 1,
      ...formData,
    };
    setEntries([...entries, newEntry]);
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4 border-b border-gray-800">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <img
              src="/assets/mtbm/logo.png"
              alt="MTBM Logo"
              className="h-8 w-8 lg:h-10 lg:w-10 rounded-full"
            />
            <div>
              <span className="font-bold text-base lg:text-xl block">Bored Tunnelers</span>
              <span className="text-xs lg:text-sm text-gray-400">MTU Navigation System</span>
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-2 lg:gap-4">
          <Link to="/engineer">
            <Button variant="ghost" className="text-gray-400 hover:text-white text-xs lg:text-sm">
              Dashboard
            </Button>
          </Link>
          <Link to="/engineer/navigation">
            <Button variant="ghost" className="text-gray-400 hover:text-white text-xs lg:text-sm">
              Navigation
            </Button>
          </Link>
          <Link to="/engineer/sensors">
            <Button variant="ghost" className="text-gray-400 hover:text-white text-xs lg:text-sm">
              Sensors
            </Button>
          </Link>
          <Button
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-bold text-xs lg:text-sm px-3 lg:px-6"
          >
            Log Book
          </Button>
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs lg:text-sm px-4 lg:px-6"
          >
            Stop
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </nav>
      </header>

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
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search"
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
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-700 hover:bg-gray-900/50">
                  <td className="px-4 py-3 text-sm text-gray-300">{entry.issue}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{entry.return}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{entry.duration}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{entry.company}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{entry.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <button className="px-2 py-1 text-gray-400 hover:text-white">❮❮</button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded">1</button>
          {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} className="px-3 py-2 text-gray-400 hover:text-white">
              {num}
            </button>
          ))}
          <button className="px-2 py-1 text-gray-400 hover:text-white">❯❯</button>
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
