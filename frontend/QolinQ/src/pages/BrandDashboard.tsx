import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, TrendingUp, Users, Instagram, Youtube, MapPin, Bookmark, ClipboardList } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { brandAPI, campaignAPI, searchAPI } from "@/lib/api";

const BrandDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [latestInfluencers, setLatestInfluencers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'brand')) {
      navigate(user?.role === 'influencer' ? "/influencer/dashboard" : "/brand/login");
      return;
    }

    const loadData = async () => {
      try {
        const [dashRes, campRes, infRes] = await Promise.all([
          brandAPI.getDashboard(),
          campaignAPI.getMyCampaigns({ limit: 3 }),
          searchAPI.influencers({ limit: 4 }),
        ]);
        setDashboard(dashRes.data.data);
        setCampaigns(campRes.data.data || []);
        setLatestInfluencers(infRes.data.data || []);
      } catch (err: unknown) {
        console.error("Dashboard load error:", err);
        if (err && typeof err === 'object' && 'response' in err && (err as any).response?.status === 403) {
          toast.error("Access denied. Please check your role.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'brand') loadData();
  }, [user, isLoading, navigate]);

  const stats = [
    { label: "Active Campaigns", value: dashboard?.activeCampaigns?.toString() || "0", icon: TrendingUp },
    { label: "Total Campaigns", value: dashboard?.totalCampaigns?.toString() || "0", icon: Eye },
    { label: "Applications", value: dashboard?.totalApplicationsReceived?.toString() || "0", icon: Users },
    { label: "Rating", value: dashboard?.rating?.average || "N/A", icon: MessageSquare },
  ];

  const PlatformIcon = ({ platform }: { platform: string }) => {
    if (platform === "Instagram" || platform === "instagram") return <Instagram className="w-3.5 h-3.5 text-primary" />;
    if (platform === "YouTube" || platform === "youtube") return <Youtube className="w-3.5 h-3.5 text-primary" />;
    return <TrendingUp className="w-3.5 h-3.5 text-primary" />;
  };

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Brand Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || "Manager"}</p>
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

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Active Campaigns</h2>
            <NeonButton neonVariant="primary" onClick={() => navigate("/create-listing")}>+ New Campaign</NeonButton>
          </div>
          <div className="space-y-3">
            {campaigns.length === 0 && !loading && (
              <Card className="bg-card border border-border p-8 text-center">
                <p className="text-muted-foreground mb-4">No campaigns yet. Create your first one!</p>
                <NeonButton neonVariant="primary" onClick={() => navigate("/create-listing")}>Create Campaign</NeonButton>
              </Card>
            )}
            {campaigns.map((campaign: any) => (
              <Card key={campaign._id} className="bg-card border border-border p-5 hover-lift">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{campaign.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>Budget: ₹{campaign.budgetRange?.min?.toLocaleString()} - ₹{campaign.budgetRange?.max?.toLocaleString()}</span>
                      <span>·</span>
                      <span>{campaign.applicationsCount} Applications</span>
                      <span>·</span>
                      <span className={campaign.status === "active" ? "text-primary capitalize" : "text-muted-foreground capitalize"}>{campaign.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <NeonButton neonVariant="primary" onClick={() => navigate("/applications")}>View Applications</NeonButton>
                    <NeonButton neonVariant="outline">Edit</NeonButton>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Latest Influencers</h2>
            <NeonButton neonVariant="outline" onClick={() => navigate("/explore/influencers")}>View All</NeonButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestInfluencers.map((inf: any) => (
              <Card key={inf._id} className="bg-card border border-border p-4 hover-lift">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {inf.user?.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{inf.user?.name || "Influencer"}</h4>
                    <Badge variant="secondary" className="text-[10px] capitalize">{inf.niche || inf.categories?.[0] || ""}</Badge>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span>{inf.totalFollowers?.toLocaleString() || 0} followers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{inf.location?.city || "Unknown"}{inf.location?.country ? `, ${inf.location.country}` : ""}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-sm font-semibold text-primary">₹{inf.priceExpectation?.min?.toLocaleString() || "N/A"}</span>
                  <button onClick={() => toast.success(`${inf.user?.name} saved!`)} className="text-muted-foreground hover:text-primary transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Find Influencers", desc: "Browse through our creator database", cta: "Explore Now", path: "/explore/influencers" },
              { title: "Review Applications", desc: `${dashboard?.totalApplicationsReceived || 0} applications pending review`, cta: "Review Now", path: "/applications" },
              { title: "Saved Profiles", desc: "View your bookmarked influencers", cta: "View Saved", path: "/saved-profiles" },
            ].map((item, idx) => (
              <Card key={idx} className="bg-card border border-border p-5 hover-lift cursor-pointer" onClick={() => navigate(item.path)}>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                <NeonButton neonVariant="primary" className="w-full">{item.cta}</NeonButton>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrandDashboard;
