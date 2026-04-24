import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/layout";
import { useAuthContext } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  User, Mail, Briefcase, Lock, Phone,
  Save, Eye, EyeOff, LogOut, CheckCircle2, Clock,
  CreditCard, Shield, Zap, Star, Check, Wallet, TrendingUp,
  PhoneCall, ArrowUpCircle, ArrowDownCircle, Gift, Plus,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE_URL}/api`;

type CallLog = { id: string; callId: string; language: string; status: string; durationSeconds: number | null; createdAt: string; };
type BalanceInfo = { balanceMad: number; freeCreditsRemainingMad: number; freeCreditsUsedMad: number; totalCallMinutes: number; voiceCostPerMinMad: number; freeCreditsInitialMad: number; };
type Transaction = { id: number; userId: string; amountMad: string; type: string; description: string; callId: string | null; createdAt: string; };

const PLANS = [
  { id: "professional", name: "Professionnel", nameAr: "احترافي", price: "49€/mois", icon: <Zap className="w-4 h-4" />, color: "text-accent", features: ["Consultations illimitées", "4 juridictions", "Citations légales", "Historique complet"], featuresAr: ["استشارات غير محدودة", "4 اختصاصات", "اقتباسات قانونية", "تاريخ كامل"] },
  { id: "expert", name: "Expert", nameAr: "خبير", price: "99€/mois", icon: <Star className="w-4 h-4" />, color: "text-purple-500", features: ["Tout Professionnel", "Appels vocaux IA", "Analyse de documents", "Support prioritaire"], featuresAr: ["كل المميزات الاحترافية", "مكالمات ذكاء اصطناعي", "تحليل وثائق", "دعم أولوية"] },
];

const TX_ICONS: Record<string, any> = {
  free_credit: <Gift className="w-3.5 h-3.5 text-green-500" />,
  card_recharge: <ArrowUpCircle className="w-3.5 h-3.5 text-blue-500" />,
  call_charge: <PhoneCall className="w-3.5 h-3.5 text-red-500" />,
  admin_credit: <ArrowUpCircle className="w-3.5 h-3.5 text-green-600" />,
  admin_debit: <ArrowDownCircle className="w-3.5 h-3.5 text-orange-500" />,
  free_credit_used: <PhoneCall className="w-3.5 h-3.5 text-amber-500" />,
};

export default function ProfilePage() {
  const { user, isSignedIn, isLoaded, updateProfile, changePassword, logout, refreshUser } = useAuthContext();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isRTL = language === "ar";

  const [activeTab, setActiveTab] = useState<"profil" | "securite" | "paiement" | "solde" | "appels">("profil");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeCard, setRechargeCard] = useState("");
  const [rechargeExpiry, setRechargeExpiry] = useState("");
  const [rechargeCvc, setRechargeCvc] = useState("");
  const [rechargeName, setRechargeName] = useState("");
  const [recharging, setRecharging] = useState(false);
  const [showRechargeForm, setShowRechargeForm] = useState(false);

  useEffect(() => { if (isLoaded && !isSignedIn) navigate(`${BASE_URL}/sign-in`); }, [isLoaded, isSignedIn]);
  useEffect(() => { if (user) { setFirstName(user.firstName || ""); setLastName(user.lastName || ""); setJobTitle(user.jobTitle || ""); setSelectedPlan(user.plan || "professional"); } }, [user]);

  const fetchBalance = useCallback(async () => {
    if (!isSignedIn) return;
    setLoadingBalance(true);
    try {
      const bRes = await fetch(`${API}/billing/balance`, { credentials: "include" });
      const b = bRes.ok ? await bRes.json() : null;
      setBalance(b);
      const tRes = await fetch(`${API}/billing/transactions`, { credentials: "include" });
      const t = tRes.ok ? await tRes.json() : [];
      setTransactions(t);
    } finally { setLoadingBalance(false); }
  }, [isSignedIn]);

  const fetchCalls = useCallback(async () => {
    if (!isSignedIn) return;
    setLoadingCalls(true);
    fetch(`${API}/voice/calls`, { credentials: "include" }).then(r => r.ok ? r.json() : []).then(setCalls).catch(() => setCalls([])).finally(() => setLoadingCalls(false));
  }, [isSignedIn]);

  useEffect(() => {
    if (activeTab === "solde") {
      fetchBalance();
      const interval = setInterval(fetchBalance, 15000);
      return () => clearInterval(interval);
    }
    if (activeTab === "appels") {
      fetchCalls();
      const interval = setInterval(fetchCalls, 15000);
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchBalance, fetchCalls]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try { await updateProfile({ firstName, lastName, jobTitle }); await refreshUser(); toast({ title: isRTL ? "تم الحفظ" : "Profil mis à jour" }); }
    catch (err: any) { toast({ variant: "destructive", title: "Erreur", description: err.message }); }
    finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (newPwd !== confirmPwd) { toast({ variant: "destructive", title: "Erreur", description: "Les mots de passe ne correspondent pas." }); return; }
    if (newPwd.length < 8) { toast({ variant: "destructive", title: "Erreur", description: "Au moins 8 caractères requis." }); return; }
    setSavingPwd(true);
    try { await changePassword(currentPwd, newPwd); setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); toast({ title: "Mot de passe modifié" }); }
    catch (err: any) { toast({ variant: "destructive", title: "Erreur", description: err.message }); }
    finally { setSavingPwd(false); }
  };

  const handleLogout = async () => { await logout(); navigate(`${BASE_URL}/`); };

  const handleRecharge = async () => {
    const amt = Number(rechargeAmount);
    if (!amt || amt < 50) { toast({ variant: "destructive", title: "Minimum 50 MAD" }); return; }
    setRecharging(true);
    try {
      const r = await fetch(`${API}/billing/recharge`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amountMad: amt }) });
      if (r.ok) { toast({ title: `+${amt} MAD ajoutés à votre solde` }); setShowRechargeForm(false); setRechargeAmount(""); setRechargeCard(""); setRechargeExpiry(""); setRechargeCvc(""); setRechargeName(""); fetchBalance(); }
      else { const e = await r.json(); toast({ variant: "destructive", title: e.error }); }
    } finally { setRecharging(false); }
  };

  const formatDate = (iso: string) => format(new Date(iso), "d MMM yyyy, HH:mm");
  const formatDuration = (secs: number | null) => { if (!secs) return "—"; const m = Math.floor(secs / 60); const s = secs % 60; return m > 0 ? `${m}min ${s}s` : `${s}s`; };
  const formatCard = (val: string) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (val: string) => val.replace(/\D/g, "").slice(0, 4).replace(/(.{2})(.{1,2})/, "$1/$2");

  const displayName = `${firstName || ""} ${lastName || ""}`.trim() || user?.email?.split("@")[0] || "Utilisateur";
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || (user?.email?.[0] || "U").toUpperCase();
  const currentPlan = PLANS.find(p => p.id === user?.plan);
  const planLabel = currentPlan ? (isRTL ? currentPlan.nameAr : currentPlan.name) : null;

  const tabs = [
    { id: "profil", label: "Profil" },
    { id: "securite", label: "Sécurité" },
    { id: "paiement", label: "Paiement" },
    { id: "solde", label: "Solde" },
    { id: "appels", label: "Appels" },
  ] as const;

  const freePercent = balance ? Math.max(0, (balance.freeCreditsRemainingMad / balance.freeCreditsInitialMad) * 100) : 100;
  const canRecharge = rechargeCard.replace(/\s/g, "").length >= 16 && rechargeExpiry.length >= 5 && rechargeCvc.length >= 3 && rechargeName && Number(rechargeAmount) >= 50;

  if (!isLoaded) return <Layout><div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div></Layout>;

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

          {/* Identity card */}
          <div className="bg-card rounded-2xl p-5 flex items-center gap-4 border border-border">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-[#a07c1e] flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">{initials}</div>
            <div className="flex-1 min-w-0">
              <div className="text-foreground font-semibold text-lg truncate">{displayName}</div>
              <div className="text-muted-foreground text-sm truncate">{user?.email}</div>
              {planLabel && <Badge variant="outline" className={`text-xs mt-1 ${currentPlan?.color || ""} border-current/30`}>{planLabel}</Badge>}
            </div>
            <button onClick={handleLogout} className="shrink-0 p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap px-2 ${activeTab === tab.id ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB: PROFIL ── */}
          {activeTab === "profil" && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2"><User className="w-4 h-4 text-accent" /><span className="text-foreground font-semibold text-sm">{isRTL ? "المعلومات الشخصية" : "Informations personnelles"}</span></div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-medium">{isRTL ? "الاسم الأول" : "Prénom"}</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Prénom" className="h-10 text-sm" /></div>
                  <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-medium">{isRTL ? "اللقب" : "Nom"}</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nom" className="h-10 text-sm" /></div>
                </div>
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-medium flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />Email</Label><Input value={user?.email || ""} disabled className="h-10 text-sm opacity-50 cursor-not-allowed" /></div>
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-medium flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{isRTL ? "المهنة" : "Emploi / Poste"}</Label><Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Ex: Avocat, Juriste, Notaire..." className="h-10 text-sm" /></div>
                <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full h-10 bg-accent hover:bg-accent/90 text-[#0d1b2e] font-semibold text-sm">
                  {savingProfile ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-[#0d1b2e]/40 border-t-[#0d1b2e] rounded-full animate-spin" />Enregistrement...</span> : <span className="flex items-center gap-2"><Save className="w-4 h-4" />Sauvegarder</span>}
                </Button>
              </div>
            </div>
          )}

          {/* ── TAB: SÉCURITÉ ── */}
          {activeTab === "securite" && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2"><Lock className="w-4 h-4 text-accent" /><span className="text-foreground font-semibold text-sm">Modifier le mot de passe</span></div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-medium">Mot de passe actuel</Label>
                  <div className="relative"><Input type={showCurrentPwd ? "text" : "password"} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" className="h-10 text-sm pr-10" />
                    <button type="button" onClick={() => setShowCurrentPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div></div>
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-medium">Nouveau mot de passe</Label>
                  <div className="relative"><Input type={showNewPwd ? "text" : "password"} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" className="h-10 text-sm pr-10" />
                    <button type="button" onClick={() => setShowNewPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div></div>
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-medium">Confirmer le nouveau mot de passe</Label>
                  <Input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" className={`h-10 text-sm ${confirmPwd && confirmPwd !== newPwd ? "border-destructive" : ""}`} />
                  {confirmPwd && confirmPwd !== newPwd && <p className="text-destructive text-xs">Les mots de passe ne correspondent pas</p>}
                </div>
                <Button onClick={handleChangePassword} disabled={savingPwd || !currentPwd || !newPwd || newPwd !== confirmPwd} variant="outline" className="w-full h-10 text-sm font-medium">
                  {savingPwd ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />Modification...</span> : <span className="flex items-center gap-2"><Lock className="w-4 h-4" />Changer le mot de passe</span>}
                </Button>
              </div>
            </div>
          )}

          {/* ── TAB: PAIEMENT ── */}
          {activeTab === "paiement" && (
            <div className="space-y-4">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /><span className="text-foreground font-semibold text-sm">Votre abonnement</span></div>
                <div className="p-5 space-y-3">
                  {PLANS.map(plan => {
                    const isCurrent = user?.plan === plan.id;
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`w-full text-left rounded-xl border p-4 transition-all ${isSelected ? "border-accent bg-accent/5 ring-1 ring-accent/30" : "border-border bg-muted/30 hover:border-accent/40"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><span className={plan.color}>{plan.icon}</span><span className="font-semibold text-sm text-foreground">{isRTL ? plan.nameAr : plan.name}</span>
                            {isCurrent && <Badge className="text-[9px] h-4 px-1.5 bg-accent/20 text-accent border-accent/30">Actuel</Badge>}
                          </div>
                          <div className="flex items-center gap-2"><span className="text-sm font-bold text-foreground">{plan.price}</span>{isSelected && <Check className="w-4 h-4 text-accent" />}</div>
                        </div>
                        <ul className="mt-2 space-y-0.5">{(isRTL ? plan.featuresAr : plan.features).map(f => (<li key={f} className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Check className="w-3 h-3 text-accent shrink-0" />{f}</li>))}</ul>
                      </button>
                    );
                  })}
                </div>
              </div>
              {selectedPlan !== user?.plan && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center gap-2"><CreditCard className="w-4 h-4 text-accent" /><span className="text-foreground font-semibold text-sm">Informations de paiement</span></div>
                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-medium">Nom sur la carte</Label><Input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Prénom Nom" className="h-10 text-sm" /></div>
                    <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-medium flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />Numéro de carte</Label><Input value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" className="h-10 text-sm font-mono tracking-widest" maxLength={19} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-medium">Date d'expiration</Label><Input value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/AA" className="h-10 text-sm font-mono" maxLength={5} /></div>
                      <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-medium">CVC</Label><Input value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="123" className="h-10 text-sm font-mono" maxLength={3} type="password" /></div>
                    </div>
                    <Button className="w-full h-10 bg-accent hover:bg-accent/90 text-[#0d1b2e] font-semibold text-sm gap-2" disabled={!cardName || cardNumber.replace(/\s/g, "").length < 16 || cardExpiry.length < 5 || cardCvc.length < 3}>
                      <CreditCard className="w-4 h-4" />S'abonner — {PLANS.find(p => p.id === selectedPlan)?.price}
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">Paiement sécurisé · Résiliable à tout moment</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: SOLDE & CONSOMMATION ── */}
          {activeTab === "solde" && (
            <div className="space-y-4">
              {loadingBalance ? (
                <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}</div>
              ) : balance ? (
                <>
                  {/* Balance cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-[#0d1b2e] to-[#1a2f4a] rounded-2xl p-4 border border-[#c9a227]/20">
                      <div className="flex items-center gap-1.5 mb-2"><Wallet className="w-4 h-4 text-[#c9a227]" /><span className="text-[#c9a227] text-xs font-semibold">Solde rechargé</span></div>
                      <div className="text-2xl font-bold text-white">{balance.balanceMad.toFixed(2)}</div>
                      <div className="text-xs text-white/50 mt-0.5">MAD</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 rounded-2xl p-4 border border-green-500/20">
                      <div className="flex items-center gap-1.5 mb-2"><Gift className="w-4 h-4 text-green-400" /><span className="text-green-400 text-xs font-semibold">Crédit gratuit</span></div>
                      <div className="text-2xl font-bold text-foreground">{balance.freeCreditsRemainingMad.toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">MAD restants / {balance.freeCreditsInitialMad}</div>
                    </div>
                  </div>

                  {/* Free credits progress */}
                  <div className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">Crédit gratuit consommé</span>
                      <span className="text-xs text-muted-foreground">{balance.freeCreditsUsedMad.toFixed(0)} / {balance.freeCreditsInitialMad} MAD</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all" style={{ width: `${freePercent}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><PhoneCall className="w-3.5 h-3.5" /><span>{balance.totalCallMinutes} minutes d'appels</span></div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><span>Tarif : 5 MAD/min</span></div>
                    </div>
                  </div>

                  {/* Recharge button */}
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-accent" /><span className="text-foreground font-semibold text-sm">Recharger par carte</span></div>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowRechargeForm(v => !v)}>
                        <Plus className="w-3 h-3" />{showRechargeForm ? "Annuler" : "Recharger"}
                      </Button>
                    </div>
                    {showRechargeForm && (
                      <div className="p-5 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {[100, 200, 500].map(amt => (
                            <button key={amt} onClick={() => setRechargeAmount(String(amt))} className={`rounded-xl border py-2 text-sm font-semibold transition-all ${rechargeAmount === String(amt) ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/40"}`}>{amt} MAD</button>
                          ))}
                        </div>
                        <Input value={rechargeAmount} onChange={e => setRechargeAmount(e.target.value.replace(/\D/g, ""))} placeholder="Montant personnalisé (min 50 MAD)" className="h-10 text-sm" />
                        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Nom sur la carte</Label><Input value={rechargeName} onChange={e => setRechargeName(e.target.value)} placeholder="Prénom Nom" className="h-10 text-sm" /></div>
                        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Numéro de carte</Label><Input value={rechargeCard} onChange={e => setRechargeCard(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" className="h-10 text-sm font-mono" maxLength={19} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Expiration</Label><Input value={rechargeExpiry} onChange={e => setRechargeExpiry(formatExpiry(e.target.value))} placeholder="MM/AA" className="h-10 text-sm font-mono" maxLength={5} /></div>
                          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">CVC</Label><Input value={rechargeCvc} onChange={e => setRechargeCvc(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="123" className="h-10 text-sm font-mono" type="password" maxLength={3} /></div>
                        </div>
                        <Button className="w-full h-10 bg-accent hover:bg-accent/90 text-[#0d1b2e] font-bold text-sm gap-2" disabled={!canRecharge || recharging} onClick={handleRecharge}>
                          {recharging ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-[#0d1b2e]/30 border-t-[#0d1b2e] rounded-full animate-spin" />Traitement...</span> : <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" />Valider la recharge — {rechargeAmount || "0"} MAD</span>}
                        </Button>
                        <p className="text-[10px] text-muted-foreground text-center">Paiement sécurisé · Disponible immédiatement</p>
                      </div>
                    )}
                  </div>

                  {/* Transaction history */}
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-foreground font-semibold text-sm">Historique des transactions</span>
                    </div>
                    {transactions.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">Aucune transaction</div>
                    ) : (
                      <div className="divide-y divide-border">
                        {transactions.map(tx => {
                          const amt = Number(tx.amountMad);
                          const positive = amt >= 0;
                          return (
                            <div key={tx.id} className="px-5 py-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">{TX_ICONS[tx.type] || <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">{tx.description}</p>
                                <p className="text-[11px] text-muted-foreground">{formatDate(tx.createdAt)}</p>
                              </div>
                              <span className={`text-sm font-bold shrink-0 ${positive ? "text-green-500" : "text-red-500"}`}>{positive ? "+" : ""}{amt.toFixed(2)} MAD</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-12">Impossible de charger le solde</div>
              )}
            </div>
          )}

          {/* ── TAB: APPELS ── */}
          {activeTab === "appels" && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2"><Phone className="w-4 h-4 text-accent" /><span className="text-foreground font-semibold text-sm">Historique des appels</span></div>
              {loadingCalls ? (
                <div className="p-5 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
              ) : calls.length === 0 ? (
                <div className="p-8 text-center"><Phone className="w-8 h-8 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Aucun appel pour l'instant</p></div>
              ) : (
                <div className="divide-y divide-border">
                  {calls.map(call => (
                    <div key={call.id} className="px-5 py-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${call.status === "ended" ? "bg-green-500/10" : "bg-muted"}`}><Phone className={`w-4 h-4 ${call.status === "ended" ? "text-green-500" : "text-muted-foreground"}`} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><span className="text-sm text-foreground font-medium">{call.language === "ar" ? "عربي" : "Français"}</span><Badge variant="outline" className="text-[10px] h-4 px-1.5">{call.status}</Badge></div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(call.durationSeconds)}</span>
                          <span>{formatDate(call.createdAt)}</span>
                        </div>
                      </div>
                      {call.durationSeconds && <span className="text-xs text-red-400 font-medium shrink-0">−{(Math.ceil(call.durationSeconds / 60) * 5).toFixed(0)} MAD</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
