import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import { ReactNode } from "react";
import { VoiceCallFAB } from "@/components/chat/voice-call-button";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>

      {/* Legal disclaimer footer — all pages */}
      <footer className="w-full text-center text-[10px] text-muted-foreground/50 py-2 px-4 border-t border-border/30 bg-background md:block hidden">
        MAOS ne remplace pas l'avis d'un professionnel qualifié. © 2026 MAOS Software Ltd
      </footer>
      {/* Mobile version — sits above the bottom nav */}
      <div className="md:hidden text-center text-[9px] text-muted-foreground/40 py-1 px-4 bg-background border-t border-border/20 mb-[calc(3.5rem+env(safe-area-inset-bottom))]">
        MAOS ne remplace pas l'avis d'un professionnel qualifié. © 2026 MAOS Software Ltd
      </div>

      <VoiceCallFAB />
      <MobileNav />
    </div>
  );
}
