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
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [proposal, setProposal] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ['campaigns', category, search],
    queryFn: () => campaignAPI.getAll({ category: category !== 'all' ? category.toLowerCase() : undefined, search }),
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            <p>Error loading campaigns. Please try again later.</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No campaigns found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((campaign: any) => (
              <CampaignCard 
                key={campaign._id} 
                title={campaign.title}
                category={campaign.category}
                budget={`₹${campaign.budgetRange.min.toLocaleString()} - ₹${campaign.budgetRange.max.toLocaleString()}`}
                description={campaign.description}
                location={campaign.location?.city || 'Remote'}
                deadline={new Date(campaign.timeline.endDate).toLocaleDateString()}
                requirements={campaign.deliverables.map((d: any) => d.type)}
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
