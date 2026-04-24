import { useState, useRef, useCallback } from "react";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { RetellWebClient } from "retell-client-js-sdk";
import { useAuthContext } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

type CallState = "idle" | "connecting" | "active" | "error";
type CallLanguage = "fr" | "ar";

const LANG_OPTIONS: { code: CallLanguage; flag: string; label: string; sublabel: string }[] = [
  { code: "fr", flag: "🇫🇷", label: "Agent Français", sublabel: "Droit FR / EU / Maroc" },
  { code: "ar", flag: "🇸🇦", label: "وكيل عربي", sublabel: "القانون العربي والمغربي" },
];

export function VoiceCallFAB() {
  const { isSignedIn } = useAuthContext();
  const { language: uiLanguage } = useLanguage();
  const isRTL = uiLanguage === "ar";
  const [callState, setCallState] = useState<CallState>("idle");
  const [language, setLanguage] = useState<CallLanguage>("fr");
  const [isMuted, setIsMuted] = useState(false);
  const clientRef = useRef<RetellWebClient | null>(null);
  const { toast } = useToast();
  const sideClass = isRTL ? "left-6" : "right-6";

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
            ? "مرحباً بك في MAOS Legal"
            : "MAOS Legal à votre écoute",
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
        setCallState("idle");
        toast({ title: "Erreur d'appel", description: String(err), variant: "destructive" });
      });

      await client.startCall({ accessToken, sampleRate: 24000 });
    } catch (err: any) {
      console.error("Voice call error:", err);
      setCallState("idle");
      toast({ title: "Impossible de démarrer l'appel", description: err.message, variant: "destructive" });
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

  if (!isSignedIn) return null;

  // ACTIVE CALL — show controls instead of main FAB
  if (callState === "active") {
    return (
      <div className={`fixed bottom-20 md:bottom-6 ${sideClass} z-50 flex flex-col items-end gap-2`}>
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all border ${
            isMuted
              ? "bg-red-500 border-red-600 text-white"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          title={isMuted ? "Réactiver le micro" : "Couper le micro"}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Hang up FAB */}
        <button
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xl transition-all active:scale-95"
          title="Raccrocher"
        >
          <PhoneOff className="w-6 h-6" />
        </button>

        {/* Pulsing ring */}
        <span className="absolute bottom-0 right-0 w-14 h-14 rounded-full bg-red-400 opacity-30 animate-ping pointer-events-none" />
      </div>
    );
  }

  // CONNECTING
  if (callState === "connecting") {
    return (
      <div className={`fixed bottom-20 md:bottom-6 ${sideClass} z-50`}>
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-xl">
          <Phone className="w-6 h-6 text-[#0d1b2e] animate-pulse" />
        </div>
        <span className="absolute inset-0 rounded-full bg-accent opacity-40 animate-ping" />
      </div>
    );
  }

  // IDLE — dropdown to pick language
  return (
    <div className={`fixed bottom-20 md:bottom-6 ${sideClass} z-50`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-14 h-14 rounded-full bg-[#c9a227] hover:bg-[#b8911f] text-[#0d1b2e] flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 focus:outline-none"
            title="Appeler un agent vocal MAOS Legal"
          >
            <Phone className="w-6 h-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          className="mb-2 min-w-[210px]"
        >
          <div className="px-2 py-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
            Choisir un agent vocal
          </div>
          {LANG_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.code}
              onClick={() => startCall(opt.code)}
              className="gap-3 cursor-pointer py-3"
            >
              <span className="text-xl leading-none">{opt.flag}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.sublabel}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
