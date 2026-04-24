import { Layout } from "@/components/layout/layout";
import { useListSubscriptionPlans, useGetSubscriptionStatus, getListSubscriptionPlansQueryKey, getGetSubscriptionStatusQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function PricingPage() {
  const { data: plans, isLoading: isLoadingPlans } = useListSubscriptionPlans({ query: { queryKey: getListSubscriptionPlansQueryKey() } });
  const { data: status, isLoading: isLoadingStatus } = useGetSubscriptionStatus({ query: { queryKey: getGetSubscriptionStatusQueryKey() } });

  const usagePercentage = status && status.questionsLimit 
    ? (status.questionsUsed / status.questionsLimit) * 100 
    : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-4 tracking-tight">Invest in Intelligence</h1>
          <p className="text-lg text-muted-foreground">
            Clear, transparent pricing for enterprise-grade legal AI.
          </p>
        </div>

        {/* Current Status Banner */}
        <div className="mb-16">
          {isLoadingStatus ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : status ? (
            <Card className="bg-secondary/50 border-secondary-border">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">Current Plan: <span className="font-serif text-accent-foreground">{status.plan}</span></h3>
                    {status.isActive && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">Active</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {status.renewsAt ? `Renews on ${new Date(status.renewsAt).toLocaleDateString()}` : 'Free tier never expires'}
                  </p>
                </div>
                
                <div className="flex-1 w-full space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Usage This Month</span>
                    <span>{status.questionsUsed} / {status.questionsLimit || '∞'} queries</span>
                  </div>
                  {status.questionsLimit && (
                    <Progress value={usagePercentage} className="h-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Could not load subscription status.</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {isLoadingPlans ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[500px] rounded-2xl" />
            ))
          ) : plans?.map((plan) => (
            <Card key={plan.id} className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${plan.highlighted ? 'border-accent shadow-lg md:-translate-y-4 z-10 bg-primary text-primary-foreground' : 'border-border'}`}>
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent rounded-t-2xl"></div>
              )}
              <CardHeader className="pb-8">
                <CardTitle className="font-serif text-2xl mb-2">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-serif font-bold">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                  {plan.price > 0 && <span className={`text-sm ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>/{plan.interval}</span>}
                </div>
                <CardDescription className={`text-sm ${plan.highlighted ? 'text-primary-foreground/80' : ''}`}>
                  {plan.questionsPerMonth ? `${plan.questionsPerMonth} legal queries per month` : 'Unlimited legal queries'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm leading-tight">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.highlighted ? 'text-accent' : 'text-primary'}`} />
                      <span className={plan.highlighted ? 'text-primary-foreground/90' : 'text-muted-foreground'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-8">
                <Button 
                  className="w-full h-12 text-base font-medium" 
                  variant={plan.highlighted ? "secondary" : "outline"}
                  disabled={status?.plan.toLowerCase() === plan.name.toLowerCase()}
                  data-testid={`button-subscribe-${plan.id}`}
                >
                  {status?.plan.toLowerCase() === plan.name.toLowerCase() ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Upgrade Now'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center text-sm text-muted-foreground max-w-xl mx-auto">
          All plans include enterprise-grade encryption. Prices are in USD. 
          For custom enterprise deployments or API access, please contact our partnerships team.
        </div>
      </div>
    </Layout>
  );
}