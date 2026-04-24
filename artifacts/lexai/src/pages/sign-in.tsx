import { SignIn } from "@clerk/react";
import { Scale } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignInPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0d1b2e] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src={`${basePath}/logo.svg`} alt="LexAI" className="w-10 h-10" />
          <span className="font-serif font-bold text-3xl tracking-tight text-white">LexAI</span>
        </Link>
        <p className="text-[#c9a227] text-sm font-medium tracking-widest uppercase">Intelligence Juridique Premium</p>
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
          },
        }}
      />

      <p className="mt-8 text-slate-500 text-sm text-center max-w-sm">
        {t.auth?.signInDisclaimer || "En accédant à LexAI, vous acceptez nos conditions d'utilisation et notre politique de confidentialité."}
      </p>
    </div>
  );
}
