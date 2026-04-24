import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import { DesktopSidebar } from "./desktop-sidebar";
import { ReactNode } from "react";
import { VoiceCallFAB } from "@/components/chat/voice-call-button";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Top navbar — mobile only */}
      <div className="md:hidden">
        <Navbar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <DesktopSidebar />
        <main className="flex-1 flex flex-col overflow-y-auto pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
      </div>

      <VoiceCallFAB />
      <MobileNav />
    </div>
  );
}
