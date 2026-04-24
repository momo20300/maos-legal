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
import { Scale, Loader2, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListAnthropicConversationsQueryKey } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/language-context";

const formSchema = z.object({
  title: z.string().min(3),
  jurisdiction: z.enum(["EU", "US", "Arabic", "Morocco"], { required_error: "Please select a jurisdiction" }),
  legalDomain: z.string().min(1),
});

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
    defaultValues: {
      title: "",
      jurisdiction: undefined,
      legalDomain: "",
    },
  });

  const watchJurisdiction = form.watch("jurisdiction");

  const filteredDomains = domains?.filter(
    (d) => d.jurisdiction === watchJurisdiction
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate({ data: values });
  };

  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar />

        <main className="flex-1 flex flex-col bg-background relative">
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/10">
                  <Scale className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground mb-2">
                  {t.chat.consultationTitle}
                </h1>
                <p className="text-muted-foreground text-sm">{t.chat.consultationSubtitle}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">{t.chat.caseTitle}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.chat.casePlaceholder} className="bg-background" {...field} data-testid="input-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jurisdiction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">{t.chat.jurisdiction}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background" data-testid="select-jurisdiction">
                                <SelectValue placeholder={t.chat.jurisdictionPlaceholder} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="EU">{t.jurisdictions.EU}</SelectItem>
                              <SelectItem value="US">{t.jurisdictions.US}</SelectItem>
                              <SelectItem value="Arabic">{t.jurisdictions.Arabic}</SelectItem>
                              <SelectItem value="Morocco">
                                <span className="flex items-center gap-2">
                                  <span>🇲🇦</span>
                                  <span>{t.jurisdictions.Morocco}</span>
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* MAOS Legal feature highlight */}
                    {watchJurisdiction === "Morocco" && (
                      <div className="rounded-lg border border-[#C1272D]/30 bg-[#C1272D]/5 p-3">
                        <p className="text-xs font-semibold text-[#C1272D] mb-1">🇲🇦 MAOS Legal — Expert Droit Marocain</p>
                        <p className="text-xs text-muted-foreground">
                          DOC · Code Pénal · Moudawwana · CPC · CPP · Droit Commercial · Droit du Travail · Droit Administratif · Tous Tribunaux · Préparation Concours Avocat / Procureur
                        </p>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="legalDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">{t.chat.legalDomain}</FormLabel>
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
                          <FormDescription className="text-xs">
                            {t.chat.domainHint}
                          </FormDescription>
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
