import { Navbar } from "./navbar";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}