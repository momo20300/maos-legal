import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderOpen, Plus, Trash2, MessageSquare,
  Link2, X, ArrowLeft, ChevronRight, Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/language-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { JurisdictionBadge } from "@/components/chat/jurisdiction-badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Dossier { id: number; userId: string; name: string; description?: string; createdAt: string; }
interface DossierItem { id: number; dossierId: number; itemType: string; conversationId: number; addedAt: string; conversationTitle: string; conversationJurisdiction: string; conversationLegalDomain: string; conversationCreatedAt: string; }
interface DossierDetail extends Dossier { items: DossierItem[]; }
interface Conversation { id: number; title: string; jurisdiction: string; legalDomain: string; createdAt: string; }

export default function DossiersPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState<DossierDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  /* mobile-only modal state */
  const [showCreate, setShowCreate] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [linking, setLinking] = useState<number | null>(null);

  const T = {
    dossiers: isRTL ? "الملفات القانونية" : language === "en" ? "My Cases" : "Mes Dossiers",
    newDossier: isRTL ? "ملف جديد" : language === "en" ? "New Case" : "Nouveau Dossier",
    empty: isRTL ? "لا توجد ملفات بعد" : language === "en" ? "No cases yet" : "Aucun dossier pour l'instant",
    emptyDesc: isRTL ? "أنشئ ملفاً لتنظيم بحوثك القانونية" : language === "en" ? "Create a case to organise your legal research" : "Créez un dossier pour organiser vos recherches",
    namePlaceholder: isRTL ? "اسم الملف..." : language === "en" ? "Case name..." : "Nom du dossier...",
    descPlaceholder: isRTL ? "وصف (اختياري)" : language === "en" ? "Description (optional)" : "Description (optionnel)",
    create: isRTL ? "إنشاء" : language === "en" ? "Create" : "Créer",
    cancel: isRTL ? "إلغاء" : language === "en" ? "Cancel" : "Annuler",
    linkConsult: isRTL ? "ربط استشارة" : language === "en" ? "Link Consultation" : "Lier une consultation",
    noConsultations: isRTL ? "لا توجد استشارات" : language === "en" ? "No consultations" : "Aucune consultation",
    emptyItems: isRTL ? "لا توجد عناصر بعد" : language === "en" ? "No items yet" : "Aucun élément dans ce dossier",
    emptyItemsDesc: isRTL ? "اربط استشارة لتنظيم بحوثك" : language === "en" ? "Link a consultation to organise your research" : "Liez une consultation pour organiser vos recherches",
    deleteConfirm: isRTL ? "حذف هذا الملف؟" : language === "en" ? "Delete this case?" : "Supprimer ce dossier ?",
    back: isRTL ? "رجوع" : language === "en" ? "Back" : "Retour",
    consultations: isRTL ? "الاستشارات المرتبطة" : language === "en" ? "Linked Consultations" : "Consultations liées",
    alreadyLinked: isRTL ? "مرتبط" : language === "en" ? "Linked" : "Déjà lié",
    link: isRTL ? "ربط" : language === "en" ? "Link" : "Lier",
  };

  const fetchDossiers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/api/dossiers`, { credentials: "include" });
      if (r.ok) setDossiers(await r.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDossiers(); }, [fetchDossiers]);

  const fetchDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const r = await fetch(`${BASE}/api/dossiers/${id}`, { credentials: "include" });
      if (r.ok) setSelectedDossier(await r.json());
    } finally { setDetailLoading(false); }
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const r = await fetch(`${BASE}/api/dossiers`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || undefined }),
      });
      if (r.ok) {
        setNewName(""); setNewDesc("");
        if (isMobile) setShowCreate(false);
        fetchDossiers();
        toast({ title: isRTL ? "تم إنشاء الملف" : "Dossier créé" });
      }
    } finally { setCreating(false); }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm(T.deleteConfirm)) return;
    await fetch(`${BASE}/api/dossiers/${id}`, { method: "DELETE", credentials: "include" });
    if (selectedDossier?.id === id) setSelectedDossier(null);
    fetchDossiers();
  };

  const handleUnlinkItem = async (itemId: number) => {
    if (!selectedDossier) return;
    await fetch(`${BASE}/api/dossiers/${selectedDossier.id}/items/${itemId}`, { method: "DELETE", credentials: "include" });
    fetchDetail(selectedDossier.id);
  };

  const openLink = async () => {
    const r = await fetch(`${BASE}/api/anthropic/conversations`, { credentials: "include" });
    if (r.ok) setConversations(await r.json());
    setShowLink(true);
  };

  const handleLink = async (convId: number) => {
    if (!selectedDossier) return;
    setLinking(convId);
    try {
      const r = await fetch(`${BASE}/api/dossiers/${selectedDossier.id}/items`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: "consultation", conversationId: convId }),
      });
      if (r.ok) { fetchDetail(selectedDossier.id); }
    } finally { setLinking(null); }
  };

  const linkedIds = new Set(selectedDossier?.items.map(i => i.conversationId) ?? []);

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <Layout>
        <div
          className="flex flex-col bg-background overflow-hidden"
          style={{ height: "calc(100dvh - 56px - 64px - env(safe-area-inset-bottom))" }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {selectedDossier ? (
            /* Mobile detail view */
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="sticky top-0 z-10 bg-card px-4 py-3 flex items-center gap-3 border-b border-border">
                <button onClick={() => setSelectedDossier(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-foreground truncate">{selectedDossier.name}</h1>
                  {selectedDossier.description && <p className="text-xs text-muted-foreground truncate">{selectedDossier.description}</p>}
                </div>
                <Button size="sm" className="gap-1.5 h-8 text-xs shrink-0" onClick={openLink}>
                  <Link2 className="w-3.5 h-3.5" />{T.linkConsult}
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col">
                {detailLoading ? (
                  <div className="space-y-3 p-4">{[1,2].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
                ) : selectedDossier.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/30 flex items-center justify-center">
                      <Link2 className="w-7 h-7 text-[#c9a227]" />
                    </div>
                    <div><p className="font-semibold text-foreground">{T.emptyItems}</p><p className="text-sm text-muted-foreground mt-1">{T.emptyItemsDesc}</p></div>
                    <Button className="gap-2 mt-2 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold" onClick={openLink}><Link2 className="w-4 h-4" />{T.linkConsult}</Button>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {selectedDossier.items.map(item => (
                      <Link key={item.id} href={`/conversations/${item.conversationId}`}>
                        <div className="group relative bg-card border border-border rounded-xl p-4 hover:border-[#c9a227]/50 transition-all">
                          <button className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={e => { e.preventDefault(); e.stopPropagation(); handleUnlinkItem(item.id); }}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-start gap-2.5 pr-8">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><MessageSquare className="w-4 h-4 text-primary" /></div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-foreground line-clamp-1">{item.conversationTitle}</p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <JurisdictionBadge jurisdiction={item.conversationJurisdiction} className="text-[10px] h-4 py-0 px-1.5" />
                                <span className="text-[10px] text-muted-foreground">{format(new Date(item.conversationCreatedAt), "d MMM yyyy")}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1 truncate">{item.conversationLegalDomain}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Mobile list view */
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="sticky top-0 z-10 bg-card px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-accent" />
                  <h1 className="text-base font-bold text-foreground">{T.dossiers}</h1>
                  {dossiers.length > 0 && <span className="text-xs bg-accent text-[#0d1b2e] rounded-full px-2 py-0.5 font-bold">{dossiers.length}</span>}
                </div>
                <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" />{T.newDossier}</Button>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col">
                {loading ? (
                  <div className="space-y-3 p-4">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
                ) : dossiers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/30 flex items-center justify-center"><FolderOpen className="w-7 h-7 text-[#c9a227]" /></div>
                    <div><p className="font-semibold text-foreground">{T.empty}</p><p className="text-sm text-muted-foreground mt-1">{T.emptyDesc}</p></div>
                    <Button className="gap-2 mt-2 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" />{T.newDossier}</Button>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {dossiers.map(dossier => (
                      <div key={dossier.id} className="group relative bg-card border border-border rounded-xl p-4 hover:border-[#c9a227]/50 transition-all cursor-pointer" onClick={() => fetchDetail(dossier.id)}>
                        <button className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={e => handleDelete(e, dossier.id)}><Trash2 className="w-3.5 h-3.5" /></button>
                        <div className="flex items-start gap-2.5 pr-8">
                          <div className="w-8 h-8 rounded-lg bg-[#c9a227]/15 flex items-center justify-center shrink-0"><FolderOpen className="w-4 h-4 text-[#c9a227]" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground line-clamp-1">{dossier.name}</p>
                            {dossier.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{dossier.description}</p>}
                            <p className="text-[10px] text-muted-foreground mt-1.5">{format(new Date(dossier.createdAt), "d MMM yyyy")}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile: Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-foreground">{T.newDossier}</h2>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <Input autoFocus placeholder={T.namePlaceholder} value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()} />
                <Input placeholder={T.descPlaceholder} value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              </div>
              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1" onClick={() => { setShowCreate(false); setNewName(""); setNewDesc(""); }}>{T.cancel}</Button>
                <Button className="flex-1 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold" disabled={!newName.trim() || creating} onClick={handleCreate}>{T.create}</Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile: Link modal */}
        {showLink && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-bold text-foreground text-sm">{T.linkConsult}</h2>
                <button onClick={() => setShowLink(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">{T.noConsultations}</p>
                ) : conversations.map(conv => {
                  const already = linkedIds.has(conv.id);
                  return (
                    <div key={conv.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${already ? "border-[#c9a227]/40 bg-[#c9a227]/5" : "border-border"}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{conv.title}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <JurisdictionBadge jurisdiction={conv.jurisdiction} className="text-[10px] h-4 py-0 px-1.5" />
                          <span className="text-[10px] text-muted-foreground">{conv.legalDomain}</span>
                        </div>
                      </div>
                      {already ? (
                        <span className="text-[10px] text-[#c9a227] font-semibold shrink-0">{T.alreadyLinked}</span>
                      ) : (
                        <Button size="sm" className="h-7 text-xs px-3 shrink-0" disabled={linking === conv.id} onClick={() => handleLink(conv.id)}>
                          {linking === conv.id ? "..." : T.link}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  /* ── DESKTOP: horizontal split — form TOP, list/detail BOTTOM ── */
  return (
    <Layout>
      <div className="flex flex-col flex-1 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>

        {/* TOP: compact form */}
        <div className="shrink-0 bg-card border-b border-border">
          {selectedDossier ? (
            /* Detail header */
            <div className="flex items-center gap-3 px-6 py-4">
              <button
                onClick={() => setSelectedDossier(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-lg bg-[#c9a227]/15 flex items-center justify-center shrink-0">
                <FolderOpen className="w-4 h-4 text-[#c9a227]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-none truncate">{selectedDossier.name}</p>
                {selectedDossier.description && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{selectedDossier.description}</p>}
              </div>
              <Button size="sm" className="gap-1.5 h-9 text-xs shrink-0" onClick={openLink}>
                <Link2 className="w-3.5 h-3.5" />{T.linkConsult}
              </Button>
            </div>
          ) : (
            /* Create form */
            <>
              <div className="flex items-center gap-3 px-6 pt-4 pb-2">
                <div className="w-8 h-8 rounded-lg bg-[#c9a227]/15 flex items-center justify-center shrink-0">
                  <FolderOpen className="w-4 h-4 text-[#c9a227]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-none">{T.dossiers}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isRTL ? "نظّم استشاراتك في ملفات قانونية" : "Organisez vos consultations en dossiers juridiques"}
                  </p>
                </div>
                {dossiers.length > 0 && (
                  <span className="ml-2 text-xs bg-accent text-[#0d1b2e] rounded-full px-2 py-0.5 font-bold">{dossiers.length}</span>
                )}
              </div>
              <div className="flex items-center gap-3 px-6 pb-4">
                <Input
                  placeholder={T.namePlaceholder}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleCreate()}
                  className="h-9 text-sm flex-1 min-w-[200px]"
                />
                <Input
                  placeholder={T.descPlaceholder}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="h-9 text-sm w-[260px]"
                />
                <Button
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                  className="h-9 px-5 shrink-0 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold text-sm gap-1.5"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {T.create}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* BOTTOM: dossier list OR detail */}
        <div className="flex-1 overflow-y-auto bg-background">
          {selectedDossier ? (
            /* Detail view */
            <div className="p-5 max-w-4xl mx-auto">
              {detailLoading ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                  {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
                </div>
              ) : selectedDossier.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/30 flex items-center justify-center">
                    <Link2 className="w-7 h-7 text-[#c9a227]" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{T.emptyItems}</p>
                    <p className="text-sm text-muted-foreground mt-1">{T.emptyItemsDesc}</p>
                  </div>
                  <Button className="gap-2 mt-2 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-bold" onClick={openLink}>
                    <Link2 className="w-4 h-4" />{T.linkConsult}
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{T.consultations}</p>
                  <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                    {selectedDossier.items.map(item => (
                      <Link key={item.id} href={`/conversations/${item.conversationId}`}>
                        <div className="group relative bg-card border border-border rounded-xl p-4 hover:border-[#c9a227]/50 transition-all cursor-pointer h-full">
                          <button
                            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                            onClick={e => { e.preventDefault(); e.stopPropagation(); handleUnlinkItem(item.id); }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="flex items-start gap-2.5 pr-6">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <MessageSquare className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">{item.conversationTitle}</p>
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                <JurisdictionBadge jurisdiction={item.conversationJurisdiction} className="text-[10px] h-4 py-0 px-1.5" />
                                <span className="text-[10px] text-muted-foreground">{format(new Date(item.conversationCreatedAt), "d MMM yyyy")}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1 truncate">{item.conversationLegalDomain}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Dossiers grid */
            <div className="p-5">
              {loading ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
                </div>
              ) : dossiers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 border border-[#c9a227]/30 flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-[#c9a227]" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{T.empty}</p>
                    <p className="text-sm text-muted-foreground mt-1">{T.emptyDesc}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {dossiers.map(dossier => (
                    <div
                      key={dossier.id}
                      className="group relative bg-card border border-border rounded-xl p-4 hover:border-[#c9a227]/50 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => fetchDetail(dossier.id)}
                    >
                      <button
                        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                        onClick={e => handleDelete(e, dossier.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="flex items-start gap-2.5 pr-6">
                        <div className="w-8 h-8 rounded-lg bg-[#c9a227]/15 flex items-center justify-center shrink-0">
                          <FolderOpen className="w-4 h-4 text-[#c9a227]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">{dossier.name}</p>
                          {dossier.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{dossier.description}</p>}
                          <p className="text-[10px] text-muted-foreground mt-1.5">{format(new Date(dossier.createdAt), "d MMM yyyy")}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Link modal (desktop & mobile) */}
      {showLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold text-foreground">{T.linkConsult}</h2>
              <button onClick={() => setShowLink(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {conversations.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">{T.noConsultations}</p>
              ) : conversations.map(conv => {
                const already = linkedIds.has(conv.id);
                return (
                  <div key={conv.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${already ? "border-[#c9a227]/40 bg-[#c9a227]/5" : "border-border"}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{conv.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <JurisdictionBadge jurisdiction={conv.jurisdiction} className="text-[10px] h-4 py-0 px-1.5" />
                        <span className="text-[10px] text-muted-foreground">{conv.legalDomain}</span>
                      </div>
                    </div>
                    {already ? (
                      <span className="text-[10px] text-[#c9a227] font-semibold shrink-0">{T.alreadyLinked}</span>
                    ) : (
                      <Button size="sm" className="h-7 text-xs px-3 shrink-0" disabled={linking === conv.id} onClick={() => handleLink(conv.id)}>
                        {linking === conv.id ? "..." : T.link}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
