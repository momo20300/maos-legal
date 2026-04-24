import { Link, useLocation } from "wouter";
import {
  Home, Scale, GraduationCap, FolderOpen, User, ShieldCheck, Plus,
} from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";

export function DesktopSidebar() {
  const [location] = useLocation();
  const { isSignedIn, user } = useAuthContext();
  const { language } = useLanguage();
  const isAdmin = user?.email === "elasri.mounsef@gmail.com";
  const isRTL = language === "ar";

  const modules = [
    {
      id: "accueil",
      icon: <Home className="w-4 h-4" />,
      label: isRTL ? "الرئيسية" : "Accueil",
      href: "/",
      activePattern: /^\/$/,
    },
    {
      id: "consulter",
      icon: <Scale className="w-4 h-4" />,
      label: isRTL ? "استشارة" : "Consulter",
      href: "/chat",
      activePattern: /^\/(chat|conversations)/,
    },
    {
      id: "preparer",
      icon: <GraduationCap className="w-4 h-4" />,
      label: isRTL ? "تحضير" : "Préparer",
      href: "/preparations",
      activePattern: /^\/preparations/,
    },
    {
      id: "dossiers",
      icon: <FolderOpen className="w-4 h-4" />,
      label: isRTL ? "الملفات" : "Dossiers",
      href: "/dossiers",
      activePattern: /^\/dossiers/,
    },
    {
      id: "compte",
      icon: <User className="w-4 h-4" />,
      label: isRTL ? "حسابي" : "Compte",
      href: "/profile",
      activePattern: /^\/profile/,
    },
    ...(isAdmin ? [{
      id: "admin",
      icon: <ShieldCheck className="w-4 h-4" />,
      label: isRTL ? "الإدارة" : "Administration",
      href: "/admin",
      activePattern: /^\/admin/,
    }] : []),
  ];

  if (!isSignedIn) return null;

  return (
    <aside
      className="hidden md:flex flex-col w-72 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground"
      style={{ height: "calc(100dvh - 4rem)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* New Consultation CTA */}
      <div className="p-3 border-b border-sidebar-border">
        <Link href="/chat">
          <Button
            className="w-full justify-start font-medium bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 gap-2 h-9 text-sm"
            data-testid="button-new-chat-sidebar"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {isRTL ? "استشارة جديدة" : "Nouvelle Consultation"}
          </Button>
        </Link>
      </div>

      {/* Navigation — titles only */}
      <nav className="flex-1 p-2 space-y-0.5">
        {modules.map(mod => {
          const isActive = mod.activePattern.test(location);
          return (
            <Link key={mod.id} href={mod.href}>
              <div
                className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  mod.id === "admin"
                    ? isActive
                      ? "bg-amber-500/15 text-amber-500"
                      : "text-amber-600/80 hover:bg-amber-500/10 hover:text-amber-500"
                    : isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <span className={
                  mod.id === "admin"
                    ? "text-amber-500"
                    : isActive ? "text-accent" : "text-sidebar-foreground/50"
                }>
                  {mod.icon}
                </span>
                {mod.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <p className="text-[9px] text-sidebar-foreground/25 leading-snug text-center">
          MAOS ne remplace pas l'avis d'un professionnel qualifié. © 2026 MAOS Software Ltd
        </p>
      </div>
    </aside>
  );
}
