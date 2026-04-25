import { Link, useLocation } from "wouter";
import { useListAnthropicConversations } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, Plus, Trash2, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteAnthropicConversation } from "@workspace/api-client-react";
import { getListAnthropicConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";

export function ChatSidebar() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: conversations, isLoading } = useListAnthropicConversations({
    query: { queryKey: getListAnthropicConversationsQueryKey() }
  });

  const deleteMutation = useDeleteAnthropicConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAnthropicConversationsQueryKey() });
        if (location !== "/chat") {
          setLocation("/chat");
        }
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

  return (
    <div className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden shrink-0">
      {/* New consultation button */}
      <div className="p-3 border-b border-sidebar-border">
        <Link href="/chat">
          <Button
            className="w-full justify-start gap-2 font-semibold bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] h-9 text-sm"
            data-testid="button-new-chat"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {t.chat.newConsultation}
          </Button>
        </Link>
      </div>

      {/* Conversation list — titles only */}
      <ScrollArea className="flex-1">
        <div className="py-2 px-2">
          {isLoading ? (
            <div className="space-y-1 px-1 pt-1">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-8 w-full rounded-md bg-sidebar-accent/40" />
              ))}
            </div>
          ) : conversations?.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-3">
              <Scale className="w-6 h-6 text-sidebar-foreground/30" />
              <p className="text-xs text-sidebar-foreground/40 italic">{t.chat.noConsultations}</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {conversations?.map((conv) => {
                const isActive = location === `/conversations/${conv.id}`;
                return (
                  <Link key={conv.id} href={`/conversations/${conv.id}`}>
                    <div
                      className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                        isActive
                          ? "bg-[#c9a227]/15 text-[#c9a227] border border-[#c9a227]/30"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground border border-transparent"
                      }`}
                      data-testid={`link-conversation-${conv.id}`}
                    >
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#c9a227]" : "text-sidebar-foreground/40"}`} />
                      <span className="text-sm font-medium line-clamp-1 flex-1 pr-5 leading-snug">
                        {conv.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute right-1.5 text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                        onClick={(e) => handleDelete(e, conv.id)}
                        data-testid={`button-delete-${conv.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
