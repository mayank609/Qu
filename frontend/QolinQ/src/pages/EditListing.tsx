import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { campaignAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    platform: [] as string[],
    budgetMin: "",
    budgetMax: "",
    location: "Remote",
    endDate: "",
    deliverables: "",
    imageUrl: "",
    otherCategory: ""
  });

  const { data: campaignRes, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignAPI.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (campaignRes?.data?.data) {
      const campaign = campaignRes.data.data;
      const categories = ["Gaming", "Lifestyle", "Travel", "Food & Cooking", "Tech", "Fitness", "Health & Wellness", "Education", "Finance & Investing", "Parenting & Family", "Automobile", "Entertainment", "Comedy & Memes", "Motivation", "Business", "Photography", "Videography", "Home Decor", "DIY & Crafts", "Pets & Animals", "Music & Singing", "Dance", "Art & Illustration", "Spirituality", "News & Politics"];
      
      const isOtherCategory = !categories.map(c => c.toLowerCase()).includes(campaign.category?.toLowerCase());

      setFormData({
        title: campaign.title || "",
        description: campaign.description || "",
        category: isOtherCategory ? "Other" : campaign.category || "",
        platform: Array.isArray(campaign.platform) ? campaign.platform : (campaign.platform ? [campaign.platform] : []),
        budgetMin: campaign.budgetRange?.min?.toString() || "",
        budgetMax: campaign.budgetRange?.max?.toString() || "",
        location: `${campaign.location?.city || ""}${campaign.location?.country ? `, ${campaign.location.country}` : ""}` || "Remote",
        endDate: campaign.timeline?.endDate ? new Date(campaign.timeline.endDate).toISOString().split('T')[0] : "",
        deliverables: campaign.deliverables?.map((d: any) => d.description).join('\n') || "",
        imageUrl: campaign.imageUrl || "",
        otherCategory: isOtherCategory ? campaign.category : ""
      });
    }
  }, [campaignRes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const finalCategory = formData.category === "Other" ? formData.otherCategory : formData.category;
      const payload = {
        title: formData.title,
        description: formData.description,
        category: finalCategory,
        platform: formData.platform,
        budgetRange: {
          min: parseInt(formData.budgetMin),
          max: parseInt(formData.budgetMax),
          currency: 'INR'
        },
        location: {
          city: formData.location.split(',')[0].trim(),
          country: formData.location.split(',')[1]?.trim() || 'India'
        },
        timeline: {
          endDate: new Date(formData.endDate)
        },
        imageUrl: formData.imageUrl,
        deliverables: formData.deliverables.split('\n').filter(d => d.trim()).map(d => ({
          type: 'post',
          description: d.trim()
        }))
      };

      await campaignAPI.update(id!, payload);
      toast.success("Campaign updated successfully!");
      navigate("/my-listings");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update campaign");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="brand">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Edit Campaign</h1>
          <p className="text-muted-foreground">Update your campaign listing details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="bg-card border border-border p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">1</span>
              Campaign Basics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label>Campaign Title *</Label>
                <Input 
                  placeholder="e.g. Summer Fashion Collection Launch" 
                  required 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="bg-muted/30"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Campaign Description *</Label>
                <Textarea 
                  placeholder="Describe your goals, what you are promoting, and overall vision..." 
                  className="min-h-[120px] bg-muted/30" 
                  required 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger className="bg-muted/30"><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    {["Gaming", "Lifestyle", "Travel", "Food & Cooking", "Tech", "Fitness", "Health & Wellness", "Education", "Finance & Investing", "Parenting & Family", "Automobile", "Entertainment", "Comedy & Memes", "Motivation", "Business", "Photography", "Videography", "Home Decor", "DIY & Crafts", "Pets & Animals", "Music & Singing", "Dance", "Art & Illustration", "Spirituality", "News & Politics", "Other"].map(c => (
                      <SelectItem key={c} value={c === "Other" ? "Other" : c.toLowerCase()}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.category === "Other" && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Input 
                      placeholder="Specify campaign niche..." 
                      value={formData.otherCategory} 
                      onChange={(e) => setFormData({ ...formData, otherCategory: e.target.value })}
                      className="bg-muted/30 border-primary/20"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="bg-card border border-border p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">2</span>
              Deliverables & Budget
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-4">
                <Label>Primary Platforms * (Select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'instagram_reel', label: 'Instagram Reel' },
                    { id: 'instagram_story', label: 'Instagram Story' },
                    { id: 'instagram_post', label: 'Instagram Post' },
                    { id: 'youtube_video', label: 'YouTube Video' },
                    { id: 'youtube_short', label: 'YouTube Shorts' },
                    { id: 'facebook_post', label: 'Facebook' },
                    { id: 'tiktok_video', label: 'TikTok' },
                    { id: 'linkedin_post', label: 'LinkedIn' },
                    { id: 'twitter_post', label: 'Twitter/X' },
                    { id: 'snapchat_spotlight', label: 'Snapchat' }
                  ].map((p) => {
                    const isSelected = formData.platform.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const newPlatforms = isSelected
                            ? formData.platform.filter(id => id !== p.id)
                            : [...formData.platform, p.id];
                          setFormData({ ...formData, platform: newPlatforms });
                        }}
                        className={cn(
                          "px-4 py-2 rounded-full text-xs font-semibold border transition-all",
                          isSelected 
                            ? "bg-primary text-primary-foreground border-primary shadow-glow-sm" 
                            : "bg-muted/30 text-muted-foreground border-border hover:border-primary/50"
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                {formData.platform.length === 0 && (
                  <p className="text-[10px] text-destructive">Please select at least one platform.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-muted/30 border-border h-10",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {formData.endDate ? format(new Date(formData.endDate), "PPP") : <span>Pick a deadline</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border shadow-elevated" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate ? new Date(formData.endDate) : undefined}
                      onSelect={(date) => setFormData({ ...formData, endDate: date ? date.toISOString() : "" })}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="bg-card"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2 text-primary">
                <Label>Min Budget (₹) *</Label>
                <Input 
                  type="number"
                  placeholder="5000" 
                  required 
                  value={formData.budgetMin}
                  onChange={e => setFormData({...formData, budgetMin: e.target.value})}
                  className="bg-muted/30 border-primary/20"
                />
              </div>
              <div className="space-y-2 text-primary">
                <Label>Max Budget (₹) *</Label>
                <Input 
                  type="number"
                  placeholder="10000" 
                  required 
                  value={formData.budgetMax}
                  onChange={e => setFormData({...formData, budgetMax: e.target.value})}
                  className="bg-muted/30 border-primary/20"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Deliverables Checklist (one per line) *</Label>
                <Textarea 
                  placeholder="e.g.&#10;1x Instagram Reel (30-60s)&#10;2x Story with Swipe-up Link&#10;Permanent Post on Feed" 
                  className="min-h-[100px] bg-muted/30"
                  required
                  value={formData.deliverables}
                  onChange={e => setFormData({...formData, deliverables: e.target.value})}
                />
              </div>
            </div>
          </Card>

          <Card className="bg-card border border-border p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">3</span>
              Campaign Media
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Cover Image URL</Label>
                <Input 
                  placeholder="Paste a high-quality image URL (e.g., Unsplash link)" 
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="bg-muted/30"
                />
              </div>
              
              {formData.imageUrl && (
                <div className="relative group rounded-xl overflow-hidden aspect-video bg-muted border border-border mt-4 max-w-md">
                   <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800';
                    }}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-card border border-border p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">4</span>
              Audience & Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Target Location</Label>
                <Input 
                  placeholder="e.g. India, Tier 1 Cities" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="bg-muted/30"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-4 pt-4">
            <NeonButton neonVariant="primary" type="submit" className="flex-1 py-6 text-lg" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </NeonButton>
            <NeonButton neonVariant="outline" type="button" onClick={() => navigate(-1)} className="px-10">Cancel</NeonButton>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditListing;
