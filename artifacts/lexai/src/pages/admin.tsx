import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { Layout } from "@/components/layout/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, CreditCard, TrendingUp, Trash2, ShieldAlert, Wallet, Plus, X, Eye, Gift, ArrowUpCircle, PhoneCall, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${basePath}`;

type Stats = { totalUsers: number; activeSubscriptions: number; byPlan: { plan: string; count: number }[] };
type UserRecord = { id: string; email: string | null; first_name?: string; last_name?: string; plan: string | null; subscription_status: string; created_at: string; balance_mad: number; free_credits_remaining_mad: number; total_call_minutes: number; };
type Transaction = { id: number; amount_mad: string; type: string; description: string; created_at: string; };

const TX_ICONS: Record<string, any> = {
  free_credit: <Gift className="w-3.5 h-3.5 text-green-400" />,
  card_recharge: <ArrowUpCircle className="w-3.5 h-3.5 text-blue-400" />,
  call_charge: <PhoneCall className="w-3.5 h-3.5 text-red-400" />,
  admin_credit: <ArrowUpCircle className="w-3.5 h-3.5 text-green-400" />,
  admin_debit: <Wallet className="w-3.5 h-3.5 text-orange-400" />,
};

const PLAN_LABELS: Record<string, string> = { professional: "Professionnel", expert: "Expert" };

