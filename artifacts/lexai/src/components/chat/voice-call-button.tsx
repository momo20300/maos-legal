import { useState, useRef, useCallback } from "react";
import { Phone, PhoneOff, Mic, MicOff, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { RetellWebClient } from "retell-client-js-sdk";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

type CallState = "idle" | "connecting" | "active" | "error";
type CallLanguage = "fr" | "ar";

const LANG_LABELS: Record<CallLanguage, { label: string; flag: string; sublabel: string }> = {
  fr: { label: "Agent Français", flag: "🇫🇷", sublabel: "Droit FR / EU / Maroc" },
  ar: { label: "وكيل عربي", flag: "🇸🇦", sublabel: "القانون العربي والمغربي" },
};

export function VoiceCallButton() {
  const [callState, setCallState] = useState<CallState>("idle");
  const [language, setLanguage] = useState<CallLanguage>("fr");
  const [isMuted, setIsMuted] = useState(false);
  const clientRef = useRef<RetellWebClient | null>(null);
  const { toast } = useToast();

  const startCall = useCallback(async (lang: CallLanguage) => {
    setLanguage(lang);
    setCallState("connecting");

    try {
      const res = await fetch(`${BASE_URL}/api/voice/create-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ language: lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur serveur");
      }

      const { accessToken } = await res.json();

      const client = new RetellWebClient();
      clientRef.current = client;

      client.on("call_started", () => {
        setCallState("active");
        toast({
          title: lang === "ar" ? "تم الاتصال" : "Appel en cours",
          description: lang === "ar"
            ? "مرحباً بك في MAOS Legal، كيف يمكنني مساعدتك؟"
            : "MAOS Legal à votre écoute. Comment puis-je vous aider ?",
        });
      });

      client.on("call_ended", () => {
        setCallState("idle");
        setIsMuted(false);
        clientRef.current = null;
        toast({ title: lang === "ar" ? "انتهى الاتصال" : "Appel terminé" });
      });

      client.on("error", (err) => {
        console.error("Retell error:", err);
        setCallState("error");
        setTimeout(() => setCallState("idle"), 2000);
        toast({
          title: "Erreur d'appel",
          description: String(err),
          variant: "destructive",
        });
      });

      await client.startCall({ accessToken, sampleRate: 24000 });

    } catch (err: any) {
      console.error("Voice call error:", err);
      setCallState("error");
      setTimeout(() => setCallState("idle"), 2000);
      toast({
        title: "Impossible de démarrer l'appel",
        description: err.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const endCall = useCallback(() => {
    clientRef.current?.stopCall();
    clientRef.current = null;
    setCallState("idle");
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!clientRef.current) return;
    if (isMuted) {
      clientRef.current.unmute();
    } else {
      clientRef.current.mute();
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Active call UI
  if (callState === "active") {
    return (
      <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1.5">
        {/* Pulsing indicator */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-xs text-green-600 dark:text-green-400 font-medium hidden sm:inline">
          {LANG_LABELS[language].flag} {language === "ar" ? "متصل" : "En ligne"}
        </span>

        {/* Mute */}
        <button
          onClick={toggleMute}
          className={`p-1.5 rounded-full transition-colors ${isMuted ? "bg-red-500/20 text-red-500" : "hover:bg-white/10 text-muted-foreground hover:text-foreground"}`}
          title={isMuted ? "Activer le micro" : "Couper le micro"}
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        {/* Hang up */}
        <button
          onClick={endCall}
          className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="Raccrocher"
        >
          <PhoneOff className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Connecting state
  if (callState === "connecting") {
    return (
      <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5">
        <Phone className="w-3.5 h-3.5 text-accent animate-pulse" />
        <span className="text-xs text-accent font-medium hidden sm:inline">
          {language === "ar" ? "جارٍ الاتصال..." : "Connexion..."}
        </span>
      </div>
    );
  }

  // Idle — show dropdown to pick language
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-accent/40 text-accent hover:bg-accent/10 hover:text-accent rounded-full h-8 px-3"
          title="Appeler un agent vocal"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs font-medium">Agent vocal</span>
          <Globe className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <div className="px-2 py-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          Choisir un agent
        </div>
        {(Object.entries(LANG_LABELS) as [CallLanguage, typeof LANG_LABELS[CallLanguage]][]).map(
          ([code, info]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => startCall(code)}
              className="gap-3 cursor-pointer py-2.5"
            >
              <span className="text-xl">{info.flag}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{info.label}</span>
                <span className="text-xs text-muted-foreground">{info.sublabel}</span>
              </div>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
