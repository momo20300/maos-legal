import { useState, useEffect, Fragment } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, CreditCard, TrendingUp, Trash2, RefreshCw, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${basePath}`;

type Stats = {
  totalUsers: number;
  activeSubscriptions: number;
  byPlan: { plan: string; count: number }[];
};

type UserRecord = {
  id: string;
  email: string | null;
  plan: string | null;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  createdAt: string;
};

const PLAN_LABELS: Record<string, string> = {
  professional: "Professionnel — $49/mois",
  expert: "Expert — $199/mois",
};

export default function AdminPage() {
  const { isSignedIn, isLoaded } = useAuthContext();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("active");
  const [editExpiry, setEditExpiry] = useState<string>("");
  const { toast } = useToast();

  async function loadData() {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { credentials: "include" }),
        fetch(`${API}/api/admin/users`, { credentials: "include" }),
      ]);
      if (statsRes.status === 403 || usersRes.status === 403) {
        setForbidden(true);
        return;
      }
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) loadData();
  }, [isLoaded, isSignedIn]);

  async function saveSubscription(userId: string) {
    const res = await fetch(`${API}/api/admin/users/${userId}/subscription`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        plan: editPlan || null,
        subscriptionStatus: editStatus,
        subscriptionExpiresAt: editExpiry || null,
      }),
    });
    if (res.ok) {
      toast({ title: "Abonnement mis à jour" });
      setEditingUser(null);
      loadData();
    } else {
      toast({ title: "Erreur", variant: "destructive" });
    }
  }

  async function deleteUser(userId: string, email: string | null) {
    if (!confirm(`Supprimer ${email || userId} ? Cette action est irréversible.`)) return;
    const res = await fetch(`${API}/api/admin/users/${userId}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast({ title: "Utilisateur supprimé" });
      loadData();
    } else {
      toast({ title: "Erreur", variant: "destructive" });
    }
  }

  function startEdit(user: UserRecord) {
    setEditingUser(user.id);
    setEditPlan(user.plan || "");
    setEditStatus(user.subscriptionStatus || "inactive");
    setEditExpiry(
      user.subscriptionExpiresAt
        ? new Date(user.subscriptionExpiresAt).toISOString().split("T")[0]
        : ""
    );
  }

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <ShieldAlert className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">Connexion requise.</p>
        </div>
      </Layout>
    );
  }

  if (forbidden) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <ShieldAlert className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-serif font-bold">Accès refusé</h2>
          <p className="text-muted-foreground">Vous n'avez pas les droits d'accès à ce panneau.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold">Panneau Administrateur</h1>
            <p className="text-muted-foreground mt-1">Gestion des comptes et abonnements MAOS Legal</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> Utilisateurs totaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{stats?.totalUsers ?? "—"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Abonnements actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-accent">{stats?.activeSubscriptions ?? "—"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Revenu mensuel estimé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">
                ${
                  (stats?.byPlan ?? []).reduce((acc, p) => {
                    const price = p.plan === "expert" ? 199 : p.plan === "professional" ? 49 : 0;
                    return acc + price * Number(p.count);
                  }, 0).toLocaleString()
                }
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(stats?.byPlan ?? []).map((p) => (
                  <Badge key={p.plan} variant="secondary" className="text-xs">
                    {p.plan === "professional" ? "Pro" : "Expert"}: {p.count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Liste des utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Aucun utilisateur enregistré.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Statut</th>
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Expiration</th>
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Inscrit le</th>
                      <th className="text-right py-3 px-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <Fragment key={user.id}>
                        <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3 font-medium">
                            {user.email || <span className="text-muted-foreground italic">—</span>}
                          </td>
                          <td className="py-3 px-3">
                            {user.plan ? (
                              <Badge variant="outline" className="text-xs capitalize border-accent/40 text-accent">
                                {user.plan === "professional" ? "Professionnel" : "Expert"}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">Aucun</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={user.subscriptionStatus === "active" ? "default" : "secondary"}
                              className={`text-xs ${user.subscriptionStatus === "active" ? "bg-green-600 text-white" : ""}`}
                            >
                              {user.subscriptionStatus === "active" ? "Actif" : "Inactif"}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground text-xs">
                            {user.subscriptionExpiresAt
                              ? new Date(user.subscriptionExpiresAt).toLocaleDateString("fr-FR")
                              : "—"}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground text-xs">
                            {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(user)}
                                className="text-xs h-7"
                              >
                                Gérer abonnement
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteUser(user.id, user.email)}
                                className="w-7 h-7 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {editingUser === user.id && (
                          <tr className="bg-muted/20">
                            <td colSpan={6} className="px-3 py-4">
                              <div className="flex flex-wrap items-end gap-4 bg-card border border-border rounded-xl p-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-muted-foreground">Plan</label>
                                  <Select value={editPlan} onValueChange={setEditPlan}>
                                    <SelectTrigger className="w-52 h-9 text-sm">
                                      <SelectValue placeholder="Sélectionner un plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="professional">Professionnel — $49/mois</SelectItem>
                                      <SelectItem value="expert">Expert — $199/mois</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-muted-foreground">Statut</label>
                                  <Select value={editStatus} onValueChange={setEditStatus}>
                                    <SelectTrigger className="w-36 h-9 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">Actif</SelectItem>
                                      <SelectItem value="inactive">Inactif</SelectItem>
                                      <SelectItem value="cancelled">Annulé</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-muted-foreground">Expire le</label>
                                  <input
                                    type="date"
                                    value={editExpiry}
                                    onChange={(e) => setEditExpiry(e.target.value)}
                                    className="h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" className="h-9" onClick={() => saveSubscription(user.id)}>
                                    Enregistrer
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-9" onClick={() => setEditingUser(null)}>
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
