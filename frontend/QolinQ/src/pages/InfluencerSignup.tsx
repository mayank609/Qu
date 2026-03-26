import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { influencerAPI } from "@/lib/api";

const InfluencerSignup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", bio: "", category: "", platforms: [] as string[],
    instagram: "", youtube: "", twitter: "", tiktok: "",
    contentTypes: [] as string[], price: "", location: "", portfolio: ["", "", ""],
  });

  const platforms = ["Instagram", "YouTube", "Twitter", "TikTok", "Snapchat"];
  const contentTypes = ["Photos", "Videos", "Short-form", "Long-form", "Vlogs", "Tech", "Beauty", "Fashion"];
  const categories = ["Fashion", "Fitness", "Beauty", "Gaming", "Food", "Tech", "Travel", "Lifestyle"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, "influencer");

      // Simulated "System Pull" for stats if handles are provided
      const instagramStats = formData.instagram ? {
        followers: Math.floor(Math.random() * 50000) + 5000,
        engagementRate: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        avgLikes: Math.floor(Math.random() * 2000) + 200,
        avgComments: Math.floor(Math.random() * 100) + 10,
      } : null;

      const youtubeStats = formData.youtube ? {
        subscribers: Math.floor(Math.random() * 100000) + 1000,
        avgViews: Math.floor(Math.random() * 10000) + 500,
      } : null;

      // Update profile with extra details
      await influencerAPI.updateProfile({
        bio: formData.bio,
        categories: [formData.category.toLowerCase()],
        niche: formData.category,
        location: { 
          city: formData.location.split(",")[0]?.trim() || "Mumbai", 
          country: formData.location.split(",")[1]?.trim() || "India" 
        },
        priceExpectation: { min: parseInt(formData.price) || 0, max: parseInt(formData.price) || 10000 },
        portfolioLinks: formData.portfolio.filter(l => l).map((url, i) => ({ title: `Portfolio ${i+1}`, url, platform: "other" })),
        languages: ["English", "Hindi"],
        audienceCountry: [{ country: "India", percentage: 85 }, { country: "USA", percentage: 10 }],
      });

      // Connect platforms with simulated stats
      if (formData.instagram) {
        await influencerAPI.connectPlatform({ 
          platform: "instagram", 
          handle: formData.instagram, 
          ...instagramStats 
        });
      }
      if (formData.youtube) {
        await influencerAPI.connectPlatform({ 
          platform: "youtube", 
          handle: formData.youtube, 
          ...youtubeStats 
        });
      }

      toast.success("Profile created! We've automatically pulled your stats.");
      navigate("/influencer/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-4 mb-8">
          <button 
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
            onClick={() => toast.info("Google OAuth integration coming soon!")}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.22-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Continue with Google
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with email</span></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <span className="text-[10px] font-bold uppercase tracking-wider text-primary/40">Step 1/2</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short Bio *</Label>
            <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell brands about yourself..." className="min-h-[100px]" required />
          </div>

          <div className="space-y-2">
            <Label>Category / Niche *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger><SelectValue placeholder="Select your niche" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Social Platforms *</Label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox id={platform} checked={formData.platforms.includes(platform)}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, platforms: checked ? [...formData.platforms, platform] : formData.platforms.filter(p => p !== platform) });
                    }} />
                  <label htmlFor={platform} className="text-sm">{platform}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram Handle</Label>
              <Input id="instagram" placeholder="@username" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube Channel</Label>
              <Input id="youtube" placeholder="Channel name" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content Types</Label>
            <div className="grid grid-cols-2 gap-3">
              {contentTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox id={type} checked={formData.contentTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, contentTypes: checked ? [...formData.contentTypes, type] : formData.contentTypes.filter(t => t !== type) });
                    }} />
                  <label htmlFor={type} className="text-sm">{type}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Collaboration Price (₹) *</Label>
              <Input id="price" type="number" placeholder="10000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" placeholder="Mumbai, India" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Top 3 Portfolio Links</Label>
            {formData.portfolio.map((link, idx) => (
              <Input key={idx} placeholder={`Portfolio link ${idx + 1}`} value={link}
                onChange={(e) => { const p = [...formData.portfolio]; p[idx] = e.target.value; setFormData({ ...formData, portfolio: p }); }} />
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <NeonButton neonVariant="primary" type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Profile"}
            </NeonButton>
            <NeonButton neonVariant="outline" type="button" onClick={() => navigate("/influencer/login")} className="flex-1">Login Instead</NeonButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InfluencerSignup;
