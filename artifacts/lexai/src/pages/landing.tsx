import { Layout } from "@/components/layout/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Globe, BookOpen, CheckCircle2, ArrowRight, Star, GraduationCap, LogIn, CreditCard } from "lucide-react";
import { useHealthCheck, useGetLegalDomainStats, getGetLegalDomainStatsQueryKey, getHealthCheckQueryKey } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@clerk/react";
import { useTheme } from "@/hooks/use-theme";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const PLAN_META = [
  { id: "professional", price: 49, questionsPerMonth: 100, highlighted: false },
  { id: "expert", price: 199, questionsPerMonth: null, highlighted: true },
];

export default function LandingPage() {
  const { data: health } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  const { data: stats } = useGetLegalDomainStats({ query: { queryKey: getGetLegalDomainStatsQueryKey() } });
  const { t } = useLanguage();
  const { isSignedIn } = useAuth();
  const { theme } = useTheme();

  const plans = PLAN_META.map((meta) => ({
    ...meta,
    name: meta.id === "professional" ? t.plans.professional.name : t.plans.expert.name,
    features: meta.id === "professional" ? t.plans.professional.features : t.plans.expert.features,
  }));

  const features = [
    {
      title: t.landing.feature1Title,
      description: t.landing.feature1Desc,
      icon: <Globe className="w-6 h-6 text-accent" />
    },
    {
      title: t.landing.feature2Title,
      description: t.landing.feature2Desc,
      icon: <BookOpen className="w-6 h-6 text-accent" />
    },
    {
      title: t.landing.feature3Title,
      description: t.landing.feature3Desc,
      icon: <Scale className="w-6 h-6 text-accent" />
    },
    {
      title: t.landing.feature4Title,
      description: t.landing.feature4Desc,
      icon: <GraduationCap className="w-6 h-6 text-accent" />
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden border-b border-border bg-gradient-to-b from-background to-secondary/20">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Branding block */}
            <div className="flex flex-col items-center gap-1.5 mb-2">
              <img
                src={theme === "dark" ? `${basePath}/logo-dark.png` : `${basePath}/logo-light.png`}
                alt="MAOS Legal"
                className="h-auto w-[200px] object-contain"
              />
              <span className="text-accent font-serif font-bold text-base tracking-[0.25em] uppercase">
                Legal
              </span>
              <span className="text-muted-foreground text-[11px] font-medium tracking-[0.2em] uppercase">
                {t.auth.intelligenceJuridiquePremium}
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif font-bold tracking-tight text-foreground leading-[1.1]">
              {t.landing.headline1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/60">{t.landing.headline2}</span>
            </h1>
            <p className="text-[11px] lg:text-[13px] text-muted-foreground font-light leading-loose max-w-xl mx-auto whitespace-pre-line">
              {t.landing.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isSignedIn ? (
                <Link href="/chat">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-medium shadow-xl">
                    {t.landing.startConsultation}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-medium shadow-xl gap-2">
                      <LogIn className="w-4 h-4" />
                      {t.landing.signIn}
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-medium gap-2 border-accent/40 text-accent hover:bg-accent/5">
                      <CreditCard className="w-4 h-4" />
                      {t.landing.payToStart}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="pt-8 flex items-center justify-center gap-8 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {health?.status === 'ok' ? t.landing.systemsOk : t.landing.systemsDegraded}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {stats?.totalQuestions ? stats.totalQuestions.toLocaleString() : '10,000+'} {t.landing.consultations}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAOS Legal Feature Banner */}
      <section className="py-8 border-b border-border bg-gradient-to-r from-[#C1272D]/10 via-background to-[#006233]/10">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🇲🇦</div>
              <div>
                <h3 className="font-serif font-bold text-xl">MAOS Legal</h3>
                <p className="text-sm text-muted-foreground">{t.landing.maosSubtitle}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              {["DOC", "Code Pénal", "Moudawwana", "CPC", "CPP", "Droit Administratif", "Concours Avocat"].map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs border border-[#C1272D]/20">
                  {tag}
                </Badge>
              ))}
            </div>
            <Link href={isSignedIn ? "/chat" : "/sign-in"}>
              <Button variant="outline" className="border-[#C1272D] text-[#C1272D] hover:bg-[#C1272D]/5 whitespace-nowrap">
                <GraduationCap className="w-4 h-4 mr-2" />
                {t.landing.maosRevisionMode}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">{t.landing.featuresTitle}</h2>
            <p className="text-muted-foreground">{t.landing.featuresSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-serif font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-border bg-secondary">
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-serif font-bold tracking-tight">{t.landing.statsTitle}</h2>
              <p className="text-lg text-muted-foreground">{t.landing.statsSubtitle}</p>

              <div className="grid grid-cols-2 gap-6 pt-6">
                {stats?.byJurisdiction.map((j) => (
                  <div key={j.jurisdiction} className="space-y-2">
                    <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      {j.jurisdiction === "Morocco" ? "🇲🇦 MAOS" : j.jurisdiction}
                    </div>
                    <div className="text-3xl font-serif font-bold text-accent">{j.percentage}%</div>
                    <div className="text-sm text-muted-foreground">{t.landing.inquiries}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full"></div>
              <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                {t.landing.topDomainsTitle}
              </h3>
              <div className="space-y-4">
                {stats?.byDomain.slice(0, 4).map((d) => (
                  <div key={d.domain} className="flex items-center justify-between">
                    <span className="font-medium text-sm">{d.domain}</span>
                    <Badge variant="secondary" className="font-mono text-xs">{d.count} {t.landing.queries}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">{t.landing.pricingTitle}</h2>
            <p className="text-muted-foreground">{t.landing.pricingSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative flex flex-col ${plan.highlighted ? 'border-accent shadow-lg scale-105 z-10 bg-primary text-primary-foreground' : 'border-border'}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> {t.pricing.recommended}
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-serif text-xl">{plan.name}</CardTitle>
                  <CardDescription className={plan.highlighted ? 'text-primary-foreground/70' : ''}>
                    {plan.questionsPerMonth ? `${plan.questionsPerMonth} ${t.pricing.questionsPerMonth}` : t.pricing.unlimitedQuestions}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-serif font-bold">${plan.price}</span>
                    <span className={`text-sm ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{t.pricing.perMonth}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlighted ? 'text-accent' : 'text-primary'}`} />
                        <span className={plan.highlighted ? 'text-primary-foreground/90' : 'text-muted-foreground'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/pricing" className="w-full">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "secondary" : "outline"}
                    >
                      {t.pricing.subscribe}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
