import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Bookmark, ShieldCheck, Edit, Share2, Instagram, Youtube } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { influencerAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const MyProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['influencer-dashboard'],
    queryFn: () => influencerAPI.getDashboard(),
  });

  const profile = data?.data?.data?.influencer || {};
  const stats = data?.data?.data?.stats || {};

  if (isLoading) {
    return (
      <DashboardLayout userType="influencer">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="influencer">
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">My Profile</h1>
          <p className="text-muted-foreground">View and manage your influencer listing</p>
        </div>

        <Card className="bg-card border border-border p-6 shadow-glow">
          <div className="flex flex-col md:flex-row items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border border-primary/20">
              {profile.name?.charAt(0) || user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{profile.name || user?.name}</h2>
                <Badge variant="secondary" className="text-xs capitalize">{profile.category || "Influencer"}</Badge>
                {profile.isVerified && <ShieldCheck className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{profile.bio || "No bio added yet."}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-primary" />
                  <span>{profile.socialMedia?.instagram?.followers?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-primary" />
                  <span>{profile.socialMedia?.youtube?.subscribers?.toLocaleString() || "0"}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {profile.categories?.map((cat: string) => (
                  <Badge key={cat} variant="outline" className="capitalize">{cat}</Badge>
                ))}
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                <span>📍 {profile.location?.city || "Remote"}, {profile.location?.country || "India"}</span>
                <span>·</span>
                <span className="text-primary font-semibold">₹{profile.priceExpectation?.toLocaleString() || "N/A"} / post</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <NeonButton neonVariant="primary" onClick={() => navigate("/settings")}>
                  <Edit className="w-4 h-4 mr-1" />Edit Profile
                </NeonButton>
                <NeonButton neonVariant="outline" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Profile link copied!");
                }}>
                  <Share2 className="w-4 h-4 mr-1" />Share
                </NeonButton>
                {!profile.isVerified && (
                  <NeonButton neonVariant="secondary" onClick={() => toast.success("Verification request submitted!")}>
                    <ShieldCheck className="w-4 h-4 mr-1" />Verify Profile
                  </NeonButton>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border border-border p-5 text-center hover:border-primary/50 transition-colors">
            <Eye className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground">Profile Views</p>
          </Card>
          <Card className="bg-card border border-border p-5 text-center hover:border-primary/50 transition-colors">
            <Bookmark className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.applicationsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Applications</p>
          </Card>
          <Card className="bg-card border border-border p-5 text-center hover:border-primary/50 transition-colors">
            <ShieldCheck className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">₹{stats.totalEarnings?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </Card>
        </div>

        <Card className="bg-card border border-border p-6">
          <h3 className="font-bold mb-3">Portfolio Links</h3>
          <div className="space-y-2">
            {profile.socialMedia?.instagram?.handle ? (
              <a href={`https://instagram.com/${profile.socialMedia.instagram.handle}`} target="_blank" className="block text-sm text-primary hover:underline">
                https://instagram.com/{profile.socialMedia.instagram.handle}
              </a>
            ) : (
                <p className="text-sm text-muted-foreground italic">No portfolio links added yet.</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyProfile;
