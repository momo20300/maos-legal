import { SignIn } from "@clerk/react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { useEffect } from "react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function useHideClerkDevBanner() {
  useEffect(() => {
    const selectors = [
      ".cl-developerBanner",
      "[data-localization-key='badge__devMode']",
      "#cl-dev-browser-warning",
    ];
    const hide = () => {
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.setProperty("display", "none", "important");
        });
      });
    };
    hide();
    const observer = new MutationObserver(hide);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
}

export default function SignInPage() {
  const { t } = useLanguage();
  useHideClerkDevBanner();

  return (
    <div className="min-h-screen bg-[#0d1b2e] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link href="/" className="flex flex-col items-center gap-2 transition-opacity hover:opacity-80">
          <img src={`${basePath}/logo-dark.png`} alt="MAOS Legal" className="h-12 w-auto object-contain" />
          <span className="text-[#c9a227] text-sm font-semibold tracking-widest uppercase font-serif">Legal</span>
        </Link>
        <p className="text-slate-400 text-xs font-medium tracking-widest uppercase">Intelligence Juridique Premium</p>
      </div>

      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/chat`}
        localization={{
          signIn: {
            start: {
              title: "Connexion à MAOS Legal",
              subtitle: "Bienvenue ! Connectez-vous pour continuer.",
              actionText: "Pas encore de compte ?",
              actionLink: "Créer un compte",
            },
          },
        }}
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
            headerTitle: "font-serif text-2xl text-white",
            headerSubtitle: "text-slate-400",
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
          },
        }}
      />

      <p className="mt-8 text-slate-500 text-sm text-center max-w-sm">
        {t.auth?.signInDisclaimer || "En accédant à MAOS Legal, vous acceptez nos conditions d'utilisation et notre politique de confidentialité."}
      </p>
    </div>
  );
}
