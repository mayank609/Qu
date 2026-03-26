import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import NeonSearchBar from "@/components/NeonSearchBar";
import InfluencerCard from "@/components/InfluencerCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { searchAPI, messageAPI } from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";

const ExploreInfluencers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const startConvMutation = useMutation({
    mutationFn: (data: { participantId: string, campaignId?: string }) => 
      messageAPI.startConversation(data.participantId, data.campaignId),
    onSuccess: (res) => {
      navigate(`/chat?id=${res.data.data._id}`);
    },
    onError: () => {
      toast.error("Failed to start conversation");
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['influencers', category, search],
    queryFn: () => searchAPI.influencers({ category: category !== 'all' ? category.toLowerCase() : undefined, search }),
  });

  const influencers = data?.data?.data || [];

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Explore Influencers</h1>
          <p className="text-muted-foreground">Find the perfect creator for your brand</p>
        </div>

        <NeonSearchBar placeholder="Search by name, niche, or platform..." value={search} onChange={setSearch} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={`All Categories`} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="food">Food</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p>Error loading influencers. Please try again later.</p>
          </div>
        ) : influencers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No influencers found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencers.map((profile: any) => (
              <InfluencerCard 
                key={profile._id} 
                name={profile.user?.name || 'Influencer'}
                bio={profile.bio}
                category={profile.categories?.[0] || 'Uncategorized'}
                followers={[
                  { platform: "Instagram", count: profile.platforms?.instagram?.followers > 1000 ? `${(profile.platforms.instagram.followers/1000).toFixed(1)}K` : profile.platforms?.instagram?.followers || 0 },
                  { platform: "YouTube", count: profile.platforms?.youtube?.subscribers > 1000 ? `${(profile.platforms.youtube.subscribers/1000).toFixed(1)}K` : profile.platforms?.youtube?.subscribers || 0 }
                ]}
                price={`₹${profile.priceExpectation?.min?.toLocaleString()} - ₹${profile.priceExpectation?.max?.toLocaleString()}`}
                location={profile.location?.city || 'India'}
                contentTypes={profile.categories || []}
                onContact={() => startConvMutation.mutate({ participantId: profile.user?._id })} 
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExploreInfluencers;
