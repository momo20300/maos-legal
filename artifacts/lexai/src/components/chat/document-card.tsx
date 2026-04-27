import { Printer, Copy, Check, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";

interface DocumentCardProps {
  content: string;
}

function isArabicDocument(text: string): boolean {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  return arabicChars / text.length > 0.25;
}

function isTableSeparator(line: string): boolean {
  return /^\|?[\s\-:]+(\|[\s\-:]+)+\|?$/.test(line.trim());
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith("|") || (line.includes("|") && !line.trim().startsWith("#"));
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

type DocBlock =
  | { type: "line"; content: string }
  | { type: "table"; header: string[]; rows: string[][] };

function parseDocumentBlocks(lines: string[]): DocBlock[] {
  const blocks: DocBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (isTableRow(line) && line.includes("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && (isTableRow(lines[i]!) && lines[i]!.includes("|"))) {
        tableLines.push(lines[i]!);
        i++;
      }
      const dataRows = tableLines.filter((l) => !isTableSeparator(l));
      if (dataRows.length >= 2) {
        const header = parseTableRow(dataRows[0]!);
        const rows = dataRows.slice(1).map(parseTableRow);
        blocks.push({ type: "table", header, rows });
      } else {
        for (const tl of tableLines) blocks.push({ type: "line", content: tl });
      }
    } else {
      blocks.push({ type: "line", content: line });
      i++;
    }
  }
  return blocks;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

function renderDocumentBlock(block: DocBlock, idx: number): React.ReactNode {
  if (block.type === "table") {
    return (
      <div key={idx} className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#c9a227]/15 border-b border-border">
              {block.header.map((cell, ci) => (
                <th key={ci} className="px-4 py-2.5 text-left font-semibold text-[#c9a227] whitespace-nowrap text-xs">
                  {renderInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {block.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-muted/40 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2 text-foreground/85 text-xs leading-snug">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const line = block.content;
  if (!line.trim()) return <div key={idx} className="h-4" />;

  if (line.match(/^---+$/) || line.match(/^___+$/)) {
    return <hr key={idx} className="my-6 border-border" />;
  }

  if (line.match(/^#{1,3} /)) {
    const text = line.replace(/^#{1,3} /, "");
    return (
      <p key={idx} className="font-bold text-base mt-4 mb-1">
        {renderInline(text)}
      </p>
    );
  }

  if (line.match(/^[\-\*] /)) {
    const text = line.replace(/^[\-\*] /, "");
    return (
      <div key={idx} className="flex gap-2 ml-4">
        <span className="shrink-0 mt-1">•</span>
        <span>{renderInline(text)}</span>
      </div>
    );
  }

  if (line.match(/^\d+\. /)) {
    const match = line.match(/^(\d+)\. (.*)$/);
    if (match) {
      return (
        <div key={idx} className="flex gap-2 ml-4">
          <span className="shrink-0 font-medium">{match[1]}.</span>
          <span>{renderInline(match[2]!)}</span>
        </div>
      );
    }
  }

  return <p key={idx} className="leading-relaxed">{renderInline(line)}</p>;
}

function buildTableHtml(header: string[], rows: string[][]): string {
  const ths = header.map((h) => `<th>${h.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")}</th>`).join("");
  const trs = rows
    .map(
      (row) =>
        `<tr>${row.map((c) => `<td>${c.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")}</td>`).join("")}</tr>`
    )
    .join("");
  return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}

function buildPrintHtml(content: string, isRTL: boolean): string {
  const lines = content.split("\n");
  const blocks = parseDocumentBlocks(lines);

  const bodyHtml = blocks
    .map((block) => {
      if (block.type === "table") {
        return buildTableHtml(block.header, block.rows);
      }
      const line = block.content;
      if (!line.trim()) return "<br>";
      if (line.match(/^---+$/) || line.match(/^___+$/)) return "<hr>";
      if (line.match(/^#{1,3} /)) return `<p class="heading">${line.replace(/^#{1,3} /, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\*(.*?)\*/g, "<i>$1</i>")}</p>`;
      if (line.match(/^[\-\*] /)) return `<li>${line.replace(/^[\-\*] /, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")}</li>`;
      if (line.match(/^\d+\. /)) return `<li>${line.replace(/^\d+\. /, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")}</li>`;
      return `<p>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\*(.*?)\*/g, "<i>$1</i>")}</p>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${isRTL ? "ar" : "fr"}" dir="${isRTL ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Juridique</title>
  <style>
    @page {
      size: A4;
      margin: 8cm 2.5cm 3cm 2.5cm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${isRTL ? "'Amiri', 'Scheherazade New', 'Arial', serif" : "'Times New Roman', 'Georgia', serif"};
      font-size: 12pt;
      line-height: 1.8;
      color: #000;
      background: white;
      direction: ${isRTL ? "rtl" : "ltr"};
    }
    .document { max-width: 100%; }
    p { margin-bottom: 0.8em; text-align: justify; }
    p.heading { font-weight: bold; font-size: 13pt; margin: 1.2em 0 0.4em; }
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
    hr { border: none; border-top: 1px solid #666; margin: 1.5em 0; }
    li {
      margin-left: ${isRTL ? "0" : "1.5em"};
      margin-right: ${isRTL ? "1.5em" : "0"};
      margin-bottom: 0.3em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2em 0;
      font-size: 11pt;
    }
    th {
      background: #f5f0e0;
      border: 1px solid #999;
      padding: 6px 10px;
      font-weight: bold;
      text-align: ${isRTL ? "right" : "left"};
    }
    td {
      border: 1px solid #bbb;
      padding: 5px 10px;
      text-align: ${isRTL ? "right" : "left"};
    }
    tr:nth-child(even) td { background: #fafaf8; }
    @media print {
      body { -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="document">
    ${bodyHtml}
  </div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#{1,3} /gm, "")
    .replace(/^[\-\*] /gm, "• ")
    .replace(/\|/g, " ")
    .trim();
}

export function DocumentCard({ content }: DocumentCardProps) {
  const [copied, setCopied] = useState(false);
  const { language } = useLanguage();
  const isRTL = isArabicDocument(content);
  const lines = content.split("\n");
  const blocks = parseDocumentBlocks(lines);

  const handlePrint = () => {
    const html = buildPrintHtml(content, isRTL);
    const win = window.open("", "_blank", "width=850,height=1100");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const cleanContent = stripMarkdown(content);
    const blob = new Blob([cleanContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `document-juridique-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printLabel = isRTL ? "طباعة" : language === "en" ? "Print" : "Imprimer";
  const copyLabel = isRTL ? "نسخ" : language === "en" ? "Copy" : "Copier";
  const downloadLabel = isRTL ? "تحميل" : language === "en" ? "Download" : "Télécharger";
  const documentLabel = isRTL ? "وثيقة قانونية" : language === "en" ? "Legal Document" : "Document Juridique";
  const readyLabel = isRTL ? "جاهز للطباعة على ورقك المكتبي" : language === "en" ? "Print-ready — use your own letterhead" : "Prêt à imprimer sur votre papier à en-tête";

  return (
    <div className="w-full max-w-2xl my-2">
      {/* Document Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-primary/5 border border-border rounded-t-xl border-b-0 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent/15 rounded-lg flex items-center justify-center border border-accent/25 shrink-0">
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{documentLabel}</p>
            <p className="text-[10px] text-muted-foreground">{readyLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? (isRTL ? "تم النسخ" : "Copié !") : copyLabel}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{downloadLabel}</span>
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs bg-accent text-[#0d1b2e] hover:bg-accent/90 font-semibold"
            onClick={handlePrint}
          >
            <Printer className="w-3.5 h-3.5" />
            {printLabel}
          </Button>
        </div>
      </div>

      {/* Document Body — letter paper simulation */}
      <div
        className={`
          bg-card border border-border rounded-b-xl shadow-lg overflow-hidden
          ${isRTL ? "font-[Amiri,serif] text-right" : "font-serif"}
        `}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Letterhead area */}
        <div className="h-10 border-b border-dashed border-border bg-muted/40 flex items-center justify-center">
          <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest select-none">
            {isRTL ? "← ورقتك المكتبية الخاصة" : language === "en" ? "← Your own letterhead paper" : "← Espace pour votre en-tête professionnel"}
          </span>
        </div>

        {/* Document content */}
        <div className="px-10 py-8 text-sm leading-relaxed text-foreground space-y-0.5 min-h-[300px]">
          {blocks.map((block, idx) => renderDocumentBlock(block, idx))}
        </div>

        {/* Bottom print hint */}
        <div className="px-10 py-3 border-t border-dashed border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Printer className="w-3 h-3" />
            <span className="select-none">
              {isRTL
                ? "انقر طباعة — سيُفتح مباشرة على ورقتك المكتبية"
                : language === "en"
                  ? "Click Print — opens directly on your letterhead paper"
                  : "Cliquer Imprimer — s'ouvre directement sur votre papier à en-tête"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
