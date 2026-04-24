import { SignIn } from "@clerk/react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-[#0d1b2e] flex flex-col items-center justify-center px-4 py-12">

      {/* Bouton retour accueil */}
      <div className="w-full max-w-sm mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#c9a227] text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t.notFound.goHome}
        </Link>
      </div>

      {/* Branding */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/" className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80">
          <img src={`${basePath}/logo-dark.png`} alt="MAOS Legal" className="h-14 w-auto object-contain" />
          <span className="text-[#c9a227] text-sm font-bold tracking-widest uppercase font-serif">Legal</span>
        </Link>
        <p className="text-slate-400 text-[11px] font-medium tracking-widest uppercase mt-1">
          {t.auth.intelligenceJuridiquePremium}
        </p>
      </div>

      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/chat`}
        appearance={{
          variables: {
            colorPrimary: "#c9a227",
            colorBackground: "#112240",
            colorText: "#e2e8f0",
            colorTextSecondary: "#94a3b8",
            colorInputBackground: "#1e3a5f",
            colorInputText: "#e2e8f0",
            colorNeutral: "#94a3b8",
            colorSuccess: "#22c55e",
            colorDanger: "#ef4444",
            fontFamily: "'Inter', sans-serif",
            borderRadius: "0.5rem",
          },
          elements: {
            card: "shadow-2xl border border-[#1e3a5f] bg-[#112240]",
            header: "!hidden",
            headerTitle: "!hidden",
            headerSubtitle: "!hidden",
            socialButtonsBlockButton: "border-[#1e3a5f] bg-[#1a2d4a] hover:bg-[#1e3a5f] text-white",
            socialButtonsBlockButtonText: "text-white font-medium",
            dividerLine: "bg-[#1e3a5f]",
            dividerText: "text-slate-500",
            formFieldLabel: "text-slate-300 text-sm",
            formFieldInput: "bg-[#1a2d4a] border-[#1e3a5f] text-white placeholder:text-slate-500 focus:border-[#c9a227]",
            formButtonPrimary: "bg-[#c9a227] hover:bg-[#b8921f] text-[#0d1b2e] font-semibold",
            footerActionLink: "text-[#c9a227] hover:text-[#b8921f]",
            identityPreviewText: "text-white",
            identityPreviewEditButton: "text-[#c9a227]",
            otpCodeFieldInput: "bg-[#1a2d4a] border-[#1e3a5f] text-white",
            developerBanner: "!hidden",
            footerPages: "!hidden",
            footerPagesLink__help: "!hidden",
            footerPagesLink__privacy: "!hidden",
            footerPagesLink__terms: "!hidden",
          },
        }}
      />

      <p className="mt-8 text-slate-500 text-xs text-center max-w-sm">
        {t.auth.signInDisclaimer}
      </p>
    </div>
  );
}
