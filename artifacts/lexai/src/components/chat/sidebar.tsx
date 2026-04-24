import { Link, useLocation } from "wouter";
import { useListAnthropicConversations } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JurisdictionBadge } from "./jurisdiction-badge";
import { Scale, Plus, MessageSquare, Trash2, Shield, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteAnthropicConversation } from "@workspace/api-client-react";
import { getListAnthropicConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export function ChatSidebar() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
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
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="w-72 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col h-[calc(100dvh-4rem)]">
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/chat">
          <Button className="w-full justify-start font-medium bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" data-testid="button-new-chat">
            <Plus className="w-4 h-4 mr-2" />
            New Consultation
          </Button>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
              <Globe className="w-3 h-3" />
              Active Cases
            </h3>
            
            {isLoading ? (
              <div className="space-y-2 px-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-md bg-sidebar-accent/50" />
                ))}
              </div>
            ) : conversations?.length === 0 ? (
              <div className="text-sm text-sidebar-foreground/50 px-2 italic">
                No active consultations.
              </div>
            ) : (
              conversations?.map((conv) => {
                const isActive = location === `/conversations/${conv.id}`;
                return (
                  <Link key={conv.id} href={`/conversations/${conv.id}`}>
                    <div 
                      className={`group relative flex flex-col gap-1.5 p-3 rounded-lg cursor-pointer transition-all ${
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-accent-border" 
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground border border-transparent"
                      }`}
                      data-testid={`link-conversation-${conv.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-medium text-sm line-clamp-1 flex-1 pr-4">
                          {conv.title}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-sidebar-foreground/50 hover:text-destructive transition-opacity"
                          onClick={(e) => handleDelete(e, conv.id)}
                          data-testid={`button-delete-${conv.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <JurisdictionBadge jurisdiction={conv.jurisdiction} className="text-[10px] h-4 py-0 px-1" />
                        <span className="text-[10px] text-sidebar-foreground/40">
                          {format(new Date(conv.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-sidebar-foreground/60 font-medium">
                        <Shield className="w-3 h-3" />
                        <span className="truncate">{conv.legalDomain}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}