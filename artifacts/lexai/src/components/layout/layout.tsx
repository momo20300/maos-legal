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
    <div className="h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden">
      <Navbar />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <DesktopSidebar />
        <main
          className={`flex-1 flex flex-col min-h-0 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 outline-none ${
            scrollable ? "overflow-y-auto" : "overflow-hidden"
          }`}
        >
          {children}
        </main>
      </div>

      <VoiceCallFAB />
      <MobileNav />
    </div>
  );
}
