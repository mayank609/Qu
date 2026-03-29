import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import NeonSearchBar from "@/components/NeonSearchBar";
import CampaignCard from "@/components/CampaignCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { campaignAPI, applicationAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import NeonButton from "@/components/NeonButton";

const ExploreCampaigns = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [budgetRange, setBudgetRange] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [proposal, setProposal] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ['campaigns', category, platform, budgetRange, urgency, search],
    queryFn: () => {
      const minBudget = budgetRange === '0-5000' ? 0 : budgetRange === '5000-15000' ? 5000 : budgetRange === '15000-50000' ? 15000 : budgetRange === '50000+' ? 50000 : undefined;
      const maxBudget = budgetRange === '0-5000' ? 5000 : budgetRange === '5000-15000' ? 15000 : budgetRange === '15000-50000' ? 50000 : undefined;
      
      return campaignAPI.getAll({ 
        category: category !== 'all' ? category.toLowerCase() : undefined, 
        platform: platform !== 'all' ? platform.toLowerCase() : undefined,
        urgency: urgency !== 'all' ? urgency.toLowerCase() : undefined,
        minBudget,
        maxBudget,
        search 
      });
    },
  });

  const campaigns = data?.data?.data || [];

  const applyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => applicationAPI.apply(id, data),
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setSelectedCampaign(null);
      setProposal("");
      setOfferedPrice("");
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit application");
    }
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    applyMutation.mutate({
      id: selectedCampaign._id,
      data: {
        proposalMessage: proposal,
        customPrice: parseInt(offeredPrice) || selectedCampaign.budgetRange.min
      }
    });
  };

  return (
    <DashboardLayout userType="influencer">
      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Explore Campaigns</h1>
          <p className="text-muted-foreground">Find brand deals that match your style</p>
        </div>

        <NeonSearchBar placeholder="Search campaigns by title, brand, or category..." value={search} onChange={setSearch} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="food">Food & Cooking</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="health">Health & Wellness</SelectItem>
                <SelectItem value="beauty">Beauty & Skincare</SelectItem>
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
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Budget Range</Label>
            <Select value={budgetRange} onValueChange={setBudgetRange}>
              <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Any Budget" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Budget</SelectItem>
                <SelectItem value="0-5000">Below ₹5k</SelectItem>
                <SelectItem value="5000-15000">₹5k - ₹15k</SelectItem>
                <SelectItem value="15000-50000">₹15k - ₹50k</SelectItem>
                <SelectItem value="50000+">₹50k+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timeline / Urgency</Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="bg-muted/30 border-border"><SelectValue placeholder="Any Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Status</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High priority</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-glow-sm"></div>
            <p className="text-sm text-muted-foreground animate-pulse">Hunting for best brand deals...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 text-destructive bg-destructive/5 rounded-2xl border border-destructive/10">
            <p className="font-bold">Oops! Connection error.</p>
            <p className="text-sm opacity-80">We couldn't reach our marketplace servers.</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
            <p className="text-lg font-semibold">No campaigns found matching your criteria.</p>
            <p className="text-sm">Try exploring other categories or clearing filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 animate-slide-up">
            {campaigns.map((campaign: any) => (
              <CampaignCard 
                key={campaign._id} 
                title={campaign.title}
                brandName={campaign.brand?.name || "Premium Brand"}
                category={campaign.category}
                platform={campaign.platform}
                budget={`₹${campaign.budgetRange.min.toLocaleString()} - ₹${campaign.budgetRange.max.toLocaleString()}`}
                description={campaign.description}
                location={campaign.location?.city || 'Remote'}
                deadline={new Date(campaign.timeline.endDate).toLocaleDateString()}
                requirements={campaign.deliverables.map((d: any) => d.description || d.type)}
                urgency={campaign.urgency || "medium"}
                onApply={() => setSelectedCampaign(campaign)} 
              />
            ))}
          </div>
        )}

        <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
          <DialogContent className="sm:max-w-[500px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Apply to Campaign</DialogTitle>
              <DialogDescription>
                {selectedCampaign?.title} by {selectedCampaign?.brand?.name || 'Brand'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleApply} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Your Proposal *</Label>
                <Textarea 
                  placeholder="Tell the brand why you're a good fit..." 
                  value={proposal}
                  onChange={e => setProposal(e.target.value)}
                  required
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Your Price Quote (₹) *</Label>
                <Input 
                  type="number"
                  placeholder={selectedCampaign?.budgetRange?.min?.toString()}
                  value={offeredPrice}
                  onChange={e => setOfferedPrice(e.target.value)}
                  required
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Budget range: ₹{selectedCampaign?.budgetRange?.min?.toLocaleString()} - ₹{selectedCampaign?.budgetRange?.max?.toLocaleString()}
                </p>
              </div>
              <DialogFooter className="pt-4">
                <NeonButton 
                  type="submit" 
                  neonVariant="primary" 
                  className="w-full"
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                </NeonButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ExploreCampaigns;
