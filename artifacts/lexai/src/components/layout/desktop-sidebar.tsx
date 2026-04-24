import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, Scale, GraduationCap, MessageSquare, User, ChevronDown,
  Plus, Loader2, Trash2, ShieldCheck,
} from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useListAnthropicConversations, getListAnthropicConversationsQueryKey, useDeleteAnthropicConversation } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { JurisdictionBadge } from "@/components/chat/jurisdiction-badge";
import { format } from "date-fns";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function useLocalStorageState<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setAndPersist = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);

  return [state, setAndPersist];
}

type Module = {
  id: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  activePattern: RegExp;
  children?: { label: string; href: string; activePattern: RegExp }[];
};

export function DesktopSidebar() {
  const [location, setLocation] = useLocation();
  const { isSignedIn, user } = useAuthContext();
  const { language } = useLanguage();
  const isAdmin = user?.email === "elasri.mounsef@gmail.com";
  const queryClient = useQueryClient();
  const isRTL = language === "ar";

  const [openModules, setOpenModules] = useLocalStorageState<Record<string, boolean>>(
    "sidebar-open-modules",
    { consulter: true, preparer: false, dossiers: true, compte: false }
  );

  const { data: conversations, isLoading: loadingConvs } = useListAnthropicConversations({
    query: { queryKey: getListAnthropicConversationsQueryKey(), enabled: isSignedIn }
  });

  const deleteMutation = useDeleteAnthropicConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAnthropicConversationsQueryKey() });
        if (/^\/conversations/.test(location)) setLocation("/dossiers");
      }
    }
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(language === "ar" ? "هل تريد حذف هذه المحادثة؟" : "Supprimer cette conversation ?")) {
      deleteMutation.mutate({ id });
    }
  };

  const toggle = (id: string) =>
    setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));

  const modules: Module[] = [
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
      children: [
        {
          label: isRTL ? "استشارة جديدة" : "Nouvelle Consultation",
          href: "/chat",
          activePattern: /^\/chat$/,
        },
      ],
    },
    {
      id: "preparer",
      icon: <GraduationCap className="w-4 h-4" />,
      label: isRTL ? "تحضير" : "Préparer",
      href: "/preparations",
      activePattern: /^\/preparations/,
      children: [
        {
          label: isRTL ? "وحدات التحضير" : "Modules de préparation",
          href: "/preparations",
          activePattern: /^\/preparations$/,
        },
      ],
    },
    {
      id: "dossiers",
      icon: <MessageSquare className="w-4 h-4" />,
      label: isRTL ? "الملفات" : "Dossiers",
      href: "/dossiers",
      activePattern: /^\/(dossiers|conversations)/,
    },
    {
      id: "compte",
      icon: <User className="w-4 h-4" />,
      label: isRTL ? "حسابي" : "Compte",
      href: "/profile",
      activePattern: /^\/profile/,
      children: [
        {
          label: isRTL ? "ملفي الشخصي" : "Mon Profil",
          href: "/profile",
          activePattern: /^\/profile$/,
        },
        {
          label: isRTL ? "الاشتراك والدفع" : "Paiement & Abonnement",
          href: "/profile#payment",
          activePattern: /never/,
        },
      ],
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
      className="hidden md:flex flex-col w-72 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground overflow-y-auto"
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

      {/* Modules */}
      <nav className="flex-1 p-2 space-y-0.5">
        {modules.map(mod => {
          const isActive = mod.activePattern.test(location);
          const isOpen = openModules[mod.id];

          return (
            <div key={mod.id}>
              {/* Module header */}
              <div className="flex items-center">
                <Link
                  href={mod.href}
                  className={`flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                </Link>

                {mod.children && (
                  <button
                    onClick={() => toggle(mod.id)}
                    className="p-1.5 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </div>

              {/* Sub-modules */}
              {mod.children && isOpen && (
                <div className="ml-4 pl-3 border-l border-sidebar-border/50 mt-0.5 space-y-0.5">
                  {mod.children.map(child => {
                    const childActive = child.activePattern.test(location);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          childActive
                            ? "text-accent font-semibold"
                            : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Dossiers: conversation list as sub-items */}
              {mod.id === "dossiers" && (
                <div
                  className={`overflow-hidden transition-all ${
                    openModules["dossiers"] !== false ? "max-h-[400px]" : "max-h-0"
                  }`}
                >
                  <div className="ml-4 pl-3 border-l border-sidebar-border/50 mt-0.5 space-y-0.5 max-h-64 overflow-y-auto">
                    {loadingConvs ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sidebar-foreground/30" />
                      </div>
                    ) : !conversations?.length ? (
                      <p className="text-[10px] text-sidebar-foreground/30 px-2.5 py-2 italic">
                        {isRTL ? "لا توجد محادثات" : "Aucun dossier"}
                      </p>
                    ) : (
                      conversations.slice(0, 15).map(conv => {
                        const isConvActive = location === `/conversations/${conv.id}`;
                        return (
                          <div
                            key={conv.id}
                            className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                              isConvActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                            }`}
                          >
                            <Link
                              href={`/conversations/${conv.id}`}
                              className="flex-1 min-w-0"
                            >
                              <p className="truncate font-medium leading-tight">{conv.title}</p>
                              <div className="flex items-center gap-1 mt-0.5 opacity-60">
                                <JurisdictionBadge
                                  jurisdiction={conv.jurisdiction}
                                  className="text-[8px] h-3.5 px-1 py-0"
                                />
                                <span className="text-[9px] truncate">{conv.legalDomain}</span>
                              </div>
                            </Link>
                            <button
                              onClick={(e) => handleDelete(e, conv.id)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-sidebar-foreground/40 hover:text-red-400 transition-all shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="p-3 border-t border-sidebar-border">
        <p className="text-[9px] text-sidebar-foreground/25 leading-snug text-center">
          MAOS ne remplace pas l'avis d'un professionnel qualifié. © 2026 MAOS Software Ltd
        </p>
      </div>
    </aside>
  );
}
