import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatApi } from "@/lib/repairAlertsApi";
import * as adminChatApi from "@/lib/adminChatApi";
import { loadCurrentUser, API_BASE_URL } from "@/lib/auth";
import {
  MessageCircle,
  Send,
  X,
  Loader2,
  Image,
  MapPin,
  Link2,
  Smile,
  Paperclip,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  ArrowLeft,
  Trash2,
  Search,
  Circle,
  Wrench,
  Shield,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const EMOJI_LIST = [
  "😀","😂","😍","🥰","😊","😎","🤔","😅",
  "👍","👎","👏","🙌","🔥","❤️","💯","✅",
  "😢","😭","😱","🤯","😤","🙄","😴","🤒",
  "👋","🤝","✌️","🤞","💪","🛠️","⚙️","🔧",
];

const API_URL = API_BASE_URL;

// ─── Voice Player ───────────────────────────────────────────
function VoicePlayer({ src, duration, isMe }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime);
    const onEnd = () => { setIsPlaying(false); setCurrentTime(0); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("ended", onEnd); };
  }, []);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg min-w-[180px] ${isMe ? "bg-blue-600" : "bg-neutral-800"}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={togglePlay} className={`w-8 h-8 rounded-full flex items-center justify-center ${isMe ? "bg-blue-700 hover:bg-blue-800" : "bg-neutral-700 hover:bg-neutral-600"}`}>
        {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className={`h-1 rounded-full overflow-hidden ${isMe ? "bg-blue-700" : "bg-neutral-700"}`}>
          <div className="h-full bg-white transition-all duration-100" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Mic className="w-3 h-3 text-white/70" />
          <span className="text-[10px] text-white/70">{fmt(isPlaying ? currentTime : duration)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar ─────────────────────────────────────────────────
function Avatar({ name, photoUrl, size = 44, online, roleIcon }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = [
    "bg-blue-600","bg-green-600","bg-purple-600","bg-orange-600","bg-pink-600","bg-teal-600","bg-indigo-600",
  ];
  const idx = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {photoUrl ? (
        <img src={photoUrl.startsWith("http") ? photoUrl : `${API_URL}${photoUrl}`} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <div className={`w-full h-full rounded-full ${colors[idx]} flex items-center justify-center`}>
          <span className="text-white font-semibold" style={{ fontSize: size * 0.35 }}>{initials}</span>
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-neutral-950 rounded-full" />
      )}
      {roleIcon && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-neutral-900 flex items-center justify-center">
          {roleIcon}
        </span>
      )}
    </div>
  );
}

