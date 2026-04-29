import { Printer, Copy, Check, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";

interface DocumentCardProps {
  content: string;
}

export function isArabicDocument(text: string): boolean {
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

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmtInline(s: string): string {
  return esc(s).replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\*(.*?)\*/g, "<i>$1</i>");
}

export function buildPrintHtml(content: string, isRTL: boolean): string {
  const lines = content.split("\n");
  const blocks = parseDocumentBlocks(lines);
  const align = isRTL ? "right" : "left";
  const mlProp = isRTL ? "margin-right" : "margin-left";
  const today = new Date().toLocaleDateString(isRTL ? "ar-MA" : "fr-MA", { year: "numeric", month: "long", day: "numeric" });
  const year = new Date().getFullYear();

  const bodyHtml = blocks
    .map((block) => {
      if (block.type === "table") {
        const ths = block.header.map((h) => `<th>${fmtInline(h)}</th>`).join("");
        const trs = block.rows.map((row) => `<tr>${row.map((c) => `<td>${fmtInline(c)}</td>`).join("")}</tr>`).join("");
        return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
      }
      const line = block.content;
      if (!line.trim()) return "<div class='spacer'></div>";
      if (line.match(/^---+$/) || line.match(/^___+$/)) return "<hr>";
      if (line.match(/^#{1,3} /)) return `<p class="heading">${fmtInline(line.replace(/^#{1,3} /, ""))}</p>`;
      if (line.match(/^[\-\*] /))  return `<div class="li">${fmtInline(line.replace(/^[\-\*] /, ""))}</div>`;
      if (line.match(/^\d+\. /))   return `<div class="li">${fmtInline(line.replace(/^\d+\. /, ""))}</div>`;
      return `<p>${fmtInline(line)}</p>`;
    })
    .join("\n");

  const disclaimerText = isRTL
    ? `تم إنشاء هذا المستند بواسطة MAOS Legal — الذكاء القانوني المتقدم. يُعدّ توجيهاً قانونياً ولا يُغني عن استشارة محامٍ مؤهل. © ${year} MAOS Legal — maossot.com`
    : `Ce document a été généré par MAOS Legal — Intelligence Juridique IA. Il constitue une orientation juridique et ne remplace pas l'avis d'un avocat inscrit au barreau. © ${year} MAOS Legal — maossot.com`;

  const docBadge = isRTL ? "وثيقة قانونية" : "DOCUMENT JURIDIQUE";

  return `<!DOCTYPE html>
<html lang="${isRTL ? "ar" : "fr"}" dir="${isRTL ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8">
  <title>Document Juridique — MAOS Legal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 4cm 2.5cm 3.2cm 2.5cm;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: ${isRTL ? "'Amiri', 'Scheherazade New', serif" : "'Inter', 'Helvetica Neue', Arial, sans-serif"};
      font-size: 11pt;
      line-height: 1.75;
      color: #2d3340;
      background: #fff;
      direction: ${isRTL ? "rtl" : "ltr"};
    }

    /* ─── WATERMARK ─────────────────────────────── */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-42deg);
      font-family: 'Inter', sans-serif;
      font-size: 88pt;
      font-weight: 700;
      color: rgba(201,168,76,0.055);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      letter-spacing: 0.12em;
      user-select: none;
    }

    /* ─── HEADER (fixed on every page) ──────────── */
    .doc-header {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 3.6cm;
      background: #2d3340;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2.5cm;
      z-index: 10;
    }
    .doc-header::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, #C9A84C 20%, #e4c87a 50%, #C9A84C 80%, transparent);
    }
    .logo-area { display: flex; align-items: center; gap: 14px; }
    .logo-icon { width: 42px; height: 42px; flex-shrink: 0; }
    .logo-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 19pt;
      font-weight: 700;
      color: #C9A84C;
      letter-spacing: 0.04em;
      line-height: 1;
    }
    .logo-tagline {
      font-family: 'Inter', sans-serif;
      font-size: 6.5pt;
      font-weight: 300;
      color: rgba(255,255,255,0.45);
      letter-spacing: 0.22em;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .header-meta {
      text-align: ${isRTL ? "left" : "right"};
      display: flex;
      flex-direction: column;
      align-items: ${isRTL ? "flex-start" : "flex-end"};
      gap: 7px;
    }
    .doc-badge {
      background: rgba(201,168,76,0.12);
      border: 1px solid rgba(201,168,76,0.3);
      color: #C9A84C;
      font-family: 'Inter', sans-serif;
      font-size: 6.5pt;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 2px;
    }
    .doc-date {
      font-family: 'Inter', sans-serif;
      font-size: 7.5pt;
      color: rgba(255,255,255,0.4);
    }

    /* ─── CONTENT ────────────────────────────────── */
    .doc-content {
      position: relative;
      z-index: 1;
    }

    p { margin-bottom: 0.85em; text-align: justify; }

    p.heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 13pt;
      font-weight: 600;
      color: #2d3340;
      margin: 1.6em 0 0.5em;
      padding-bottom: 7px;
      border-bottom: 1.5px solid rgba(201,168,76,0.35);
    }

    strong, b { font-weight: 600; }
    em, i { font-style: italic; }

    hr {
      border: none;
      border-top: 1px solid rgba(201,168,76,0.25);
      margin: 1.6em 0;
    }

    .spacer { height: 0.5em; }

    .li {
      ${mlProp}: 1.8em;
      margin-bottom: 0.35em;
      position: relative;
    }
    .li::before {
      content: '◆';
      position: absolute;
      ${isRTL ? "right" : "left"}: -1.5em;
      color: #C9A84C;
      font-size: 6.5pt;
      top: 5px;
    }

    /* ─── TABLES ─────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.3em 0;
      font-size: 10pt;
      border: 1px solid #d5cebb;
    }
    thead tr { background: #2d3340; }
    th {
      color: #C9A84C;
      border: 1px solid #3d4455;
      padding: 8px 12px;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 8.5pt;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      text-align: ${align};
    }
    td {
      border: 1px solid #ddd8ca;
      padding: 6px 12px;
      text-align: ${align};
    }
    tr:nth-child(even) td { background: #faf8f3; }

    /* ─── QR PLACEHOLDER ─────────────────────────── */
    .qr-row {
      display: flex;
      justify-content: ${isRTL ? "flex-start" : "flex-end"};
      align-items: center;
      gap: 10px;
      margin-top: 2.5em;
      padding-top: 1em;
      border-top: 1px solid rgba(201,168,76,0.2);
    }
    .qr-label {
      font-family: 'Inter', sans-serif;
      font-size: 7pt;
      color: #aaa;
      text-align: ${isRTL ? "left" : "right"};
      line-height: 1.5;
    }
    .qr-box {
      width: 58px;
      height: 58px;
      border: 1.5px solid rgba(201,168,76,0.35);
      border-radius: 4px;
      background: #faf8f3;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* ─── FOOTER (fixed on every page) ──────────── */
    .doc-footer {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      height: 2.8cm;
      background: #2d3340;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-bottom: 10px;
    }
    .footer-gold-line {
      height: 2px;
      background: linear-gradient(90deg, transparent, #C9A84C 20%, #e4c87a 50%, #C9A84C 80%, transparent);
      margin-bottom: 10px;
    }
    .footer-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2.5cm;
    }
    .footer-disclaimer {
      font-family: 'Inter', sans-serif;
      font-size: 6.5pt;
      color: rgba(255,255,255,0.32);
      max-width: 75%;
      line-height: 1.5;
      direction: ${isRTL ? "rtl" : "ltr"};
    }
    .footer-right {
      display: flex;
      flex-direction: column;
      align-items: ${isRTL ? "flex-start" : "flex-end"};
      gap: 3px;
    }
    .footer-page {
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      color: rgba(201,168,76,0.55);
      white-space: nowrap;
    }
    .footer-brand {
      font-family: 'Playfair Display', serif;
      font-size: 7pt;
      color: rgba(201,168,76,0.3);
      letter-spacing: 0.12em;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- Filigrane diagonal -->
  <div class="watermark">CONFIDENTIEL</div>

  <!-- En-tête premium -->
  <div class="doc-header">
    <div class="logo-area">
      <svg class="logo-icon" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="21" cy="21" r="20" stroke="#C9A84C" stroke-width="1.2" opacity="0.35"/>
        <line x1="21" y1="7" x2="21" y2="35" stroke="#C9A84C" stroke-width="1.4"/>
        <line x1="9" y1="13" x2="33" y2="13" stroke="#C9A84C" stroke-width="1.4"/>
        <line x1="9" y1="13" x2="5" y2="21" stroke="#C9A84C" stroke-width="1.1"/>
        <line x1="33" y1="13" x2="37" y2="21" stroke="#C9A84C" stroke-width="1.1"/>
        <path d="M4 21 Q9 18.5 14 21 Q9 23.5 4 21Z" fill="#C9A84C" opacity="0.85"/>
        <path d="M28 21 Q33 18.5 38 21 Q33 23.5 28 21Z" fill="#C9A84C" opacity="0.85"/>
        <rect x="17.5" y="33" width="7" height="2" rx="1" fill="#C9A84C" opacity="0.6"/>
      </svg>
      <div>
        <div class="logo-name">MAOS Legal</div>
        <div class="logo-tagline">Intelligence Juridique Premium</div>
      </div>
    </div>
    <div class="header-meta">
      <div class="doc-badge">${docBadge}</div>
      <div class="doc-date">${today}</div>
    </div>
  </div>

  <!-- Contenu du document -->
  <div class="doc-content">
    ${bodyHtml}

    <!-- QR Code placeholder -->
    <div class="qr-row">
      <div class="qr-label">${isRTL ? "التحقق من\nالوثيقة" : "Vérification\ndu document"}</div>
      <div class="qr-box">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="2" y="2" width="15" height="15" rx="1" stroke="#C9A84C" stroke-width="1.4" fill="none"/>
          <rect x="5.5" y="5.5" width="8" height="8" fill="#C9A84C" opacity="0.45"/>
          <rect x="23" y="2" width="15" height="15" rx="1" stroke="#C9A84C" stroke-width="1.4" fill="none"/>
          <rect x="26.5" y="5.5" width="8" height="8" fill="#C9A84C" opacity="0.45"/>
          <rect x="2" y="23" width="15" height="15" rx="1" stroke="#C9A84C" stroke-width="1.4" fill="none"/>
          <rect x="5.5" y="26.5" width="8" height="8" fill="#C9A84C" opacity="0.45"/>
          <rect x="23" y="23" width="4" height="4" fill="#C9A84C" opacity="0.45"/>
          <rect x="29" y="23" width="4" height="4" fill="#C9A84C" opacity="0.45"/>
          <rect x="35" y="23" width="2" height="2" fill="#C9A84C" opacity="0.45"/>
          <rect x="23" y="29" width="4" height="4" fill="#C9A84C" opacity="0.45"/>
          <rect x="29" y="29" width="2" height="2" fill="#C9A84C" opacity="0.45"/>
          <rect x="33" y="33" width="4" height="4" fill="#C9A84C" opacity="0.45"/>
          <rect x="23" y="35" width="4" height="2" fill="#C9A84C" opacity="0.45"/>
          <rect x="29" y="33" width="2" height="4" fill="#C9A84C" opacity="0.45"/>
        </svg>
      </div>
    </div>
  </div>

  <!-- Pied de page premium -->
  <div class="doc-footer">
    <div class="footer-gold-line"></div>
    <div class="footer-inner">
      <div class="footer-disclaimer">${disclaimerText}</div>
      <div class="footer-right">
        <div class="footer-page">Page 1</div>
        <div class="footer-brand">MAOS LEGAL</div>
      </div>
    </div>
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
