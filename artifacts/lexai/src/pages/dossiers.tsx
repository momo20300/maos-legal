import { Layout } from "@/components/layout/layout";
import { ChatSidebar } from "@/components/chat/sidebar";
import { useListAnthropicConversations, getListAnthropicConversationsQueryKey, useDeleteAnthropicConversation } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { JurisdictionBadge } from "@/components/chat/jurisdiction-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Trash2, MessageSquare, FolderOpen, Scale } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/language-context";

export default function DossiersPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const { data: conversations, isLoading } = useListAnthropicConversations({
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

  const labelDossiers = isRTL ? "الملفات القانونية" : language === "en" ? "My Cases" : "Mes Dossiers";
  const labelNew = isRTL ? "استشارة جديدة" : language === "en" ? "New Consultation" : "Nouvelle Consultation";
  const labelEmpty = isRTL ? "لا توجد ملفات بعد" : language === "en" ? "No cases yet" : "Aucun dossier pour l'instant";
  const labelEmptyDesc = isRTL ? "ابدأ استشارة جديدة" : language === "en" ? "Start a new consultation" : "Commencez une nouvelle consultation";

  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop: show real sidebar */}
        <div className="hidden md:block">
          <ChatSidebar />
        </div>

        {/* Mobile: full-screen dossiers list */}
        <main className="flex-1 md:hidden flex flex-col bg-background overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0d1b2e] px-4 py-3 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#c9a227]" />
              <h1 className="text-base font-bold text-white">{labelDossiers}</h1>
              {conversations && conversations.length > 0 && (
                <span className="text-xs bg-[#c9a227] text-[#0d1b2e] rounded-full px-2 py-0.5 font-bold">
                  {conversations.length}
                </span>
              )}
            </div>
            <Link href="/chat">
              <Button size="sm" className="gap-1.5 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" />
                {labelNew}
              </Button>
            </Link>
          </div>

          {/* List */}
          <div className="flex-1 p-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : conversations?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Scale className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{labelEmpty}</p>
                  <p className="text-sm text-muted-foreground mt-1">{labelEmptyDesc}</p>
                </div>
                <Link href="/chat">
                  <Button className="gap-2 mt-2">
                    <Plus className="w-4 h-4" />
                    {labelNew}
                  </Button>
                </Link>
              </div>
            ) : (
              conversations?.map((conv) => (
                <Link key={conv.id} href={`/conversations/${conv.id}`}>
                  <div className="group relative bg-card border border-border rounded-xl p-4 hover:border-[#c9a227]/50 hover:shadow-md transition-all active:scale-[0.99]">
                    {/* Delete button */}
                    <button
                      className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={(e) => handleDelete(e, conv.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Title */}
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

                    {/* Message count badge */}
                    {(conv as any).messageCount > 0 && (
                      <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground">
                        {(conv as any).messageCount} msg
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>

        {/* Desktop: show placeholder if no conversation selected */}
        <main className="hidden md:flex flex-1 items-center justify-center bg-background text-muted-foreground">
          <div className="text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{isRTL ? "اختر ملفاً من القائمة" : "Sélectionnez un dossier dans la liste"}</p>
          </div>
        </main>
      </div>
    </Layout>
  );
}
