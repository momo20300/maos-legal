import { useSignUp } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignUpPage() {
  const { t } = useLanguage();
  const { signUp, setActive, isLoaded } = useSignUp();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<"form" | "code">("form");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("code");
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setError(clerkError?.longMessage ?? clerkError?.message ?? "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate(`${basePath}/pricing`);
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setError(clerkError?.longMessage ?? clerkError?.message ?? "Code invalide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-lg px-6 py-5 flex flex-col items-center">

          {/* Logo like home page */}
          <Link href={`${basePath}/`} className="flex flex-col items-center gap-0.5 mb-3 cursor-pointer">
            <img
              src={`${basePath}/logo-light.png`}
              alt="MAOS Legal"
              className="h-auto w-[140px] object-contain"
            />
            <span className="text-accent font-serif font-bold text-sm tracking-[0.25em] uppercase">
              Legal
            </span>
          </Link>

          <h1 className="text-xl font-bold text-foreground mb-0.5">{t.auth.signUpTitle}</h1>
          <p className="text-muted-foreground text-xs mb-4 text-center">
            {step === "form" ? t.auth.signUpSubtitle : `Code envoyé à ${email}`}
          </p>

          {step === "form" ? (
            <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-medium text-foreground">{t.auth.firstNameLabel}</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-medium text-foreground">{t.auth.lastNameLabel}</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-foreground">{t.auth.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent text-sm"
                />
              </div>

              {error && <p className="text-red-500 text-xs text-center -mt-1">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-accent text-[#0d1b2e] font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-60"
              >
                {loading ? "..." : `${t.auth.signUpButton} →`}
              </button>

              <Link href={`${basePath}/`}>
                <button type="button" className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors">
                  {t.auth.homeButton}
                </button>
              </Link>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="w-full flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-foreground">Code de vérification</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  required
                  autoFocus
                  maxLength={6}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent text-sm text-center tracking-[0.4em] text-lg font-mono"
                />
              </div>

              {error && <p className="text-red-500 text-xs text-center -mt-1">{error}</p>}

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full py-2.5 rounded-lg bg-accent text-[#0d1b2e] font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-60"
              >
                {loading ? "..." : "Vérifier →"}
              </button>

              <button
                type="button"
                onClick={() => { setStep("form"); setCode(""); setError(""); }}
                className="w-full py-2.5 rounded-lg border border-border text-foreground text-sm hover:bg-secondary transition-colors"
              >
                ← Modifier l'email
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-muted-foreground text-center">
            {t.auth.alreadyAccount}{" "}
            <Link href={`${basePath}/sign-in`} className="text-accent font-medium hover:underline">
              {t.auth.signInLink}
            </Link>
          </p>
        </div>

        <p className="mt-4 text-muted-foreground text-[10px] text-center max-w-xs px-4">
          {t.auth.signUpDisclaimer}
        </p>
      </div>
    </div>
  );
}
