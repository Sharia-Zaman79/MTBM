import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatApi } from "@/lib/repairAlertsApi";
import { loadCurrentUser } from "@/lib/auth";
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
  Wrench,
  Circle,
  Trash2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Common emojis for quick access
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
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg min-w-[180px] ${
        isMe ? "bg-orange-600" : "bg-neutral-800"
      }`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isMe 
            ? "bg-orange-700 hover:bg-orange-800" 
            : "bg-neutral-700 hover:bg-neutral-600"
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-white" />
        ) : (
          <Play className="w-4 h-4 text-white ml-0.5" />
        )}
      </button>
      <div className="flex-1">
        <div className={`h-1 rounded-full overflow-hidden ${isMe ? "bg-orange-700" : "bg-neutral-700"}`}>
          <div 
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Mic className="w-3 h-3 text-white/70" />
          <span className="text-[10px] text-white/70">
            {formatDuration(isPlaying ? currentTime : duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ChatBox({ alertId, alertInfo, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
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
  const currentUser = loadCurrentUser();
  const userRole = currentUser?.role?.toLowerCase();

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages on mount and poll for new ones
  useEffect(() => {
    let isMounted = true;
    let pollInterval;

    const fetchMessages = async () => {
      try {
        const data = await chatApi.getMessages(alertId);
        if (isMounted) {
          setMessages(data.messages || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchMessages();

    // Poll for new messages every 3 seconds
    pollInterval = setInterval(async () => {
      try {
        const lastMessage = messages[messages.length - 1];
        const since = lastMessage?.createdAt;
        const data = await chatApi.getMessages(alertId, since);
        
        if (isMounted && data.messages?.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m._id));
            const newMessages = data.messages.filter(m => !existingIds.has(m._id));
            return newMessages.length > 0 ? [...prev, ...newMessages] : prev;
          });
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [alertId]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const result = await chatApi.sendMessage(alertId, newMessage.trim());
      setMessages(prev => [...prev, result.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setShowAttachMenu(false);
    setSending(true);

    try {
      const result = await chatApi.sendImage(alertId, file);
      setMessages((prev) => [...prev, result.data]);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image: ' + err.message);
    } finally {
      setSending(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          setNewMessage((prev) => prev + ` 📍 Location: ${locationUrl}`);
          setShowAttachMenu(false);
        },
        () => {
          alert("Unable to get location. Please enable location access.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleShareLink = () => {
    const link = prompt("Enter the URL to share:");
    if (link) {
      setNewMessage((prev) => prev + ` 🔗 ${link}`);
    }
    setShowAttachMenu(false);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Update duration every second
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Unable to access microphone. Please enable microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
    setIsRecording(false);
    setAudioBlob(null);
    setRecordingDuration(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) return;

    setSending(true);
    try {
      const result = await chatApi.sendVoice(alertId, audioBlob, recordingDuration);
      setMessages(prev => [...prev, result.data]);
      setAudioBlob(null);
      setRecordingDuration(0);
    } catch (err) {
      console.error('Error sending voice message:', err);
      alert('Failed to send voice message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await chatApi.deleteMessage(alertId, messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message: ' + err.message);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const otherParty = userRole === 'engineer' 
    ? alertInfo?.technicianName 
    : alertInfo?.engineerName;

  const statusColor =
    alertInfo?.status === "resolved"
      ? "bg-green-500"
      : alertInfo?.status === "in-progress"
      ? "bg-blue-500"
      : "bg-yellow-500";

  // Detect if message contains a link
  const renderMessageContent = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-300 hover:text-blue-200"
          >
            {part.length > 40 ? part.slice(0, 40) + "..." : part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 w-full sm:w-[400px] h-[100dvh] sm:h-[520px] bg-neutral-950 border border-neutral-800 sm:rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              {otherParty || "Technician"}
              <Circle className={`w-2 h-2 ${statusColor} fill-current`} />
            </h3>
            <p className="text-xs text-neutral-500">
              {alertInfo?.subsystem} • {alertInfo?.status === "resolved" ? "Resolved" : "In Progress"}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Issue Description */}
      <div className="px-4 py-2 bg-neutral-900/50 border-b border-neutral-800/50">
        <p className="text-xs text-neutral-400 line-clamp-1">
          <span className="text-orange-400 font-medium">Issue:</span> {alertInfo?.issue}
        </p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-neutral-950">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 text-sm">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-neutral-600 text-sm mt-12">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-neutral-500">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start discussing</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isMe = msg.senderRole === userRole;
              const showName =
                index === 0 || messages[index - 1]?.senderRole !== msg.senderRole;
              const isImage = msg.messageType === 'image' && msg.imageUrl;
              const isVoice = msg.messageType === 'voice' && msg.voiceUrl;
              const imageFullUrl = isImage
                ? (msg.imageUrl.startsWith('http') ? msg.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${msg.imageUrl}`)
                : null;
              const voiceFullUrl = isVoice
                ? (msg.voiceUrl.startsWith('http') ? msg.voiceUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${msg.voiceUrl}`)
                : null;

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}
                >
                  {showName && (
                    <span className="text-[10px] text-neutral-500 mb-1 px-1">
                      {msg.senderName}
                    </span>
                  )}
                  <div className={`flex items-center gap-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {isVoice ? (
                      <VoicePlayer 
                        src={voiceFullUrl} 
                        duration={msg.voiceDuration} 
                        isMe={isMe} 
                      />
                    ) : isImage ? (
                      <div
                        className={`max-w-[80%] rounded-lg overflow-hidden ${
                          isMe ? "bg-orange-600" : "bg-neutral-800"
                        }`}
                      >
                        <a href={imageFullUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={imageFullUrl}
                            alt="Shared image"
                            className="max-w-full max-h-48 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '';
                              e.target.alt = 'Image failed to load';
                            }}
                          />
                        </a>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          isMe
                            ? "bg-orange-600 text-white"
                            : "bg-neutral-800 text-neutral-100"
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words">
                          {renderMessageContent(msg.message)}
                        </p>
                      </div>
                    )}
                    {/* Delete button - only for own messages */}
                    {isMe && (
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-red-400"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-600 mt-1 px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800">
        {/* Voice Recording UI */}
        {isRecording || audioBlob ? (
          <div className="flex items-center gap-2">
            {isRecording ? (
              <>
                <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-red-900/30 border border-red-700 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-sm font-medium">
                    Recording {formatDuration(recordingDuration)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelRecording}
                  className="h-9 w-9 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  onClick={stopRecording}
                  className="h-9 w-9 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  <Square className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg">
                  <Mic className="w-4 h-4 text-orange-400" />
                  <span className="text-neutral-300 text-sm">
                    Voice message ready ({formatDuration(recordingDuration)})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelRecording}
                  className="h-9 w-9 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  onClick={sendVoiceMessage}
                  disabled={sending}
                  className="h-9 w-9 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Attachment Menu */}
            <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-neutral-500 hover:text-orange-400 hover:bg-neutral-800 rounded-lg"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-44 p-1.5 bg-neutral-900 border-neutral-700"
                side="top"
                align="start"
              >
                <button
                  onClick={handleImageUpload}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md"
                >
                  <Image className="w-4 h-4 text-green-400" />
                  Photo
                </button>
                <button
                  onClick={handleShareLocation}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md"
                >
                  <MapPin className="w-4 h-4 text-red-400" />
                  Location
                </button>
                <button
                  onClick={handleShareLink}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md"
                >
                  <Link2 className="w-4 h-4 text-blue-400" />
                  Link
                </button>
              </PopoverContent>
            </Popover>

            {/* Emoji Picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-neutral-500 hover:text-yellow-400 hover:bg-neutral-800 rounded-lg"
                >
                  <Smile className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-56 p-2 bg-neutral-900 border-neutral-700"
                side="top"
              >
                <div className="grid grid-cols-8 gap-0.5">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-neutral-800 rounded text-base"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Text Input */}
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/50 resize-none text-sm"
                disabled={sending}
                style={{ minHeight: "38px", maxHeight: "80px" }}
              />
            </div>

            {/* Voice Recording Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={startRecording}
              className="h-9 w-9 text-neutral-500 hover:text-orange-400 hover:bg-neutral-800 rounded-lg"
              title="Record voice message"
            >
              <Mic className="w-5 h-5" />
            </Button>

            {/* Send Button */}
            <Button
              type="button"
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              size="icon"
              className={`h-9 w-9 rounded-lg transition-colors ${
                newMessage.trim()
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-neutral-800 text-neutral-600"
              }`}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*,.pdf,.doc,.docx"
          className="hidden"
        />
      </div>
    </div>
  );
}

export default ChatBox;
