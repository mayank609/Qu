import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { campaignAPI } from "@/lib/api";

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    platform: "",
    budgetMin: "",
    budgetMax: "",
    location: "Remote",
    endDate: "",
    deliverables: "",
    otherCategory: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        deliverables: formData.deliverables.split('\n').filter(d => d.trim()).map(d => ({
          type: 'post',
          description: d.trim()
        }))
      };

      await campaignAPI.create(payload);
      toast.success("Campaign published successfully!");
      navigate("/brand/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Post a Campaign</h1>
          <p className="text-muted-foreground">Create a new campaign listing for influencers to discover</p>
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
                    {["Gaming", "Fashion", "Lifestyle", "Travel", "Food & Cooking", "Tech", "Fitness", "Health & Wellness", "Beauty & Skincare", "Education", "Finance & Investing", "Parenting & Family", "Automobile", "Entertainment", "Comedy & Memes", "Motivation", "Business", "Photography", "Videography", "Home Decor", "DIY & Crafts", "Pets & Animals", "Music & Singing", "Dance", "Art & Illustration", "Spirituality", "News & Politics", "Other"].map(c => (
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
              <div className="space-y-2">
                <Label>Urgency Level</Label>
                <Select defaultValue="medium" onValueChange={v => setFormData({...formData, platform: formData.platform}) /* Placeholder for urgency */}>
                  <SelectTrigger className="bg-muted/30"><SelectValue placeholder="Select urgency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (1-2 months)</SelectItem>
                    <SelectItem value="medium">Medium (2-4 weeks)</SelectItem>
                    <SelectItem value="high">High (Next week)</SelectItem>
                    <SelectItem value="urgent">Urgent (Asap)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="bg-card border border-border p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">2</span>
              Deliverables & Budget
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Primary Platform *</Label>
                <Select value={formData.platform} onValueChange={v => setFormData({...formData, platform: v})}>
                  <SelectTrigger className="bg-muted/30"><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram_reel">Instagram Reels</SelectItem>
                    <SelectItem value="instagram_story">Instagram Stories</SelectItem>
                    <SelectItem value="youtube_video">YouTube Main Video</SelectItem>
                    <SelectItem value="youtube_short">YouTube Shorts</SelectItem>
                    <SelectItem value="linkedin_post">LinkedIn Article/Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Input 
                  type="date" 
                  required 
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  className="bg-muted/30"
                />
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
              <div className="space-y-2">
                <Label>Required Hashtags</Label>
                <Input 
                  placeholder="#SummerVibes #QolinqFashion" 
                  className="bg-muted/30"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Content Guidelines & Don'ts</Label>
                <Textarea 
                  placeholder="e.g. No competitors mentioned. High-lighting the fabric quality. Use clear audio..." 
                  className="min-h-[100px] bg-muted/30"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-4 pt-4">
            <NeonButton neonVariant="primary" type="submit" className="flex-1 py-6 text-lg" disabled={loading}>
              {loading ? "Publishing..." : "Publish Campaign Listing"}
            </NeonButton>
            <NeonButton neonVariant="outline" type="button" onClick={() => navigate(-1)} className="px-10">Cancel</NeonButton>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateListing;
