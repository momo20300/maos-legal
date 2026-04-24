import { Layout } from "@/components/layout/layout";
import { ChatSidebar } from "@/components/chat/sidebar";
import { MessageBubble } from "@/components/chat/message-bubble";
import { JurisdictionBadge } from "@/components/chat/jurisdiction-badge";
import { useGetAnthropicConversation, getGetAnthropicConversationQueryKey, useListAnthropicMessages, getListAnthropicMessagesQueryKey, AnthropicMessage } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Info, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationPage() {
  const [, params] = useRoute("/conversations/:id");
  const id = Number(params?.id);
  const queryClient = useQueryClient();
  
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading: isLoadingConv } = useGetAnthropicConversation(id, {
    query: { enabled: !!id, queryKey: getGetAnthropicConversationQueryKey(id) }
  });

  const { data: messages, isLoading: isLoadingMsgs } = useListAnthropicMessages(id, {
    query: { enabled: !!id, queryKey: getListAnthropicMessagesQueryKey(id) }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedContent]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !id) return;

    const userContent = input;
    setInput("");
    setIsStreaming(true);
    setStreamedContent("");

    // Optimistically add user message to cache
    const tempUserMessage: AnthropicMessage = {
      id: Date.now(),
      conversationId: id,
      role: "user",
      content: userContent,
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData<AnthropicMessage[]>(
      getListAnthropicMessagesQueryKey(id), 
      (old) => old ? [...old, tempUserMessage] : [tempUserMessage]
    );

    try {
      // Raw fetch to handle SSE streaming
      const response = await fetch(`/api/anthropic/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userContent })
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullResponse += data.content;
                  setStreamedContent(fullResponse);
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
      
      // Invalidate to get final saved messages from DB
      await queryClient.invalidateQueries({ queryKey: getListAnthropicMessagesQueryKey(id) });
      
    } catch (error) {
      console.error("Streaming error:", error);
    } finally {
      setIsStreaming(false);
      setStreamedContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar />
        
        <main className="flex-1 flex flex-col bg-background relative">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card flex items-center px-6 justify-between shrink-0">
            {isLoadingConv ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : conversation ? (
              <div>
                <h2 className="font-serif font-bold text-lg leading-tight flex items-center gap-3">
                  {conversation.title}
                  <JurisdictionBadge jurisdiction={conversation.jurisdiction} className="text-[10px] h-5 py-0 px-2" />
                </h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <FileText className="w-3 h-3" />
                  {conversation.legalDomain}
                </p>
              </div>
            ) : (
              <div>Conversation not found</div>
            )}
          </header>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-4xl mx-auto flex flex-col">
              
              {messages?.length === 0 && !isStreaming && (
                <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                    <Info className="w-8 h-8 opacity-50" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-foreground text-lg mb-1">Consultation Ready</h3>
                    <p className="text-sm max-w-md mx-auto">
                      Your legal intelligence expert is ready. Describe your situation, ask for definitions, or request analysis based on {conversation?.jurisdiction} law.
                    </p>
                  </div>
                </div>
              )}

              {isLoadingMsgs ? (
                <div className="space-y-6">
                  <Skeleton className="h-24 w-3/4 self-end rounded-2xl" />
                  <Skeleton className="h-48 w-3/4 rounded-2xl" />
                </div>
              ) : (
                messages?.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))
              )}

              {/* Streaming Bubble */}
              {isStreaming && streamedContent && (
                <MessageBubble message={{ role: "assistant", content: streamedContent }} />
              )}
              
              {/* Loading indicator before stream starts */}
              {isStreaming && !streamedContent && (
                <div className="flex items-center gap-3 text-muted-foreground text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-serif italic">Analyzing legal precedents...</span>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-border shrink-0">
            <div className="max-w-4xl mx-auto relative rounded-xl overflow-hidden border border-input bg-card shadow-sm focus-within:ring-1 focus-within:ring-ring transition-all">
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Detail your legal inquiry..."
                className="min-h-[80px] max-h-[300px] w-full resize-none border-0 focus-visible:ring-0 p-4 pb-12 bg-transparent text-sm"
                data-testid="textarea-message"
              />
              <div className="absolute bottom-2 right-2 flex items-center justify-between left-4">
                <div className="text-[10px] text-muted-foreground hidden sm:block">
                  Press <kbd className="px-1 py-0.5 bg-muted rounded border border-border font-mono mx-1">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-muted rounded border border-border font-mono mx-1">Shift</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded border border-border font-mono mx-1">Enter</kbd> for new line
                </div>
                <Button 
                  size="sm" 
                  onClick={handleSend} 
                  disabled={!input.trim() || isStreaming}
                  className="h-8 gap-2 ml-auto shadow-sm"
                  data-testid="button-send"
                >
                  Submit Inquiry
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="text-center mt-3 text-[10px] text-muted-foreground max-w-4xl mx-auto">
              Responses are generated by AI and do not constitute formal legal counsel. Always verify citations and consult a qualified attorney for critical decisions.
            </div>
          </div>
          
        </main>
      </div>
    </Layout>
  );
}