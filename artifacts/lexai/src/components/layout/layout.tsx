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
      <VoiceCallFAB />
      <MobileNav />
    </div>
  );
}
