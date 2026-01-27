import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatApi } from "@/lib/repairAlertsApi";
import { loadCurrentUser } from "@/lib/auth";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";

export function ChatBox({ alertId, alertInfo, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
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
    e.preventDefault();
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const otherParty = userRole === 'engineer' 
    ? alertInfo?.technicianName 
    : alertInfo?.engineerName;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 bg-zinc-800 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-semibold text-white text-sm">Chat with {otherParty || "Technician"}</h3>
            <p className="text-xs text-zinc-400">{alertInfo?.subsystem} - {alertInfo?.issue?.slice(0, 30)}...</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-8 w-8 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 text-sm">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMe = msg.senderRole === userRole;
              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      isMe
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-700 text-white"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <span className="text-xs text-zinc-500 mt-1">
                    {msg.senderName} • {formatTime(msg.createdAt)}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-zinc-700 bg-zinc-800 rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
            disabled={sending}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ChatBox;
