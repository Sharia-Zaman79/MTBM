import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminApi } from "@/lib/adminApi";
import { loadCurrentUser, clearCurrentUser, API_BASE_URL } from "@/lib/auth";
import { toast } from "sonner";
import * as adminChatApi from "@/lib/adminChatApi";
import {
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  LogOut,
  RefreshCw,
  Star,
  TrendingUp,
  Activity,
  MessageCircle,
  Smile,
  Paperclip,
  Image,
  MapPin,
  Link2,
  Mic,
  Square,
  Play,
  Pause,
  Send,
  X,
  Trash2,
} from "lucide-react";
import { AdminProfilePopover } from "@/components/AdminProfile";

// Common emojis
const EMOJI_LIST = [
  "😀", "😂", "😍", "🥰", "😊", "😎", "🤔", "😅",
  "👍", "👎", "👏", "🙌", "🔥", "❤️", "💯", "✅",
  "😢", "😭", "😱", "🤯", "😤", "🙄", "😴", "🤒",
  "👋", "🤝", "✌️", "🤞", "💪", "🛠️", "⚙️", "🔧",
];

// Voice Player Component
function VoicePlayer({ src, duration, isMe }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formatDur = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg min-w-[160px] ${isMe ? "bg-purple-700" : "bg-neutral-700"}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={togglePlay} className={`w-7 h-7 rounded-full flex items-center justify-center ${isMe ? "bg-purple-800" : "bg-neutral-600"}`}>
        {isPlaying ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className={`h-1 rounded-full overflow-hidden ${isMe ? "bg-purple-800" : "bg-neutral-600"}`}>
          <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] text-white/70">{formatDur(isPlaying ? currentTime : duration)}</span>
      </div>
    </div>
  );
}

// Message content with link detection
function MessageContent({ message }) {
  if (!message) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = message.split(urlRegex);
  return (
    <p className="text-sm whitespace-pre-wrap break-words">
      {parts.map((part, i) => urlRegex.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline hover:text-blue-200">{part}</a>
      ) : <span key={i}>{part}</span>)}
    </p>
  );
}

// Stats Card Component
function StatsCard({ icon, label, value, subtext, color = "orange", onClick }) {
  const colorClasses = {
    orange: "bg-orange-500/20 text-orange-400",
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    red: "bg-red-500/20 text-red-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    purple: "bg-purple-500/20 text-purple-400",
  };

  const content = (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtext && <p className="text-xs text-neutral-400">{subtext}</p>}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button 
        type="button"
        onClick={onClick}
        className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-left w-full hover:border-neutral-600 hover:bg-neutral-800/50 transition-all cursor-pointer"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      {content}
    </div>
  );
}

