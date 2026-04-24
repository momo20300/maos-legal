import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnthropicMessage } from "@workspace/api-client-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Scale, User, FileText, Image } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { DocumentCard } from "./document-card";
import type { Components } from "react-markdown";

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
    const preText = working.slice(0, startIdx).trim();
    const documentContent = working.slice(startIdx + DOC_START.length, endIdx).trim();
    const postText = working.slice(endIdx + DOC_END.length).trim();
    return { preText, documentContent, documentStreaming: false, postText, attachmentType, attachmentFilename, chatText };
  }

  if (startIdx !== -1 && endIdx === -1) {
    const preText = working.slice(0, startIdx).trim();
    return { preText, documentContent: null, documentStreaming: true, postText: "", attachmentType, attachmentFilename, chatText };
  }

  return { preText: chatText, documentContent: null, documentStreaming: false, postText: "", attachmentType, attachmentFilename, chatText };
}

// Highlight legal citations inside a string
const CITATION_RE = /(\[(?:Art(?:icle)?\.?|Section|Sec\.|U\.S\.C\.|C\.F\.R\.|CJEU|v\.|Arrêt|Décision|Loi|Dahir|D\.O\.C|CPP?C?|CPCC|DOC)[^\]]*\]|\[[^\]]{3,60}\])/g;

function highlightCitations(text: string): React.ReactNode[] {
  const parts = text.split(CITATION_RE);
  return parts.map((part, i) => {
    if (CITATION_RE.test(part)) {
      CITATION_RE.lastIndex = 0;
      return (
        <span
          key={i}
          className="inline-block px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-semibold bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/40 tracking-tight align-middle"
        >
          {part}
        </span>
      );
    }
    CITATION_RE.lastIndex = 0;
    return <span key={i}>{part}</span>;
  });
}

function processChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === "string") {
    return highlightCitations(children);
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === "string") {
        return <span key={i}>{highlightCitations(child)}</span>;
      }
      return child;
    });
  }
  return children;
}

// Custom markdown components
const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-white mt-5 mb-2 pb-1 border-b border-white/20">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-[#c9a227] mt-4 mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-white/90 mt-3 mb-1.5">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed mb-2 last:mb-0">
      {processChildren(children)}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-white/80">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside ml-4 space-y-1 my-2 text-sm">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-4 space-y-1 my-2 text-sm">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-white/80 pl-1">
      {processChildren(children)}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#c9a227]/60 pl-4 my-3 italic text-white/70 text-sm">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-white/15 my-4" />,
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="bg-black/30 rounded-lg p-3 my-3 overflow-x-auto text-xs font-mono text-green-300 border border-white/10">
          <code>{children}</code>
        </pre>
      );
    }
    return (
      <code className="bg-white/10 rounded px-1.5 py-0.5 text-[11px] font-mono text-[#c9a227]">
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 rounded-xl border border-white/15">
      <table className="w-full text-xs border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#c9a227]/15 border-b border-white/15">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-white/10">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-white/5 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold text-[#c9a227] text-xs whitespace-nowrap">
      {processChildren(children)}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-white/80 text-xs leading-snug">
      {processChildren(children)}
    </td>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#c9a227] underline hover:text-[#c9a227]/80">
      {children}
    </a>
  ),
};

// Main markdown renderer for assistant messages
function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-invert text-white/85">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
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

            {preText && (
              <div className="px-5 py-3.5 rounded-2xl shadow-sm bg-card border border-border text-card-foreground rounded-tl-none">
                <MarkdownContent content={preText} />
              </div>
            )}

            {hasDocument ? (
              <DocumentCard content={documentContent!} />
            ) : (
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-border bg-card text-sm text-muted-foreground rounded-tl-none">
                <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                <span>{language === "ar" ? "جارٍ صياغة الوثيقة..." : language === "en" ? "Drafting document…" : "Rédaction du document en cours…"}</span>
              </div>
            )}

            {postText && (
              <div className="px-5 py-3.5 rounded-2xl shadow-sm bg-card border border-border text-card-foreground rounded-tl-none">
                <MarkdownContent content={postText} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular message
  const displayText = attachmentType ? chatText : message.content;

  return (
    <div
      className={`flex w-full ${isAssistant ? "justify-start" : "justify-end"} mb-6`}
      data-testid={`message-${message.role}`}
    >
      <div className={`flex gap-4 max-w-[92%] md:max-w-[85%] ${isAssistant ? "flex-row" : "flex-row-reverse"}`}>
        <Avatar className={`w-8 h-8 border shadow-sm shrink-0 ${isAssistant ? "bg-primary border-primary-border" : "bg-secondary border-secondary-border"}`}>
          <AvatarFallback className={isAssistant ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}>
            {isAssistant ? <Scale className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>

        <div className={`flex flex-col gap-1 ${isAssistant ? "items-start" : "items-end"} min-w-0 flex-1`}>
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
            className={`px-5 py-3.5 rounded-2xl shadow-sm w-full ${
              isAssistant
                ? "bg-card border border-border text-card-foreground rounded-tl-none"
                : "bg-primary text-primary-foreground rounded-tr-none"
            }`}
          >
            {isAssistant ? (
              <MarkdownContent content={displayText} />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayText}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
