import { AnthropicMessage } from "@workspace/api-client-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Scale, User, FileText, Image } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface MessageBubbleProps {
  message: Pick<AnthropicMessage, "role" | "content">;
}

function parseAttachment(content: string): { type: "image" | "pdf" | null; filename: string; rest: string } {
  const pdfMatch = content.match(/^📄 \[PDF: (.+?)\]\n\n([\s\S]*)$/);
  if (pdfMatch) return { type: "pdf", filename: pdfMatch[1]!, rest: pdfMatch[2]! };

  const imgMatch = content.match(/^🖼️ \[Image: (.+?)\]\n\n([\s\S]*)$/);
  if (imgMatch) return { type: "image", filename: imgMatch[1]!, rest: imgMatch[2]! };

  return { type: null, filename: "", rest: content };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const { type: attachmentType, filename, rest } = parseAttachment(message.content);
  const { t } = useLanguage();

  const formatContent = (content: string) => {
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
    });
  };

  const displayText = attachmentType ? rest : message.content;

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
              <span className="max-w-[200px] truncate">{filename}</span>
            </div>
          )}

          <div
            className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
              isAssistant
                ? "bg-card border border-border text-card-foreground rounded-tl-none font-serif"
                : "bg-primary text-primary-foreground rounded-tr-none font-sans"
            }`}
          >
            {formatContent(displayText)}
          </div>
        </div>
      </div>
    </div>
  );
}
