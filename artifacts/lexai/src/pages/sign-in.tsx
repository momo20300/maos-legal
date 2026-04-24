import { useSignIn } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Eye, EyeOff } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignInPage() {
  const { t } = useLanguage();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate(`${basePath}/chat`);
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message ?? "Erreur de connexion.";
      setError(msg);
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

          <h1 className="text-xl font-bold text-foreground mb-0.5">{t.auth.signInTitle}</h1>
          <p className="text-muted-foreground text-xs mb-4 text-center">{t.auth.signInSubtitle}</p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            {/* Email */}
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

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">{t.auth.passwordLabel}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center -mt-1">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-accent text-[#0d1b2e] font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-60"
            >
              {loading ? "..." : `${t.auth.signInButton} →`}
            </button>

            {/* Home */}
            <Link href={`${basePath}/`}>
              <button
                type="button"
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
              >
                {t.auth.homeButton}
              </button>
            </Link>
          </form>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            {t.auth.noAccount}{" "}
            <Link href={`${basePath}/sign-up`} className="text-accent font-medium hover:underline">
              {t.auth.signUpLink}
            </Link>
          </p>
        </div>

        <p className="mt-4 text-muted-foreground text-[10px] text-center max-w-xs px-4">
          {t.auth.signInDisclaimer}
        </p>
      </div>
    </div>
  );
}
