import { Link, useLocation } from "wouter";
import { MessageSquare, CreditCard, Menu, X, Moon, Sun, Globe, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";
import { useLanguage, type Language } from "@/contexts/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserButton, useAuth } from "@clerk/react";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function Navbar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isSignedIn } = useAuth();

  const navLinks = [
    ...(isSignedIn ? [{ href: "/chat", label: t.nav.chat, icon: <MessageSquare className="w-4 h-4 mr-2" /> }] : []),
    { href: "/pricing", label: t.nav.pricing, icon: <CreditCard className="w-4 h-4 mr-2" /> },
  ];

  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 transition-opacity hover:opacity-80" data-testid="link-home">
          <img
            src={theme === "dark" ? `${basePath}/logo-dark.png` : `${basePath}/logo-light.png`}
            alt="MAOS Legal"
            className="h-8 w-auto object-contain"
          />
          <span className="font-serif font-semibold text-base tracking-wider text-accent border-l border-border pl-2 ml-1">Legal</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${location.startsWith(link.href) ? "text-primary" : "text-muted-foreground"}`}
                data-testid={`link-nav-${link.href.replace("/", "")}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 border-l border-border pl-6">
            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 font-medium" data-testid="button-language-switcher">
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

            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {isSignedIn ? (
              <UserButton
                appearance={{
                  variables: {
                    colorPrimary: "#c9a227",
                  },
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 ring-2 ring-accent/40 hover:ring-accent transition-all",
                    userButtonPopoverCard: "border border-border shadow-xl",
                    userButtonPopoverActionButton: "hover:bg-muted",
                    userButtonPopoverActionButtonText: "text-foreground",
                    userButtonPopoverFooter: "hidden",
                  },
                }}
                afterSignOutUrl={`${basePath}/`}
              />
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

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-language-switcher-mobile">
                <Globe className="w-4 h-4" />
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
          <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle-mobile">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          {isSignedIn && (
            <UserButton
              appearance={{
                variables: { colorPrimary: "#c9a227" },
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                },
              }}
              afterSignOutUrl={`${basePath}/`}
            />
          )}
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="button-mobile-menu">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium p-2 rounded-md transition-colors hover:bg-muted flex items-center ${location.startsWith(link.href) ? "bg-muted text-primary" : "text-muted-foreground"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {!isSignedIn && (
            <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full gap-2">
                <LogIn className="w-4 h-4" />
                {t.nav.signIn || "Connexion"}
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
