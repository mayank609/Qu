import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { messageAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const Chat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get("id");
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(conversationIdFromUrl);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: convRes, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageAPI.getConversations(),
  });

  const conversations = convRes?.data?.data || [];

  const { data: msgRes, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', selectedChatId],
    enabled: !!selectedChatId,
    queryFn: () => messageAPI.getMessages(selectedChatId!),
    refetchInterval: 3000, // Faster polling for better "real-time" feel without sockets on frontend
  });

  const messages = msgRes?.data?.data || [];

  const sendMessageMutation = useMutation({
    mutationFn: (text: string) => messageAPI.sendMessage(selectedChatId!, { content: text }),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChatId] });
    }
  });

  useEffect(() => {
    // If we have an ID from URL, prioritize it
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
    sendMessageMutation.mutate(messageText);
  };

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    setSearchParams({ id });
  };

  const currentChat = conversations.find((c: any) => c._id === selectedChatId);
  const chatPartner = currentChat?.participants.find((p: any) => p._id !== user?._id);

  return (
    <DashboardLayout userType={user?.role || "influencer"}>
      <div className="h-[calc(100vh-128px)] flex overflow-hidden">
        <div className="w-full md:w-72 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold">Messages</h2>
          </div>
          <ScrollArea className="flex-1">
            {convsLoading ? (
               <div className="p-4 text-center text-sm text-muted-foreground">Loading chats...</div>
            ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet.</div>
            ) : conversations.map((conv: any) => {
              const partner = conv.participants.find((p: any) => p._id !== user?._id);
              return (
                <div key={conv._id} onClick={() => handleSelectChat(conv._id)}
                  className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${selectedChatId === conv._id ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-0.5 truncate">{partner?.name || "Chat"}</h3>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage?.content || "No messages yet"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col bg-background/50">
          {selectedChatId ? (
            <>
              <div className="p-4 border-b border-border bg-card">
                <h2 className="font-semibold">{chatPartner?.name || "Chat"}</h2>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg: any) => (
                    <div key={msg._id} className={`flex ${msg.sender._id === user?._id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                        msg.sender._id === user?._id ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none text-foreground"
                      }`}>
                        <p>{msg.content}</p>
                        <p className="text-[10px] opacity-60 mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border bg-card">
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input 
                    value={messageText} 
                    onChange={(e) => setMessageText(e.target.value)} 
                    placeholder="Type your message..." 
                    className="flex-1 bg-background" 
                    disabled={sendMessageMutation.isPending}
                  />
                  <NeonButton neonVariant="primary" type="submit" disabled={sendMessageMutation.isPending || !messageText.trim()}>
                    <Send className="w-4 h-4" />
                  </NeonButton>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center">
              <div>
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Select a message to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
