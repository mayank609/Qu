import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import InfluencerCard from "@/components/InfluencerCard";
import { toast } from "sonner";
import { brandAPI, messageAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Search } from "lucide-react";
import NeonButton from "@/components/NeonButton";

const SavedProfiles = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['saved-influencers'],
    queryFn: () => brandAPI.getSavedInfluencers(),
  });

  const toggleSaveMutation = useMutation({
    mutationFn: (id: string) => brandAPI.toggleSaveInfluencer(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['saved-influencers'] });
      queryClient.invalidateQueries({ queryKey: ['brand-profile'] });
      toast.success(res.data.message);
    },
    onError: () => toast.error("Failed to update saved status")
  });

  const startConvMutation = useMutation({
    mutationFn: (data: { participantId: string }) => messageAPI.startConversation(data),
    onSuccess: (res) => {
      navigate(`/chat?id=${res.data.data._id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to start conversation");
    }
  });

  const savedInfluencers = data?.data?.data || [];

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-6">
        <div className="animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-1">Saved Profiles</h1>
            <p className="text-muted-foreground">Influencers you've bookmarked for your upcoming campaigns</p>
          </div>
          <NeonButton neonVariant="outline" onClick={() => navigate("/explore/influencers")}>
             <Search className="w-4 h-4 mr-2" /> Find More Influencers
          </NeonButton>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
           <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
              <p className="text-destructive font-semibold">Error loading saved profiles. Please try again.</p>
           </div>
        ) : savedInfluencers.length === 0 ? (
          <div className="text-center py-24 bg-card border border-border rounded-2xl shadow-glow-sm">
            <Bookmark className="w-16 h-16 mx-auto mb-6 text-muted-foreground/20" />
            <h3 className="text-xl font-bold mb-2">No saved profiles yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Browse through our curated list of influencers and bookmark the ones that fit your brand.</p>
            <NeonButton neonVariant="primary" onClick={() => navigate("/explore/influencers")}>
                Start Exploring
            </NeonButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedInfluencers.map((profile: any) => (
              <div 
                key={profile._id} 
                className="cursor-pointer" 
                onClick={() => navigate(`/influencer/${profile.user?._id}`)}
              >
                <InfluencerCard 
                  id={profile.user?._id || profile.user}
                  name={profile.user?.name || 'Influencer'}
                  bio={profile.bio || "No bio provided"}
                  category={profile.categories?.[0] || 'Influencer'}
                  followers={[
                    ...(profile.platforms?.instagram?.connected || profile.platforms?.instagram?.handle ? [{ platform: "Instagram", count: profile.platforms.instagram.followers > 1000 ? `${(profile.platforms.instagram.followers/1000).toFixed(1)}K` : `${profile.platforms.instagram.followers || 0}` }] : []),
                    ...(profile.platforms?.youtube?.connected || profile.platforms?.youtube?.handle ? [{ platform: "YouTube", count: profile.platforms.youtube.subscribers > 1000 ? `${(profile.platforms.youtube.subscribers/1000).toFixed(1)}K` : `${profile.platforms.youtube.subscribers || 0}` }] : []),
                    ...(profile.platforms?.facebook?.connected || profile.platforms?.facebook?.handle ? [{ platform: "Facebook", count: profile.platforms.facebook.followers > 1000 ? `${(profile.platforms.facebook.followers/1000).toFixed(1)}K` : `${profile.platforms.facebook.followers || 0}` }] : []),
                    ...(profile.platforms?.twitter?.connected || profile.platforms?.twitter?.handle ? [{ platform: "Twitter", count: profile.platforms.twitter.followers > 1000 ? `${(profile.platforms.twitter.followers/1000).toFixed(1)}K` : `${profile.platforms.twitter.followers || 0}` }] : []),
                    ...(profile.platforms?.tiktok?.connected || profile.platforms?.tiktok?.handle ? [{ platform: "TikTok", count: profile.platforms.tiktok.followers > 1000 ? `${(profile.platforms.tiktok.followers/1000).toFixed(1)}K` : `${profile.platforms.tiktok.followers || 0}` }] : []),
                    ...(profile.platforms?.linkedin?.connected || profile.platforms?.linkedin?.handle ? [{ platform: "LinkedIn", count: profile.platforms.linkedin.connections > 1000 ? `${(profile.platforms.linkedin.connections/1000).toFixed(1)}K` : `${profile.platforms.linkedin.connections || 0}` }] : []),
                  ]}
                  price={`Starting ₹${profile.priceExpectation?.min?.toLocaleString() || 'N/A'}`}
                  location={profile.location?.city || 'India'}
                  image={profile.user?.avatar}
                  contentTypes={profile.categories?.slice(1) || []}
                  isSaved={true}
                  onToggleSave={() => toggleSaveMutation.mutate(profile.user?._id || profile.user)}
                  onContact={() => startConvMutation.mutate({ participantId: profile.user?._id || profile.user })}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedProfiles;
