import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { socket } from '@/services/socket';
import api from '@/services/api';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, MoreVertical, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatPage() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChatAndMessages = async () => {
      try {
        const chatRes = await api.get(`/chat/${appointmentId}`);
        setChat(chatRes.data);
        
        const msgRes = await api.get(`/chat/messages/${chatRes.data._id}`);
        setMessages(msgRes.data);
        setLoading(false);
        
        // Connect to socket and join room
        socket.connect();
        socket.emit('join_chat', chatRes.data._id);
      } catch (error) {
        console.error('Error fetching chat:', error);
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchChatAndMessages();
    }

    return () => {
      socket.disconnect();
    };
  }, [appointmentId]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      if (data.chatId === chat?._id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on('user_typing', ({ userId }) => {
      if (userId !== user?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [chat, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        chatId: chat._id,
        message: newMessage.trim(),
        senderId: user._id,
        createdAt: new Date().toISOString()
      };

      // Real-time update via socket
      socket.emit('send_message', messageData);
      
      // Save to database
      await api.post('/chat/messages', {
        chatId: chat._id,
        message: newMessage.trim()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    socket.emit('typing', { chatId: chat?._id, userId: user?._id });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Chat...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="bg-white p-4 rounded-t-2xl border-b border-border shadow-sm flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Doctor Consultation Chat</h2>
              <p className="text-xs text-muted-foreground">
                {isTyping ? 'Typing...' : 'Always secure and confidential'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages Layout */}
        <div className="flex-1 bg-white p-6 overflow-y-auto space-y-4 border-l border-r border-border scrollbar-hide">
          {messages.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <p className="text-sm">No messages yet. Send a message to start the conversation.</p>
            </div>
          )}
          
          {messages.map((msg, index) => {
            const isMe = msg.senderId === user?._id;
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] group`}>
                  <div className={`p-4 rounded-2xl text-sm shadow-sm relative ${
                    isMe 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    {msg.message}
                    <p className={`text-[10px] mt-1 opacity-70 flex justify-end`}>
                      {format(new Date(msg.createdAt), 'hh:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 rounded-b-2xl border-t border-border shadow-sm">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type your message here..."
              className="rounded-xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 h-12"
            />
            <Button 
              type="submit" 
              className="rounded-xl h-12 w-12 p-0 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
              disabled={!newMessage.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