// ─── Conversation List ──────────────────────────────────────
function ConversationList({ conversations, adminConv, activeUsers, onSelect, onSelectAdmin, loading, searchQuery, setSearchQuery }) {
  const filtered = conversations.filter((c) =>
    (c.otherName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.subsystem || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showAdmin = !searchQuery || "admin".includes(searchQuery.toLowerCase());

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-neutral-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Active Now Bar */}
      {activeUsers.length > 0 && (
        <div className="px-3 py-2 border-b border-neutral-800">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2 font-semibold">Active Now</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {activeUsers.map((u) => (
              <button key={u.id} onClick={() => u.onClick?.()} className="flex flex-col items-center gap-1 min-w-[52px]">
                <Avatar name={u.name} photoUrl={u.photoUrl} size={40} online />
                <span className="text-[10px] text-neutral-400 truncate max-w-[52px]">{u.name?.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : (
          <div>
            {/* Admin conversation (always on top) */}
            {showAdmin && adminConv && (
              <button
                onClick={onSelectAdmin}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/60 transition-colors border-b border-neutral-800/50 text-left"
              >
                <Avatar name="Admin" photoUrl="" size={48} online={adminConv.online} roleIcon={<Shield className="w-2.5 h-2.5 text-green-400" />} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white text-sm">Admin</h4>
                    {adminConv.lastTime && (
                      <span className="text-[10px] text-neutral-500">{adminConv.lastTime}</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 truncate">
                    {adminConv.lastMessage || "Support & Assistance"}
                  </p>
                </div>
                {(adminConv.unreadCount || 0) > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center font-bold flex-shrink-0">
                    {adminConv.unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Technician / Repair conversations */}
            {filtered.length === 0 && !showAdmin ? (
              <div className="text-center py-12 text-neutral-500">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.alertId}
                  onClick={() => onSelect(conv)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/60 transition-colors border-b border-neutral-800/50 text-left"
                >
                  <Avatar
                    name={conv.otherName}
                    photoUrl={conv.otherPhotoUrl}
                    size={48}
                    online={conv.isOnline}
                    roleIcon={<Wrench className="w-2.5 h-2.5 text-orange-400" />}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white text-sm">{conv.otherName}</h4>
                      {conv.lastMessage?.createdAt && (
                        <span className="text-[10px] text-neutral-500">
                          {formatConvTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        conv.status === "resolved" ? "bg-green-500/20 text-green-400" :
                        conv.status === "in-progress" ? "bg-blue-500/20 text-blue-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {conv.subsystem}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {conv.lastMessage
                        ? conv.lastMessage.messageType === "voice"
                          ? "🎤 Voice message"
                          : conv.lastMessage.messageType === "image"
                            ? "📷 Photo"
                            : conv.lastMessage.message || "..."
                        : "No messages yet"}
                    </p>
                  </div>
                  {(conv.unreadCount || 0) > 0 && (
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center font-bold flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function formatConvTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Chat Thread (repair alert chat) ───────────────────────
function ChatThread({ conv, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUser = loadCurrentUser();
  const userRole = currentUser?.role?.toLowerCase();
  const alertId = conv.alertId;

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Fetch + poll messages
  useEffect(() => {
    let alive = true;
    const fetch = async () => {
      try {
        const data = await chatApi.getMessages(alertId);
        if (alive) { setMessages(data.messages || []); setLoading(false); }
      } catch { if (alive) setLoading(false); }
    };
    fetch();
    const iv = setInterval(async () => {
      try {
        const data = await chatApi.getMessages(alertId);
        if (alive) setMessages(data.messages || []);
      } catch {}
    }, 3000);
    return () => { alive = false; clearInterval(iv); };
  }, [alertId]);

  // Presence heartbeat + check active
  useEffect(() => {
    let alive = true;
    const beat = async () => {
      try { await chatApi.sendPresence(alertId); } catch {}
    };
    const checkActive = async () => {
      try {
        const data = await chatApi.getActiveUsers(alertId);
        if (alive) {
          const others = (data.activeUsers || []).filter(
            (u) => u.userId !== currentUser?._id && u.role !== userRole
          );
          setIsOnline(others.length > 0);
        }
      } catch {}
    };
    beat(); checkActive();
    const bIv = setInterval(beat, 10000);
    const cIv = setInterval(checkActive, 8000);
    return () => { alive = false; clearInterval(bIv); clearInterval(cIv); };
  }, [alertId]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await chatApi.sendMessage(alertId, newMessage.trim());
      setMessages((p) => [...p, res.data]);
      setNewMessage("");
    } catch {}
    setSending(false);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleEmojiClick = (emoji) => { setNewMessage((p) => p + emoji); setShowEmojiPicker(false); };

  const handleImageUpload = () => { fileInputRef.current?.click(); setShowAttachMenu(false); };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be < 5MB"); return; }
    setSending(true);
    try {
      const res = await chatApi.sendImage(alertId, file);
      setMessages((p) => [...p, res.data]);
    } catch {}
    setSending(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => { setNewMessage((m) => m + ` 📍 https://maps.google.com/?q=${p.coords.latitude},${p.coords.longitude}`); setShowAttachMenu(false); },
        () => alert("Unable to get location")
      );
    }
  };
  const handleShareLink = () => {
    const link = prompt("Enter URL:"); if (link) setNewMessage((m) => m + ` 🔗 ${link}`); setShowAttachMenu(false);
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => { setAudioBlob(new Blob(audioChunksRef.current, { type: "audio/webm" })); stream.getTracks().forEach((t) => t.stop()); };
      mr.start(); setIsRecording(true); setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => setRecordingDuration((p) => p + 1), 1000);
    } catch { alert("Cannot access microphone"); }
  };
  const stopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current); } };
  const cancelRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop()); } setIsRecording(false); setAudioBlob(null); setRecordingDuration(0); if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current); };
  const sendVoiceMessage = async () => {
    if (!audioBlob) return; setSending(true);
    try {
      const res = await chatApi.sendVoice(alertId, audioBlob, recordingDuration);
      setMessages((p) => [...p, res.data]); setAudioBlob(null); setRecordingDuration(0);
    } catch {}
    setSending(false);
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm("Delete this message?")) return;
    try { await chatApi.deleteMessage(alertId, id); setMessages((p) => p.filter((m) => m._id !== id)); } catch {}
  };

  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d) => {
    const dt = new Date(d); const now = new Date();
    if (dt.toDateString() === now.toDateString()) return "Today";
    const y = new Date(now); y.setDate(y.getDate() - 1);
    if (dt.toDateString() === y.toDateString()) return "Yesterday";
    return dt.toLocaleDateString();
  };
  const fmtDur = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const renderMessageContent = (text) => {
    if (!text) return null;
    const urlRe = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRe).map((part, i) =>
      urlRe.test(part)
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline hover:text-blue-200">{part.length > 40 ? part.slice(0, 40) + "…" : part}</a>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900 border-b border-neutral-800">
        <button onClick={onBack} className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar name={conv.otherName} photoUrl={conv.otherPhotoUrl} size={40} online={isOnline} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{conv.otherName}</h3>
          <p className="text-[11px] text-neutral-400">
            {isOnline ? (
              <span className="text-green-400">Active now</span>
            ) : (
              <span>{conv.subsystem} • {conv.status === "resolved" ? "Resolved" : "In Progress"}</span>
            )}
          </p>
        </div>
      </div>

      {/* Issue banner */}
      <div className="px-4 py-1.5 bg-neutral-900/50 border-b border-neutral-800/50">
        <p className="text-[11px] text-neutral-500 truncate">
          <span className="text-blue-400 font-medium">Issue:</span> {conv.issue}
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-neutral-950">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-neutral-600 text-sm mt-12">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-neutral-500">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, idx) => {
              const isMe = msg.senderRole === userRole;
              const showName = idx === 0 || messages[idx - 1]?.senderRole !== msg.senderRole;
              const showDate = idx === 0 || fmtDate(messages[idx - 1]?.createdAt) !== fmtDate(msg.createdAt);
              const isImage = msg.messageType === "image" && msg.imageUrl;
              const isVoice = msg.messageType === "voice" && msg.voiceUrl;
              const imgUrl = isImage ? (msg.imageUrl.startsWith("http") ? msg.imageUrl : `${API_URL}${msg.imageUrl}`) : null;
              const vUrl = isVoice ? (msg.voiceUrl.startsWith("http") ? msg.voiceUrl : `${API_URL}${msg.voiceUrl}`) : null;

              return (
                <React.Fragment key={msg._id}>
                  {showDate && <div className="text-center text-[10px] text-neutral-600 my-3">{fmtDate(msg.createdAt)}</div>}
                  <div className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"} group`}>
                    {showName && <span className="text-[10px] text-neutral-500 mb-0.5 px-1">{msg.senderName}</span>}
                    <div className={`flex items-center gap-1 w-full ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {isVoice ? (
                        <VoicePlayer src={vUrl} duration={msg.voiceDuration} isMe={isMe} />
                      ) : isImage ? (
                        <div className={`max-w-[75%] rounded-lg overflow-hidden ${isMe ? "bg-blue-600" : "bg-neutral-800"}`}>
                          <a href={imgUrl} target="_blank" rel="noopener noreferrer">
                            <img src={imgUrl} alt="Shared" className="max-w-full max-h-48 object-contain hover:opacity-90" />
                          </a>
                        </div>
                      ) : (
                        <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${isMe ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-100"}`}>
                          <p className="text-sm leading-relaxed break-words">{renderMessageContent(msg.message)}</p>
                        </div>
                      )}
                      {isMe && (
                        <button onClick={() => handleDeleteMessage(msg._id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-600 mt-0.5 px-1">{fmtTime(msg.createdAt)}</span>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

        {isRecording || audioBlob ? (
          <div className="flex items-center gap-2">
            {isRecording ? (
              <>
                <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-red-900/30 border border-red-700 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-sm">Recording {fmtDur(recordingDuration)}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={cancelRecording} className="h-9 w-9 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></Button>
                <Button size="icon" onClick={stopRecording} className="h-9 w-9 bg-red-600 hover:bg-red-700 text-white rounded-lg"><Square className="w-4 h-4" /></Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg">
                  <Mic className="w-4 h-4 text-blue-400" />
                  <span className="text-neutral-300 text-sm">Voice ready ({fmtDur(recordingDuration)})</span>
                </div>
                <Button variant="ghost" size="icon" onClick={cancelRecording} className="h-9 w-9 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></Button>
                <Button size="icon" onClick={sendVoiceMessage} disabled={sending} className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-500 hover:text-blue-400 hover:bg-neutral-800 rounded-lg"><Paperclip className="w-5 h-5" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1.5 bg-neutral-900 border-neutral-700" side="top" align="start">
                <button onClick={handleImageUpload} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md"><Image className="w-4 h-4 text-green-400" /> Photo</button>
                <button onClick={handleShareLocation} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md"><MapPin className="w-4 h-4 text-red-400" /> Location</button>
                <button onClick={handleShareLink} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md"><Link2 className="w-4 h-4 text-blue-400" /> Link</button>
              </PopoverContent>
            </Popover>

            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-500 hover:text-yellow-400 hover:bg-neutral-800 rounded-lg"><Smile className="w-5 h-5" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 bg-neutral-900 border-neutral-700" side="top">
                <div className="grid grid-cols-8 gap-0.5">
                  {EMOJI_LIST.map((e) => <button key={e} onClick={() => handleEmojiClick(e)} className="w-6 h-6 flex items-center justify-center hover:bg-neutral-800 rounded text-base">{e}</button>)}
                </div>
              </PopoverContent>
            </Popover>

            <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." rows={1}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-full text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50 resize-none text-sm"
              style={{ minHeight: "38px", maxHeight: "80px" }}
            />

            <Button variant="ghost" size="icon" onClick={startRecording} className="h-9 w-9 text-neutral-500 hover:text-blue-400 hover:bg-neutral-800 rounded-lg"><Mic className="w-5 h-5" /></Button>

            <Button type="button" onClick={handleSend} disabled={!newMessage.trim() || sending} size="icon"
              className={`h-9 w-9 rounded-full transition-colors ${newMessage.trim() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-neutral-800 text-neutral-600"}`}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Chat Thread ──────────────────────────────────────
function AdminChatThread({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    let alive = true;
    const fetch = async () => {
      try {
        const data = await adminChatApi.getUserMessages();
        if (alive) { setMessages(data.messages || []); setLoading(false); }
      } catch { if (alive) setLoading(false); }
    };
    fetch();
    const iv = setInterval(fetch, 3000);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await adminChatApi.sendUserMessage(newMessage.trim());
      setNewMessage("");
      const data = await adminChatApi.getUserMessages();
      setMessages(data.messages || []);
    } catch {}
    setSending(false);
  };
  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleEmojiClick = (emoji) => { setNewMessage((p) => p + emoji); setShowEmojiPicker(false); };

  const handleImageUpload = () => { fileInputRef.current?.click(); setShowAttachMenu(false); };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Select an image"); return; }
    setSending(true);
    try { await adminChatApi.sendUserImage(file); const d = await adminChatApi.getUserMessages(); setMessages(d.messages || []); } catch {}
    setSending(false); if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => { setNewMessage((m) => m + ` 📍 https://maps.google.com/?q=${p.coords.latitude},${p.coords.longitude}`); setShowAttachMenu(false); },
        () => alert("Unable to get location")
      );
    }
  };
  const handleShareLink = () => { const l = prompt("Enter URL:"); if (l) setNewMessage((m) => m + ` 🔗 ${l}`); setShowAttachMenu(false); };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr; audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => { setAudioBlob(new Blob(audioChunksRef.current, { type: "audio/webm" })); stream.getTracks().forEach((t) => t.stop()); };
      mr.start(); setIsRecording(true); setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => setRecordingDuration((p) => p + 1), 1000);
    } catch { alert("Cannot access microphone"); }
  };
  const stopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current); } };
  const cancelRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop()); } setIsRecording(false); setAudioBlob(null); setRecordingDuration(0); if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current); };
  const sendVoiceMessage = async () => {
    if (!audioBlob) return; setSending(true);
    try { await adminChatApi.sendUserVoice(audioBlob, recordingDuration); setAudioBlob(null); setRecordingDuration(0); const d = await adminChatApi.getUserMessages(); setMessages(d.messages || []); } catch {}
    setSending(false);
  };
  const handleDeleteMessage = async (id) => {
    if (!confirm("Delete?")) return;
    try { await adminChatApi.deleteMessage(id); setMessages((p) => p.filter((m) => m._id !== id)); } catch {}
  };

  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d) => { const dt = new Date(d); const now = new Date(); if (dt.toDateString() === now.toDateString()) return "Today"; const y = new Date(now); y.setDate(y.getDate() - 1); if (dt.toDateString() === y.toDateString()) return "Yesterday"; return dt.toLocaleDateString(); };
  const fmtDur = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const renderMsgContent = (text) => {
    if (!text) return null;
    const re = /(https?:\/\/[^\s]+)/g;
    return text.split(re).map((p, i) => re.test(p) ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">{p.length > 40 ? p.slice(0, 40) + "…" : p}</a> : <span key={i}>{p}</span>);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900 border-b border-neutral-800">
        <button onClick={onBack} className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <Avatar name="Admin" photoUrl="" size={40} online roleIcon={<Shield className="w-2.5 h-2.5 text-green-400" />} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm">Admin</h3>
          <p className="text-[11px] text-green-400">Support & Assistance</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-neutral-950">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-neutral-600 text-sm mt-12">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-neutral-500">No messages yet</p>
            <p className="text-xs mt-1">Send a message to get help</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, idx) => {
              const isMe = msg.senderRole !== "admin";
              const showDate = idx === 0 || fmtDate(messages[idx - 1]?.createdAt) !== fmtDate(msg.createdAt);
              const isImage = msg.messageType === "image" && msg.imageUrl;
              const isVoice = msg.messageType === "voice" && msg.voiceUrl;
              const imgUrl = isImage ? (msg.imageUrl.startsWith("http") ? msg.imageUrl : `${API_URL}${msg.imageUrl}`) : null;
              const vUrl = isVoice ? (msg.voiceUrl.startsWith("http") ? msg.voiceUrl : `${API_URL}${msg.voiceUrl}`) : null;

              return (
                <React.Fragment key={msg._id}>
                  {showDate && <div className="text-center text-[10px] text-neutral-600 my-3">{fmtDate(msg.createdAt)}</div>}
                  <div className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"} group`}>
                    {!isMe && <span className="text-[10px] text-green-400 mb-0.5 px-1 font-medium">Admin</span>}
                    <div className={`flex items-center gap-1 w-full ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {isVoice ? <VoicePlayer src={vUrl} duration={msg.voiceDuration} isMe={isMe} />
                       : isImage ? (
                        <div className={`max-w-[75%] rounded-lg overflow-hidden ${isMe ? "bg-blue-600" : "bg-neutral-800"}`}>
                          <img src={imgUrl} alt="Shared" className="max-w-full max-h-48 object-contain cursor-pointer hover:opacity-90" onClick={() => window.open(imgUrl, "_blank")} />
                        </div>
                      ) : (
                        <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${isMe ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-100"}`}>
                          <p className="text-sm leading-relaxed break-words">{renderMsgContent(msg.message)}</p>
                        </div>
                      )}
                      {isMe && <button onClick={() => handleDeleteMessage(msg._id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>}
                    </div>
                    <span className="text-[10px] text-neutral-600 mt-0.5 px-1">{fmtTime(msg.createdAt)}</span>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        {isRecording || audioBlob ? (
          <div className="flex items-center gap-2">
            {isRecording ? (
              <>
                <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-red-900/30 border border-red-700 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-sm">Recording {fmtDur(recordingDuration)}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={cancelRecording} className="h-9 w-9 text-neutral-400"><X className="w-5 h-5" /></Button>
                <Button size="icon" onClick={stopRecording} className="h-9 w-9 bg-red-600 text-white rounded-lg"><Square className="w-4 h-4" /></Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg">
                  <Mic className="w-4 h-4 text-blue-400" />
                  <span className="text-neutral-300 text-sm">Voice ready ({fmtDur(recordingDuration)})</span>
                </div>
                <Button variant="ghost" size="icon" onClick={cancelRecording} className="h-9 w-9 text-neutral-400"><X className="w-5 h-5" /></Button>
                <Button size="icon" onClick={sendVoiceMessage} disabled={sending} className="h-9 w-9 bg-blue-600 text-white rounded-lg">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
              <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-500 hover:text-blue-400"><Paperclip className="w-5 h-5" /></Button></PopoverTrigger>
              <PopoverContent className="w-44 p-1.5 bg-neutral-900 border-neutral-700" side="top" align="start">
                <button onClick={handleImageUpload} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md"><Image className="w-4 h-4 text-green-400" /> Photo</button>
                <button onClick={handleShareLocation} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md"><MapPin className="w-4 h-4 text-red-400" /> Location</button>
                <button onClick={handleShareLink} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md"><Link2 className="w-4 h-4 text-blue-400" /> Link</button>
              </PopoverContent>
            </Popover>
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-500 hover:text-yellow-400"><Smile className="w-5 h-5" /></Button></PopoverTrigger>
              <PopoverContent className="w-56 p-2 bg-neutral-900 border-neutral-700" side="top">
                <div className="grid grid-cols-8 gap-0.5">
                  {EMOJI_LIST.map((e) => <button key={e} onClick={() => handleEmojiClick(e)} className="w-6 h-6 flex items-center justify-center hover:bg-neutral-800 rounded text-base">{e}</button>)}
                </div>
              </PopoverContent>
            </Popover>
            <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." rows={1}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-full text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50 resize-none text-sm"
              style={{ minHeight: "38px", maxHeight: "80px" }}
            />
            <Button variant="ghost" size="icon" onClick={startRecording} className="h-9 w-9 text-neutral-500 hover:text-blue-400"><Mic className="w-5 h-5" /></Button>
            <Button type="button" onClick={handleSend} disabled={!newMessage.trim() || sending} size="icon"
              className={`h-9 w-9 rounded-full ${newMessage.trim() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-neutral-800 text-neutral-600"}`}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Messenger Panel ───────────────────────────────────
export default function MessengerPanel({ isOpen, onClose }) {
  const [view, setView] = useState("list"); // "list" | "chat" | "admin"
  const [selectedConv, setSelectedConv] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [adminConv, setAdminConv] = useState({ online: false, lastMessage: "", lastTime: "", unreadCount: 0 });
  const [activeNowUsers, setActiveNowUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data.conversations || []);

      // Check online status for each conversation
      const activeList = [];
      for (const conv of (data.conversations || [])) {
        try {
          const aData = await chatApi.getActiveUsers(conv.alertId);
          const currentUser = loadCurrentUser();
          const others = (aData.activeUsers || []).filter((u) => u.role !== currentUser?.role?.toLowerCase());
          if (others.length > 0) {
            conv.isOnline = true;
            activeList.push({
              id: conv.alertId,
              name: conv.otherName,
              photoUrl: conv.otherPhotoUrl,
              onClick: () => { setSelectedConv(conv); setView("chat"); },
            });
          }
        } catch {}
      }
      setActiveNowUsers(activeList);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
    setLoading(false);
  }, []);

  // Fetch admin unread
  const fetchAdminUnread = useCallback(async () => {
    try {
      const data = await adminChatApi.getUnreadCount();
      setAdminConv((prev) => ({ ...prev, unreadCount: data.unreadCount || 0 }));
    } catch {}
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchConversations();
    fetchAdminUnread();
    const iv = setInterval(() => { fetchConversations(); fetchAdminUnread(); }, 8000);
    return () => clearInterval(iv);
  }, [isOpen, fetchConversations, fetchAdminUnread]);

  // Reset view when closed
  useEffect(() => {
    if (!isOpen) { setView("list"); setSelectedConv(null); }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) + (adminConv.unreadCount || 0);

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 w-full sm:w-[400px] h-[100dvh] sm:h-[600px] bg-neutral-950 border border-neutral-800 sm:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Top bar (only on list view) */}
      {view === "list" && (
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-white text-base">Chats</h2>
            {totalUnread > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-[10px] text-white font-bold">{totalUnread}</span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === "list" && (
          <ConversationList
            conversations={conversations}
            adminConv={adminConv}
            activeUsers={activeNowUsers}
            onSelect={(conv) => { setSelectedConv(conv); setView("chat"); }}
            onSelectAdmin={() => setView("admin")}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {view === "chat" && selectedConv && (
          <ChatThread conv={selectedConv} onBack={() => { setView("list"); fetchConversations(); }} />
        )}
        {view === "admin" && (
          <AdminChatThread onBack={() => { setView("list"); fetchAdminUnread(); }} />
        )}
      </div>
    </div>
  );
}
