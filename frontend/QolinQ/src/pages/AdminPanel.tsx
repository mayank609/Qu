import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, ShieldAlert, Users, Building2, Search, UserCheck, UserX, TrendingUp } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"influencer" | "brand">("influencer");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Redirect non-admins
  if (!authLoading && currentUser && currentUser.role !== "admin") {
    navigate("/");
  }

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
      toast.success("User updated successfully");
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
          <button
            onClick={() => { setTab("influencer"); setPage(1); }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tab === "influencer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            Influencers
          </button>
          <button
            onClick={() => { setTab("brand"); setPage(1); }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tab === "brand" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            Brands
          </button>
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

        {/* User List */}
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
              <Card key={user._id} className="bg-card border-border p-4 hover:border-primary/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0 overflow-hidden">
                      {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="font-semibold truncate">{user.name}</p>
                        {user.trustBadge && (
                          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusColor[user.verificationStatus] || statusColor.unverified}`}>
                          {user.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {tab === "influencer" && user.profile && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {user.profile.niche || user.profile.categories?.[0] || "—"} •{" "}
                          {user.profile.totalFollowers?.toLocaleString() || 0} followers •{" "}
                          {user.profile.location?.city || "—"}
                        </p>
                      )}
                      {tab === "brand" && user.profile && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {user.profile.companyName || "—"} •{" "}
                          {user.profile.totalCampaigns || 0} campaigns •{" "}
                          {user.profile.location?.city || "—"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {user.verificationStatus !== "verified" && (
                      <NeonButton
                        neonVariant="primary"
                        className="h-8 px-3 text-xs"
                        onClick={() => verifyMutation.mutate({ userId: user._id, verificationStatus: "verified", trustBadge: true })}
                        disabled={verifyMutation.isPending}
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1" /> Verify
                      </NeonButton>
                    )}
                    {user.verificationStatus !== "flagged" && (
                      <NeonButton
                        neonVariant="ghost"
                        className="h-8 px-3 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => verifyMutation.mutate({ userId: user._id, verificationStatus: "flagged" })}
                        disabled={verifyMutation.isPending}
                      >
                        <UserX className="w-3.5 h-3.5 mr-1" /> Flag
                      </NeonButton>
                    )}
                    {user.verificationStatus !== "unverified" && (
                      <NeonButton
                        neonVariant="ghost"
                        className="h-8 px-3 text-xs"
                        onClick={() => verifyMutation.mutate({ userId: user._id, verificationStatus: "unverified", trustBadge: false })}
                        disabled={verifyMutation.isPending}
                      >
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
            <NeonButton
              neonVariant="ghost"
              className="h-8 px-4 text-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </NeonButton>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <NeonButton
              neonVariant="ghost"
              className="h-8 px-4 text-sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </NeonButton>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
