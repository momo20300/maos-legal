import { useLocation, Link } from "wouter";
import { Home, Scale, MessageSquare, User, GraduationCap } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useIsMobile } from "@/hooks/use-mobile";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
  activePattern: RegExp;
  auth?: boolean;
};

export function MobileNav() {
  const isMobile = useIsMobile();
  const { isSignedIn } = useAuthContext();
  const { language } = useLanguage();
  const [location] = useLocation();
  const isRTL = language === "ar";

  if (!isMobile) return null;

  const navItems: NavItem[] = [
    {
      href: "/",
      icon: <Home className="w-[18px] h-[18px]" />,
      label: isRTL ? "الرئيسية" : "Accueil",
      activePattern: /^\/$/,
    },
    {
      href: "/chat",
      icon: <Scale className="w-[18px] h-[18px]" />,
      label: isRTL ? "استشارة" : "Consulter",
      activePattern: /^\/chat$/,
      auth: true,
    },
    {
      href: "/preparations",
      icon: <GraduationCap className="w-[18px] h-[18px]" />,
      label: isRTL ? "تحضير" : "Préparer",
      activePattern: /^\/preparations$/,
      auth: true,
    },
    {
      href: "/dossiers",
      icon: <MessageSquare className="w-[18px] h-[18px]" />,
      label: isRTL ? "الملفات" : "Dossiers",
      activePattern: /^\/dossiers|^\/conversations/,
      auth: true,
    },
    {
      href: isSignedIn ? "/profile" : "/sign-in",
      icon: <User className="w-[18px] h-[18px]" />,
      label: isRTL ? "حسابي" : "Compte",
      activePattern: /^\/profile$/,
    },
  ];

  const visibleItems = navItems.filter((item) => !item.auth || isSignedIn);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#0d1b2e] border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Disclaimer tucked inside fixed nav — no space stolen from content */}
      <p className="text-center text-[8px] text-white/20 leading-none py-0.5 px-4 truncate">
        MAOS ne remplace pas l'avis d'un professionnel qualifié. © 2026 MAOS Software Ltd
      </p>
      <div className="flex items-stretch h-14">
        {visibleItems.map((item) => {
          const isActive = item.activePattern.test(location);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                isActive
                  ? "text-[#c9a227]"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 inset-x-1/4 h-0.5 rounded-full bg-[#c9a227]" />
              )}
              <span className={isActive ? "scale-110 transition-transform" : ""}>
                {item.icon}
              </span>
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
