import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/layout";
import { useAuthContext } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  GraduationCap, ChevronLeft, Zap, RotateCcw,
  CheckCircle2, Send, X, BookOpen, Award, Loader2,
} from "lucide-react";

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

type Phase = "select" | "generating" | "exercise" | "answering" | "correcting" | "result";

export default function PreparationsPage() {
  const { isSignedIn, isLoaded } = useAuthContext();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isRTL = language === "ar";

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

    if (!res.ok || !res.body) {
      throw new Error("Erreur API");
    }

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
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer l'exercice." });
      setPhase("select");
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || answer.trim().length < 20) {
      toast({ variant: "destructive", title: isRTL ? "الإجابة قصيرة جداً" : "Réponse trop courte", description: isRTL ? "أكتب إجابة أكثر تفصيلاً" : "Développez davantage votre réponse" });
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
        (full) => {
          setCorrection(full);
          setStreamBuffer("");
          setPhase("result");
        }
      );
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de corriger la réponse." });
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

  const exit = () => navigate(`${BASE_URL}/`);

  const formatText = (text: string) =>
    text
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("## ")) return <h3 key={i} className="text-[#c9a227] font-bold text-base mt-4 mb-2">{line.slice(3)}</h3>;
        if (line.startsWith("# ")) return <h2 key={i} className="text-foreground font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>;
        if (line.startsWith("**") && line.endsWith("**")) return <strong key={i} className="text-foreground font-semibold block">{line.slice(2, -2)}</strong>;
        if (line.startsWith("- ") || line.startsWith("• ")) return <li key={i} className="text-foreground/80 text-sm ml-4 list-disc">{line.slice(2)}</li>;
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return <p key={i} className="text-foreground/80 text-sm leading-relaxed">{line}</p>;
      });

  if (!isLoaded) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#0d1b2e]">
          <div className="w-8 h-8 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-24" dir={isRTL ? "rtl" : "ltr"}>

        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#0d1b2e]/95 backdrop-blur border-b border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
            <button onClick={() => phase === "select" ? exit() : reset()} className="text-white/60 hover:text-white transition-colors">
              <ChevronLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c9a227] to-[#a07c1e] flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-[#0d1b2e]" />
              </div>
              <div>
                <h1 className="text-white font-bold text-sm leading-none">
                  {isRTL ? "التحضير والتدريب" : "Préparations"}
                </h1>
                {selectedDomain && (
                  <p className="text-muted-foreground text-[10px] leading-none mt-0.5">{selectedDomain} · {selectedDifficulty}</p>
                )}
              </div>
            </div>
            {/* EXIT button */}
            <button
              onClick={exit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-bold transition-all border border-white/10"
            >
              <X className="w-3.5 h-3.5" />
              EXIT
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 px-4 pb-3 max-w-2xl mx-auto">
            {["select", "exercise", "answering", "result"].map((p, i) => {
              const phaseOrder = ["select", "generating", "exercise", "answering", "correcting", "result"];
              const current = phaseOrder.indexOf(phase);
              const target = phaseOrder.indexOf(p);
              const isActive = current >= target;
              return (
                <div key={p} className={`h-1 rounded-full transition-all flex-1 ${isActive ? "bg-[#c9a227]" : "bg-white/15"}`} />
              );
            })}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

          {/* PHASE: SELECT */}
          {phase === "select" && (
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/30 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-7 h-7 text-[#c9a227]" />
                </div>
                <h2 className="text-foreground font-bold text-lg">
                  {isRTL ? "اختر مادتك" : "Choisissez votre exercice"}
                </h2>
                <p className="text-muted-foreground text-xs mt-1">
                  {isRTL ? "مرن ذاكرتك القانونية وتعلم من التصحيح" : "Entraînez-vous et apprenez de la correction IA"}
                </p>
              </div>

              {/* Domain selection */}
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider px-1">
                  {isRTL ? "المادة القانونية" : "Matière"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {domains.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDomain(d)}
                      className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        selectedDomain === d
                          ? "bg-[#c9a227]/20 border-[#c9a227]/60 text-[#c9a227]"
                          : "bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty selection */}
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider px-1">
                  {isRTL ? "المستوى" : "Niveau"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {difficulties.map((d, i) => {
                    const colors = ["text-green-500 border-green-500/40 bg-green-500/10", "text-blue-500 border-blue-500/40 bg-blue-500/10", "text-orange-500 border-orange-500/40 bg-orange-500/10", "text-red-500 border-red-500/40 bg-red-500/10"];
                    const selectedColors = ["bg-green-500/20 border-green-500/60", "bg-blue-500/20 border-blue-500/60", "bg-orange-500/20 border-orange-500/60", "bg-red-500/20 border-red-500/60"];
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(d)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                          selectedDifficulty === d
                            ? selectedColors[i]
                            : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        } ${selectedDifficulty === d ? colors[i] : ""}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={generateExercise}
                disabled={!selectedDomain || !selectedDifficulty}
                className="w-full h-12 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold text-sm shadow-lg shadow-[#c9a227]/20 disabled:opacity-30"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isRTL ? "توليد تمرين" : "Générer un exercice"}
              </Button>
            </div>
          )}

          {/* PHASE: GENERATING (streaming) */}
          {phase === "generating" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#c9a227]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">
                  {isRTL ? "جارٍ توليد التمرين..." : "Génération de l'exercice en cours..."}
                </span>
              </div>
              {streamBuffer && (
                <div className="bg-muted/50 rounded-2xl border border-border p-5 space-y-1">
                  {formatText(streamBuffer)}
                  <span className="inline-block w-2 h-4 bg-[#c9a227] animate-pulse rounded-sm ml-1" />
                </div>
              )}
            </div>
          )}

          {/* PHASE: EXERCISE */}
          {(phase === "exercise" || phase === "answering") && (
            <div ref={exerciseRef} className="space-y-4">
              {/* Exercise card */}
              <div className="bg-muted/30 rounded-2xl border border-[#c9a227]/30 overflow-hidden">
                <div className="px-4 py-3 bg-[#c9a227]/10 border-b border-[#c9a227]/20 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#c9a227]" />
                  <span className="text-[#c9a227] font-bold text-sm">
                    {isRTL ? "التمرين" : "Exercice"}
                  </span>
                  <span className="ml-auto text-muted-foreground text-xs">{selectedDomain} · {selectedDifficulty}</span>
                </div>
                <div className="p-5 space-y-1">
                  {formatText(exercise)}
                </div>
              </div>

              {/* Answer input */}
              {phase === "exercise" && (
                <Button
                  onClick={() => setPhase("answering")}
                  className="w-full h-11 bg-muted hover:bg-muted/80 text-foreground border border-border font-medium text-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isRTL ? "كتابة الإجابة" : "Rédiger ma réponse"}
                </Button>
              )}

              {phase === "answering" && (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    {isRTL ? "إجابتك" : "Votre réponse"}
                  </p>
                  <Textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder={isRTL ? "اكتب إجابتك القانونية المفصلة هنا..." : "Rédigez votre réponse juridique ici... (minimum 20 caractères)"}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground text-sm resize-none focus:border-[#c9a227]/60 min-h-[180px]"
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPhase("exercise")}
                      variant="ghost"
                      className="flex-1 h-11 text-muted-foreground hover:text-foreground text-sm"
                    >
                      <ChevronLeft className={`w-4 h-4 mr-1 ${isRTL ? "rotate-180" : ""}`} />
                      {isRTL ? "رجوع" : "Retour"}
                    </Button>
                    <Button
                      onClick={submitAnswer}
                      disabled={!answer.trim() || answer.trim().length < 20}
                      className="flex-[2] h-11 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold text-sm disabled:opacity-30"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {isRTL ? "تقديم للتصحيح" : "Soumettre pour correction"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PHASE: CORRECTING (streaming) */}
          {phase === "correcting" && (
            <div className="space-y-4">
              {/* Show exercise mini */}
              <div className="bg-muted/30 rounded-xl border border-border p-3 text-muted-foreground text-xs leading-relaxed line-clamp-3">
                {exercise.slice(0, 200)}...
              </div>
              <div className="flex items-center gap-2 text-[#c9a227]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">
                  {isRTL ? "جارٍ التصحيح..." : "Correction en cours..."}
                </span>
              </div>
              {streamBuffer && (
                <div ref={correctionRef} className="bg-muted/50 rounded-2xl border border-border p-5 space-y-1">
                  {formatText(streamBuffer)}
                  <span className="inline-block w-2 h-4 bg-[#c9a227] animate-pulse rounded-sm ml-1" />
                </div>
              )}
            </div>
          )}

          {/* PHASE: RESULT */}
          {phase === "result" && (
            <div className="space-y-4">
              {/* Correction card */}
              <div className="bg-muted/30 rounded-2xl border border-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-green-500/10 to-[#c9a227]/10 border-b border-border flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#c9a227]" />
                  <span className="text-foreground font-bold text-sm">
                    {isRTL ? "التصحيح النموذجي" : "Correction détaillée"}
                  </span>
                </div>
                <div ref={correctionRef} className="p-5 space-y-1">
                  {formatText(correction)}
                </div>
              </div>

              {/* Your answer reminder */}
              <div className="bg-muted/30 rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
                  <span className="text-muted-foreground text-xs font-semibold">{isRTL ? "إجابتك" : "Votre réponse"}</span>
                </div>
                <div className="p-4 text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{answer}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={reset}
                  variant="outline"
                  className="flex-1 h-11 border-border text-muted-foreground hover:bg-muted hover:text-foreground text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isRTL ? "تمرين جديد" : "Nouvel exercice"}
                </Button>
                <Button
                  onClick={exit}
                  className="flex-1 h-11 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold text-sm"
                >
                  {isRTL ? "خروج" : "EXIT"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
