import { Layout } from "@/components/layout/layout";
import {
  useListLegalDomains, getListLegalDomainsQueryKey, useCreateAnthropicConversation,
  useListAnthropicConversations, getListAnthropicConversationsQueryKey,
  useDeleteAnthropicConversation,
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { Scale, Loader2, ChevronRight, Plus, Trash2, Shield, MessageSquare, ChevronLeft, Phone, FileText } from "lucide-react";
import { JusticeScaleSVG } from "@/components/ui/justice-scale";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { JurisdictionBadge } from "@/components/chat/jurisdiction-badge";
import { format } from "date-fns";
import { useState, useMemo, useEffect } from "react";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

type ArchivedDoc = {
  id: number;
  docNumber: number;
  title: string;
  content: string;
  conversationId: number | null;
  createdAt: string;
};

function useArchivedDocs() {
  const [docs, setDocs] = useState<ArchivedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/documents`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { setDocs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { refresh(); }, []);
  return { docs, loading, refresh };
}

const JURISDICTIONS = [
  { key: "Morocco", flag: "🇲🇦", short: "Maroc", color: "#C1272D" },
  { key: "EU",      flag: "🇪🇺", short: "EU",    color: "#003399" },
  { key: "US",      flag: "🇺🇸", short: "US",    color: "#B22234" },
  { key: "Arabic",  flag: "AR",   short: "Moyen Orient", color: "#006233" },
];

type FormValues = {
  title: string;
  jurisdiction: "EU" | "US" | "Arabic" | "Morocco";
  legalDomain: string;
};

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const isRTL = language === "ar";
  const [showForm, setShowForm] = useState(false);

  const formSchema = useMemo(() =>
    z.object({
      title: z.string().min(3, t.chat.caseTitleMinLength),
      jurisdiction: z.enum(["EU", "US", "Arabic", "Morocco"] as const, {
        required_error: t.chat.jurisdictionRequired,
        invalid_type_error: t.chat.jurisdictionRequired,
      }),
      legalDomain: z.string().min(1, t.chat.domainRequired),
    }),
    [t]
  );

  // Pick domain display name by UI language
  const domainLabel = (d: { name: string; nameFr?: string; nameAr?: string }) =>
    language === "ar" ? (d.nameAr ?? d.name) : language === "fr" ? (d.nameFr ?? d.name) : d.name;

  const { data: domains } = useListLegalDomains({
    query: { queryKey: getListLegalDomainsQueryKey() }
  });

  const { data: conversations, isLoading: convsLoading } = useListAnthropicConversations({
    query: { queryKey: getListAnthropicConversationsQueryKey() }
  });

  const deleteMutation = useDeleteAnthropicConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAnthropicConversationsQueryKey() });
      }
    }
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(t.chat.deleteConfirm)) {
      deleteMutation.mutate({ id });
    }
  };

  const createMutation = useCreateAnthropicConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListAnthropicConversationsQueryKey() });
        setLocation(`/conversations/${data.id}`);
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", jurisdiction: undefined, legalDomain: "" },
  });

  const watchJurisdiction = form.watch("jurisdiction");
  const filteredDomains = domains?.filter((d) => d.jurisdiction === watchJurisdiction);
  const onSubmit = (values: FormValues) => createMutation.mutate({ data: values });

  const { docs: archivedDocs, loading: docsLoading } = useArchivedDocs();

  /* ── MOBILE: list view or form ── */
  if (isMobile) {
    const labelNew = isRTL ? "استشارة جديدة" : language === "en" ? "New Consultation" : "Nouvelle Consultation";
    const labelConsulter = isRTL ? "استشاراتي" : language === "en" ? "My Consultations" : "Consulter";
    const labelEmpty = isRTL ? "لا توجد استشارات بعد" : language === "en" ? "No consultations yet" : "Aucune consultation pour l'instant";
    const labelEmptyDesc = isRTL ? "ابدأ استشارة قانونية جديدة" : language === "en" ? "Start a new legal consultation" : "Commencez une nouvelle consultation";

    if (!showForm) {
      return (
        <Layout>
          <div className="flex flex-col bg-background overflow-y-auto" style={{ height: "calc(100dvh - 56px - 64px - env(safe-area-inset-bottom))" }} dir={isRTL ? "rtl" : "ltr"}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card px-4 py-3 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-accent" />
                <h1 className="text-base font-bold text-foreground">{labelConsulter}</h1>
                {conversations && conversations.length > 0 && (
                  <span className="text-xs bg-accent text-[#0d1b2e] rounded-full px-2 py-0.5 font-bold">
                    {conversations.length}
                  </span>
                )}
              </div>
              <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowForm(true)}>
                <Plus className="w-3.5 h-3.5" />
                {labelNew}
              </Button>
            </div>

            {/* List */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              {convsLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
                </div>
              ) : !conversations?.length ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/30 flex items-center justify-center">
                    <Scale className="w-7 h-7 text-[#c9a227]" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{labelEmpty}</p>
                    <p className="text-sm text-muted-foreground mt-1">{labelEmptyDesc}</p>
                  </div>
                  <Button className="gap-2 mt-2 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold" onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4" />
                    {labelNew}
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                {conversations?.map((conv) => (
                  <Link key={conv.id} href={`/conversations/${conv.id}`}>
                    <div className="group relative bg-card border border-border rounded-xl p-4 hover:border-[#c9a227]/50 transition-all active:scale-[0.99]">
                      <button
                        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={(e) => handleDelete(e, conv.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-start gap-2.5 pr-8">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <MessageSquare className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground line-clamp-1">{conv.title}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <JurisdictionBadge jurisdiction={conv.jurisdiction} className="text-[10px] h-4 py-0 px-1.5" />
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(conv.createdAt), "d MMM yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground font-medium">
                            <Shield className="w-3 h-3 shrink-0" />
                            <span className="truncate">{conv.legalDomain}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                </div>
              )}
            </div>
          </div>
        </Layout>
      );
    }

    /* ── MOBILE FORM VIEW ── */
    return (
      <Layout>
        <div
          key={language}
          className="flex flex-col bg-background"
          style={{ height: "calc(100dvh - 56px - 64px - env(safe-area-inset-bottom))" }}
        >
          {/* Back header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <JusticeScaleSVG size={22} />
            <div>
              <p className="text-sm font-bold text-foreground leading-none">{t.chat.consultationTitle}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{t.chat.consultationSubtitle}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 px-4 pt-3 gap-3">

              {/* Jurisdiction cards — 2x2 compact */}
              <div className="grid grid-cols-2 gap-2">
                {JURISDICTIONS.map(({ key, flag, short }) => {
                  const isSelected = watchJurisdiction === key;
                  const isText = flag.length <= 2 && !/\p{Emoji}/u.test(flag);
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
                      {isText ? (
                        <span className={`text-xs font-bold px-1 py-0.5 rounded bg-muted ${isSelected ? "text-[#c9a227]" : "text-foreground"}`}>{flag}</span>
                      ) : (
                        <span className="text-lg leading-none">{flag}</span>
                      )}
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

  /* ── DESKTOP: left = form (mobile style), right = list ── */
  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>

        {/* LEFT: form panel — same layout as mobile */}
        <div className="w-[400px] shrink-0 flex flex-col border-r border-border bg-card overflow-y-auto">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
            <JusticeScaleSVG size={24} />
            <div>
              <p className="text-sm font-bold text-foreground leading-none">{t.chat.consultationTitle}</p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{t.chat.consultationSubtitle}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} key={language} className="flex flex-col gap-4 px-5 pt-5 pb-6">

              {/* Jurisdiction 2×2 grid — same as mobile */}
              <div className="grid grid-cols-2 gap-2">
                {JURISDICTIONS.map(({ key, flag, short }) => {
                  const isSelected = watchJurisdiction === key;
                  const isText = flag.length <= 2 && !/\p{Emoji}/u.test(flag);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => form.setValue("jurisdiction", key as any, { shouldValidate: true })}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-left transition-all ${
                        isSelected ? "border-[#c9a227] bg-[#c9a227]/10 shadow-sm" : "border-border bg-background hover:bg-muted"
                      }`}
                    >
                      {isText
                        ? <span className={`text-xs font-bold px-1 py-0.5 rounded bg-muted ${isSelected ? "text-[#c9a227]" : "text-foreground"}`}>{flag}</span>
                        : <span className="text-lg leading-none">{flag}</span>}
                      <span className={`text-sm font-semibold ${isSelected ? "text-[#c9a227]" : "text-foreground"}`}>
                        {t.jurisdictions[key as keyof typeof t.jurisdictions] || short}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Hidden jurisdiction field for validation */}
              <FormField control={form.control} name="jurisdiction" render={({ field }) => (
                <FormItem className="hidden">
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger data-testid="select-jurisdiction"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{JURISDICTIONS.map(j => <SelectItem key={j.key} value={j.key}>{j.short}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Title */}
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder={t.chat.casePlaceholder} className="bg-background h-11 text-sm" {...field} data-testid="input-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Legal Domain */}
              <FormField control={form.control} name="legalDomain" render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!watchJurisdiction}>
                    <FormControl>
                      <SelectTrigger className="bg-background h-11 text-sm" data-testid="select-domain">
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
              )} />

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-md mt-1"
                disabled={createMutation.isPending}
                data-testid="button-create-consultation"
              >
                {createMutation.isPending
                  ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t.chat.initializingExpert}</>
                  : <>{t.chat.beginConsultation}<ChevronRight className="w-5 h-5 ml-1" /></>}
              </Button>
            </form>
          </Form>
        </div>

        {/* ── RIGHT: consultations + archived documents ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-card shrink-0">
            <MessageSquare className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-bold text-foreground">
              {isRTL ? "استشاراتي ومراسلاتي" : "Consultations & Courriers"}
            </h2>
            {(conversations?.length ?? 0) + archivedDocs.length > 0 && (
              <span className="text-xs bg-accent text-[#0d1b2e] rounded-full px-2 py-0.5 font-bold">
                {(conversations?.length ?? 0) + archivedDocs.length}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">

            {/* Conversations */}
            <div>
              {convsLoading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
                </div>
              ) : !conversations?.length ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/30 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-[#c9a227]" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "لا توجد استشارات بعد" : "Aucune consultation pour l'instant"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {conversations.map((conv) => {
                    const isVoice = (conv as any).source === "voice";
                    return (
                      <Link key={conv.id} href={`/conversations/${conv.id}`}>
                        <div className="group relative bg-card border border-border rounded-xl p-4 hover:border-[#c9a227]/50 transition-all cursor-pointer h-full">
                          <button
                            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                            onClick={(e) => handleDelete(e, conv.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <div className="flex items-start gap-2.5 pr-6">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isVoice ? "bg-[#c9a227]/15" : "bg-primary/10"}`}>
                              {isVoice ? <Phone className="w-4 h-4 text-[#c9a227]" /> : <MessageSquare className="w-4 h-4 text-primary" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">{conv.title}</p>
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                <JurisdictionBadge jurisdiction={conv.jurisdiction} className="text-[10px] h-4 py-0 px-1.5" />
                                <span className="text-[10px] text-muted-foreground">{format(new Date(conv.createdAt), "d MMM yyyy")}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                                <Shield className="w-3 h-3 shrink-0" />
                                <span className="truncate">{conv.legalDomain}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Archived Documents */}
            {(docsLoading || archivedDocs.length > 0) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-[#c9a227]" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {isRTL ? "المراسلات والوثائق القانونية" : "Courriers & Documents archivés"}
                  </h3>
                  {archivedDocs.length > 0 && (
                    <span className="text-[10px] bg-[#c9a227]/20 text-[#c9a227] rounded-full px-1.5 py-0.5 font-bold">{archivedDocs.length}</span>
                  )}
                </div>
                {docsLoading ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {[1,2].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {archivedDocs.map((doc) => (
                      <Link key={doc.id} href={doc.conversationId ? `/conversations/${doc.conversationId}` : "/chat"}>
                        <div className="group bg-card border border-[#c9a227]/30 rounded-xl p-4 hover:border-[#c9a227]/70 transition-all cursor-pointer">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#c9a227]/15 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-[#c9a227]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-[#c9a227] leading-none mb-1">
                                {isRTL ? `وثيقة رقم ${doc.docNumber}` : `Courrier n°${doc.docNumber}`}
                              </p>
                              <p className="font-semibold text-sm text-foreground line-clamp-1">{doc.title}</p>
                              <span className="text-[10px] text-muted-foreground">{format(new Date(doc.createdAt), "d MMM yyyy")}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
