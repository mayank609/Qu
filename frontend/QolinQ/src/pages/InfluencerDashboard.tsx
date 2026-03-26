import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, Bookmark, TrendingUp, ShieldCheck, Camera } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { influencerAPI } from "@/lib/api";

import { useQuery } from "@tanstack/react-query";

const InfluencerDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: dashboardData, isLoading: dashLoading } = useQuery({
    queryKey: ['influencer-dashboard'],
    queryFn: async () => {
      const res = await influencerAPI.getDashboard();
      return res.data.data;
    },
    enabled: !!user && user.role === 'influencer',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['influencer-profile'],
    queryFn: async () => {
      const res = await influencerAPI.getProfile();
      return res.data.data;
    },
    enabled: !!user && user.role === 'influencer',
    staleTime: 5 * 60 * 1000,
  });

  const loading = authLoading || dashLoading || profileLoading;

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'influencer')) {
      navigate(user?.role === 'brand' ? "/brand/dashboard" : "/influencer/login");
    }
  }, [user, authLoading, navigate]);

  const dashboard = dashboardData;
  const profile = profileData;

  const stats = [
    { label: "Profile Views", value: dashboard?.profileViews?.toLocaleString() || "0", icon: Eye },
    { label: "Applications", value: dashboard?.totalApplications?.toString() || "0", icon: MessageSquare },
    { label: "Accepted", value: dashboard?.acceptedCampaigns?.toString() || "0", icon: Bookmark },
    { label: "Rating", value: dashboard?.rating?.average || "N/A", icon: TrendingUp },
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      toast.success("Profile photo updated!");
    }
  };

  return (
    <DashboardLayout userType="influencer">
      <div className="p-6 space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || "superstar"}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          {stats.map((stat, idx) => (
            <Card key={idx} className="bg-card border border-border p-5 hover-lift">
              <stat.icon className="w-5 h-5 text-primary mb-3" />
              <div className="text-2xl font-bold">{loading ? "..." : stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>

        <Card className="bg-card border border-border p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <label className="relative cursor-pointer group shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || "A"
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Camera className="w-3 h-3 text-primary-foreground" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{user?.name || "User"}</h2>
              <p className="text-sm text-muted-foreground mb-3">{profile?.bio || "Complete your profile to attract brands"}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile?.categories?.map((c: string) => (
                  <Badge key={c} variant="secondary" className="capitalize">{c}</Badge>
                ))}
                {profile?.totalFollowers > 0 && <Badge variant="secondary">{profile.totalFollowers.toLocaleString()} followers</Badge>}
                {dashboard?.totalEarnings > 0 && <Badge variant="secondary">₹{dashboard.totalEarnings.toLocaleString()} earned</Badge>}
              </div>
              <div className="flex flex-wrap gap-3">
                <NeonButton neonVariant="primary" onClick={() => navigate("/my-profile")}>Edit Profile</NeonButton>
                <NeonButton neonVariant="outline" onClick={() => toast.success("Profile link copied!")}>Share Profile</NeonButton>
                <NeonButton neonVariant="secondary" onClick={() => toast.success("Verification request submitted!")}>
                  <ShieldCheck className="w-4 h-4 mr-1" />Verify Profile
                </NeonButton>
              </div>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { title: "Browse Campaigns", desc: "Find new brand collaboration opportunities", cta: "Explore Now", path: "/explore/campaigns" },
              { title: "Applied Campaigns", desc: `${dashboard?.pendingApplications || 0} applications pending`, cta: "View Applied", path: "/applied-campaigns" },
              { title: "Check Messages", desc: "View your conversations with brands", cta: "View Chats", path: "/chat" },
            ].map((item, idx) => (
              <Card key={idx} className="bg-card border border-border p-5 hover-lift cursor-pointer" onClick={() => navigate(item.path)}>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                <NeonButton neonVariant="primary" className="w-full">{item.cta}</NeonButton>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card border border-border p-6 overflow-hidden relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Profile Analytics</h2>
                <Badge variant="outline" className="border-primary/30 text-primary">Last 30 Days</Badge>
              </div>
              <div className="space-y-6">
                 {[
                   { label: "Engagement Rate", val: dashboard?.rating?.average ? (dashboard?.rating?.average * 1.5).toFixed(1) + "%" : "4.2%", trend: "+0.5%" },
                   { label: "Avg. Likes per Post", val: "1.2k", trend: "+12%" },
                   { label: "Reach", val: "45.2k", trend: "+5.1%" },
                   { label: "Top Audience", val: "India (82%)", trend: "Stable" },
                 ].map((metric, i) => (
                   <div key={metric.label} className="flex items-center justify-between animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      <div className="text-right">
                        <div className="font-bold">{metric.val}</div>
                        <div className="text-[10px] text-green-500 font-medium">{metric.trend}</div>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="mt-8 pt-6 border-t border-border/50">
                 <div className="text-xs text-muted-foreground mb-1">Growth Index</div>
                 <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[75%] shadow-glow-sm"></div>
                 </div>
              </div>
            </Card>

            <Card className="bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Earnings Overview</h2>
                <Badge variant="outline" className="border-green-500/30 text-green-500">Live Escrow</Badge>
              </div>
              <div className="text-4xl font-bold mb-2">₹{dashboard?.totalEarnings?.toLocaleString() || "0"}</div>
              <p className="text-sm text-muted-foreground mb-8">Total verified earnings across all campaigns</p>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                    <div className="text-sm">In Escrow (Locked)</div>
                    <div className="font-bold text-green-500">₹12,500</div>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                    <div className="text-sm">Pending Approval</div>
                    <div className="font-bold text-yellow-500">₹4,000</div>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-sm">Available for Payout</div>
                    <div className="font-bold">₹0</div>
                 </div>
              </div>

              <NeonButton neonVariant="primary" className="w-full mt-6" disabled>Withdraw Earnings</NeonButton>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InfluencerDashboard;
