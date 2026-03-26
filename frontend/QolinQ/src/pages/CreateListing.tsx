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
    deliverables: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
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

        <form onSubmit={handleSubmit}>
          <Card className="bg-card border border-border p-6 space-y-5">
            <div className="space-y-2">
              <Label>Campaign Title *</Label>
              <Input 
                placeholder="Summer Fashion Collection Launch" 
                required 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea 
                placeholder="Describe your campaign goals, target audience, and what you're looking for..." 
                className="min-h-[120px]" 
                required 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Platform *</Label>
                <Select value={formData.platform} onValueChange={v => setFormData({...formData, platform: v})}>
                  <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram_reel">Instagram Reels</SelectItem>
                    <SelectItem value="instagram_story">Instagram Stories</SelectItem>
                    <SelectItem value="youtube_video">YouTube Video</SelectItem>
                    <SelectItem value="youtube_short">YouTube Shorts</SelectItem>
                    <SelectItem value="instagram_post">Static Posts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Budget (₹) *</Label>
                <Input 
                  type="number"
                  placeholder="5000" 
                  required 
                  value={formData.budgetMin}
                  onChange={e => setFormData({...formData, budgetMin: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Budget (₹) *</Label>
                <Input 
                  type="number"
                  placeholder="10000" 
                  required 
                  value={formData.budgetMax}
                  onChange={e => setFormData({...formData, budgetMax: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input 
                  placeholder="Mumbai, India" 
                  required 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Input 
                  type="date" 
                  required 
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deliverables & Requirements (one per line)</Label>
              <Textarea 
                placeholder="2 Instagram Reels&#10;3 Story Posts" 
                value={formData.deliverables}
                onChange={e => setFormData({...formData, deliverables: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <NeonButton neonVariant="primary" type="submit" className="flex-1" disabled={loading}>
                {loading ? "Publishing..." : "Publish Campaign"}
              </NeonButton>
              <NeonButton neonVariant="outline" type="button" onClick={() => navigate(-1)} className="flex-1">Cancel</NeonButton>
            </div>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateListing;