// User Card Component
function UserCard({ user, type, onChat, unreadCount = 0 }) {
  const isEngineer = type === "engineer";
  const stats = user.stats || {};

  const handleStartChat = () => {
    if (onChat) {
      onChat(user);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-semibold text-neutral-400">
                {user.fullName?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-medium text-white text-sm">{user.fullName}</h4>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats.avgRating && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-medium">{stats.avgRating}</span>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25 relative"
            onClick={handleStartChat}
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            Chat
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {isEngineer ? (
          <>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Issues Reported</p>
              <p className="text-lg font-semibold text-white">{stats.totalIssues || 0}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Critical</p>
              <p className="text-lg font-semibold text-red-400">{stats.criticalIssues || 0}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Resolved</p>
              <p className="text-lg font-semibold text-green-400">{stats.resolvedIssues || 0}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Avg Response</p>
              <p className="text-lg font-semibold text-blue-400">{stats.avgResponseTime || 0}m</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Assigned</p>
              <p className="text-lg font-semibold text-white">{stats.tasksAssigned || 0}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Completed</p>
              <p className="text-lg font-semibold text-green-400">{stats.tasksCompleted || 0}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Success Rate</p>
              <p className="text-lg font-semibold text-blue-400">{stats.successRate || 0}%</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-neutral-500">Avg Fix Time</p>
              <p className="text-lg font-semibold text-orange-400">{stats.avgFixTime || 0}m</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = loadCurrentUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [overviewStats, setOverviewStats] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [monthlyUserReport, setMonthlyUserReport] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportScope, setReportScope] = useState("overall"); // overall | engineer | technician
  const [selectedReportUserId, setSelectedReportUserId] = useState("");
  
  // Chat state
  const [chatUser, setChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Fetch unread counts for all users
  const fetchUnreadCounts = async () => {
    try {
      const data = await adminChatApi.getConversations();
      const counts = {};
      (data.conversations || []).forEach(conv => {
        if (conv.unreadCount > 0) {
          counts[conv._id] = conv.unreadCount;
        }
      });
      setUnreadCounts(counts);
    } catch (err) {
      console.error("Error fetching unread counts:", err);
    }
  };

  // Poll for unread counts
  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle starting chat with a user
  const handleStartChat = async (user) => {
    setChatUser(user);
    setChatLoading(true);
    try {
      await adminChatApi.startConversation(user._id);
      const data = await adminChatApi.getMessages(user._id);
      setChatMessages(data.messages || []);
      // Clear unread count for this user
      setUnreadCounts(prev => ({ ...prev, [user._id]: 0 }));
    } catch (err) {
      console.error("Error starting chat:", err);
      toast.error("Failed to start chat");
    } finally {
      setChatLoading(false);
    }
  };

  // Send message in chat
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatUser) return;
    try {
      await adminChatApi.sendMessage(chatUser._id, chatInput.trim());
      setChatInput("");
      const data = await adminChatApi.getMessages(chatUser._id);
      setChatMessages(data.messages || []);
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  // Emoji handler
  const handleEmojiClick = (emoji) => {
    setChatInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Image upload
  const handleImageUpload = () => {
    fileInputRef.current?.click();
    setShowAttachMenu(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !chatUser) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5MB'); return; }
    setChatLoading(true);
    try {
      await adminChatApi.sendImage(chatUser._id, file);
      const data = await adminChatApi.getMessages(chatUser._id);
      setChatMessages(data.messages || []);
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Failed to upload image");
    } finally {
      setChatLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Location share
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
          setChatInput(prev => prev + ` 📍 Location: ${url}`);
          setShowAttachMenu(false);
        },
        () => alert("Unable to get location")
      );
    }
  };

  // Link share
  const handleShareLink = () => {
    const link = prompt("Enter URL to share:");
    if (link) setChatInput(prev => prev + ` 🔗 ${link}`);
    setShowAttachMenu(false);
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);
    } catch (err) {
      alert("Unable to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) { clearInterval(recordingIntervalRef.current); recordingIntervalRef.current = null; }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);
    setAudioBlob(null);
    setRecordingDuration(0);
    if (recordingIntervalRef.current) { clearInterval(recordingIntervalRef.current); recordingIntervalRef.current = null; }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !chatUser) return;
    setChatLoading(true);
    try {
      await adminChatApi.sendVoice(chatUser._id, audioBlob, recordingDuration);
      setAudioBlob(null);
      setRecordingDuration(0);
      const data = await adminChatApi.getMessages(chatUser._id);
      setChatMessages(data.messages || []);
    } catch (err) {
      console.error("Error sending voice:", err);
      toast.error("Failed to send voice message");
    } finally {
      setChatLoading(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!confirm("Delete this message?")) return;
    try {
      await adminChatApi.deleteMessage(msgId);
      setChatMessages(prev => prev.filter(m => m._id !== msgId));
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const formatDuration = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Poll for new messages
  useEffect(() => {
    if (!chatUser) return;
    const interval = setInterval(async () => {
      try {
        const data = await adminChatApi.getMessages(chatUser._id);
        setChatMessages(data.messages || []);
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [chatUser]);

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login", { state: { message: "Admin access required" } });
    }
  }, [currentUser, navigate]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overview, engineerData, technicianData] = await Promise.all([
        adminApi.getOverviewStats(),
        adminApi.getEngineers(),
        adminApi.getTechnicians(),
      ]);
      setOverviewStats(overview);
      setEngineers(engineerData.engineers || []);
      setTechnicians(technicianData.technicians || []);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyReport = async () => {
    try {
      // Clear any per-user report when generating overall report
      setMonthlyUserReport(null);
      const report = await adminApi.getMonthlyReport(selectedMonth, selectedYear);
      setMonthlyReport(report);
    } catch (err) {
      console.error("Error loading monthly report:", err);
      toast.error("Failed to load monthly report");
    }
  };

  const loadMonthlyUserReport = async () => {
    if (!selectedReportUserId) {
      setMonthlyUserReport(null);
      // Also clear overall report so we don't show overall data in per-user mode
      setMonthlyReport(null);
      return;
    }
    try {
      // Clear overall report when generating per-user report
      setMonthlyReport(null);
      const report = await adminApi.getMonthlyUserReport(selectedReportUserId, selectedMonth, selectedYear);
      setMonthlyUserReport(report);
    } catch (err) {
      console.error("Error loading monthly user report:", err);
      toast.error("Failed to load user report");
    }
  };

  useEffect(() => {
    if (activeTab === "reports") {
      if (reportScope === "overall") {
        loadMonthlyReport();
      } else {
        loadMonthlyUserReport();
      }
    }
  }, [activeTab, selectedMonth, selectedYear, reportScope, selectedReportUserId]);

  useEffect(() => {
    // Keep selected user in sync when switching scope
    setMonthlyReport(null);
    setMonthlyUserReport(null);
    setSelectedReportUserId("");
  }, [reportScope]);

  const handleLogout = () => {
    clearCurrentUser();
    navigate("/login", { state: { message: "Successfully logged out" } });
  };

  // Export to CSV
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => `"${row[h] || ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("CSV exported successfully");
  };

  // Export to PDF (using print)
  const exportToPDF = () => {
    window.print();
    toast.success("PDF export initiated");
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950 print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/assets/mtbm/logo.png"
              alt="MTBM Logo"
              className="h-10 w-10 rounded-full"
            />
            <div>
              <span className="font-bold text-xl">MTBM</span>
              <span className="text-neutral-500 text-sm ml-2">Admin Dashboard</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <AdminProfilePopover />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-neutral-400 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-800 bg-neutral-950/50 print:hidden">
        <div className="flex gap-1 px-6">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "engineers", label: "Engineers", icon: Users },
            { id: "technicians", label: "Technicians", icon: Wrench },
            { id: "reports", label: "Reports", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-orange-500 text-white"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && overviewStats && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">System Overview</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatsCard
                icon={<Users className="w-5 h-5" />}
                label="Engineers"
                value={overviewStats.totalEngineers}
                color="blue"
              />
              <StatsCard
                icon={<Wrench className="w-5 h-5" />}
                label="Technicians"
                value={overviewStats.totalTechnicians}
                color="purple"
              />
              <StatsCard
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Total Alerts"
                value={overviewStats.totalAlerts}
                color="orange"
                onClick={() => navigate("/admin/alerts")}
              />
              <StatsCard
                icon={<Clock className="w-5 h-5" />}
                label="Pending"
                value={overviewStats.pendingAlerts}
                color="yellow"
                onClick={() => navigate("/admin/alerts?status=pending")}
              />
              <StatsCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="In Progress"
                value={overviewStats.inProgressAlerts}
                color="blue"
                onClick={() => navigate("/admin/alerts?status=in-progress")}
              />
              <StatsCard
                icon={<CheckCircle className="w-5 h-5" />}
                label="Resolved"
                value={overviewStats.resolvedAlerts}
                color="green"
                onClick={() => navigate("/admin/alerts?status=resolved")}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Top Engineers
                </h3>
                <div className="space-y-3">
                  {engineers.slice(0, 5).map((eng) => (
                    <div key={eng._id} className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm">
                          {eng.fullName?.charAt(0)}
                        </div>
                        <span className="text-sm">{eng.fullName}</span>
                      </div>
                      <span className="text-sm text-neutral-400">{eng.stats?.totalIssues || 0} issues</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-400" />
                  Top Technicians
                </h3>
                <div className="space-y-3">
                  {technicians.slice(0, 5).map((tech) => (
                    <div key={tech._id} className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm">
                          {tech.fullName?.charAt(0)}
                        </div>
                        <span className="text-sm">{tech.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {tech.stats?.avgRating && (
                          <span className="flex items-center gap-1 text-yellow-400 text-xs">
                            <Star className="w-3 h-3 fill-current" />
                            {tech.stats.avgRating}
                          </span>
                        )}
                        <span className="text-sm text-neutral-400">{tech.stats?.successRate || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engineers Tab */}
        {activeTab === "engineers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Engineers ({engineers.length})</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(engineers.map(e => ({
                  Name: e.fullName,
                  Email: e.email,
                  Organization: e.organization,
                  "Total Issues": e.stats?.totalIssues || 0,
                  "Critical Issues": e.stats?.criticalIssues || 0,
                  "Resolved Issues": e.stats?.resolvedIssues || 0,
                  "Avg Response (min)": e.stats?.avgResponseTime || 0,
                })), "engineers_report")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-0 shadow-lg shadow-blue-500/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engineers.map((engineer) => (
                <UserCard key={engineer._id} user={engineer} type="engineer" onChat={handleStartChat} unreadCount={unreadCounts[engineer._id] || 0} />
              ))}
              {engineers.length === 0 && (
                <p className="text-neutral-500 col-span-full text-center py-8">No engineers found</p>
              )}
            </div>
          </div>
        )}

        {/* Technicians Tab */}
        {activeTab === "technicians" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Technicians ({technicians.length})</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(technicians.map(t => ({
                  Name: t.fullName,
                  Email: t.email,
                  Organization: t.organization,
                  "Tasks Assigned": t.stats?.tasksAssigned || 0,
                  "Tasks Completed": t.stats?.tasksCompleted || 0,
                  "Success Rate (%)": t.stats?.successRate || 0,
                  "Avg Fix Time (min)": t.stats?.avgFixTime || 0,
                  "Rating": t.stats?.avgRating || "N/A",
                })), "technicians_report")}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white border-0 shadow-lg shadow-orange-500/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technicians.map((technician) => (
                <UserCard key={technician._id} user={technician} type="technician" onChat={handleStartChat} unreadCount={unreadCounts[technician._id] || 0} />
              ))}
              {technicians.length === 0 && (
                <p className="text-neutral-500 col-span-full text-center py-8">No technicians found</p>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6 print:text-black print:bg-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-semibold">Monthly Maintenance Summary Report</h2>
              <div className="flex items-center gap-3 print:hidden">
                <select
                  value={reportScope}
                  onChange={(e) => setReportScope(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="overall">Overall (All)</option>
                  <option value="engineer">Per Engineer</option>
                  <option value="technician">Per Technician</option>
                </select>

                {reportScope !== "overall" && (
                  <select
                    value={selectedReportUserId}
                    onChange={(e) => setSelectedReportUserId(e.target.value)}
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm min-w-[220px]"
                  >
                    <option value="">Select {reportScope}...</option>
                    {(reportScope === "engineer" ? engineers : technicians).map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                >
                  {months.map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                >
                  {[2024, 2025, 2026].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (reportScope === "overall") {
                      loadMonthlyReport();
                    } else {
                      if (!selectedReportUserId) {
                        toast.error(`Please select a ${reportScope}`);
                        return;
                      }
                      loadMonthlyUserReport();
                    }
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/20 print:hidden"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            {reportScope === "overall" && monthlyReport && (
              <div className="space-y-6" id="report-content">
                {/* Summary */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 print:bg-gray-100 print:border-gray-300">
                  <h3 className="font-semibold text-lg mb-4">Summary - {monthlyReport.summary?.period}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white print:text-black">{monthlyReport.summary?.totalAlerts || 0}</p>
                      <p className="text-sm text-neutral-400 print:text-gray-600">Total Alerts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400 print:text-green-600">{monthlyReport.summary?.resolvedAlerts || 0}</p>
                      <p className="text-sm text-neutral-400 print:text-gray-600">Resolved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-400 print:text-red-600">{monthlyReport.summary?.criticalAlerts || 0}</p>
                      <p className="text-sm text-neutral-400 print:text-gray-600">Critical</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-400 print:text-blue-600">{monthlyReport.summary?.avgResolutionRate || "0%"}</p>
                      <p className="text-sm text-neutral-400 print:text-gray-600">Resolution Rate</p>
                    </div>
                  </div>
                </div>

                {/* Technician Report Table */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 print:bg-gray-100 print:border-gray-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Technician Report</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV(monthlyReport.technicianReport, "technician_monthly_report")}
                      className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 hover:text-orange-300 print:hidden"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-700 print:border-gray-400">
                          <th className="text-left py-2 px-3 text-neutral-400 print:text-gray-600">Name</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Assigned</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Completed</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Avg Fix Time</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Success Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyReport.technicianReport?.map((tech, idx) => (
                          <tr key={idx} className="border-b border-neutral-800 print:border-gray-300">
                            <td className="py-2 px-3">{tech.name}</td>
                            <td className="text-center py-2 px-3">{tech.tasksAssigned}</td>
                            <td className="text-center py-2 px-3 text-green-400 print:text-green-600">{tech.tasksCompleted}</td>
                            <td className="text-center py-2 px-3">{tech.avgFixTime}</td>
                            <td className="text-center py-2 px-3 text-blue-400 print:text-blue-600">{tech.successRate}</td>
                          </tr>
                        ))}
                        {(!monthlyReport.technicianReport || monthlyReport.technicianReport.length === 0) && (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-neutral-500">No data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Engineer Report Table */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 print:bg-gray-100 print:border-gray-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Engineer Report</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToCSV(monthlyReport.engineerReport, "engineer_monthly_report")}
                      className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 print:hidden"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-700 print:border-gray-400">
                          <th className="text-left py-2 px-3 text-neutral-400 print:text-gray-600">Name</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Total Issues</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Critical</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">High</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Resolved</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Avg Response</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyReport.engineerReport?.map((eng, idx) => (
                          <tr key={idx} className="border-b border-neutral-800 print:border-gray-300">
                            <td className="py-2 px-3">{eng.name}</td>
                            <td className="text-center py-2 px-3">{eng.totalIssuesReported}</td>
                            <td className="text-center py-2 px-3 text-red-400 print:text-red-600">{eng.criticalIssues}</td>
                            <td className="text-center py-2 px-3 text-orange-400 print:text-orange-600">{eng.highIssues}</td>
                            <td className="text-center py-2 px-3 text-green-400 print:text-green-600">{eng.resolvedIssues}</td>
                            <td className="text-center py-2 px-3">{eng.avgResponseTime}</td>
                          </tr>
                        ))}
                        {(!monthlyReport.engineerReport || monthlyReport.engineerReport.length === 0) && (
                          <tr>
                            <td colSpan={6} className="text-center py-4 text-neutral-500">No data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {reportScope !== "overall" && monthlyUserReport && (
              <div className="space-y-6" id="user-report-content">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 print:bg-gray-100 print:border-gray-300">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {monthlyUserReport.user?.fullName} ({monthlyUserReport.user?.role})
                      </h3>
                      <p className="text-sm text-neutral-400 print:text-gray-600">
                        {monthlyUserReport.user?.email} • {monthlyUserReport.summary?.period}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const rows = (monthlyUserReport.alerts || []).map((a) => ({
                          Subsystem: a.subsystem,
                          Issue: a.issue,
                          Priority: a.priority,
                          Status: a.status,
                          "Created At": a.createdAt ? new Date(a.createdAt).toLocaleString() : "",
                          "Accepted At": a.acceptedAt ? new Date(a.acceptedAt).toLocaleString() : "",
                          "Resolved At": a.resolvedAt ? new Date(a.resolvedAt).toLocaleString() : "",
                          Technician: a.technicianName || "",
                          Engineer: a.engineerName || "",
                          Rating: a.rating ?? "",
                        }));
                        exportToCSV(rows, `${monthlyUserReport.user?.role}_monthly_report_${monthlyUserReport.user?.fullName?.replace(/\s+/g, "_")}`);
                      }}
                      className="bg-neutral-800 text-neutral-200 hover:bg-neutral-700 print:hidden"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white print:text-black">{monthlyUserReport.summary?.totalAlerts || 0}</p>
                      <p className="text-sm text-neutral-400 print:text-gray-600">Total Alerts</p>
                    </div>
                    {monthlyUserReport.user?.role === "engineer" ? (
                      <>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-green-400 print:text-green-600">{monthlyUserReport.stats?.resolvedIssues || 0}</p>
                          <p className="text-sm text-neutral-400 print:text-gray-600">Resolved</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-red-400 print:text-red-600">{monthlyUserReport.stats?.criticalIssues || 0}</p>
                          <p className="text-sm text-neutral-400 print:text-gray-600">Critical</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-blue-400 print:text-blue-600">{monthlyUserReport.stats?.avgResponseTime || "0 min"}</p>
                          <p className="text-sm text-neutral-400 print:text-gray-600">Avg Response</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-green-400 print:text-green-600">{monthlyUserReport.stats?.tasksCompleted || 0}</p>
                          <p className="text-sm text-neutral-400 print:text-gray-600">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-blue-400 print:text-blue-600">{monthlyUserReport.stats?.successRate || "0%"}</p>
                          <p className="text-sm text-neutral-400 print:text-gray-600">Success Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-orange-400 print:text-orange-600">{monthlyUserReport.stats?.avgFixTime || "0 min"}</p>
                          <p className="text-sm text-neutral-400 print:text-gray-600">Avg Fix Time</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 print:bg-gray-100 print:border-gray-300">
                  <h3 className="font-semibold text-lg mb-4">Alerts</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-700 print:border-gray-400">
                          <th className="text-left py-2 px-3 text-neutral-400 print:text-gray-600">Subsystem</th>
                          <th className="text-left py-2 px-3 text-neutral-400 print:text-gray-600">Issue</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Priority</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Status</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Created</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Accepted</th>
                          <th className="text-center py-2 px-3 text-neutral-400 print:text-gray-600">Resolved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(monthlyUserReport.alerts || []).map((a) => (
                          <tr key={a._id} className="border-b border-neutral-800 print:border-gray-300">
                            <td className="py-2 px-3">{a.subsystem}</td>
                            <td className="py-2 px-3">{a.issue}</td>
                            <td className="text-center py-2 px-3 capitalize">{a.priority}</td>
                            <td className="text-center py-2 px-3 capitalize">{a.status}</td>
                            <td className="text-center py-2 px-3">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}</td>
                            <td className="text-center py-2 px-3">{a.acceptedAt ? new Date(a.acceptedAt).toLocaleDateString() : ""}</td>
                            <td className="text-center py-2 px-3">{a.resolvedAt ? new Date(a.resolvedAt).toLocaleDateString() : ""}</td>
                          </tr>
                        ))}
                        {(!monthlyUserReport.alerts || monthlyUserReport.alerts.length === 0) && (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-neutral-500">No data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          header, .print\\:hidden { display: none !important; }
          main { padding: 20px !important; }
          * { color: black !important; }
        }
      `}</style>

      {/* Chat Modal */}
      {chatUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-lg h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-700 flex items-center justify-between bg-purple-600 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {chatUser.photoUrl ? (
                    <img src={chatUser.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-lg font-semibold text-white">
                      {chatUser.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{chatUser.fullName}</h3>
                  <p className="text-xs text-purple-200 capitalize">{chatUser.role}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setChatUser(null); setChatMessages([]); setChatInput(""); setAudioBlob(null); cancelRecording(); }}
                className="text-white hover:bg-purple-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {chatLoading ? (
                  <div className="text-center text-neutral-500 py-8">Loading...</div>
                ) : chatMessages.length === 0 ? (
                  <div className="text-center text-neutral-500 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <div key={msg._id} className={`flex ${isAdmin ? "justify-end" : "justify-start"} group`}>
                        <div
                          className={`max-w-[75%] rounded-lg p-3 relative ${
                            isAdmin
                              ? "bg-purple-600 text-white"
                              : "bg-neutral-800 text-white"
                          }`}
                        >
                          {/* Message Content */}
                          {msg.messageType === 'voice' ? (
                            <VoicePlayer src={msg.voiceUrl} duration={msg.voiceDuration} isOwn={isAdmin} />
                          ) : msg.messageType === 'image' ? (
                            <div>
                              <img 
                                src={msg.imageUrl} 
                                alt="Shared" 
                                className="max-w-full rounded cursor-pointer hover:opacity-90" 
                                onClick={() => window.open(msg.imageUrl, '_blank')}
                              />
                              {msg.message && <p className="text-sm mt-2"><MessageContent message={msg.message} /></p>}
                            </div>
                          ) : (
                            <MessageContent message={msg.message} />
                          )}
                          <span className={`text-xs mt-1 block ${isAdmin ? "text-purple-200" : "text-neutral-500"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {/* Delete button for own messages */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Hidden file input */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

            {/* Voice Preview */}
            {audioBlob && !isRecording && (
              <div className="p-3 border-t border-neutral-700 bg-neutral-800">
                <div className="flex items-center gap-3">
                  <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1 h-8" />
                  <Button size="sm" variant="ghost" onClick={cancelRecording} className="text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={sendVoiceMessage} className="bg-purple-600">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Recording UI */}
            {isRecording && (
              <div className="p-3 border-t border-neutral-700 bg-red-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 font-medium">Recording {formatDuration(recordingDuration)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={cancelRecording} className="text-red-400">
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={stopRecording} className="bg-red-600">
                      <Square className="w-4 h-4 mr-1" /> Stop
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Input */}
            {!isRecording && !audioBlob && (
              <div className="p-4 border-t border-neutral-700">
                <div className="flex items-center gap-2">
                  {/* Emoji Picker */}
                  <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-yellow-400 p-2">
                        <Smile className="w-5 h-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 bg-neutral-800 border-neutral-700" side="top">
                      <div className="grid grid-cols-8 gap-1">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiClick(emoji)}
                            className="text-xl hover:bg-neutral-700 rounded p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Attachment Menu */}
                  <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-purple-400 p-2">
                        <Paperclip className="w-5 h-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 bg-neutral-800 border-neutral-700" side="top">
                      <div className="space-y-1">
                        <button onClick={handleImageUpload} className="w-full flex items-center gap-2 p-2 rounded hover:bg-neutral-700 text-white">
                          <Image className="w-4 h-4 text-green-400" /> Photo
                        </button>
                        <button onClick={handleShareLocation} className="w-full flex items-center gap-2 p-2 rounded hover:bg-neutral-700 text-white">
                          <MapPin className="w-4 h-4 text-red-400" /> Location
                        </button>
                        <button onClick={handleShareLink} className="w-full flex items-center gap-2 p-2 rounded hover:bg-neutral-700 text-white">
                          <Link2 className="w-4 h-4 text-blue-400" /> Link
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  {/* Voice / Send Button */}
                  {chatInput.trim() ? (
                    <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700 p-2">
                      <Send className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button onClick={startRecording} variant="ghost" className="text-neutral-400 hover:text-red-400 p-2">
                      <Mic className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
