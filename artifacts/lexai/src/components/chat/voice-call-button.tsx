import React, { useState, useRef, useCallback } from "react";
import { Phone, PhoneOff, Mic, MicOff, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { RetellWebClient } from "retell-client-js-sdk";
import { useAuthContext } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useLocation } from "wouter";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

type CallState = "idle" | "connecting" | "active" | "error";
export type CallLanguage = "fr" | "ar" | "en" | "es" | "de" | "it" | "no" | "pl";

interface LangOption {
  code: CallLanguage;
  flag: string;
  label: string;
  sublabel: string;
}

const LANG_OPTIONS: LangOption[] = [
  { code: "fr", flag: "🇫🇷", label: "Agent Français",       sublabel: "Droit FR / EU / Maroc" },
  { code: "ar", flag: "🇲🇦", label: "وكيل عربي",            sublabel: "القانون العربي والمغربي" },
  { code: "en", flag: "🇺🇸", label: "English Agent",        sublabel: "US / EU / International" },
  { code: "es", flag: "🇪🇸", label: "Agente Español",       sublabel: "Derecho ES / EU / Internacional" },
  { code: "de", flag: "🇩🇪", label: "Deutschsprachiger Agent", sublabel: "Recht DE / EU / International" },
  { code: "it", flag: "🇮🇹", label: "Agente Italiano",      sublabel: "Diritto IT / EU / Internazionale" },
  { code: "no", flag: "🇳🇴", label: "Norsk Agent",          sublabel: "Norsk rett / EU / Internasjonal" },
  { code: "pl", flag: "🇵🇱", label: "Agent Polski",         sublabel: "Prawo PL / EU / Międzynarodowe" },
];

const LANG_LABELS: Record<CallLanguage, { started: string; ended: string; greeting: string; viewLabel: string; archivedTitle: string; archivedDesc: string; callbackLabel: string }> = {
  fr: { started: "Appel en cours", ended: "Appel terminé", greeting: "MAOS Legal à votre écoute", viewLabel: "Voir", archivedTitle: "Appel archivé", archivedDesc: "La transcription est sauvegardée", callbackLabel: "Rappeler" },
  ar: { started: "تم الاتصال", ended: "انتهى الاتصال", greeting: "مرحباً بك في MAOS Legal", viewLabel: "عرض", archivedTitle: "تم أرشفة المكالمة", archivedDesc: "التسجيل محفوظ في استشاراتك", callbackLabel: "معاودة الاتصال" },
  en: { started: "Call in progress", ended: "Call ended", greeting: "MAOS Legal at your service", viewLabel: "View", archivedTitle: "Call archived", archivedDesc: "Transcript saved", callbackLabel: "Call back" },
  es: { started: "Llamada en curso", ended: "Llamada terminada", greeting: "MAOS Legal a su servicio", viewLabel: "Ver", archivedTitle: "Llamada archivada", archivedDesc: "La transcripción está guardada", callbackLabel: "Volver a llamar" },
  de: { started: "Gespräch läuft", ended: "Gespräch beendet", greeting: "MAOS Legal ist für Sie da", viewLabel: "Anzeigen", archivedTitle: "Anruf archiviert", archivedDesc: "Transkript wurde gespeichert", callbackLabel: "Zurückrufen" },
  it: { started: "Chiamata in corso", ended: "Chiamata terminata", greeting: "MAOS Legal al vostro servizio", viewLabel: "Vedi", archivedTitle: "Chiamata archiviata", archivedDesc: "La trascrizione è stata salvata", callbackLabel: "Richiamare" },
  no: { started: "Samtale pågår", ended: "Samtale avsluttet", greeting: "MAOS Legal til din tjeneste", viewLabel: "Vis", archivedTitle: "Samtale arkivert", archivedDesc: "Transkripsjonen er lagret", callbackLabel: "Ring tilbake" },
  pl: { started: "Połączenie w toku", ended: "Połączenie zakończone", greeting: "MAOS Legal do Twoich usług", viewLabel: "Zobacz", archivedTitle: "Rozmowa zarchiwizowana", archivedDesc: "Transkrypcja została zapisana", callbackLabel: "Oddzwoń" },
};

