import { Layout } from "@/components/layout/layout";
import { MessageBubble } from "@/components/chat/message-bubble";
import { JurisdictionBadge } from "@/components/chat/jurisdiction-badge";
import { useGetAnthropicConversation, getGetAnthropicConversationQueryKey, useListAnthropicMessages, getListAnthropicMessagesQueryKey, AnthropicMessage } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, FileText, Paperclip, Camera, X, FileImage, ScanSearch, ChevronLeft, Printer } from "lucide-react";
import { JusticeScaleSVG } from "@/components/ui/justice-scale";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { VoiceCallInlineButton } from "@/components/chat/voice-call-button";

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
  const streamingBubbleRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const isStreamingRef = useRef(false);
  const hasScrolledInitialRef = useRef(false);
  const autoSendMsgRef = useRef<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSendRef = useRef<(override?: string) => Promise<void>>(null as any);

  const { data: conversation, isLoading: isLoadingConv } = useGetAnthropicConversation(id, {
    query: { enabled: !!id, queryKey: getGetAnthropicConversationQueryKey(id) }
  });

  const { data: messages, isLoading: isLoadingMsgs } = useListAnthropicMessages(id, {
    query: { enabled: !!id, queryKey: getListAnthropicMessagesQueryKey(id) }
  });

  const isVoiceConversation = conversation?.source === "voice";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    chatAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToStreamingTop = useCallback(() => {
    if (streamingBubbleRef.current && chatAreaRef.current) {
      const bubbleTop = streamingBubbleRef.current.offsetTop;
      chatAreaRef.current.scrollTo({ top: bubbleTop - 16, behavior: "smooth" });
    }
  }, []);

  // Initial scroll: top for voice transcripts, bottom for chat
  useEffect(() => {
    if (!isLoadingMsgs && messages && !hasScrolledInitialRef.current) {
      hasScrolledInitialRef.current = true;
      if (isVoiceConversation) {
        scrollToTop();
      } else {
        scrollToBottom();
      }
    }
  }, [isLoadingMsgs, messages, isVoiceConversation, scrollToTop, scrollToBottom]);

  useEffect(() => {
    if (!isStreamingRef.current && !isVoiceConversation) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, isVoiceConversation]);

  useEffect(() => {
    if (isStreamingRef.current && streamedContent) {
      scrollToStreamingTop();
    }
  }, [streamedContent.length < 200 ? streamedContent : null, scrollToStreamingTop]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCallArchived = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListAnthropicMessagesQueryKey(id) });
    queryClient.refetchQueries({ queryKey: getListAnthropicMessagesQueryKey(id) });
  }, [queryClient, id]);

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
    // PDF → auto-send: the AI will read it and ask the user what they want to know
    if (file.type === "application/pdf") {
      autoSendMsgRef.current = t.chat.pdfAutoPrompt;
    }
  }, [toast, t]);

  const clearFile = useCallback((revokeUrl = true) => {
    if (revokeUrl && previewUrl) URL.revokeObjectURL(previewUrl);
    setAttachedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }, [previewUrl]);

  const handleSend = async (overrideInput?: string) => {
    const userContent = overrideInput !== undefined ? overrideInput : input;
    if ((!userContent.trim() && !attachedFile) || isStreaming || !id) return;

    if (overrideInput === undefined) setInput("");
    setIsStreaming(true);
    isStreamingRef.current = true;
    setStreamedContent("");

    const isFileMessage = !!attachedFile;
    const currentFile = attachedFile;
    const capturedPreviewUrl = previewUrl;
    clearFile(false);

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
      attachmentData:
        isFileMessage && currentFile!.type.startsWith("image/") && capturedPreviewUrl
          ? capturedPreviewUrl
          : null,
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
          credentials: "include",
          body: formData,
        });
      } else {
        response = await fetch(`${BASE_URL}/api/anthropic/conversations/${id}/messages`, {
          method: "POST",
          credentials: "include",
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
        let lineBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";

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

      setStreamedContent("");
      isStreamingRef.current = false;

      await queryClient.invalidateQueries({ queryKey: getListAnthropicMessagesQueryKey(id) });
      await queryClient.refetchQueries({ queryKey: getListAnthropicMessagesQueryKey(id) });

    } catch (error: any) {
      console.error("Send error:", error);
      toast({ title: t.chat.fileFormatError, description: error?.message || "Impossible d'envoyer le message", variant: "destructive" });
    } finally {
      setIsStreaming(false);
      isStreamingRef.current = false;
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

  // Keep ref always pointing to the latest handleSend (avoids stale closure in useEffect)
  handleSendRef.current = handleSend;

  // Auto-send when a PDF is attached: AI reads it and asks the user what they want to know
  useEffect(() => {
    if (attachedFile?.type === "application/pdf" && autoSendMsgRef.current !== null) {
      const msg = autoSendMsgRef.current;
      autoSendMsgRef.current = null;
      // Small delay to ensure state is fully settled
      const timer = setTimeout(() => {
        handleSendRef.current(msg);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [attachedFile]);

  return (
    <Layout>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          header, nav, footer, [data-no-print] { display: none !important; }
        }
      `}</style>

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
        <main className="flex-1 flex flex-col bg-background relative min-w-0">
          {/* Mobile header */}
          <div className="md:hidden flex items-center gap-2 px-3 py-2 bg-card border-b border-border shrink-0" data-no-print>
            <JusticeScaleSVG size={22} className="shrink-0" />
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            {isLoadingConv ? (
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : conversation ? (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-bold truncate leading-tight">{conversation.title}</p>
                  <JurisdictionBadge jurisdiction={conversation.jurisdiction} className="text-[9px] h-4 py-0 px-1.5 shrink-0" />
                </div>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <FileText className="w-3 h-3 shrink-0" />
                  {conversation.legalDomain}
                </p>
              </div>
            ) : null}
            <div className="flex items-center gap-1.5 shrink-0">
              {isVoiceConversation && (
                <VoiceCallInlineButton conversationId={id} onArchived={handleCallArchived} />
              )}
              <button onClick={handlePrint} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Imprimer / PDF">
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop header */}
          <header className="hidden md:flex h-16 border-b border-border bg-card items-center px-6 justify-between shrink-0" data-no-print>
            {isLoadingConv ? (
              <div className="flex items-center gap-3">
                <JusticeScaleSVG size={28} />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ) : conversation ? (
              <div className="flex items-center gap-3">
                <JusticeScaleSVG size={28} />
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
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <JusticeScaleSVG size={28} />
                <span>Conversation not found</span>
              </div>
            )}

            {/* Right side header actions */}
            <div className="flex items-center gap-2">
              {isVoiceConversation && (
                <VoiceCallInlineButton conversationId={id} onArchived={handleCallArchived} />
              )}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-medium"
                title="Imprimer / Sauvegarder en PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Imprimer</span>
              </button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
                <ScanSearch className="w-3.5 h-3.5 text-accent" />
                <span>{t.chat.analyzeDocBadge}</span>
              </div>
            </div>
          </header>

          {/* Chat Area (printable) */}
          <div id="print-area" ref={chatAreaRef} className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth outline-none" tabIndex={-1}>
            <div className="max-w-4xl mx-auto flex flex-col">

              {messages?.length === 0 && !isStreaming && (
                <div className="py-8 flex flex-col items-center text-center space-y-6" data-no-print>
                  {/* Title */}
                  <div>
                    <h3 className="font-serif font-bold text-foreground text-xl mb-1">
                      {conversation?.jurisdiction === "Morocco"
                        ? t.chat.readyMaosTitle
                        : t.chat.readyDefaultTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      {conversation?.jurisdiction === "Morocco"
                        ? t.chat.maosReadyDesc
                        : t.chat.defaultReadyDesc}
                    </p>
                  </div>

                  {/* Document analysis cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
                    {/* Camera card */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-accent/50 hover:bg-accent/5 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <Camera className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t.chat.takePhotoLabel}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t.chat.emptyPhotoDesc}</p>
                      </div>
                    </button>

                    {/* Image/PDF upload card */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-accent/50 hover:bg-accent/5 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <ScanSearch className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t.chat.photosImages}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t.chat.emptyImageDesc}</p>
                      </div>
                    </button>

                    {/* PDF card */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-accent/50 hover:bg-accent/5 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t.chat.pdfDocuments}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t.chat.emptyPdfDesc}</p>
                      </div>
                    </button>
                  </div>

                  {/* Examples */}
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
                    {[t.chat.examplePvAccident, t.chat.exampleContrat, t.chat.exampleBail, t.chat.exampleMiseEnDemeure].map((ex) => (
                      <span key={ex} className="text-[11px] px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground">
                        {ex}
                      </span>
                    ))}
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
                <div ref={streamingBubbleRef}>
                  <MessageBubble message={{ role: "assistant", content: streamedContent, attachmentData: null }} />
                </div>
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
          {!isVoiceConversation && (
            <div className="p-3 md:p-4 bg-background border-t border-border shrink-0" data-no-print>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" onClick={() => clearFile()}>
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

                    <div className="flex items-center gap-2">
                      <VoiceCallInlineButton conversationId={id} onArchived={handleCallArchived} />
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
                </div>

              </div>
            </div>
          )}

          {/* Voice conversation: prompt to continue by voice */}
          {isVoiceConversation && (
            <div className="p-3 md:p-4 bg-background border-t border-border shrink-0" data-no-print>
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground">
                  <span>Continuez la conversation par appel vocal</span>
                  <VoiceCallInlineButton conversationId={id} onArchived={handleCallArchived} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
