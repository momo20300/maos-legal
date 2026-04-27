import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import { DesktopSidebar } from "./desktop-sidebar";
import { ReactNode } from "react";
import { VoiceCallFAB } from "@/components/chat/voice-call-button";

interface LayoutProps {
  children: ReactNode;
  scrollable?: boolean;
}

export function Layout({ children, scrollable = false }: LayoutProps) {
  return (
    <div className="h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden outline-none">
      <Navbar />

      <div className="flex flex-1 min-h-0 overflow-hidden outline-none">
        <DesktopSidebar />
        {scrollable ? (
          <main className="flex-1 overflow-y-auto pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 outline-none">
            {children}
          </main>
        ) : (
          <main className="flex-1 flex flex-col min-h-0 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 outline-none overflow-hidden">
            {children}
          </main>
        )}
      </div>

      <VoiceCallFAB />
      <MobileNav />
    </div>
  );
}
