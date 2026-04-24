import { Layout } from "@/components/layout/layout";
import { ChatSidebar } from "@/components/chat/sidebar";
import { useListLegalDomains, getListLegalDomainsQueryKey, useCreateAnthropicConversation } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Scale, Loader2, ChevronRight, Globe, MapPin, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListAnthropicConversationsQueryKey } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/language-context";

const formSchema = z.object({
  title: z.string().min(3),
  jurisdiction: z.enum(["EU", "US", "Arabic", "Morocco"], { required_error: "Please select a jurisdiction" }),
  legalDomain: z.string().min(1),
});

const JURISDICTION_META: Record<string, { flag: string; color: string; desc: string }> = {
  Morocco: { flag: "🇲🇦", color: "#C1272D", desc: "DOC, Moudawwana, Code Commerce..." },
  EU:      { flag: "🇪🇺", color: "#003399", desc: "TFEU, GDPR, CJEU..." },
  US:      { flag: "🇺🇸", color: "#B22234", desc: "USC, CFR, SCOTUS..." },
  Arabic:  { flag: "🌙", color: "#006233", desc: "Fiqh, GCC, Droit islamique..." },
};

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate({ data: values });
  };

  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <div className="hidden md:block">
          <ChatSidebar />
        </div>

        {/* Main — full screen on mobile */}
        <main className="flex-1 flex flex-col bg-background overflow-y-auto">
          <div className="flex items-start justify-center p-4 md:p-6 min-h-full">
            <div className="max-w-md w-full py-4 md:py-8">

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-primary/10">
                  <Scale className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground mb-1">
                  {t.chat.consultationTitle}
                </h1>
                <p className="text-muted-foreground text-sm">{t.chat.consultationSubtitle}</p>
              </div>

              {/* Jurisdiction quick-pick cards (mobile-friendly) */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {Object.entries(JURISDICTION_META).map(([key, meta]) => {
                  const isSelected = watchJurisdiction === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => form.setValue("jurisdiction", key as any, { shouldValidate: true })}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[#c9a227] bg-[#c9a227]/10 shadow-sm"
                          : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      <span className="text-xl leading-none">{meta.flag}</span>
                      <span className="text-xs font-bold text-foreground">{t.jurisdictions[key as keyof typeof t.jurisdictions] || key}</span>
                      <span className="text-[10px] text-muted-foreground leading-tight">{meta.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form card */}
              <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            {t.chat.caseTitle}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t.chat.casePlaceholder}
                              className="bg-background"
                              {...field}
                              data-testid="input-title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Hidden jurisdiction field (controlled by cards above) */}
                    <FormField
                      control={form.control}
                      name="jurisdiction"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-jurisdiction">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="EU">EU</SelectItem>
                              <SelectItem value="US">US</SelectItem>
                              <SelectItem value="Arabic">Arabic</SelectItem>
                              <SelectItem value="Morocco">Morocco</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchJurisdiction && (
                      <div className="rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/5 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-[#c9a227] shrink-0" />
                        <span>
                          {JURISDICTION_META[watchJurisdiction]?.flag}{" "}
                          <strong className="text-foreground">{t.jurisdictions[watchJurisdiction as keyof typeof t.jurisdictions]}</strong>
                          {watchJurisdiction === "Morocco" && ` — ${t.chat.maosExpertTitle}`}
                        </span>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="legalDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {t.chat.legalDomain}
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!watchJurisdiction}>
                            <FormControl>
                              <SelectTrigger className="bg-background" data-testid="select-domain">
                                <SelectValue placeholder={!watchJurisdiction ? t.chat.selectJurisdictionFirst : t.chat.domainPlaceholder} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredDomains?.map((domain) => (
                                <SelectItem key={domain.id} value={domain.name}>
                                  {domain.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">{t.chat.domainHint}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium shadow-md"
                      disabled={createMutation.isPending}
                      data-testid="button-create-consultation"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t.chat.initializingExpert}
                        </>
                      ) : (
                        <>
                          {t.chat.beginConsultation}
                          <ChevronRight className="w-5 h-5 ml-1" />
                        </>
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
