import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/layout";
import { useAuthContext } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  GraduationCap, ChevronLeft, Zap, RotateCcw,
  CheckCircle2, Send, X, BookOpen, Award, Loader2, Plus,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE_URL}/api`;

const DOMAINS_FR = [
  "Droit Civil", "Droit Pénal", "Droit Commercial",
  "Droit Administratif", "Droit du Travail", "Moudawwana",
  "Droit Constitutionnel", "Procédure Civile", "Procédure Pénale",
  "Droit des Affaires",
];

const DOMAINS_AR = [
  "القانون المدني", "القانون الجنائي", "القانون التجاري",
  "القانون الإداري", "قانون الشغل", "مدونة الأسرة",
  "القانون الدستوري", "المسطرة المدنية", "المسطرة الجنائية",
  "قانون الأعمال",
];

const DIFFICULTIES = {
  fr: ["Débutant", "Intermédiaire", "Avancé", "Expert (Concours)"],
  ar: ["مبتدئ", "متوسط", "متقدم", "خبير (مباراة)"],
};

const DIFF_COLORS = [
  "text-green-500 border-green-500/60 bg-green-500/15",
  "text-blue-500 border-blue-500/60 bg-blue-500/15",
  "text-orange-500 border-orange-500/60 bg-orange-500/15",
  "text-red-500 border-red-500/60 bg-red-500/15",
];

type Phase = "select" | "generating" | "exercise" | "answering" | "correcting" | "result";

export default function PreparationsPage() {
  const { isSignedIn, isLoaded } = useAuthContext();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isRTL = language === "ar";

  const isMobile = useIsMobile();
  const [mobileShowList, setMobileShowList] = useState(true);
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [exercise, setExercise] = useState("");
  const [answer, setAnswer] = useState("");
  const [correction, setCorrection] = useState("");
  const [streamBuffer, setStreamBuffer] = useState("");

  const exerciseRef = useRef<HTMLDivElement>(null);
  const correctionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate(`${BASE_URL}/sign-in`);
  }, [isLoaded, isSignedIn]);

  const domains = isRTL ? DOMAINS_AR : DOMAINS_FR;
  const difficulties = isRTL ? DIFFICULTIES.ar : DIFFICULTIES.fr;

  const streamFromApi = async (
    endpoint: string,
    body: object,
    onChunk: (chunk: string) => void,
    onDone: (full: string) => void,
  ) => {
    const res = await fetch(`${API}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) throw new Error("Erreur API");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      onChunk(chunk);
    }
    onDone(full);
  };

  const generateExercise = async () => {
    if (!selectedDomain || !selectedDifficulty) {
      toast({ variant: "destructive", title: isRTL ? "اختر المادة والمستوى" : "Choisissez une matière et un niveau" });
      return;
    }
    setPhase("generating");
    setExercise("");
    setStreamBuffer("");
    try {
      await streamFromApi(
        "prep/exercise",
        { domain: selectedDomain, difficulty: selectedDifficulty, language },
        (chunk) => setStreamBuffer(prev => prev + chunk),
        (full) => {
          setExercise(full);
          setStreamBuffer("");
          setPhase("exercise");
          setTimeout(() => exerciseRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      );
    } catch {
      toast({ variant: "destructive", title: isRTL ? "خطأ" : "Erreur", description: isRTL ? "تعذّر توليد التمرين." : "Impossible de générer l'exercice." });
      setPhase("select");
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || answer.trim().length < 20) {
      toast({ variant: "destructive", title: isRTL ? "الإجابة قصيرة جداً" : "Réponse trop courte" });
      return;
    }
    setPhase("correcting");
    setCorrection("");
    setStreamBuffer("");
    try {
      await streamFromApi(
        "prep/correct",
        { exercise, answer, domain: selectedDomain, language },
        (chunk) => {
          setStreamBuffer(prev => prev + chunk);
          setTimeout(() => correctionRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        },
        (full) => { setCorrection(full); setStreamBuffer(""); setPhase("result"); }
      );
    } catch {
      toast({ variant: "destructive", title: isRTL ? "خطأ" : "Erreur" });
      setPhase("answering");
    }
  };

  const reset = () => {
    setPhase("select");
    setExercise("");
    setAnswer("");
    setCorrection("");
    setStreamBuffer("");
  };

  const formatText = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let tableLines: string[] = [];

    const flushTable = (key: string) => {
      if (tableLines.length === 0) return;
      elements.push(
        <div key={key} className="overflow-x-auto w-full my-2 rounded-lg border border-border">
          <table className="min-w-full text-xs border-collapse">
            <tbody>
              {tableLines.map((row, ri) => {
                const isSep = /^\|?\s*[-:]+[\s|:–-]+$/.test(row);
                if (isSep) return null;
                const cells = row.replace(/^\|/, "").replace(/\|$/, "").split("|");
                return (
                  <tr key={ri} className={ri === 0 ? "bg-muted/50 font-semibold" : "border-t border-border"}>
                    {cells.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-foreground/80 whitespace-nowrap border-r border-border last:border-r-0">
                        {cell.trim().replace(/\*\*/g, "")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableLines = [];
    };

    lines.forEach((line, i) => {
      const isTableRow = /^\|/.test(line.trim()) || (line.includes("|") && line.trim().startsWith("|"));
      if (isTableRow) { tableLines.push(line); return; }
      else { flushTable(`table-${i}`); }

      if (line.startsWith("### ")) {
        elements.push(<h4 key={i} className="text-[#c9a227] font-bold text-sm mt-3 mb-1">{line.slice(4)}</h4>);
      } else if (line.startsWith("## ")) {
        elements.push(<h3 key={i} className="text-[#c9a227] font-bold text-base mt-4 mb-2">{line.slice(3)}</h3>);
      } else if (line.startsWith("# ")) {
        elements.push(<h2 key={i} className="text-foreground font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>);
      } else if (line.startsWith("- ") || line.startsWith("• ")) {
        elements.push(<li key={i} className="text-foreground/80 text-sm ms-4 list-disc">{line.slice(2)}</li>);
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-2" />);
      } else {
        const formatted = line
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
          .replace(/\*([^*]+)\*/g, "<em>$1</em>");
        elements.push(
          <p key={i} className="text-foreground/80 text-sm leading-relaxed break-words"
            dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }
    });
    flushTable("table-end");
    return elements;
  };

  if (!isLoaded) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#0d1b2e]">
          <div className="w-8 h-8 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  /* ── MOBILE: list landing ── */
  if (isMobile && mobileShowList) {
    const labelNew = isRTL ? "تمرين جديد" : "Nouvelle Préparation";
    const labelTitle = isRTL ? "تحضيراتي" : "Préparer";
    const labelEmpty = isRTL ? "لا توجد تحضيرات بعد" : "Aucun exercice pour l'instant";
    const labelEmptyDesc = isRTL ? "ابدأ تمريناً جديداً وصحح مع الذكاء الاصطناعي" : "Commencez un exercice et corrigez-le avec l'IA";
    return (
      <Layout>
        <div className="flex flex-col bg-background overflow-y-auto" style={{ height: "calc(100dvh - 56px - 64px - env(safe-area-inset-bottom))" }} dir={isRTL ? "rtl" : "ltr"}>
          <div className="sticky top-0 z-10 bg-card px-4 py-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-accent" />
              <h1 className="text-base font-bold text-foreground">{labelTitle}</h1>
            </div>
            <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setMobileShowList(false)}>
              <Plus className="w-3.5 h-3.5" />{labelNew}
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/30 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-[#c9a227]" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{labelEmpty}</p>
              <p className="text-sm text-muted-foreground mt-1">{labelEmptyDesc}</p>
            </div>
            <Button className="gap-2 mt-2 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold" onClick={() => setMobileShowList(false)}>
              <Plus className="w-4 h-4" />{labelNew}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── MOBILE: exercise view ── */
  if (isMobile) {
    return (
      <Layout>
        <div className="bg-background pb-20" dir={isRTL ? "rtl" : "ltr"}>
          <div className="sticky top-0 z-20 bg-[#0d1b2e]/95 backdrop-blur border-b border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
              <button onClick={() => phase === "select" ? setMobileShowList(true) : reset()} className="text-white/60 hover:text-white transition-colors">
                <ChevronLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
              </button>
              <div className="flex items-center gap-2 flex-1">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c9a227] to-[#a07c1e] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-[#0d1b2e]" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-sm leading-none">{isRTL ? "التحضير والتدريب" : "Préparations"}</h1>
                  {selectedDomain && <p className="text-muted-foreground text-[10px] leading-none mt-0.5">{selectedDomain} · {selectedDifficulty}</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-4 pb-3 max-w-2xl mx-auto">
              {["select", "exercise", "answering", "result"].map((p, i) => {
                const phaseOrder = ["select", "generating", "exercise", "answering", "correcting", "result"];
                const current = phaseOrder.indexOf(phase);
                const target = phaseOrder.indexOf(p);
                return <div key={i} className={`h-1 rounded-full transition-all flex-1 ${current >= target ? "bg-[#c9a227]" : "bg-white/15"}`} />;
              })}
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-4 py-2 space-y-3">
            {/* Mobile select phase */}
            {phase === "select" && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider px-1">{isRTL ? "المادة القانونية" : "Matière"}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {domains.map((d) => (
                      <button key={d} onClick={() => setSelectedDomain(d)} className={`text-start px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all border ${selectedDomain === d ? "bg-[#c9a227]/20 border-[#c9a227]/60 text-[#c9a227]" : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"}`}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider px-1">{isRTL ? "المستوى" : "Niveau"}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {difficulties.map((d, i) => (
                      <button key={d} onClick={() => setSelectedDifficulty(d)} className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${selectedDifficulty === d ? DIFF_COLORS[i] : "bg-muted/50 border-border text-muted-foreground"}`}>{d}</button>
                    ))}
                  </div>
                </div>
                <Button onClick={generateExercise} disabled={!selectedDomain || !selectedDifficulty} className="w-full h-10 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold text-sm">
                  <Zap className="w-4 h-4 me-2" />{isRTL ? "توليد تمرين" : "Générer un exercice"}
                </Button>
              </div>
            )}
            {/* Other mobile phases follow same pattern as original */}
            {phase === "generating" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-[#c9a227]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">{isRTL ? "جارٍ توليد التمرين..." : "Génération en cours..."}</span>
                </div>
                {streamBuffer && <div className="bg-muted/50 rounded-2xl border border-border p-5 space-y-1">{formatText(streamBuffer)}<span className="inline-block w-2 h-4 bg-[#c9a227] animate-pulse rounded-sm ml-1" /></div>}
              </div>
            )}
            {(phase === "exercise" || phase === "answering") && (
              <div ref={exerciseRef} className="space-y-4 pt-2">
                <div className="bg-muted/30 rounded-2xl border border-[#c9a227]/30 overflow-hidden">
                  <div className="px-4 py-3 bg-[#c9a227]/10 border-b border-[#c9a227]/20 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#c9a227]" />
                    <span className="text-[#c9a227] font-bold text-sm">{isRTL ? "التمرين" : "Exercice"}</span>
                    <span className="ml-auto text-muted-foreground text-xs">{selectedDomain}</span>
                  </div>
                  <div className="p-5 space-y-1">{formatText(exercise)}</div>
                </div>
                {phase === "exercise" && <Button onClick={() => setPhase("answering")} className="w-full h-11 bg-muted text-foreground border"><Send className="w-4 h-4 me-2" />{isRTL ? "كتابة الإجابة" : "Rédiger ma réponse"}</Button>}
                {phase === "answering" && (
                  <div className="space-y-3">
                    <Textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder={isRTL ? "اكتب إجابتك..." : "Rédigez votre réponse..."} className="text-sm resize-none min-h-[180px]" dir={isRTL ? "rtl" : "ltr"} />
                    <div className="flex gap-2">
                      <Button onClick={() => setPhase("exercise")} variant="ghost" className="flex-1 h-11 text-sm"><ChevronLeft className="w-4 h-4 me-1" />{isRTL ? "رجوع" : "Retour"}</Button>
                      <Button onClick={submitAnswer} disabled={!answer.trim() || answer.trim().length < 20} className="flex-[2] h-11 bg-[#c9a227] text-[#0d1b2e] font-bold text-sm"><CheckCircle2 className="w-4 h-4 me-2" />{isRTL ? "تقديم" : "Soumettre"}</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {phase === "correcting" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-[#c9a227]"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">{isRTL ? "جارٍ التصحيح..." : "Correction en cours..."}</span></div>
                {streamBuffer && <div ref={correctionRef} className="bg-muted/50 rounded-2xl border border-border p-5 space-y-1">{formatText(streamBuffer)}<span className="inline-block w-2 h-4 bg-[#c9a227] animate-pulse rounded-sm ml-1" /></div>}
              </div>
            )}
            {phase === "result" && (
              <div className="space-y-4 pt-2">
                <div className="bg-muted/30 rounded-2xl border border-border overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-green-500/10 to-[#c9a227]/10 border-b border-border flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#c9a227]" />
                    <span className="text-foreground font-bold text-sm">{isRTL ? "التصحيح النموذجي" : "Correction détaillée"}</span>
                  </div>
                  <div ref={correctionRef} className="p-5 space-y-1">{formatText(correction)}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={reset} variant="outline" className="flex-1 h-11 text-sm"><RotateCcw className="w-4 h-4 me-2" />{isRTL ? "تمرين جديد" : "Nouvel exercice"}</Button>
                  <Button onClick={() => setMobileShowList(true)} className="flex-1 h-11 text-sm"><X className="w-4 h-4 me-2" />{isRTL ? "خروج" : "Terminer"}</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  /* ── DESKTOP: left = form panel, right = exercise content ── */
  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>

        {/* LEFT: form panel */}
        <div className="w-[400px] shrink-0 flex flex-col border-e border-border bg-card overflow-y-auto outline-none">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a227] to-[#a07c1e] flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-[#0d1b2e]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground leading-none">{isRTL ? "التحضير والتدريب" : "Préparation & Entraînement"}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{isRTL ? "اختر المادة والمستوى ثم ولّد تمريناً" : "Choisissez la matière, le niveau et générez un exercice"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-5 pt-5 pb-6">
            {/* Domain pills — 2-col grid */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{isRTL ? "المادة" : "Matière"}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {domains.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDomain(d)}
                    className={`px-2.5 py-2 rounded-lg border text-xs font-medium transition-all text-start truncate ${
                      selectedDomain === d ? "border-[#c9a227] bg-[#c9a227]/10 text-[#c9a227]" : "border-border bg-background hover:bg-muted text-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty pills — 2-col grid */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{isRTL ? "المستوى" : "Niveau"}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {difficulties.map((d, i) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-2.5 py-2 rounded-lg border text-xs font-semibold transition-all text-center ${
                      selectedDifficulty === d ? DIFF_COLORS[i] : "border-border bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <Button
              onClick={generateExercise}
              disabled={!selectedDomain || !selectedDifficulty || phase === "generating"}
              className="w-full h-11 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold text-sm gap-2 mt-1"
            >
              {phase === "generating"
                ? <><Loader2 className="w-4 h-4 animate-spin" />{isRTL ? "جارٍ..." : "Génération..."}</>
                : <><Zap className="w-4 h-4" />{isRTL ? "توليد تمرين" : "Générer"}</>}
            </Button>

            {phase !== "select" && (
              <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground w-full">
                <RotateCcw className="w-3.5 h-3.5" />{isRTL ? "تمرين جديد" : "Nouvel exercice"}
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT: exercise content */}
        <div className="flex-1 overflow-y-auto bg-background outline-none">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">

            {/* Empty state */}
            {phase === "select" && (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/30 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-[#c9a227]" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{isRTL ? "اختر المادة والمستوى واضغط توليد" : "Sélectionnez une matière et un niveau, puis cliquez sur Générer"}</p>
                  <p className="text-sm text-muted-foreground mt-1">{isRTL ? "سيولّد الذكاء الاصطناعي تمريناً مناسباً" : "L'IA générera un exercice adapté à votre niveau"}</p>
                </div>
              </div>
            )}

            {/* Generating */}
            {phase === "generating" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#c9a227]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">{isRTL ? "جارٍ توليد التمرين..." : "Génération de l'exercice en cours..."}</span>
                </div>
                {streamBuffer && (
                  <div className="bg-muted/50 rounded-2xl border border-border p-6 space-y-1">
                    {formatText(streamBuffer)}
                    <span className="inline-block w-2 h-4 bg-[#c9a227] animate-pulse rounded-sm ml-1" />
                  </div>
                )}
              </div>
            )}

            {/* Exercise + answering */}
            {(phase === "exercise" || phase === "answering") && (
              <div ref={exerciseRef} className="space-y-5">
                <div className="bg-muted/30 rounded-2xl border border-[#c9a227]/30 overflow-hidden">
                  <div className="px-5 py-3 bg-[#c9a227]/10 border-b border-[#c9a227]/20 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#c9a227]" />
                    <span className="text-[#c9a227] font-bold text-sm">{isRTL ? "التمرين" : "Exercice"}</span>
                    <span className="ml-auto text-muted-foreground text-xs">{selectedDomain} · {selectedDifficulty}</span>
                  </div>
                  <div className="p-6 space-y-1">{formatText(exercise)}</div>
                </div>

                {phase === "exercise" && (
                  <Button onClick={() => setPhase("answering")} className="w-full h-11 bg-muted hover:bg-muted/80 text-foreground border border-border font-medium">
                    <Send className="w-4 h-4 me-2" />{isRTL ? "كتابة الإجابة" : "Rédiger ma réponse"}
                  </Button>
                )}

                {phase === "answering" && (
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{isRTL ? "إجابتك" : "Votre réponse"}</p>
                    <Textarea
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder={isRTL ? "اكتب إجابتك القانونية المفصلة هنا..." : "Rédigez votre réponse juridique ici..."}
                      className="bg-background border-border text-foreground text-sm resize-none focus:border-[#c9a227]/60 min-h-[200px]"
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => setPhase("exercise")} variant="ghost" className="flex-1 h-11 text-muted-foreground text-sm">
                        <ChevronLeft className={`w-4 h-4 me-1 ${isRTL ? "rotate-180" : ""}`} />{isRTL ? "رجوع" : "Retour"}
                      </Button>
                      <Button onClick={submitAnswer} disabled={!answer.trim() || answer.trim().length < 20} className="flex-[2] h-11 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 me-2" />{isRTL ? "تقديم للتصحيح" : "Soumettre pour correction"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Correcting */}
            {phase === "correcting" && (
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-xl border border-border p-4 text-muted-foreground text-xs leading-relaxed line-clamp-3">{exercise.slice(0, 200)}...</div>
                <div className="flex items-center gap-2 text-[#c9a227]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">{isRTL ? "جارٍ التصحيح..." : "Correction en cours..."}</span>
                </div>
                {streamBuffer && (
                  <div ref={correctionRef} className="bg-muted/50 rounded-2xl border border-border p-6 space-y-1">
                    {formatText(streamBuffer)}
                    <span className="inline-block w-2 h-4 bg-[#c9a227] animate-pulse rounded-sm ml-1" />
                  </div>
                )}
              </div>
            )}

            {/* Result */}
            {phase === "result" && (
              <div className="space-y-5">
                <div className="bg-muted/30 rounded-2xl border border-border overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-green-500/10 to-[#c9a227]/10 border-b border-border flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#c9a227]" />
                    <span className="text-foreground font-bold text-sm">{isRTL ? "التصحيح النموذجي" : "Correction détaillée"}</span>
                  </div>
                  <div ref={correctionRef} className="p-6 space-y-1">{formatText(correction)}</div>
                </div>

                <div className="bg-muted/30 rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-2.5 border-b border-border">
                    <span className="text-muted-foreground text-xs font-semibold">{isRTL ? "إجابتك" : "Votre réponse"}</span>
                  </div>
                  <div className="p-5 text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{answer}</div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={reset} variant="outline" className="flex-1 h-11 text-sm">
                    <RotateCcw className="w-4 h-4 me-2" />{isRTL ? "تمرين جديد بنفس الإعدادات" : "Nouvel exercice (mêmes paramètres)"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
