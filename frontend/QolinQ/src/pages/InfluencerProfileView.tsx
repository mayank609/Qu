import { useNavigate, useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import PublicLayout from "@/components/PublicLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Bookmark, ShieldCheck, Share2, Instagram, Youtube, MessageCircle, User, LogIn, Twitter, Facebook } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { influencerAPI, messageAPI } from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

// TikTok icon (not available in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.71a8.19 8.19 0 004.76 1.52V6.79a4.82 4.82 0 01-1-.1z"/>
  </svg>
);

// LinkedIn icon
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InfluencerProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const { data: profileRes, isLoading, error } = useQuery({
    queryKey: ['influencer-profile', id],
    queryFn: () => influencerAPI.getById(id!),
    enabled: !!id,
  });

  const startConvMutation = useMutation({
    mutationFn: (data: { participantId: string }) => messageAPI.startConversation(data),
    onSuccess: (res) => {
      navigate(`/chat?id=${res.data.data._id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to start conversation. Messaging is only allowed after application shortlisting.");
    }
  });

  const profile = profileRes?.data?.data || {};
  const isOwnProfile = currentUser?._id === profile.user?._id;

  const Layout = currentUser ? DashboardLayout : PublicLayout;
  const layoutProps = currentUser ? { userType: currentUser.role as "brand" | "influencer" } : {};

  if (isLoading) {
    return (
      <Layout {...(layoutProps as any)}>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error || !profile.user) {
    return (
      <Layout {...(layoutProps as any)}>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-6">The influencer profile you are looking for does not exist or has been removed.</p>
          <NeonButton neonVariant="primary" onClick={() => navigate(-1)}>Go Back</NeonButton>
        </div>
      </Layout>
    );
  }

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied to clipboard!");
  };

  return (
    <Layout {...(layoutProps as any)}>
      <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto pb-20">
        <div className="animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-1">Influencer Profile</h1>
            <p className="text-muted-foreground">Detailed view of the influencer's professional profile</p>
          </div>
          <NeonButton neonVariant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />Share Profile
          </NeonButton>
        </div>

        <Card className="bg-card border border-border p-5 md:p-8 shadow-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <User className="w-32 h-32" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 text-center md:text-left">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border-2 border-primary/20 overflow-hidden shadow-glow-sm">
              {profile.user?.avatar ? (
                <img src={profile.user?.avatar} alt={profile.user?.name} className="w-full h-full object-cover" />
              ) : (
                profile.user?.name?.charAt(0) || "U"
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl font-bold">{profile.user?.name}</h2>
                </div>
                <p className="text-lg text-primary font-medium">{profile.categories?.join(" • ") || "Content Creator"}</p>
              </div>

              <p className="text-muted-foreground leading-relaxed italic">
                 "{profile.bio || "Crafting digital experiences and connecting with audiences worldwide."}"
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                {profile.platforms?.instagram?.connected && (
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    <span className="font-bold">{profile.platforms.instagram.followers?.toLocaleString() || "0"}</span>
                    <span className="text-muted-foreground text-[10px] uppercase">Followers</span>
                  </div>
                )}
                {profile.platforms?.youtube?.connected && (
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span className="font-bold">{profile.platforms.youtube.subscribers?.toLocaleString() || "0"}</span>
                    <span className="text-muted-foreground text-[10px] uppercase">Subscribers</span>
                  </div>
                )}
                {profile.platforms?.facebook?.connected && (
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border">
                    <Facebook className="w-4 h-4 text-blue-500" />
                    <span className="font-bold">{profile.platforms.facebook.followers?.toLocaleString() || "0"}</span>
                    <span className="text-muted-foreground text-[10px] uppercase">Followers</span>
                  </div>
                )}
                {profile.platforms?.twitter?.connected && (
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border">
                    <Twitter className="w-4 h-4 text-sky-500" />
                    <span className="font-bold">{profile.platforms.twitter.followers?.toLocaleString() || "0"}</span>
                    <span className="text-muted-foreground text-[10px] uppercase">Followers</span>
                  </div>
                )}
                {profile.platforms?.tiktok?.connected && (
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border">
                    <TikTokIcon className="w-4 h-4 text-foreground" />
                    <span className="font-bold">{profile.platforms.tiktok.followers?.toLocaleString() || "0"}</span>
                    <span className="text-muted-foreground text-[10px] uppercase">Followers</span>
                  </div>
                )}
                {profile.platforms?.linkedin?.connected && (
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border">
                    <LinkedInIcon className="w-4 h-4 text-blue-700" />
                    <span className="font-bold">{profile.platforms.linkedin.connections?.toLocaleString() || "0"}</span>
                    <span className="text-muted-foreground text-[10px] uppercase">Connections</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                {currentUser?.role === 'brand' && (
                  <NeonButton 
                    neonVariant="primary" 
                    className="w-full sm:w-auto px-8"
                    onClick={() => startConvMutation.mutate({ participantId: profile.user?._id })}
                    disabled={startConvMutation.isPending}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> Message Influencer
                  </NeonButton>
                )}
                {!currentUser && (
                  <Link to="/brand/login" className="w-full sm:w-auto">
                    <NeonButton neonVariant="primary" className="w-full px-8">
                      <LogIn className="w-4 h-4 mr-2" /> Login to Collaborate
                    </NeonButton>
                  </Link>
                )}
                {isOwnProfile && (
                  <NeonButton neonVariant="secondary" onClick={() => navigate("/settings")} className="w-full sm:w-auto">
                    Edit My Profile
                  </NeonButton>
                )}
                <div className="flex items-center gap-2 text-sm font-semibold ml-auto">
                   <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Rate Card:</span>
                   <span className="text-primary text-xl">₹{profile.priceExpectation?.min?.toLocaleString() || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="bg-card border border-border p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                 <Bookmark className="w-5 h-5 text-primary" /> Profile Links
              </h3>
              <div className="space-y-3">
                 {profile.portfolioLinks?.length > 0 ? (
                    profile.portfolioLinks.map((link: any, idx: number) => (
                       <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border hover:border-primary/50 transition-colors group">
                          <span className="text-sm font-medium truncate max-w-[200px]">{link.url}</span>
                          <Share2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                       </a>
                    ))
                 ) : (
                    <p className="text-sm text-muted-foreground italic">No profile links available.</p>
                 )}
              </div>
           </Card>

           <Card className="bg-card border border-border p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                 📍 Location & Details
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Base Location</span>
                    <span className="font-semibold">{profile.location?.city || "Remote"}, {profile.location?.country || "India"}</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Niche</span>
                    <span className="font-semibold capitalize">{profile.niche || "General Content"}</span>
                 </div>
              </div>
           </Card>
        </div>

        <Card className="bg-card border border-border p-6 md:p-8 shadow-glow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Best Content Gallery</h3>
            <Badge variant="outline" className="border-primary/30 text-primary">Featured Work</Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {profile.bestContent?.length > 0 ? (
                profile.bestContent.map((content: any, idx: number) => (
                    <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-border bg-muted/30 shadow-lg group relative">
                        {content.type === 'video' ? (
                            <video src={content.url} className="w-full h-full object-cover" controls />
                        ) : (
                            <img src={content.url} alt={`Featured work ${idx+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                           <span className="text-xs text-white font-medium uppercase tracking-widest">{content.type}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full py-16 text-center text-muted-foreground italic border-2 border-dashed border-border rounded-2xl bg-muted/5">
                    No featured content items added to the gallery yet.
                </div>
            )}
          </div>
        </Card>

        {!currentUser && (
            <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-4">
                <h3 className="text-2xl font-bold">Want to work with {profile.user?.name}?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Join Qolinq to message creators, post campaigns, and scale your brand with India's best influencers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                    <NeonButton neonVariant="primary" onClick={() => navigate("/register")} className="px-10">Sign Up Now</NeonButton>
                    <NeonButton neonVariant="outline" onClick={() => navigate("/brand/login")} className="px-10">I'm a Brand</NeonButton>
                </div>
            </div>
        )}
      </div>
    </Layout>
  );
};

export default InfluencerProfileView;
