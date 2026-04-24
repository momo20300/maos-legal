import { Layout } from "@/components/layout/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Globe, Shield, BookOpen, CheckCircle2, ArrowRight, Zap, Star } from "lucide-react";
import { useHealthCheck, useListSubscriptionPlans, useGetLegalDomainStats, getListSubscriptionPlansQueryKey, getGetLegalDomainStatsQueryKey, getHealthCheckQueryKey } from "@workspace/api-client-react";

export default function LandingPage() {
  const { data: health } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  const { data: plans } = useListSubscriptionPlans({ query: { queryKey: getListSubscriptionPlansQueryKey() } });
  const { data: stats } = useGetLegalDomainStats({ query: { queryKey: getGetLegalDomainStatsQueryKey() } });

  const features = [
    {
      title: "Multijurisdictional Intelligence",
      description: "Deep expertise across EU, US, and Arabic legal systems with accurate statutory citations.",
      icon: <Globe className="w-6 h-6 text-accent" />
    },
    {
      title: "Specialized Legal Domains",
      description: "From Corporate Law to Intellectual Property, matched with specialized AI expert profiles.",
      icon: <BookOpen className="w-6 h-6 text-accent" />
    },
    {
      title: "Authoritative Citations",
      description: "Responses backed by specific article numbers, case law, and statutory references.",
      icon: <Scale className="w-6 h-6 text-accent" />
    },
    {
      title: "Bank-Grade Security",
      description: "Enterprise-grade encryption protecting your sensitive legal inquiries.",
      icon: <Shield className="w-6 h-6 text-accent" />
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden border-b border-border bg-gradient-to-b from-background to-secondary/20">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="px-3 py-1 font-serif tracking-wide border-accent/30 text-accent bg-accent/5">
              The Future of Legal Intelligence
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-serif font-bold tracking-tight text-foreground leading-[1.1]">
              Uncompromising legal <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/60">clarity</span>, instantly.
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Access a sophisticated panel of AI legal experts across Europe, the US, and Arabic jurisdictions. Precise answers, authoritative citations, zero ambiguity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/chat">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-medium shadow-xl">
                  Start Consultation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-medium">
                  View Plans
                </Button>
              </Link>
            </div>
            
            <div className="pt-8 flex items-center justify-center gap-8 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                Systems {health?.status === 'ok' ? 'Operational' : 'Degraded'}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {stats?.totalQuestions ? stats.totalQuestions.toLocaleString() : '10,000+'} Consultations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">Engineered for Excellence</h2>
            <p className="text-muted-foreground">The precision of a senior partner, the speed of advanced AI.</p>
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
              <h2 className="text-4xl font-serif font-bold tracking-tight">Trusted across global jurisdictions.</h2>
              <p className="text-lg text-muted-foreground">Our platform processes complex legal inquiries across diverse frameworks daily.</p>
              
              <div className="grid grid-cols-2 gap-6 pt-6">
                {stats?.byJurisdiction.map((j) => (
                  <div key={j.jurisdiction} className="space-y-2">
                    <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{j.jurisdiction}</div>
                    <div className="text-3xl font-serif font-bold text-accent">{j.percentage}%</div>
                    <div className="text-sm text-muted-foreground">of inquiries</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full"></div>
              <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Top Domains Consulted
              </h3>
              <div className="space-y-4">
                {stats?.byDomain.slice(0, 4).map((d) => (
                  <div key={d.domain} className="flex items-center justify-between">
                    <span className="font-medium text-sm">{d.domain}</span>
                    <Badge variant="secondary" className="font-mono text-xs">{d.count} queries</Badge>
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
            <h2 className="text-3xl font-serif font-bold mb-4">Transparent Investment</h2>
            <p className="text-muted-foreground">Choose the tier that matches your legal intelligence needs.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans?.map((plan) => (
              <Card key={plan.id} className={`relative flex flex-col ${plan.highlighted ? 'border-accent shadow-lg scale-105 z-10 bg-primary text-primary-foreground' : 'border-border'}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Recommended
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-serif text-xl">{plan.name}</CardTitle>
                  <CardDescription className={plan.highlighted ? 'text-primary-foreground/70' : ''}>
                    {plan.questionsPerMonth ? `${plan.questionsPerMonth} questions / mo` : 'Unlimited questions'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-serif font-bold">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                    {plan.price > 0 && <span className={`text-sm ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>/{plan.interval}</span>}
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
                      {plan.price === 0 ? 'Get Started' : 'Subscribe'}
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