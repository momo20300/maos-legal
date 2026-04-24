import { Layout } from "@/components/layout/layout";
import { useGetSubscriptionStatus, getGetSubscriptionStatusQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, CreditCard, Zap, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useAuthContext } from "@/contexts/auth-context";
import { Link } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const PLAN_META = [
  { id: "professional", price: 49, questionsPerMonth: 100, highlighted: false },
  { id: "expert", price: 99, questionsPerMonth: null, highlighted: true },
];

export default function PricingPage() {
  const { data: status, isLoading: isLoadingStatus } = useGetSubscriptionStatus({ query: { queryKey: getGetSubscriptionStatusQueryKey() } });
  const { t } = useLanguage();
  const { isSignedIn } = useAuthContext();

  const handleSubscribe = (planId: string) => {
    window.location.href = `${basePath}/api/subscriptions/checkout?planId=${planId}`;
  };

  const plans = PLAN_META.map((meta) => ({
    ...meta,
    name: meta.id === "professional" ? t.plans.professional.name : t.plans.expert.name,
    features: meta.id === "professional" ? t.plans.professional.features : t.plans.expert.features,
  }));

  const trustBadges = [
    { icon: "🔒", label: t.pricing.sslBadge },
    { icon: "🌍", label: t.pricing.jurisdictionsBadge },
    { icon: "📚", label: t.pricing.citationsBadge },
    { icon: "⚡", label: t.pricing.responseBadge },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
            <Lock className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              {t.pricing.premiumOnly}
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-4 tracking-tight">
            {t.pricing.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* Active Subscription Banner */}
        {isSignedIn && !isLoadingStatus && status?.hasActiveSubscription && (
          <div className="mb-12">
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-300">
                      {t.pricing.activePlan}: {status.plan}
                    </p>
                    {status.renewsAt && (
                      <p className="text-sm text-green-700 dark:text-green-400">
                        {t.pricing.renewsOn} {new Date(status.renewsAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Link href="/chat">
                  <Button className="bg-green-600 hover:bg-green-700 text-white shrink-0">
                    {t.pricing.goToChat}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${
                plan.highlighted
                  ? "border-accent shadow-lg md:-translate-y-2 z-10 bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-accent rounded-t-xl" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-[#0d1b2e] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      {t.pricing.mostPopular}
                    </span>
                  </div>
                </>
              )}

              <CardHeader className="pb-6 pt-8">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className={`w-5 h-5 ${plan.highlighted ? "text-accent" : "text-accent"}`} />
                  <CardTitle className="font-serif text-2xl">{plan.name}</CardTitle>
                </div>
                <div className="flex items-baseline gap-2 mb-3 mt-2">
                  <span className="text-5xl font-serif font-bold">${plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    / {t.pricing.month}
                  </span>
                </div>
                <CardDescription className={`text-sm ${plan.highlighted ? "text-primary-foreground/80" : ""}`}>
                  {plan.questionsPerMonth
                    ? `${plan.questionsPerMonth} ${t.pricing.questionsPerMonth}`
                    : t.pricing.unlimitedQuestions}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm leading-snug">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlighted ? "text-accent" : "text-primary"}`} />
                      <span className={plan.highlighted ? "text-primary-foreground/90" : "text-muted-foreground"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6 pb-6 flex flex-col gap-3">
                {isSignedIn ? (
                  <Button
                    className={`w-full h-12 text-base font-semibold gap-2 ${
                      plan.highlighted
                        ? "bg-accent text-[#0d1b2e] hover:bg-accent/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                    disabled={status?.plan === plan.name && status?.isActive}
                    onClick={() => handleSubscribe(plan.id)}
                    data-testid={`button-subscribe-${plan.id}`}
                  >
                    <CreditCard className="w-4 h-4" />
                    {status?.plan === plan.name && status?.isActive
                      ? t.pricing.currentPlanLabel
                      : t.pricing.subscribeNow}
                  </Button>
                ) : (
                  <Link href="/sign-up" className="w-full">
                    <Button
                      className={`w-full h-12 text-base font-semibold gap-2 ${
                        plan.highlighted
                          ? "bg-accent text-[#0d1b2e] hover:bg-accent/90"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                      data-testid={`button-subscribe-${plan.id}`}
                    >
                      <CreditCard className="w-4 h-4" />
                      {t.pricing.getStartedNow}
                    </Button>
                  </Link>
                )}
                <p className={`text-xs text-center ${plan.highlighted ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                  {t.pricing.cardRequired}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {trustBadges.map((badge, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card">
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-xs font-medium text-muted-foreground">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground max-w-xl mx-auto">
          {t.pricing.encryptionNote}
        </div>
      </div>
    </Layout>
  );
}
