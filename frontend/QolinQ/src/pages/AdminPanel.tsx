import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Users, Building2, Search, UserCheck, UserX, TrendingUp, Lock, MapPin, Globe, ExternalLink } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/* ─── Inline admin login ─── */
const AdminLogin = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      toast.error("Invalid credentials or not an admin account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm bg-card border-border p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-sm text-muted-foreground">Sign in with your admin account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-muted/30 border-border" />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-muted/30 border-border" />
          <NeonButton neonVariant="primary" type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </NeonButton>
        </form>
        <p className="text-xs text-muted-foreground text-center">
          Run <code className="bg-muted px-1 rounded">node scripts/createAdmin.js</code> to create an admin account.
        </p>
      </Card>
    </div>
  );
};

/* ─── User Detail Dialog ─── */
const UserDetailDialog = ({ userId, role, open, onClose }: { userId: string; role: string; open: boolean; onClose: () => void }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => adminAPI.getUserById(userId),
    enabled: open && !!userId,
  });

  const user = data?.data?.data;
  const profile = user?.profile;

  const statusColor: Record<string, string> = {
    verified: "bg-green-500/15 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    flagged: "bg-red-500/15 text-red-400 border-red-500/30",
    unverified: "bg-muted text-muted-foreground border-border",
  };

  const fmtNum = (n: number) => n > 1000000 ? `${(n / 1000000).toFixed(1)}M` : n > 1000 ? `${(n / 1000).toFixed(1)}K` : String(n || 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold capitalize">{role} Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : !user ? (
          <p className="text-center py-8 text-muted-foreground">Could not load profile.</p>
        ) : (
          <div className="space-y-5 pt-1">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary shrink-0 overflow-hidden">
                {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-lg truncate">{user.name}</p>
                  {user.trustBadge && <ShieldCheck className="w-4 h-4 text-primary shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusColor[user.verificationStatus] || statusColor.unverified}`}>
                    {user.verificationStatus}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Influencer profile */}
            {role === "influencer" && profile && (
              <>
                {profile.bio && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Bio</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Followers", value: fmtNum(profile.totalFollowers) },
                    { label: "Campaigns", value: profile.completedCampaigns ?? 0 },
                    { label: "Earnings", value: profile.totalEarnings ? `₹${profile.totalEarnings.toLocaleString()}` : "—" },
                  ].map((s) => (
                    <Card key={s.label} className="bg-muted/30 border-border p-3 text-center">
                      <p className="text-xs font-bold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </Card>
                  ))}
                </div>

                {/* Price */}
                {(profile.priceExpectation?.min > 0 || profile.priceExpectation?.max > 0) && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Price Range</p>
                    <p className="text-sm">₹{profile.priceExpectation.min?.toLocaleString()} – ₹{profile.priceExpectation.max?.toLocaleString()}</p>
                  </div>
                )}

                {/* Categories */}
                {profile.categories?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.categories.map((c: string) => (
                        <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Platforms */}
                {profile.platforms && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Platforms</p>
                    <div className="space-y-1.5">
                      {[
                        { key: "instagram", label: "Instagram", count: profile.platforms.instagram?.followers, handle: profile.platforms.instagram?.handle },
                        { key: "youtube", label: "YouTube", count: profile.platforms.youtube?.subscribers, handle: profile.platforms.youtube?.handle },
                        { key: "facebook", label: "Facebook", count: profile.platforms.facebook?.followers, handle: profile.platforms.facebook?.handle },
                        { key: "tiktok", label: "TikTok", count: profile.platforms.tiktok?.followers, handle: profile.platforms.tiktok?.handle },
                        { key: "twitter", label: "Twitter / X", count: profile.platforms.twitter?.followers, handle: profile.platforms.twitter?.handle },
                        { key: "linkedin", label: "LinkedIn", count: profile.platforms.linkedin?.connections, handle: profile.platforms.linkedin?.handle },
                      ]
                        .filter((p) => p.handle || p.count > 0)
                        .map((p) => (
                          <div key={p.key} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                            <span className="text-sm font-medium">{p.label}</span>
                            <div className="text-right">
                              {p.handle && <p className="text-xs text-muted-foreground">@{p.handle}</p>}
                              {p.count > 0 && <p className="text-xs font-semibold">{fmtNum(p.count)}</p>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                {(profile.location?.city || profile.location?.country) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{[profile.location.city, profile.location.state, profile.location.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}

                {/* Languages */}
                {profile.languages?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Languages</p>
                    <p className="text-sm">{profile.languages.join(", ")}</p>
                  </div>
                )}

                {/* Portfolio */}
                {profile.portfolioLinks?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Portfolio</p>
                    <div className="space-y-1">
                      {profile.portfolioLinks.map((link: any, i: number) => (
                        <a key={i} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          {link.title || link.url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Brand profile */}
            {role === "brand" && profile && (
              <>
                {profile.companyName && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Company</p>
                    <p className="text-sm font-semibold">{profile.companyName}</p>
                  </div>
                )}

                {profile.description && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">About</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{profile.description}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Campaigns", value: profile.totalCampaigns ?? 0 },
                    { label: "Total Spent", value: profile.totalSpent ? `₹${profile.totalSpent.toLocaleString()}` : "—" },
                  ].map((s) => (
                    <Card key={s.label} className="bg-muted/30 border-border p-3 text-center">
                      <p className="text-xs font-bold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </Card>
                  ))}
                </div>

                {/* Budget preference */}
                {(profile.budgetRangePreference?.min > 0 || profile.budgetRangePreference?.max > 0) && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Budget Preference</p>
                    <p className="text-sm">₹{profile.budgetRangePreference.min?.toLocaleString()} – ₹{profile.budgetRangePreference.max?.toLocaleString()}</p>
                  </div>
                )}

                {/* Categories */}
                {profile.categories?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.categories.map((c: string) => (
                        <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Website */}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    {profile.website}
                  </a>
                )}

                {/* Location */}
                {(profile.location?.city || profile.location?.country) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{[profile.location.city, profile.location.state, profile.location.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}

                {/* Business proof */}
                {profile.businessProof?.url && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Business Proof</p>
                    <div className="flex items-center gap-2">
                      <a href={profile.businessProof.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> View document
                      </a>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${profile.businessProof.verified ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-muted text-muted-foreground border-border"}`}>
                        {profile.businessProof.verified ? "Verified" : "Not verified"}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {!profile && (
              <p className="text-sm text-muted-foreground text-center py-4">No profile data found for this user.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ─── Main panel ─── */
const AdminPanel = () => {
  const { user: currentUser, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return <AdminLogin />;
  }

  return <AdminPanelContent />;
};

const AdminPanelContent = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"influencer" | "brand">("influencer");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const { data: statsRes } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminAPI.getStats(),
  });
  const stats = statsRes?.data?.data;

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ["admin-users", tab, debouncedSearch, page],
    queryFn: () => adminAPI.getUsers({ role: tab, search: debouncedSearch || undefined, page, limit: 20 }),
  });
  const users = usersRes?.data?.data || [];
  const pagination = usersRes?.data?.pagination;

  const verifyMutation = useMutation({
    mutationFn: ({ userId, trustBadge, verificationStatus }: { userId: string; trustBadge?: boolean; verificationStatus?: string }) =>
      adminAPI.verifyUser(userId, { trustBadge, verificationStatus }),
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Failed to update user"),
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    clearTimeout((window as any)._adminSearchTimer);
    (window as any)._adminSearchTimer = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const statusColor: Record<string, string> = {
    verified: "bg-green-500/15 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    flagged: "bg-red-500/15 text-red-400 border-red-500/30",
    unverified: "bg-muted text-muted-foreground border-border",
  };

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Admin Panel</h1>
          <p className="text-muted-foreground">Manage all influencers and brands on the platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-primary" },
            { label: "Influencers", value: stats?.influencers ?? "—", icon: TrendingUp, color: "text-purple-400" },
            { label: "Brands", value: stats?.brands ?? "—", icon: Building2, color: "text-blue-400" },
            { label: "Verified Rate", value: stats?.verifiedRate ?? "—", icon: ShieldCheck, color: "text-green-400" },
          ].map((s) => (
            <Card key={s.label} className="bg-card/50 border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["influencer", "brand"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              {t}s
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${tab}s by name or email...`}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-muted/30 border-border"
          />
        </div>

        {/* User list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No {tab}s found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user: any) => (
              <Card
                key={user._id}
                className="bg-card border-border p-4 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setDetailUserId(user._id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0 overflow-hidden">
                      {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="font-semibold truncate">{user.name}</p>
                        {user.trustBadge && <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusColor[user.verificationStatus] || statusColor.unverified}`}>
                          {user.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {tab === "influencer" && user.profile && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {user.profile.niche || user.profile.categories?.[0] || "—"} • {user.profile.totalFollowers?.toLocaleString() || 0} followers • {user.profile.location?.city || "—"}
                        </p>
                      )}
                      {tab === "brand" && user.profile && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {user.profile.companyName || "—"} • {user.profile.totalCampaigns || 0} campaigns • {user.profile.location?.city || "—"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {user.verificationStatus !== "verified" && (
                      <NeonButton neonVariant="primary" className="h-8 px-3 text-xs"
                        onClick={() => verifyMutation.mutate({ userId: user._id, verificationStatus: "verified", trustBadge: true })}
                        disabled={verifyMutation.isPending}>
                        <UserCheck className="w-3.5 h-3.5 mr-1" /> Verify
                      </NeonButton>
                    )}
                    {user.verificationStatus !== "flagged" && (
                      <NeonButton neonVariant="ghost" className="h-8 px-3 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => verifyMutation.mutate({ userId: user._id, verificationStatus: "flagged" })}
                        disabled={verifyMutation.isPending}>
                        <UserX className="w-3.5 h-3.5 mr-1" /> Flag
                      </NeonButton>
                    )}
                    {user.verificationStatus !== "unverified" && (
                      <NeonButton neonVariant="ghost" className="h-8 px-3 text-xs"
                        onClick={() => verifyMutation.mutate({ userId: user._id, verificationStatus: "unverified", trustBadge: false })}
                        disabled={verifyMutation.isPending}>
                        Reset
                      </NeonButton>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <NeonButton neonVariant="ghost" className="h-8 px-4 text-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage}>
              Previous
            </NeonButton>
            <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
            <NeonButton neonVariant="ghost" className="h-8 px-4 text-sm"
              onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage}>
              Next
            </NeonButton>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detailUserId && (
        <UserDetailDialog
          userId={detailUserId}
          role={tab}
          open={!!detailUserId}
          onClose={() => setDetailUserId(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminPanel;
