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
  const [platform, setPlatform] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [reach, setReach] = useState("all");

  const startConvMutation = useMutation({
    mutationFn: (data: { participantId: string, campaignId?: string }) => 
      messageAPI.startConversation(data),
    onSuccess: (res) => {
      navigate(`/chat?id=${res.data.data._id}`);
    },
    onError: () => {
      toast.error("Failed to start conversation");
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['influencers', category, platform, priceRange, reach, search],
    queryFn: () => {
      const minPrice = priceRange === '0-5000' ? 0 : priceRange === '5000-15000' ? 5000 : priceRange === '15000-50000' ? 15000 : priceRange === '50000+' ? 50000 : undefined;
      const maxPrice = priceRange === '0-5000' ? 5000 : priceRange === '5000-15000' ? 15000 : priceRange === '15000-50000' ? 50000 : undefined;
      
      const minFollowers = reach === '0-10k' ? 0 : reach === '10k-50k' ? 10000 : reach === '50k-100k' ? 50000 : reach === '100k+' ? 100000 : undefined;
      const maxFollowers = reach === '0-10k' ? 10000 : reach === '10k-50k' ? 50000 : reach === '50k-100k' ? 100000 : undefined;

      return searchAPI.influencers({ 
        category: category !== 'all' ? category.toLowerCase() : undefined, 
        platform: platform !== 'all' ? platform.toLowerCase() : undefined,
        minPrice,
        maxPrice,
        minFollowers,
        maxFollowers,
        search 
      });
    },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="food">Food & Cooking</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="health">Health & Wellness</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="finance">Finance & Investing</SelectItem>
                <SelectItem value="parenting">Parenting & Family</SelectItem>
                <SelectItem value="automotive">Automobile</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="comedy">Comedy & Memes</SelectItem>
                <SelectItem value="motivation">Motivation</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="videography">Videography</SelectItem>
                <SelectItem value="decor">Home Decor</SelectItem>
                <SelectItem value="diy">DIY & Crafts</SelectItem>
                <SelectItem value="pets">Pets & Animals</SelectItem>
                <SelectItem value="music">Music & Singing</SelectItem>
                <SelectItem value="dance">Dance</SelectItem>
                <SelectItem value="art">Art & Illustration</SelectItem>
                <SelectItem value="spirituality">Spirituality</SelectItem>
                <SelectItem value="news">News & Politics</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Any Platform" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Platform</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Price Range</Label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Any Price" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="0-5000">Below ₹5k</SelectItem>
                <SelectItem value="5000-15000">₹5k - ₹15k</SelectItem>
                <SelectItem value="15000-50000">₹15k - ₹50k</SelectItem>
                <SelectItem value="50000+">₹50k+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Reach</Label>
            <Select value={reach} onValueChange={setReach}>
              <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Any Reach" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Reach</SelectItem>
                <SelectItem value="0-10k">Nano (Below 10k)</SelectItem>
                <SelectItem value="10k-50k">Micro (10k - 50k)</SelectItem>
                <SelectItem value="50k-100k">Mid (50k - 100k)</SelectItem>
                <SelectItem value="100k+">Macro (100k+)</SelectItem>
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
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExploreInfluencers;
