import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/layout";
import { useAuthContext } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  User, Mail, Briefcase, Lock, Phone, ChevronLeft,
  Save, Eye, EyeOff, LogOut, CheckCircle2, Clock,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE_URL}/api`;

type CallLog = {
  id: string;
  callId: string;
  language: string;
  status: string;
  durationSeconds: number | null;
  createdAt: string;
};

export default function ProfilePage() {
  const { user, isSignedIn, isLoaded, updateProfile, changePassword, logout, refreshUser } = useAuthContext();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isRTL = language === "ar";

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // Call logs
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate(`${BASE_URL}/sign-in`);
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setJobTitle(user.jobTitle || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch(`${API}/voice/calls`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(data => setCalls(data))
      .catch(() => setCalls([]))
      .finally(() => setLoadingCalls(false));
  }, [isSignedIn]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({ firstName, lastName, jobTitle });
      await refreshUser();
      toast({ title: isRTL ? "تم الحفظ" : "Profil mis à jour", description: isRTL ? "تم حفظ معلوماتك." : "Vos informations ont été sauvegardées." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPwd !== confirmPwd) {
      toast({ variant: "destructive", title: "Erreur", description: isRTL ? "كلمات المرور غير متطابقة" : "Les nouveaux mots de passe ne correspondent pas." });
      return;
    }
    if (newPwd.length < 8) {
      toast({ variant: "destructive", title: "Erreur", description: isRTL ? "8 أحرف على الأقل" : "Au moins 8 caractères requis." });
      return;
    }
    setSavingPwd(true);
    try {
      await changePassword(currentPwd, newPwd);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      toast({ title: isRTL ? "تم تغيير كلمة المرور" : "Mot de passe modifié", description: isRTL ? "تم تحديث كلمة المرور بنجاح." : "Votre mot de passe a été mis à jour." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    } finally {
      setSavingPwd(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(`${BASE_URL}/`);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(isRTL ? "ar-MA" : "fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatDuration = (secs: number | null) => {
    if (!secs) return isRTL ? "—" : "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}min ${s}s` : `${s}s`;
  };

  const displayName = `${firstName || ""} ${lastName || ""}`.trim() || user?.email?.split("@")[0] || "Utilisateur";
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || (user?.email?.[0] || "U").toUpperCase();

  const planLabel = user?.plan === "expert" ? "Expert" : user?.plan === "pro" ? "Professional" : isRTL ? "مجاني" : "Gratuit";
  const planColor = user?.plan === "expert" ? "text-purple-400" : user?.plan === "pro" ? "text-[#c9a227]" : "text-white/50";

  if (!isLoaded) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="dark min-h-screen bg-[#0d1b2e] pb-20 md:pb-8"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-10 bg-[#0d1b2e]/95 backdrop-blur border-b border-white/10 flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(`${BASE_URL}/`)} className="text-white/60 hover:text-white">
            <ChevronLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>
          <h1 className="text-white font-semibold text-base flex-1">
            {isRTL ? "حسابي" : "Mon Compte"}
          </h1>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-xs font-medium flex items-center gap-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

          {/* Avatar + Identity card */}
          <div className="bg-white/5 rounded-2xl p-5 flex items-center gap-4 border border-white/10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c9a227] to-[#a07c1e] flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-lg truncate">{displayName}</div>
              <div className="text-white/50 text-sm truncate">{user?.email}</div>
              <div className={`text-xs font-semibold mt-1 ${planColor}`}>{planLabel}</div>
            </div>
          </div>

          {/* Profile info form */}
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
              <User className="w-4 h-4 text-[#c9a227]" />
              <span className="text-white font-semibold text-sm">
                {isRTL ? "المعلومات الشخصية" : "Informations personnelles"}
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs font-medium">
                    {isRTL ? "الاسم الأول" : "Prénom"}
                  </Label>
                  <Input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder={isRTL ? "الاسم الأول" : "Prénom"}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 h-10 text-sm focus:border-[#c9a227]/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs font-medium">
                    {isRTL ? "اللقب" : "Nom"}
                  </Label>
                  <Input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder={isRTL ? "اللقب" : "Nom de famille"}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 h-10 text-sm focus:border-[#c9a227]/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {isRTL ? "البريد الإلكتروني" : "Email"}
                </Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-white/5 border-white/10 text-white/40 h-10 text-sm cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {isRTL ? "المهنة / الوظيفة" : "Emploi / Poste"}
                </Label>
                <Input
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder={isRTL ? "مثال: محامي، مستشار قانوني..." : "Ex: Avocat, Juriste, Notaire..."}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 h-10 text-sm focus:border-[#c9a227]/60"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full h-10 bg-[#c9a227] hover:bg-[#b8901f] text-[#0d1b2e] font-semibold text-sm"
              >
                {savingProfile ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#0d1b2e]/40 border-t-[#0d1b2e] rounded-full animate-spin" />
                    {isRTL ? "جارٍ الحفظ..." : "Enregistrement..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {isRTL ? "حفظ التغييرات" : "Sauvegarder"}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Password change */}
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#c9a227]" />
              <span className="text-white font-semibold text-sm">
                {isRTL ? "تغيير كلمة المرور" : "Modifier le mot de passe"}
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium">
                  {isRTL ? "كلمة المرور الحالية" : "Mot de passe actuel"}
                </Label>
                <div className="relative">
                  <Input
                    type={showCurrentPwd ? "text" : "password"}
                    value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 h-10 text-sm pr-10 focus:border-[#c9a227]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  >
                    {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium">
                  {isRTL ? "كلمة المرور الجديدة" : "Nouveau mot de passe"}
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPwd ? "text" : "password"}
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 h-10 text-sm pr-10 focus:border-[#c9a227]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  >
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium">
                  {isRTL ? "تأكيد كلمة المرور" : "Confirmer le nouveau mot de passe"}
                </Label>
                <Input
                  type="password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  className={`bg-white/5 border-white/20 text-white placeholder:text-white/30 h-10 text-sm focus:border-[#c9a227]/60 ${
                    confirmPwd && confirmPwd !== newPwd ? "border-red-500/60" : ""
                  }`}
                />
                {confirmPwd && confirmPwd !== newPwd && (
                  <p className="text-red-400 text-xs">
                    {isRTL ? "كلمات المرور غير متطابقة" : "Les mots de passe ne correspondent pas"}
                  </p>
                )}
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={savingPwd || !currentPwd || !newPwd || newPwd !== confirmPwd}
                variant="outline"
                className="w-full h-10 border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-sm font-medium"
              >
                {savingPwd ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isRTL ? "جارٍ التغيير..." : "Modification..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {isRTL ? "تغيير كلمة المرور" : "Changer le mot de passe"}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Call history */}
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#c9a227]" />
                <span className="text-white font-semibold text-sm">
                  {isRTL ? "سجل المكالمات" : "Historique des appels"}
                </span>
              </div>
              <span className="text-white/40 text-xs">{calls.length} {isRTL ? "مكالمة" : "appel(s)"}</span>
            </div>

            {loadingCalls ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#c9a227]/40 border-t-[#c9a227] rounded-full animate-spin" />
              </div>
            ) : calls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                <Phone className="w-8 h-8 text-white/20" />
                <p className="text-white/40 text-sm">
                  {isRTL ? "لا توجد مكالمات بعد" : "Aucun appel vocal pour l'instant"}
                </p>
                <p className="text-white/25 text-xs">
                  {isRTL ? "استخدم زر الاتصال لبدء محادثة مع المساعد القانوني" : "Utilisez le bouton d'appel pour consulter notre assistant vocal"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {calls.map(call => (
                  <div key={call.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      call.status === "ended" ? "bg-green-500/20" : "bg-[#c9a227]/20"
                    }`}>
                      {call.status === "ended"
                        ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                        : <Clock className="w-4 h-4 text-[#c9a227]" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">
                          {call.language === "ar"
                            ? (isRTL ? "مساعد عربي" : "Agent Arabe")
                            : (isRTL ? "مساعد فرنسي" : "Agent Français")
                          }
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 uppercase tracking-wide">
                          {call.language}
                        </span>
                      </div>
                      <div className="text-white/40 text-xs">{formatDate(call.createdAt)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-white/60 text-xs font-mono">{formatDuration(call.durationSeconds)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logout button (desktop) */}
          <div className="hidden md:block">
            <Separator className="bg-white/10 mb-4" />
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {isRTL ? "تسجيل الخروج" : "Se déconnecter"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
