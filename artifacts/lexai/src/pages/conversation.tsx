import { Layout } from "@/components/layout/layout";
import { ChatSidebar } from "@/components/chat/sidebar";
import { MessageBubble } from "@/components/chat/message-bubble";
import { JurisdictionBadge } from "@/components/chat/jurisdiction-badge";
import { useGetAnthropicConversation, getGetAnthropicConversationQueryKey, useListAnthropicMessages, getListAnthropicMessagesQueryKey, AnthropicMessage } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Info, FileText, Paperclip, Camera, X, FileImage, ScanSearch } from "lucide-react";
import { VoiceCallButton } from "@/components/chat/voice-call-button";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function ConversationPage() {
  const [, params] = useRoute("/conversations/:id");
  const id = Number(params?.id);
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast({ title: t.chat.fileFormatError, description: t.chat.fileFormatDesc, variant: "destructive" });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: t.chat.fileSizeError, description: t.chat.fileSizeDesc, variant: "destructive" });
      return;
    }
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, [toast, t]);

  const clearFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAttachedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }, [previewUrl]);

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isStreaming || !id) return;

    const userContent = input;
    setInput("");
    setIsStreaming(true);
    setStreamedContent("");

    const isFileMessage = !!attachedFile;
    const currentFile = attachedFile;
    clearFile();

    const displayContent = isFileMessage
      ? (currentFile!.type.startsWith("image/")
          ? `🖼️ [Image: ${currentFile!.name}]\n\n${userContent || t.chat.defaultAnalysisRequest}`
          : `📄 [PDF: ${currentFile!.name}]\n\n${userContent || t.chat.defaultAnalysisRequest}`)
      : userContent;

    const tempUserMessage: AnthropicMessage = {
      id: Date.now(),
      conversationId: id,
      role: "user",
      content: displayContent,
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData<AnthropicMessage[]>(
      getListAnthropicMessagesQueryKey(id),
      (old) => old ? [...old, tempUserMessage] : [tempUserMessage]
    );

    try {
      let response: Response;

      if (isFileMessage && currentFile) {
        const formData = new FormData();
        formData.append("file", currentFile);
        if (userContent.trim()) formData.append("content", userContent);

        response = await fetch(`${BASE_URL}/api/anthropic/conversations/${id}/analyze`, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(`${BASE_URL}/api/anthropic/conversations/${id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: userContent }),
        });
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullResponse += data.content;
                  setStreamedContent(fullResponse);
                }
              } catch { /* ignore */ }
            }
          }
        }
      }

      await queryClient.invalidateQueries({ queryKey: getListAnthropicMessagesQueryKey(id) });

    } catch (error: any) {
      console.error("Send error:", error);
      toast({ title: t.chat.fileFormatError, description: error?.message || "Impossible d'envoyer le message", variant: "destructive" });
    } finally {
      setIsStreaming(false);
      setStreamedContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isPdf = attachedFile?.type === "application/pdf";

  return (
    <Layout>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      />

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

            <div className="flex items-center gap-2">
              <VoiceCallButton />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
                <ScanSearch className="w-3.5 h-3.5 text-accent" />
                <span className="hidden sm:inline">{t.chat.analyzeDocBadge}</span>
              </div>
            </div>
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
                    <h3 className="font-serif font-bold text-foreground text-lg mb-1">
                      {conversation?.jurisdiction === "Morocco"
                        ? t.chat.readyMaosTitle
                        : t.chat.readyDefaultTitle}
                    </h3>
                    <p className="text-sm max-w-md mx-auto mb-4">
                      {conversation?.jurisdiction === "Morocco"
                        ? t.chat.maosReadyDesc
                        : t.chat.defaultReadyDesc}
                    </p>
                    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <FileImage className="w-4 h-4 text-accent" />
                        <span>{t.chat.photosImages}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-accent" />
                        <span>{t.chat.pdfDocuments}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-accent" />
                        <span>{t.chat.takePhotoLabel}</span>
                      </div>
                    </div>
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

              {isStreaming && streamedContent && (
                <MessageBubble message={{ role: "assistant", content: streamedContent }} />
              )}

              {isStreaming && !streamedContent && (
                <div className="flex items-center gap-3 text-muted-foreground text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-serif italic">
                    {attachedFile ? t.chat.analyzingDoc : t.chat.analyzingLegal}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-border shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">

              {/* File Preview */}
              {attachedFile && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-accent/30 bg-accent/5">
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="w-14 h-14 object-cover rounded-lg border border-border shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center border border-border shrink-0">
                      <FileText className="w-6 h-6 text-accent" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isPdf ? t.chat.fileTypePdf : t.chat.fileTypeImage} — {(attachedFile.size / 1024).toFixed(0)} Ko
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" onClick={clearFile}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Input Box */}
              <div className="relative rounded-xl overflow-hidden border border-input bg-card shadow-sm focus-within:ring-1 focus-within:ring-ring transition-all">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={attachedFile ? t.chat.docQuestionPlaceholder : t.chat.typeMessage}
                  className="min-h-[80px] max-h-[300px] w-full resize-none border-0 focus-visible:ring-0 p-4 pb-12 bg-transparent text-sm"
                  data-testid="textarea-message"
                />

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-accent"
                      title={t.chat.attachFileLabel}
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-attach-file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-accent"
                      title={t.chat.attachCameraLabel}
                      onClick={() => cameraInputRef.current?.click()}
                      data-testid="button-camera"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline ml-1">
                      {t.chat.fileHint}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={(!input.trim() && !attachedFile) || isStreaming}
                    className="h-8 gap-2 shadow-sm"
                    data-testid="button-send"
                  >
                    {isStreaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {attachedFile ? t.chat.analyzeButton : t.chat.submitButton}
                  </Button>
                </div>
              </div>

              <div className="text-center text-[10px] text-muted-foreground">
                {t.chat.legalDisclaimer}
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
