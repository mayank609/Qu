import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import NeonSearchBar from "@/components/NeonSearchBar";
import InfluencerCard from "@/components/InfluencerCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { searchAPI, messageAPI, brandAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES } from "@/constants/categories";

const ExploreInfluencers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const platform = searchParams.get("platform") || "all";
  const priceRange = searchParams.get("priceRange") || "all";
  const reach = searchParams.get("reach") || "all";
  const sort = searchParams.get("sort") || "followers";

  const setParam = (key: string, value: string, defaultValue: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value === defaultValue) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    }, { replace: true });
  };

  const setSearch = (value: string) => setParam("search", value, "");
  const setCategory = (value: string) => setParam("category", value, "all");
  const setPlatform = (value: string) => setParam("platform", value, "all");
  const setPriceRange = (value: string) => setParam("priceRange", value, "all");
  const setReach = (value: string) => setParam("reach", value, "all");
  const setSort = (value: string) => setParam("sort", value, "followers");

  const startConvMutation = useMutation({
    mutationFn: (data: { participantId: string, campaignId?: string }) => 
      messageAPI.startConversation(data),
    onSuccess: (res) => {
      navigate(`/chat?id=${res.data.data._id}`);
    },
    onError: () => {
      toast.error("Can't message directly. Please shortlist the influencer first.");
    }
  });

  const SORT_OPTIONS: Record<string, string> = {
    followers: '-totalFollowers',
    price_asc: 'priceExpectation.min',
    price_desc: '-priceExpectation.min',
    newest: '-createdAt',
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['influencers', category, platform, priceRange, reach, search, sort],
    queryFn: () => {
      const minPrice = priceRange === '0-5000' ? 0 : priceRange === '5000-15000' ? 5000 : priceRange === '15000-50000' ? 15000 : priceRange === '50000+' ? 50000 : undefined;
      const maxPrice = priceRange === '0-5000' ? 5000 : priceRange === '5000-15000' ? 15000 : priceRange === '15000-50000' ? 50000 : undefined;

      const minFollowers = reach === '0-10k' ? 0 : reach === '10k-50k' ? 10000 : reach === '50k-100k' ? 50000 : reach === '100k+' ? 100000 : undefined;
      const maxFollowers = reach === '0-10k' ? 10000 : reach === '10k-50k' ? 50000 : reach === '50k-100k' ? 100000 : undefined;

      return searchAPI.influencers({
        categories: category !== 'all' ? category : undefined,
        platform: platform !== 'all' ? platform.toLowerCase() : undefined,
        minPrice,
        maxPrice,
        minFollowers,
        maxFollowers,
        search,
        sort: SORT_OPTIONS[sort],
      });
    },
  });
  
  const { data: brandProfileRes } = useQuery({
    queryKey: ['brand-profile'],
    queryFn: () => brandAPI.getProfile(),
    enabled: currentUser?.role === 'brand',
  });

  const toggleSaveMutation = useMutation({
    mutationFn: (id: string) => brandAPI.toggleSaveInfluencer(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['brand-profile'] });
      queryClient.invalidateQueries({ queryKey: ['saved-influencers'] });
      toast.success(res.data.message);
    },
    onError: () => toast.error("Failed to update saved status")
  });

  const influencers = data?.data?.data || [];
  const savedInfluencerIds = brandProfileRes?.data?.data?.savedInfluencers || [];

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Explore Influencers</h1>
          <p className="text-muted-foreground">Find the perfect creator for your brand</p>
        </div>

        <NeonSearchBar placeholder="Search by name, niche, or platform..." value={search} onChange={setSearch} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
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
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
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

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sort By</Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="followers">Most Followers</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
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
                id={profile.user?._id || profile.user}
                name={profile.user?.name || 'Influencer'}
                bio={profile.bio}
                category={profile.categories?.[0] || 'Uncategorized'}
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
                isSaved={savedInfluencerIds.includes(profile.user?._id || profile.user)}
                onToggleSave={() => toggleSaveMutation.mutate(profile.user?._id || profile.user)}
                onContact={() => startConvMutation.mutate({ participantId: profile.user?._id || profile.user })}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExploreInfluencers;
