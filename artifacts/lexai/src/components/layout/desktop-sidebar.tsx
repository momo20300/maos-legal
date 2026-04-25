import { Link, useLocation } from "wouter";
import {
  Home, Scale, GraduationCap, FolderOpen, User, ShieldCheck, Plus, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function DesktopSidebar() {
  const [location] = useLocation();
  const { isSignedIn, user, logout } = useAuthContext();
  const { language } = useLanguage();
  const isAdmin = user?.email === "elasri.mounsef@gmail.com";
  const isRTL = language === "ar";

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("sidebar-collapsed", String(collapsed)); } catch { /* */ }
  }, [collapsed]);

  const handleLogout = async () => {
    await logout();
    window.location.href = `${basePath}/`;
  };

  const modules = [
    {
      id: "accueil",
      icon: <Home className="w-4 h-4 shrink-0" />,
      label: isRTL ? "الرئيسية" : "Accueil",
      href: "/",
      activePattern: /^\/$/,
    },
    {
      id: "consulter",
      icon: <Scale className="w-4 h-4 shrink-0" />,
      label: isRTL ? "استشارة" : "Consulter",
      href: "/chat",
      activePattern: /^\/(chat|conversations)/,
    },
    {
      id: "preparer",
      icon: <GraduationCap className="w-4 h-4 shrink-0" />,
      label: isRTL ? "تحضير" : "Préparer",
      href: "/preparations",
      activePattern: /^\/preparations/,
    },
    {
      id: "dossiers",
      icon: <FolderOpen className="w-4 h-4 shrink-0" />,
      label: isRTL ? "الملفات" : "Dossiers",
      href: "/dossiers",
      activePattern: /^\/dossiers/,
    },
    {
      id: "compte",
      icon: <User className="w-4 h-4 shrink-0" />,
      label: isRTL ? "حسابي" : "Compte",
      href: "/profile",
      activePattern: /^\/profile/,
    },
    ...(isAdmin ? [{
      id: "admin",
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
      label: isRTL ? "الإدارة" : "Administration",
      href: "/admin",
      activePattern: /^\/admin/,
    }] : []),
  ];

  if (!isSignedIn) return null;

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 relative overflow-hidden ${collapsed ? "w-14" : "w-72"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Collapse toggle button */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-sidebar border border-border flex items-center justify-center shadow-sm text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        title={collapsed ? "Développer" : "Réduire"}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />
        }
      </button>

      {/* New Consultation CTA */}
      {!collapsed && (
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
      )}

      {collapsed && (
        <div className="p-2 border-b border-sidebar-border flex justify-center">
          <Link href="/chat">
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 transition-colors"
              title={isRTL ? "استشارة جديدة" : "Nouvelle Consultation"}
            >
              <Plus className="w-4 h-4" />
            </button>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-hidden">
        {modules.map(mod => {
          const isActive = mod.activePattern.test(location);
          return (
            <Link key={mod.id} href={mod.href}>
              <div
                className={`flex items-center gap-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  collapsed ? "px-2.5 py-2.5 justify-center" : "px-2.5 py-2.5"
                } ${
                  mod.id === "admin"
                    ? isActive
                      ? "bg-amber-500/15 text-amber-500"
                      : "text-amber-600/80 hover:bg-amber-500/10 hover:text-amber-500"
                    : isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
                title={collapsed ? mod.label : undefined}
              >
                <span className={
                  mod.id === "admin"
                    ? "text-amber-500"
                    : isActive ? "text-accent" : "text-sidebar-foreground/50"
                }>
                  {mod.icon}
                </span>
                {!collapsed && mod.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${collapsed ? "px-0 py-2 justify-center" : "px-2.5 py-2"}`}
          title={collapsed ? (isRTL ? "تسجيل الخروج" : "Déconnexion") : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && (isRTL ? "تسجيل الخروج" : "Déconnexion")}
        </button>
        {!collapsed && (
          <p className="text-[9px] text-sidebar-foreground/25 leading-snug text-center">
            MAOS ne remplace pas l'avis d'un professionnel qualifié. © 2026 MAOS Software Ltd
          </p>
        )}
      </div>
    </aside>
  );
}
