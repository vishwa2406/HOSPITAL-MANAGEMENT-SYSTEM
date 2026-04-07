import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, AlertTriangle } from "lucide-react";
import api from "@/services/api";



export default function PatientChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI health assistant. I can help with general health questions and symptoms. **Please note: This is not a medical diagnosis.** Always consult a doctor for proper medical advice.\n\nHow can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { prompt: input.trim() });
      setMessages([...newMessages, { role: "assistant", content: res.data.response }]);
      setLoading(false);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again later." }]);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="flex flex-col h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)]">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">AI Health Assistant</h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" />
            <span>Disclaimer: This AI provides general health information only, not medical diagnoses.</span>
          </div>
        </div>

        <div className="flex-1 bg-card rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                }`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[75%] p-3 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted p-3 rounded-xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-border">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your health question..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
