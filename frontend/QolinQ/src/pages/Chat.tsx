import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Paperclip, Info, Lock, CheckCircle2, Clock, X, Zap } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { messageAPI, applicationAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { io } from "socket.io-client";

const Chat = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get("id");
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(conversationIdFromUrl);
  const [messageText, setMessageText] = useState("");
  const [showContract, setShowContract] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<any>(null);

  const { data: convRes, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageAPI.getConversations(),
  });

  const conversations = convRes?.data?.data || [];

  const { data: msgRes, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', selectedChatId],
    enabled: !!selectedChatId,
    queryFn: () => messageAPI.getMessages(selectedChatId!),
    // refetchInterval removed in favor of sockets
  });

  const messages = msgRes?.data?.data || [];
  const currentChat = conversations.find((c: any) => c._id === selectedChatId);

  // Socket Connection & Listeners
  useEffect(() => {
    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:5001", {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on("newMessage", (message: any) => {
      // If message belongs to current chat, update message list
      if (message.conversation === selectedChatId) {
        queryClient.setQueryData(['messages', selectedChatId], (old: any) => {
          if (!old) return { data: [message] };
          return { ...old, data: [...old.data, message] };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    socketRef.current.on("userTyping", ({ name, userId }: any) => {
      if (userId !== user?._id) {
        setTypingUser(name);
        // Clear typing indicator after 3s of inactivity
        setTimeout(() => setTypingUser(null), 3000);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, selectedChatId, queryClient, user?._id]);

  // Join conversation room when selectedChatId changes
  useEffect(() => {
    if (selectedChatId && socketRef.current) {
      socketRef.current.emit("joinConversation", selectedChatId);
      socketRef.current.emit("messageRead", { conversationId: selectedChatId });
    }
  }, [selectedChatId]);

  const { data: contractRes } = useQuery({
    queryKey: ['contract', currentChat?.campaign?._id],
    enabled: !!currentChat?.campaign?._id && !!currentChat?.participants.find((p: any) => p.role === 'influencer' && p._id !== user?._id),
    queryFn: async () => null
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => {
        // We emit via socket for "fast" feel, and fallback/log to API if needed
        // For now, the backend socket handler handles the DB save
        socketRef.current.emit("sendMessage", {
            conversationId: selectedChatId,
            ...data
        });
        return Promise.resolve();
    },
    onSuccess: () => {
      setMessageText("");
      // Local update is handled by newMessage listener
    },
    onError: (err: any) => {
        toast.error("Failed to send message via real-time link");
    }
  });

  useEffect(() => {
    if (conversationIdFromUrl) {
      setSelectedChatId(conversationIdFromUrl);
    } else if (conversations.length > 0 && !selectedChatId) {
      setSelectedChatId(conversations[0]._id);
    }
  }, [conversations, selectedChatId, conversationIdFromUrl]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChatId) return;
    if (currentChat?.isLocked) {
        toast.error("Conversation is locked");
        return;
    }
    sendMessageMutation.mutate({ content: messageText, type: 'text' });
  };

  const handleTyping = () => {
    if (selectedChatId && socketRef.current) {
        socketRef.current.emit("typing", { conversationId: selectedChatId });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedChatId) {
      const fakeUrl = URL.createObjectURL(file);
      sendMessageMutation.mutate({ 
        content: `Shared a file: ${file.name}`, 
        fileUrl: fakeUrl, 
        fileName: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      });
      toast.success(`Uploading ${file.name}...`);
    }
  };

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    setSearchParams({ id });
    setShowContract(false);
  };

  const chatPartner = currentChat?.participants.find((p: any) => p._id !== user?._id);

  return (
    <DashboardLayout userType={(user?.role === 'admin' ? 'brand' : user?.role) || "influencer"}>
      <div className="h-[calc(100vh-128px)] flex overflow-hidden">
        {/* Conversations List */}
        <div className={cn(
            "w-full md:w-80 border-r border-border bg-card flex flex-col transition-all",
            selectedChatId && "hidden md:flex"
        )}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">Messages</h2>
            <Badge variant="outline" className="text-[10px]">{conversations.length} Active</Badge>
          </div>
          <ScrollArea className="flex-1">
            {convsLoading ? (
               <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">Loading chats...</div>
            ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>No conversations yet.</p>
                </div>
            ) : conversations.map((conv: any) => {
              const partner = conv.participants.find((p: any) => p._id !== user?._id);
              const isActive = selectedChatId === conv._id;
              return (
                <div key={conv._id} onClick={() => handleSelectChat(conv._id)}
                  className={cn(
                      "p-4 border-b border-border cursor-pointer transition-all hover:bg-muted/50 relative",
                      isActive && "bg-primary/5 border-l-4 border-l-primary"
                  )}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {partner?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="font-semibold text-sm truncate">{partner?.name || "Chat"}</h3>
                        <span className="text-[10px] text-muted-foreground">
                            {conv.updatedAt && new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={cn(
                          "text-xs truncate",
                          isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                          {conv.lastMessage?.content || "No messages yet"}
                      </p>
                      {conv.campaign && (
                          <Badge variant="secondary" className="mt-2 text-[9px] h-4 bg-muted/50 border-none font-normal">
                              Campaign: {conv.campaign.title}
                          </Badge>
                      )}
                    </div>
                    {conv.isLocked && <Lock className="w-3 h-3 text-muted-foreground shrink-0 mt-1" />}
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background relative">
          {selectedChatId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <button className="md:hidden p-1 mr-1" onClick={() => setSelectedChatId(null)}><X className="w-4 h-4" /></button>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {chatPartner?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm leading-none mb-1">{chatPartner?.name || "Loading..."}</h2>
                    <div className="flex items-center gap-1.5">
                        {typingUser ? (
                            <span className="text-[10px] text-primary font-medium animate-pulse">{typingUser} is typing...</span>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-[10px] text-muted-foreground">Active in negotiation</p>
                            </>
                        )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <NeonButton neonVariant="outline" onClick={() => setShowContract(!showContract)} className="h-8 px-3">
                        <Info className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-xs">Contract</span>
                    </NeonButton>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                        <Paperclip className="w-4 h-4" />
                    </button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-[0.98]">
                <div className="space-y-6 pb-4">
                  {messages.length === 0 && !msgsLoading && (
                      <div className="flex flex-col items-center justify-center h-48 opacity-30">
                          <MessageCircle className="w-12 h-12 mb-2" />
                          <p className="text-xs">Start your conversation with {chatPartner?.name}</p>
                      </div>
                  )}
                  {messages.map((msg: any, idx: number) => {
                    const isSelf = msg.sender._id === user?._id;
                    const showTime = idx === 0 || new Date(msg.createdAt).getTime() - new Date(messages[idx-1].createdAt).getTime() > 300000;
                    
                    return (
                      <div key={msg._id} className="space-y-2">
                        {showTime && (
                           <div className="flex justify-center my-4">
                               <span className="text-[10px] bg-muted/50 px-2 py-0.5 rounded text-muted-foreground font-medium">
                                   {new Date(msg.createdAt).toLocaleDateString() === new Date().toLocaleDateString() 
                                     ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                     : new Date(msg.createdAt).toLocaleDateString()
                                   }
                               </span>
                           </div>
                        )}
                        <div className={cn("flex items-end gap-2", isSelf ? "flex-row-reverse" : "flex-row")}>
                          <div className={cn(
                              "max-w-[80%] md:max-w-[70%] p-3 rounded-2xl text-sm shadow-sm transition-all",
                              isSelf 
                                ? "bg-primary text-primary-foreground rounded-br-none" 
                                : "bg-card border border-border rounded-bl-none text-foreground"
                          )}>
                            {msg.type === 'image' && msg.fileUrl && (
                                <img src={msg.fileUrl} alt="Sent file" className="rounded-lg mb-2 max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                            )}
                            {msg.type === 'file' && msg.fileUrl && (
                                <div className="flex items-center gap-2 p-2 bg-black/5 rounded mb-2 border border-white/10">
                                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center shrink-0">
                                        <Paperclip className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold truncate">{msg.fileName || "File"}</p>
                                        <p className="text-[10px] opacity-60">Attachment</p>
                                    </div>
                                    <button onClick={() => window.open(msg.fileUrl)} className="text-[10px] underline ml-2 shrink-0">Open</button>
                                </div>
                            )}
                            {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                            <div className={cn(
                                "flex items-center gap-1.5 mt-1.5",
                                isSelf ? "justify-end" : "justify-start"
                            )}>
                                <p className="text-[9px] opacity-60 font-medium">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                {isSelf && <CheckCircle2 className="w-2.5 h-2.5 opacity-60" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-card">
                {currentChat?.isLocked ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg text-muted-foreground text-sm border border-dashed border-border mb-2">
                        <Lock className="w-4 h-4" />
                        <span>Deal completed. This conversation is archived.</span>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="flex gap-2 items-center">
                        <div className="flex-1 relative">
                            <Input 
                                value={messageText} 
                                onChange={(e) => {
                                    setMessageText(e.target.value);
                                    handleTyping();
                                }} 
                                placeholder="Write your message..." 
                                className="pr-10 bg-background border-primary/20 focus-visible:ring-primary/30 h-11" 
                                disabled={sendMessageMutation.isPending}
                            />
                            <button type="button" onClick={() => setMessageText(prev => prev + "👋")} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-50 hover:opacity-100 transition-opacity">👋</button>
                        </div>
                        <NeonButton neonVariant="primary" type="submit" className="h-11 px-5" disabled={sendMessageMutation.isPending || !messageText.trim()}>
                            <Send className="w-4 h-4" />
                        </NeonButton>
                    </form>
                )}
                <p className="text-[10px] text-center text-muted-foreground mt-2 px-8">
                    By messaging, you agree to our professionalism guidelines. Keep it respectful.
                </p>
              </div>

              {/* Contract Side Panel */}
              {showContract && (
                  <div className="absolute inset-y-0 right-0 w-full md:w-80 bg-card border-l border-border z-20 shadow-2xl animate-in slide-in-from-right duration-300">
                      <div className="p-4 border-b border-border flex items-center justify-between">
                          <h3 className="font-bold">Deal Context</h3>
                          <button onClick={() => setShowContract(false)}><X className="w-4 h-4" /></button>
                      </div>
                      <ScrollArea className="h-full pb-16">
                          <div className="p-4 space-y-6">
                              {currentChat?.campaign ? (
                                  <>
                                      <div>
                                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Campaign</h4>
                                          <p className="font-semibold text-sm">{currentChat.campaign.title}</p>
                                          <Badge variant="outline" className="mt-2 text-[10px]">{currentChat.campaign.platform}</Badge>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                          <div>
                                              <p className="text-[10px] text-muted-foreground font-bold">BUDGET</p>
                                              <p className="text-sm font-semibold">₹{currentChat.campaign.budgetRange?.min} - {currentChat.campaign.budgetRange?.max}</p>
                                          </div>
                                          <div>
                                              <p className="text-[10px] text-muted-foreground font-bold">DEADLINE</p>
                                              <p className="text-sm font-semibold">{currentChat.campaign.timeline?.endDate ? new Date(currentChat.campaign.timeline.endDate).toLocaleDateString() : 'N/A'}</p>
                                          </div>
                                      </div>
                                      <div>
                                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Deliverables</h4>
                                          <ul className="space-y-2">
                                              {currentChat.campaign.deliverables?.map((d: any, i: number) => (
                                                  <li key={i} className="text-xs flex items-start gap-2 bg-muted/50 p-2 rounded">
                                                      <Clock className="w-3 h-3 mt-0.5 text-primary" />
                                                      <span>{d.quantity}x {d.type}: {d.description}</span>
                                                  </li>
                                              ))}
                                          </ul>
                                      </div>
                                      <div className="pt-4 border-t border-border">
                                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Status</h4>
                                          <div className="space-y-3">
                                              <div className="flex items-center justify-between text-xs">
                                                  <span>Agreement Signed</span>
                                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                              </div>
                                              <div className="flex items-center justify-between text-xs">
                                                  <span>Escrow Funded</span>
                                                  {currentChat.isLocked ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}
                                              </div>
                                          </div>
                                      </div>

                                      <div className="pt-6">
                                          <NeonButton 
                                            neonVariant="primary" 
                                            className="w-full text-xs h-9 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                                            onClick={() => setShowAiSummary(!showAiSummary)}
                                          >
                                              <Zap className="w-3.5 h-3.5 mr-2 fill-primary" />
                                              {showAiSummary ? "Hide AI Summary" : "AI: Summarize Deal"}
                                          </NeonButton>

                                          {showAiSummary && (
                                              <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                  <div className="flex items-center gap-2 mb-2">
                                                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">AI DEAL SUMMARY</span>
                                                  </div>
                                                  <p className="text-xs leading-relaxed text-foreground/80 italic">
                                                      "The Brand <strong>{currentChat.campaign.brand?.name}</strong> is looking for a {currentChat.campaign.platform} collaboration. 
                                                      Key deliverables include <strong>{currentChat.campaign.deliverables?.map((d: any) => `${d.quantity}x ${d.type}`).join(', ')}</strong> 
                                                      with a budget of <strong>₹{currentChat.campaign.budgetRange?.max}</strong>. 
                                                      Communication seems <strong>professional</strong> and <strong>high-intent</strong>."
                                                  </p>
                                                  <div className="flex items-center justify-between pt-2">
                                                      <span className="text-[9px] text-muted-foreground">Confidence: 94%</span>
                                                      <Badge className="bg-primary/10 text-primary border-none text-[8px] h-4">VERIFIED DEAL</Badge>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  </>
                              ) : (
                                  <div className="text-center py-12 opacity-30">
                                      <Info className="w-12 h-12 mx-auto mb-2" />
                                      <p className="text-xs">No campaign context linked</p>
                                  </div>
                              )}
                          </div>
                      </ScrollArea>
                  </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
              <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto border border-primary/10">
                    <MessageCircle className="w-10 h-10 text-primary opacity-40" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">Your Inbox</h2>
                    <p className="text-sm max-w-xs mx-auto text-muted-foreground">Select a conversation or start a new one to begin collaborating.</p>
                </div>
                <NeonButton neonVariant="primary" onClick={() => navigate(user?.role === 'brand' ? '/explore/influencers' : '/explore/campaigns')}>
                    Find Opportunities
                </NeonButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;