const HIDDEN_PATHS = ["/", "/profile", "/dossiers", "/preparations"];

function useVoiceCall(navigate: (path: string) => void, onCallArchived?: () => void) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [activeLang, setActiveLang] = useState<CallLanguage>("fr");
  const [isMuted, setIsMuted] = useState(false);
  const clientRef = useRef<RetellWebClient | null>(null);
  const callIdRef = useRef<string | null>(null);
  const convIdRef = useRef<number | undefined>(undefined);
  const { toast } = useToast();

  const archiveCall = useCallback(async (callId: string, lang: CallLanguage, conversationId?: number) => {
    try {
      await fetch(`${BASE_URL}/api/billing/charge-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ callId }),
      });
    } catch { /* billing errors are non-blocking */ }

    const labels = LANG_LABELS[lang];

    fetch(`${BASE_URL}/api/voice/archive-call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ callId, language: lang, ...(conversationId ? { conversationId } : {}) }),
    }).then(r => r.json()).then(data => {
      if (data.conversationId) {
        const convId = data.conversationId;
        onCallArchived?.();
        toast({
          title: labels.archivedTitle,
          description: labels.archivedDesc,
          action: (
            <ToastAction
              altText={labels.viewLabel}
              onClick={() => navigate(`/conversations/${convId}`)}
            >
              {labels.viewLabel} →
            </ToastAction>
          ),
        });
      }
    }).catch(() => {});
  }, [toast, navigate, onCallArchived]);

  const startCall = useCallback(async (lang: CallLanguage, conversationId?: number) => {
    setActiveLang(lang);
    setCallState("connecting");
    convIdRef.current = conversationId;
    const labels = LANG_LABELS[lang];

    try {
      const res = await fetch(`${BASE_URL}/api/voice/create-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ language: lang, ...(conversationId ? { conversationId } : {}) }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur serveur");
      }

      const { accessToken, callId } = await res.json();
      callIdRef.current = callId;
      const client = new RetellWebClient();
      clientRef.current = client;

      client.on("call_started", () => {
        setCallState("active");
        toast({ title: labels.started, description: labels.greeting });
      });

      client.on("call_ended", () => {
        const finishedCallId = callIdRef.current;
        const finishedConvId = convIdRef.current;
        setCallState("idle");
        setIsMuted(false);
        clientRef.current = null;
        callIdRef.current = null;
        convIdRef.current = undefined;
        toast({ title: labels.ended });
        if (finishedCallId) archiveCall(finishedCallId, lang, finishedConvId);
      });

      client.on("error", () => {
        setCallState("idle");
        toast({ title: "Erreur d'appel", description: "La connexion a été interrompue.", variant: "destructive" });
      });

      await client.startCall({ accessToken, sampleRate: 24000 });
    } catch {
      setCallState("idle");
      toast({ title: "Impossible de démarrer l'appel", description: "Vérifiez votre connexion et réessayez.", variant: "destructive" });
    }
  }, [toast, archiveCall]);

  const endCall = useCallback(() => {
    clientRef.current?.stopCall();
    clientRef.current = null;
    setCallState("idle");
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!clientRef.current) return;
    if (isMuted) clientRef.current.unmute();
    else clientRef.current.mute();
    setIsMuted(v => !v);
  }, [isMuted]);

  return { callState, activeLang, isMuted, startCall, endCall, toggleMute };
}

export function VoiceAgentSheet({ onSelect, onClose }: { onSelect: (lang: CallLanguage) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Choisir un agent vocal</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {LANG_OPTIONS.map(opt => (
            <button
              key={opt.code}
              onClick={() => { onSelect(opt.code); onClose(); }}
              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors border-b border-border/50 last:border-0 text-left"
            >
              <span className="text-2xl leading-none w-8 text-center shrink-0">{opt.flag}</span>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">{opt.label}</span>
                <span className="text-xs text-muted-foreground truncate">{opt.sublabel}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Inline button used inside conversation pages
export function VoiceCallInlineButton({ conversationId, onArchived }: { conversationId?: number; onArchived?: () => void }) {
  const { isSignedIn } = useAuthContext();
  const [, navigate] = useLocation();
  const { callState, isMuted, startCall, endCall, toggleMute } = useVoiceCall(navigate, onArchived);
  const [showSheet, setShowSheet] = useState(false);

  if (!isSignedIn) return null;

  if (callState === "active") {
    return (
      <div className="flex items-center gap-2">
        <button onClick={toggleMute} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border ${isMuted ? "bg-red-500 border-red-600 text-white" : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`} title={isMuted ? "Réactiver le micro" : "Couper le micro"}>
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <div className="relative">
          <button onClick={endCall} className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xl transition-all active:scale-95" title="Raccrocher">
            <PhoneOff className="w-5 h-5" />
          </button>
          <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping pointer-events-none" />
        </div>
      </div>
    );
  }

  if (callState === "connecting") {
    return (
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full bg-[#c9a227] flex items-center justify-center shadow-xl">
          <Phone className="w-5 h-5 text-[#0d1b2e] animate-pulse" />
        </div>
        <span className="absolute inset-0 rounded-full bg-[#c9a227] opacity-40 animate-ping pointer-events-none" />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowSheet(true)}
        className="flex items-center gap-2 h-9 px-3 rounded-xl bg-[#c9a227] hover:bg-[#b8911f] text-[#0d1b2e] font-semibold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 focus:outline-none"
        title="Rappeler un agent vocal MAOS Legal"
      >
        <Phone className="w-4 h-4" />
        {conversationId ? "Rappeler" : "Appeler"}
      </button>
      {showSheet && (
        <VoiceAgentSheet
          onSelect={(lang) => { startCall(lang, conversationId); }}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}

export function VoiceCallFAB() {
  const { isSignedIn } = useAuthContext();
  const { language: uiLanguage } = useLanguage();
  const [location, navigate] = useLocation();
  const { callState, activeLang, isMuted, startCall, endCall, toggleMute } = useVoiceCall(navigate);
  const [showSheet, setShowSheet] = useState(false);

  void uiLanguage;
  void activeLang;

  const isHidden = HIDDEN_PATHS.some(p => location === p);
  if (!isSignedIn || isHidden) return null;

  // Don't show FAB on conversation pages (the inline button is there)
  if (location.startsWith("/conversations/")) return null;

  if (callState === "active") {
    return (
      <div className="fixed bottom-36 md:bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <button onClick={toggleMute} className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all border ${isMuted ? "bg-red-500 border-red-600 text-white" : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`} title={isMuted ? "Réactiver" : "Couper le micro"}>
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <div className="relative">
          <button onClick={endCall} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xl transition-all active:scale-95" title="Raccrocher">
            <PhoneOff className="w-6 h-6" />
          </button>
          <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping pointer-events-none" />
        </div>
      </div>
    );
  }

  if (callState === "connecting") {
    return (
      <div className="fixed bottom-36 md:bottom-6 right-6 z-50">
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-xl">
          <Phone className="w-6 h-6 text-[#0d1b2e] animate-pulse" />
        </div>
        <span className="absolute inset-0 rounded-full bg-accent opacity-40 animate-ping" />
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-36 md:bottom-6 right-6 z-50">
        <button
          onClick={() => setShowSheet(true)}
          className="w-14 h-14 rounded-full bg-[#c9a227] hover:bg-[#b8911f] text-[#0d1b2e] flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 focus:outline-none"
          title="Appeler un agent vocal MAOS Legal"
        >
          <Phone className="w-6 h-6" />
        </button>
      </div>
      {showSheet && <VoiceAgentSheet onSelect={(lang) => startCall(lang)} onClose={() => setShowSheet(false)} />}
    </>
  );
}
