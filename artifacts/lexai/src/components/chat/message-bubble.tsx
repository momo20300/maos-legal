import { AnthropicMessage } from "@workspace/api-client-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Scale, User, FileText, Image } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { DocumentCard } from "./document-card";

interface MessageBubbleProps {
  message: Pick<AnthropicMessage, "role" | "content">;
}

const DOC_START = "<<<DOCUMENT_START>>>";
const DOC_END = "<<<DOCUMENT_END>>>";

interface ParsedMessage {
  preText: string;
  documentContent: string | null;
  documentStreaming: boolean;
  postText: string;
  attachmentType: "image" | "pdf" | null;
  attachmentFilename: string;
  chatText: string;
}

function parseMessage(content: string): ParsedMessage {
  let working = content;
  let attachmentType: "image" | "pdf" | null = null;
  let attachmentFilename = "";
  let chatText = content;

  const pdfMatch = working.match(/^📄 \[PDF: (.+?)\]\n\n([\s\S]*)$/);
  if (pdfMatch) {
    attachmentType = "pdf";
    attachmentFilename = pdfMatch[1]!;
    working = pdfMatch[2]!;
    chatText = pdfMatch[2]!;
  }

  const imgMatch = working.match(/^🖼️ \[Image: (.+?)\]\n\n([\s\S]*)$/);
  if (imgMatch) {
    attachmentType = "image";
    attachmentFilename = imgMatch[1]!;
    working = imgMatch[2]!;
    chatText = imgMatch[2]!;
  }

  const startIdx = working.indexOf(DOC_START);
  const endIdx = working.indexOf(DOC_END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Complete document
    const preText = working.slice(0, startIdx).trim();
    const documentContent = working.slice(startIdx + DOC_START.length, endIdx).trim();
    const postText = working.slice(endIdx + DOC_END.length).trim();
    return { preText, documentContent, documentStreaming: false, postText, attachmentType, attachmentFilename, chatText };
  }

  if (startIdx !== -1 && endIdx === -1) {
    // Document still streaming — show pre-text + spinner
    const preText = working.slice(0, startIdx).trim();
    return { preText, documentContent: null, documentStreaming: true, postText: "", attachmentType, attachmentFilename, chatText };
  }

  return { preText: chatText, documentContent: null, documentStreaming: false, postText: "", attachmentType, attachmentFilename, chatText };
}

function formatChatContent(content: string): React.ReactNode[] {
  const citationRegex = /(\[.*?\]|\(.*?\b(Article|Art\.|U\.S\.C\.|C\.F\.R\.|v\.|Code|Section|Sec\.)\b.*?\))/g;
  const parts = content.split(citationRegex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.match(citationRegex)) {
      return (
        <span key={i} className="inline-block px-1.5 py-0.5 mx-1 rounded text-xs font-semibold bg-accent/20 text-accent-foreground border border-accent/30 tracking-tight">
          {part}
        </span>
      );
    }
    if (part.includes("**")) {
      const boldParts = part.split(/\*\*(.*?)\*\*/g);
      return boldParts.map((bp, j) => {
        if (j % 2 === 1) return <strong key={`${i}-${j}`} className="font-semibold text-foreground">{bp}</strong>;
        return <span key={`${i}-${j}`}>{bp}</span>;
      });
    }
    if (part.includes("\n")) {
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < part.split("\n").length - 1 && <br />}
        </span>
      ));
    }
    return <span key={i}>{part}</span>;
  }).filter(Boolean) as React.ReactNode[];
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const { t, language } = useLanguage();

  const {
    preText,
    documentContent,
    documentStreaming,
    postText,
    attachmentType,
    attachmentFilename,
    chatText,
  } = parseMessage(message.content);

  const hasDocument = documentContent !== null;

  if (isAssistant && (hasDocument || documentStreaming)) {
    return (
      <div className="flex w-full justify-start mb-6" data-testid={`message-${message.role}`}>
        <div className="flex gap-4 max-w-[90%] flex-row">
          <Avatar className="w-8 h-8 border shadow-sm shrink-0 bg-primary border-primary-border">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Scale className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-3 items-start w-full">
            <span className="text-xs font-medium text-muted-foreground ml-1">{t.chat.lexaiPartnerLabel}</span>

            {/* Pre-document commentary */}
            {preText && (
              <div className="px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed bg-card border border-border text-card-foreground rounded-tl-none font-serif">
                {formatChatContent(preText)}
              </div>
            )}

            {/* The document card (or streaming placeholder) */}
            {hasDocument ? (
              <DocumentCard content={documentContent!} />
            ) : (
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-border bg-card text-sm text-muted-foreground rounded-tl-none">
                <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                <span>{language === "ar" ? "جارٍ صياغة الوثيقة..." : language === "en" ? "Drafting document…" : "Rédaction du document en cours…"}</span>
              </div>
            )}

            {/* Post-document commentary */}
            {postText && (
              <div className="px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed bg-card border border-border text-card-foreground rounded-tl-none font-serif">
                {formatChatContent(postText)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular message (user or assistant without document)
  const displayText = attachmentType ? chatText : message.content;

  return (
    <div
      className={`flex w-full ${isAssistant ? "justify-start" : "justify-end"} mb-6`}
      data-testid={`message-${message.role}`}
    >
      <div className={`flex gap-4 max-w-[85%] ${isAssistant ? "flex-row" : "flex-row-reverse"}`}>
        <Avatar className={`w-8 h-8 border shadow-sm shrink-0 ${isAssistant ? "bg-primary border-primary-border" : "bg-secondary border-secondary-border"}`}>
          <AvatarFallback className={isAssistant ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}>
            {isAssistant ? <Scale className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>

        <div className={`flex flex-col gap-1 ${isAssistant ? "items-start" : "items-end"}`}>
          <span className="text-xs font-medium text-muted-foreground ml-1 mr-1">
            {isAssistant ? t.chat.lexaiPartnerLabel : t.chat.youLabel}
          </span>

          {attachmentType && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium mb-1 ${
              isAssistant
                ? "bg-muted text-muted-foreground"
                : "bg-primary/80 text-primary-foreground/90"
            }`}>
              {attachmentType === "pdf"
                ? <FileText className="w-3.5 h-3.5 shrink-0" />
                : <Image className="w-3.5 h-3.5 shrink-0" />}
              <span className="max-w-[200px] truncate">{attachmentFilename}</span>
            </div>
          )}

          <div
            className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
              isAssistant
                ? "bg-card border border-border text-card-foreground rounded-tl-none font-serif"
                : "bg-primary text-primary-foreground rounded-tr-none font-sans"
            }`}
          >
            {formatChatContent(displayText)}
          </div>
        </div>
      </div>
    </div>
  );
}
