import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, Bookmark, Camera } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { influencerAPI } from "@/lib/api";

import { useQuery, useMutation } from "@tanstack/react-query";

const InfluencerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser, isLoading: authLoading } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: dashboardData, isLoading: dashLoading } = useQuery({
    queryKey: ['influencer-dashboard'],
    queryFn: async () => {
      const res = await influencerAPI.getDashboard();
      return res.data.data;
    },
    enabled: !!user && user.role === 'influencer',
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
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
    { label: "Applications", value: dashboard?.totalApplications?.toString() || "0", icon: MessageSquare },
    { label: "Accepted", value: dashboard?.acceptedCampaigns?.toString() || "0", icon: Bookmark },
    { label: "Profile views", value: dashboard?.profileViews?.toString() || "0", icon: Eye },
  ];

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => influencerAPI.updateProfile(data),
    onSuccess: (res) => {
      toast.success("Profile photo updated!");
      setAvatarPreview(null);
      if (res.data.data.avatar || res.data.data.user?.avatar) {
        updateUser({ avatar: res.data.data.avatar || res.data.data.user?.avatar });
      }
    },
    onError: () => toast.error("Failed to update photo")
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        updateProfileMutation.mutate({ avatar: base64String });
      };
      reader.readAsDataURL(file);
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
                ) : user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
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
              </div>
              <div className="flex flex-wrap gap-3">
                <NeonButton neonVariant="primary" onClick={() => navigate("/my-profile")}>Edit Profile</NeonButton>
                <NeonButton neonVariant="outline" onClick={() => toast.success("Profile link copied!")}>Share Profile</NeonButton>
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
            {/* Analytics section removed */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InfluencerDashboard;