export default function AdminPage() {
  const { isSignedIn, isLoaded } = useAuthContext();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "clients" | "billing">("stats");
  const { toast } = useToast();

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPlan, setNewPlan] = useState("professional");
  const [newInitialBalance, setNewInitialBalance] = useState("");
  const [creating, setCreating] = useState(false);

  const [creditUserId, setCreditUserId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");
  const [crediting, setCrediting] = useState(false);

  const [txUserId, setTxUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("active");

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { credentials: "include" }),
        fetch(`${API}/api/admin/billing/users`, { credentials: "include" }),
      ]);
      if (statsRes.status === 403) { setForbidden(true); return; }
      setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch { if (!silent) toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" }); }
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    loadData();
    const interval = setInterval(() => loadData(true), 20000);
    return () => clearInterval(interval);
  }, [isLoaded, isSignedIn, loadData]);

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) return;
    setCreating(true);
    try {
      const r = await fetch(`${API}/api/admin/billing/users`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: newPassword, firstName: newFirstName, lastName: newLastName, plan: newPlan, initialBalanceMad: Number(newInitialBalance) || 0 }),
      });
      const data = await r.json();
      if (r.ok) { toast({ title: `Compte créé : ${newEmail}` }); setShowCreateUser(false); setNewEmail(""); setNewPassword(""); setNewFirstName(""); setNewLastName(""); setNewInitialBalance(""); loadData(); }
      else toast({ variant: "destructive", title: data.error });
    } finally { setCreating(false); }
  };

  const handleCredit = async () => {
    if (!creditUserId || !creditAmount) return;
    setCrediting(true);
    try {
      const r = await fetch(`${API}/api/admin/billing/users/${creditUserId}/credit`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMad: Number(creditAmount), note: creditNote }),
      });
      if (r.ok) { toast({ title: `${creditAmount} MAD ajoutés` }); setCreditUserId(null); setCreditAmount(""); setCreditNote(""); loadData(); }
      else { const e = await r.json(); toast({ variant: "destructive", title: e.error }); }
    } finally { setCrediting(false); }
  };

  const handleViewTx = async (userId: string) => {
    if (txUserId === userId) { setTxUserId(null); return; }
    setTxUserId(userId); setLoadingTx(true);
    try {
      const r = await fetch(`${API}/api/admin/billing/users/${userId}/transactions`, { credentials: "include" });
      if (r.ok) setTransactions(await r.json());
    } finally { setLoadingTx(false); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Supprimer définitivement ce compte ?")) return;
    await fetch(`${API}/api/admin/users/${userId}`, { method: "DELETE", credentials: "include" });
    loadData();
  };

  const handleSaveSubscription = async (userId: string) => {
    const r = await fetch(`${API}/api/admin/users/${userId}/subscription`, {
      method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: editPlan || null, subscriptionStatus: editStatus }),
    });
    if (r.ok) { setEditingUser(null); loadData(); toast({ title: "Abonnement mis à jour" }); }
  };

  const fmtDate = (d: string) => format(new Date(d), "d MMM yyyy");
  const fmtMad = (n: number) => `${Number(n).toFixed(2)} MAD`;

  if (!isLoaded || loading) return <Layout><div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div></Layout>;
  if (forbidden) return <Layout><div className="flex-1 flex items-center justify-center flex-col gap-3"><ShieldAlert className="w-12 h-12 text-destructive" /><p className="font-semibold">Accès refusé</p></div></Layout>;

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-foreground">Administration</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border">
            {(["stats", "clients", "billing"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}>
                {tab === "stats" ? "Statistiques" : tab === "clients" ? "Clients" : "Facturation"}
              </button>
            ))}
          </div>

          {/* ── STATS ── */}
          {activeTab === "stats" && stats && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card rounded-2xl border border-border p-4 text-center"><div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div><div className="text-xs text-muted-foreground mt-1">Utilisateurs</div></div>
                <div className="bg-card rounded-2xl border border-border p-4 text-center"><div className="text-2xl font-bold text-accent">{stats.activeSubscriptions}</div><div className="text-xs text-muted-foreground mt-1">Actifs</div></div>
                <div className="bg-card rounded-2xl border border-border p-4 text-center"><div className="text-2xl font-bold text-foreground">{stats.byPlan.length}</div><div className="text-xs text-muted-foreground mt-1">Formules</div></div>
              </div>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border"><span className="text-foreground font-semibold text-sm">Répartition par formule</span></div>
                <div className="p-5 space-y-2">
                  {stats.byPlan.length === 0 ? <p className="text-sm text-muted-foreground text-center">Aucun abonnement actif</p> : stats.byPlan.map(({ plan, count }) => (
                    <div key={plan} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-foreground">{PLAN_LABELS[plan] || plan}</span>
                      <Badge variant="outline" className="text-xs">{count} client{Number(count) > 1 ? "s" : ""}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CLIENTS ── */}
          {activeTab === "clients" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button className="gap-2 bg-accent hover:bg-accent/90 text-[#0d1b2e] font-bold h-9 text-sm" onClick={() => setShowCreateUser(true)}>
                  <Plus className="w-4 h-4" />Nouveau client
                </Button>
              </div>

              {showCreateUser && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <span className="text-foreground font-semibold text-sm flex items-center gap-2"><Users className="w-4 h-4 text-accent" />Créer un compte client</span>
                    <button onClick={() => setShowCreateUser(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Prénom</Label><Input value={newFirstName} onChange={e => setNewFirstName(e.target.value)} placeholder="Prénom" className="h-10 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Nom</Label><Input value={newLastName} onChange={e => setNewLastName(e.target.value)} placeholder="Nom" className="h-10 text-sm" /></div>
                    </div>
                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Email *</Label><Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="client@email.com" type="email" className="h-10 text-sm" /></div>
                    <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Mot de passe *</Label><Input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" type="password" className="h-10 text-sm" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Formule</Label>
                        <Select value={newPlan} onValueChange={setNewPlan}>
                          <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="professional">Professionnel</SelectItem><SelectItem value="expert">Expert</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Solde initial (MAD)</Label><Input value={newInitialBalance} onChange={e => setNewInitialBalance(e.target.value.replace(/\D/g, ""))} placeholder="0" className="h-10 text-sm" /></div>
                    </div>
                    <Button className="w-full h-10 bg-accent hover:bg-accent/90 text-[#0d1b2e] font-bold text-sm" disabled={!newEmail || !newPassword || creating} onClick={handleCreateUser}>
                      {creating ? "Création..." : "Créer le compte"}
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">100 MAD de crédit gratuit offert automatiquement à chaque nouveau compte</p>
                  </div>
                </div>
              )}

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border"><span className="text-foreground font-semibold text-sm">Liste des clients ({users.length})</span></div>
                {users.length === 0 ? <div className="p-8 text-center text-muted-foreground text-sm">Aucun client</div> : (
                  <div className="divide-y divide-border">
                    {users.map(u => (
                      <div key={u.id}>
                        <div className="px-4 py-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-[#a07c1e] flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(u.first_name?.[0] || u.email?.[0] || "?").toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-foreground truncate">{u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.email}</span>
                              {u.plan && <Badge variant="outline" className="text-[10px] h-4 px-1.5">{PLAN_LABELS[u.plan] || u.plan}</Badge>}
                              <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${u.subscription_status === "active" ? "text-green-500 border-green-500/30" : "text-muted-foreground"}`}>{u.subscription_status}</Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                              <span>{u.email}</span>
                              <span className="flex items-center gap-1"><Wallet className="w-3 h-3 text-accent" />{fmtMad(u.balance_mad)} rechargé</span>
                              <span className="flex items-center gap-1"><Gift className="w-3 h-3 text-green-400" />{fmtMad(u.free_credits_remaining_mad)} gratuit</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => { setCreditUserId(creditUserId === u.id ? null : u.id); setCreditAmount(""); setCreditNote(""); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors" title="Ajouter du solde"><Plus className="w-4 h-4" /></button>
                            <button onClick={() => handleViewTx(u.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Voir transactions">{txUserId === u.id ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                            <button onClick={() => { setEditingUser(editingUser === u.id ? null : u.id); setEditPlan(u.plan || ""); setEditStatus(u.subscription_status); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Modifier abonnement"><CreditCard className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>

                        {/* Credit panel */}
                        {creditUserId === u.id && (
                          <div className="mx-4 mb-3 p-4 bg-muted/50 rounded-xl border border-border space-y-2">
                            <p className="text-xs font-semibold text-foreground">Ajouter du solde à {u.email}</p>
                            <div className="flex gap-2">
                              {[50, 100, 200, 500].map(a => (<button key={a} onClick={() => setCreditAmount(String(a))} className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all ${creditAmount === String(a) ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}>{a}</button>))}
                            </div>
                            <Input value={creditAmount} onChange={e => setCreditAmount(e.target.value.replace(/\D/g, ""))} placeholder="Montant en MAD" className="h-9 text-sm" />
                            <Input value={creditNote} onChange={e => setCreditNote(e.target.value)} placeholder="Note (optionnel)" className="h-9 text-sm" />
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setCreditUserId(null)}>Annuler</Button>
                              <Button size="sm" className="flex-1 h-8 text-xs bg-accent hover:bg-accent/90 text-[#0d1b2e] font-bold" disabled={!creditAmount || crediting} onClick={handleCredit}>{crediting ? "..." : `Créditer ${creditAmount || "0"} MAD`}</Button>
                            </div>
                          </div>
                        )}

                        {/* Subscription edit panel */}
                        {editingUser === u.id && (
                          <div className="mx-4 mb-3 p-4 bg-muted/50 rounded-xl border border-border space-y-2">
                            <p className="text-xs font-semibold text-foreground">Modifier l'abonnement</p>
                            <div className="grid grid-cols-2 gap-2">
                              <Select value={editPlan} onValueChange={setEditPlan}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Formule" /></SelectTrigger>
                                <SelectContent><SelectItem value="professional">Professionnel</SelectItem><SelectItem value="expert">Expert</SelectItem></SelectContent>
                              </Select>
                              <Select value={editStatus} onValueChange={setEditStatus}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="active">Actif</SelectItem><SelectItem value="inactive">Inactif</SelectItem><SelectItem value="suspended">Suspendu</SelectItem></SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setEditingUser(null)}>Annuler</Button>
                              <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => handleSaveSubscription(u.id)}>Enregistrer</Button>
                            </div>
                          </div>
                        )}

                        {/* Transactions panel */}
                        {txUserId === u.id && (
                          <div className="mx-4 mb-3 rounded-xl border border-border overflow-hidden">
                            {loadingTx ? <div className="p-4 text-center text-xs text-muted-foreground">Chargement...</div> : transactions.length === 0 ? <div className="p-4 text-center text-xs text-muted-foreground">Aucune transaction</div> : (
                              <div className="divide-y divide-border">
                                {transactions.slice(0, 10).map(tx => {
                                  const amt = Number(tx.amount_mad);
                                  return (
                                    <div key={tx.id} className="px-4 py-2.5 flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">{TX_ICONS[tx.type] || <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />}</div>
                                      <div className="flex-1 min-w-0"><p className="text-xs text-foreground truncate">{tx.description}</p><p className="text-[10px] text-muted-foreground">{fmtDate(tx.created_at)}</p></div>
                                      <span className={`text-xs font-bold shrink-0 ${amt >= 0 ? "text-green-500" : "text-red-500"}`}>{amt >= 0 ? "+" : ""}{amt.toFixed(2)} MAD</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── BILLING ── */}
          {activeTab === "billing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-[#0d1b2e] to-[#1a2f4a] rounded-2xl border border-[#c9a227]/20 p-4">
                  <div className="text-xs text-[#c9a227] font-semibold mb-1">Total solde clients</div>
                  <div className="text-2xl font-bold text-white">{users.reduce((s, u) => s + Number(u.balance_mad), 0).toFixed(2)}</div>
                  <div className="text-xs text-white/50">MAD rechargé</div>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 rounded-2xl border border-green-500/20 p-4">
                  <div className="text-xs text-green-400 font-semibold mb-1">Crédits gratuits restants</div>
                  <div className="text-2xl font-bold text-foreground">{users.reduce((s, u) => s + Number(u.free_credits_remaining_mad), 0).toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">MAD offerts</div>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border"><span className="text-foreground font-semibold text-sm">Consommation appels</span></div>
                <div className="divide-y divide-border">
                  {users.filter(u => u.total_call_minutes > 0).length === 0 ? <div className="p-6 text-center text-sm text-muted-foreground">Aucun appel facturé</div> : users.filter(u => u.total_call_minutes > 0).map(u => (
                    <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0"><PhoneCall className="w-4 h-4 text-red-400" /></div>
                      <div className="flex-1 min-w-0"><p className="text-sm text-foreground truncate">{u.email}</p><p className="text-xs text-muted-foreground">{u.total_call_minutes} min × 5 MAD/min</p></div>
                      <span className="text-sm font-bold text-red-400 shrink-0">{(u.total_call_minutes * 5).toFixed(0)} MAD</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
