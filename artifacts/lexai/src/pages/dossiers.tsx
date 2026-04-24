import { Layout } from "@/components/layout/layout";
import { useListAnthropicConversations, getListAnthropicConversationsQueryKey, useDeleteAnthropicConversation } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { JurisdictionBadge } from "@/components/chat/jurisdiction-badge";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Trash2, MessageSquare, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/language-context";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DossiersPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const isMobile = useIsMobile();

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
  const labelNew = isRTL ? "ملف جديد" : language === "en" ? "New Case" : "Nouveau Dossier";
  const labelEmpty = isRTL ? "لا توجد ملفات بعد" : language === "en" ? "No cases yet" : "Aucun dossier pour l'instant";
  const labelEmptyDesc = isRTL ? "أنشئ ملفاً جديداً لتنظيم استشاراتك" : language === "en" ? "Create a case to organise your consultations" : "Créez un dossier pour organiser vos consultations";

  const emptyState = (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/30 flex items-center justify-center">
        <FolderOpen className="w-7 h-7 text-[#c9a227]" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{labelEmpty}</p>
        <p className="text-sm text-muted-foreground mt-1">{labelEmptyDesc}</p>
      </div>
      <Link href="/chat">
        <Button className="gap-2 mt-2 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold">
          <Plus className="w-4 h-4" />
          {labelNew}
        </Button>
      </Link>
    </div>
  );

  const listContent = (
    <>
      {isLoading ? (
        <div className="space-y-3 p-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : !conversations?.length ? emptyState : (
        <div className="p-4 md:p-8 max-w-3xl mx-auto w-full space-y-3">
          {conversations.map((conv) => (
            <Link key={conv.id} href={`/conversations/${conv.id}`}>
              <div className="group relative bg-card border border-border rounded-xl p-4 hover:border-[#c9a227]/50 hover:shadow-md transition-all active:scale-[0.99]">
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
                {(conv as any).messageCount > 0 && (
                  <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground">
                    {(conv as any).messageCount} msg
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Layout>
        <div
          className="flex flex-col bg-background overflow-y-auto"
          style={{ height: "calc(100dvh - 56px - 64px - env(safe-area-inset-bottom))" }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card px-4 py-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-accent" />
              <h1 className="text-base font-bold text-foreground">{labelDossiers}</h1>
              {conversations && conversations.length > 0 && (
                <span className="text-xs bg-accent text-[#0d1b2e] rounded-full px-2 py-0.5 font-bold">
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
          <div className="flex flex-col flex-1 overflow-y-auto">
            {listContent}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col bg-background overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
          <div className="sticky top-0 z-10 bg-card px-4 md:px-8 py-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-accent" />
              <h1 className="text-base font-bold text-foreground">{labelDossiers}</h1>
              {conversations && conversations.length > 0 && (
                <span className="text-xs bg-accent text-[#0d1b2e] rounded-full px-2 py-0.5 font-bold">
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
          <div className="flex flex-col flex-1 overflow-y-auto">
            {listContent}
          </div>
        </main>
      </div>
    </Layout>
  );
}
