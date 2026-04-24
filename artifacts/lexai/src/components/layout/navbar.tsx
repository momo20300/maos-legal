import { Link } from "wouter";
import { Moon, Sun, Globe, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage, type Language } from "@/contexts/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/contexts/auth-context";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
];

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { isSignedIn, user, logout } = useAuthContext();

  const navLinks: { href: string; label: string; icon: React.ReactNode }[] = [];

  const currentLang = LANGUAGES.find((l) => l.code === language);
  const displayName = user?.firstName || user?.email?.split("@")[0] || "Mon compte";

  const handleLogout = async () => {
    await logout();
    window.location.href = `${basePath}/`;
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d1b2e]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* ── MOBILE HEADER: 3-column layout ── */}
      <div className="md:hidden flex items-center h-14 px-3 relative" dir="ltr">

        {/* LEFT: QUIT (when signed in) */}
        <div className="flex-none">
          {isSignedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/20 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Déc</span>
            </button>
          ) : (
            <div className="w-14" /> /* spacer to keep logo truly centered */
          )}
        </div>

        {/* CENTER: Logo — absolutely centered */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center"
          data-testid="link-home-mobile"
        >
          <img
            src={`${basePath}/logo-dark.png`}
            alt="MAOS Legal"
            className="h-auto w-[130px] object-contain"
          />
        </Link>

        {/* RIGHT: theme + language */}
        <div className="flex-none ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/10"
            data-testid="button-theme-toggle-mobile"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/10"
                data-testid="button-language-switcher-mobile"
              >
                <span className="text-sm leading-none">{currentLang?.flag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`gap-2 cursor-pointer ${language === lang.code ? "font-semibold text-primary" : ""}`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── DESKTOP HEADER ── */}
      <div className="hidden md:flex container mx-auto px-4 h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 transition-opacity hover:opacity-80" data-testid="link-home">
          <img
            src={`${basePath}/logo-dark.png`}
            alt="MAOS Legal"
            className="h-auto w-[170px] object-contain"
          />
        </Link>

        {/* Nav links + controls */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors flex items-center ${
                  location.startsWith(link.href) ? "text-accent" : "text-white/70 hover:text-white"
                }`}
                data-testid={`link-nav-${link.href.replace("/", "")}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 font-medium text-white/70 hover:text-white hover:bg-white/10" data-testid="button-language-switcher">
                  <Globe className="w-4 h-4" />
                  <span>{currentLang?.flag}</span>
                  <span className="text-xs hidden lg:inline">{currentLang?.label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`gap-2 cursor-pointer ${language === lang.code ? "font-semibold text-primary" : ""}`}
                    data-testid={`button-lang-${lang.code}`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-white/70 hover:text-white hover:bg-white/10" data-testid="button-theme-toggle">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-white/70 hover:text-white hover:bg-white/10">
                    <User className="w-4 h-4" />
                    <span className="text-xs max-w-[100px] truncate">{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  <DropdownMenuItem className="text-xs text-muted-foreground cursor-default">
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-red-500 hover:text-red-600">
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/sign-in" data-testid="link-sign-in">
                <Button size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  {t.nav.signIn || "Connexion"}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
