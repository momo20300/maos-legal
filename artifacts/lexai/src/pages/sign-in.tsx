import { SignIn } from "@clerk/react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function useHideClerkJunk() {
  useEffect(() => {
    const selectors = [
      ".cl-developerBanner",
      "[data-localization-key='badge__devMode']",
      ".cl-badge__devMode",
      "#cl-dev-browser-warning",
      "[data-clerk-development-mode]",
      ".cl-footerPages",
      ".cl-footerPagesLink__help",
      ".cl-footerPagesLink__privacy",
      ".cl-footerPagesLink__terms",
      ".cl-header",
      ".cl-headerTitle",
      ".cl-headerSubtitle",
    ];
    const hide = () => {
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.setProperty("display", "none", "important");
        });
      });
      document.querySelectorAll("*").forEach((el) => {
        const text = el.textContent?.trim().toLowerCase() ?? "";
        if (
          text === "development mode" ||
          (el as HTMLElement).className?.toString().toLowerCase().includes("devmode") ||
          (el as HTMLElement).className?.toString().toLowerCase().includes("devbrand") ||
          (el as HTMLElement).getAttribute?.("data-localization-key")?.includes("devMode")
        ) {
          (el as HTMLElement).style.setProperty("display", "none", "important");
          let parent = el.parentElement;
          while (parent && parent !== document.body) {
            if (parent.textContent?.trim().toLowerCase() === "development mode") {
              (parent as HTMLElement).style.setProperty("display", "none", "important");
            }
            parent = parent.parentElement;
          }
        }
      });
    };
    hide();
    const observer = new MutationObserver(hide);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, []);
}

export default function SignInPage() {
  const { t } = useLanguage();
  useHideClerkJunk();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-1.5">
          <Link href="/" className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80">
            <img src={`${basePath}/logo-light.png`} alt="MAOS Legal" className="h-14 w-auto object-contain" />
            <span className="text-accent text-sm font-bold tracking-widest uppercase font-serif">Legal</span>
          </Link>
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.2em] uppercase mt-1">
            {t.auth.intelligenceJuridiquePremium}
          </p>
          <Link href="/" className="mt-3">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Home className="w-3.5 h-3.5" />
              {t.notFound.goHome}
            </Button>
          </Link>
        </div>

        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          fallbackRedirectUrl={`${basePath}/chat`}
          appearance={{
            variables: {
              colorPrimary: "#c9a227",
              colorBackground: "#faf8f3",
              colorText: "#0d1b2e",
              colorTextSecondary: "#4a5568",
              colorInputBackground: "#ffffff",
              colorInputText: "#0d1b2e",
              colorNeutral: "#4a5568",
              colorSuccess: "#15803d",
              colorDanger: "#dc2626",
              fontFamily: "'Inter', sans-serif",
              borderRadius: "0.5rem",
            },
            elements: {
              card: "shadow-lg border border-border bg-card",
              header: "!hidden",
              headerTitle: "!hidden",
              headerSubtitle: "!hidden",
              socialButtonsRoot: "!hidden",
              socialButtonsBlockButton: "!hidden",
              dividerRow: "!hidden",
              dividerLine: "!hidden",
              dividerText: "!hidden",
              formFieldLabel: "text-foreground text-sm font-medium",
              formFieldInput: "bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-accent",
              formButtonPrimary: "bg-accent hover:bg-accent/90 text-[#0d1b2e] font-semibold",
              footerActionLink: "text-accent hover:text-accent/80",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-accent",
              otpCodeFieldInput: "bg-background border-border text-foreground",
              developerBanner: "!hidden",
              footerPages: "!hidden",
              footerPagesLink__help: "!hidden",
              footerPagesLink__privacy: "!hidden",
              footerPagesLink__terms: "!hidden",
            },
          }}
        />

        <p className="mt-8 text-muted-foreground text-xs text-center max-w-sm">
          {t.auth.signInDisclaimer}
        </p>
      </div>
    </div>
  );
}
