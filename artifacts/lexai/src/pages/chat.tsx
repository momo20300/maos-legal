import { Layout } from "@/components/layout/layout";
import { ChatSidebar } from "@/components/chat/sidebar";
import { useListLegalDomains, getListLegalDomainsQueryKey, useCreateAnthropicConversation } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Scale, Loader2, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListAnthropicConversationsQueryKey } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/language-context";
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z.object({
  title: z.string().min(3),
  jurisdiction: z.enum(["EU", "US", "Arabic", "Morocco"], { required_error: "Please select a jurisdiction" }),
  legalDomain: z.string().min(1),
});

const JURISDICTIONS = [
  { key: "Morocco", flag: "🇲🇦", short: "Maroc", color: "#C1272D" },
  { key: "EU",      flag: "🇪🇺", short: "EU",    color: "#003399" },
  { key: "US",      flag: "🇺🇸", short: "US",    color: "#B22234" },
  { key: "Arabic",  flag: "🌙",   short: "Arabe", color: "#006233" },
];

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();

  // Pick domain display name by UI language
  const domainLabel = (d: { name: string; nameFr?: string; nameAr?: string }) =>
    language === "ar" ? (d.nameAr ?? d.name) : language === "fr" ? (d.nameFr ?? d.name) : d.name;

  const { data: domains } = useListLegalDomains({
    query: { queryKey: getListLegalDomainsQueryKey() }
  });

  const createMutation = useCreateAnthropicConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListAnthropicConversationsQueryKey() });
        setLocation(`/conversations/${data.id}`);
      }
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", jurisdiction: undefined, legalDomain: "" },
  });

  const watchJurisdiction = form.watch("jurisdiction");
  const filteredDomains = domains?.filter((d) => d.jurisdiction === watchJurisdiction);
  const onSubmit = (values: z.infer<typeof formSchema>) => createMutation.mutate({ data: values });

  /* ── MOBILE: everything visible without scroll ── */
  if (isMobile) {
    return (
      <Layout>
        <div
          className="flex flex-col bg-background"
          style={{ height: "calc(100dvh - 56px - 64px - env(safe-area-inset-bottom))" }}
        >
          {/* Mini header */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scale className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-none">{t.chat.consultationTitle}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{t.chat.consultationSubtitle}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 px-4 gap-3">

              {/* Jurisdiction cards — 2x2 compact */}
              <div className="grid grid-cols-2 gap-2">
                {JURISDICTIONS.map(({ key, flag, short }) => {
                  const isSelected = watchJurisdiction === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => form.setValue("jurisdiction", key as any, { shouldValidate: true })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[#c9a227] bg-[#c9a227]/10 shadow-sm"
                          : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      <span className="text-lg leading-none">{flag}</span>
                      <span className={`text-xs font-semibold ${isSelected ? "text-[#c9a227]" : "text-foreground"}`}>
                        {short}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Hidden jurisdiction select for validation */}
              <FormField
                control={form.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-jurisdiction"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JURISDICTIONS.map(j => <SelectItem key={j.key} value={j.key}>{j.short}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={t.chat.casePlaceholder}
                        className="bg-card h-11 text-sm"
                        {...field}
                        data-testid="input-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Legal Domain */}
              <FormField
                control={form.control}
                name="legalDomain"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchJurisdiction}>
                      <FormControl>
                        <SelectTrigger className="bg-card h-11 text-sm" data-testid="select-domain">
                          <SelectValue placeholder={!watchJurisdiction ? t.chat.selectJurisdictionFirst : t.chat.domainPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredDomains?.map((domain) => (
                          <SelectItem key={domain.id} value={domain.name}>{domainLabel(domain)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit — pushed to bottom */}
              <div className="mt-auto pb-3">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-md"
                  disabled={createMutation.isPending}
                  data-testid="button-create-consultation"
                >
                  {createMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t.chat.initializingExpert}</>
                  ) : (
                    <>{t.chat.beginConsultation}<ChevronRight className="w-5 h-5 ml-1" /></>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Layout>
    );
  }

  /* ── DESKTOP: two-column layout ── */
  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar />
        <main className="flex-1 flex flex-col bg-background overflow-y-auto">
          <div className="flex items-start justify-center p-6 min-h-full">
            <div className="max-w-md w-full py-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/10">
                  <Scale className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground mb-2">
                  {t.chat.consultationTitle}
                </h1>
                <p className="text-muted-foreground text-sm">{t.chat.consultationSubtitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {JURISDICTIONS.map(({ key, flag, short }) => {
                  const isSelected = watchJurisdiction === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => form.setValue("jurisdiction", key as any, { shouldValidate: true })}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-left transition-all ${
                        isSelected ? "border-[#c9a227] bg-[#c9a227]/10" : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      <span className="text-xl">{flag}</span>
                      <span className={`text-sm font-semibold ${isSelected ? "text-[#c9a227]" : "text-foreground"}`}>
                        {t.jurisdictions[key as keyof typeof t.jurisdictions] || short}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="jurisdiction"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-jurisdiction"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {JURISDICTIONS.map(j => <SelectItem key={j.key} value={j.key}>{j.short}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder={t.chat.casePlaceholder} className="bg-background" {...field} data-testid="input-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="legalDomain"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchJurisdiction}>
                            <FormControl>
                              <SelectTrigger className="bg-background" data-testid="select-domain">
                                <SelectValue placeholder={!watchJurisdiction ? t.chat.selectJurisdictionFirst : t.chat.domainPlaceholder} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredDomains?.map((domain) => (
                                <SelectItem key={domain.id} value={domain.name}>{domainLabel(domain)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-12 text-base font-medium shadow-md" disabled={createMutation.isPending} data-testid="button-create-consultation">
                      {createMutation.isPending ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t.chat.initializingExpert}</>
                      ) : (
                        <>{t.chat.beginConsultation}<ChevronRight className="w-5 h-5 ml-1" /></>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
