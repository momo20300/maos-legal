import { useLocation, Link } from "wouter";
import { Home, Scale, MessageSquare, CreditCard, User, LogOut, Plus } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { isSignedIn, user, logout } = useAuthContext();
  const { language } = useLanguage();
  const [location] = useLocation();
  const isRTL = language === "ar";

  if (!isMobile) return null;

  const displayName = user?.firstName || user?.email?.split("@")[0] || "Compte";

  const handleLogout = async () => {
    await logout();
    window.location.href = `${basePath}/`;
  };

  const navItems: NavItem[] = [
    {
      href: "/",
      icon: <Home className="w-5 h-5" />,
      label: isRTL ? "الرئيسية" : "Accueil",
      activePattern: /^\/$/,
    },
    {
      href: "/chat",
      icon: <Scale className="w-5 h-5" />,
      label: isRTL ? "استشارة" : "Consulter",
      activePattern: /^\/chat$/,
      auth: true,
    },
    {
      href: "/dossiers",
      icon: <MessageSquare className="w-5 h-5" />,
      label: isRTL ? "الملفات" : "Dossiers",
      activePattern: /^\/dossiers|^\/conversations/,
      auth: true,
    },
    {
      href: "/pricing",
      icon: <CreditCard className="w-5 h-5" />,
      label: isRTL ? "الأسعار" : "Tarifs",
      activePattern: /^\/pricing$/,
    },
  ];

  const visibleItems = navItems.filter((item) => !item.auth || isSignedIn);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#0d1b2e] border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-stretch h-16">
        {visibleItems.map((item) => {
          const isActive = item.activePattern.test(location);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? "text-[#c9a227]"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <span className={isActive ? "scale-110 transition-transform" : ""}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 w-6 h-0.5 rounded-full bg-[#c9a227]" />
              )}
            </Link>
          );
        })}

        {/* Account item — always shown */}
        {isSignedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex-1 flex flex-col items-center justify-center gap-0.5 text-white/50 hover:text-white/80 transition-colors">
                <User className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">
                  {isRTL ? "حسابي" : "Compte"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align={isRTL ? "start" : "end"}
              className="mb-2 min-w-[180px]"
            >
              <div className="px-3 py-2 text-sm font-semibold text-foreground">{displayName}</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4" />
                {isRTL ? "تسجيل الخروج" : "Se déconnecter"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/sign-in"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-white/50 hover:text-white/80 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">
              {isRTL ? "دخول" : "Connexion"}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
