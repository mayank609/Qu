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
import GoogleLoginButton from "@/components/GoogleLoginButton";

const InfluencerSignup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", bio: "", category: "", platforms: [] as string[],
    instagram: "", youtube: "", twitter: "", tiktok: "", facebook: "",
    contentTypes: [] as string[], price: "", location: "", portfolio: ["", "", ""],
  });

  const platforms = ["Instagram", "YouTube", "TikTok", "Twitter", "Facebook"];
  const contentTypes = ["Photos", "Videos", "Short-form", "Long-form", "Vlogs", "Tech", "Beauty", "Fashion"];
  const categories = [
    "Gaming", 
    "Fashion", 
    "Lifestyle", 
    "Travel", 
    "Food & Cooking", 
    "Tech", 
    "Fitness", 
    "Health & Wellness", 
    "Beauty & Skincare", 
    "Education", 
    "Finance & Investing", 
    "Parenting & Family", 
    "Automobile (Cars & Bikes)", 
    "Entertainment", 
    "Comedy & Memes", 
    "Motivation & Self Growth", 
    "Business & Entrepreneurship", 
    "Photography", 
    "Videography", 
    "Home Decor & Interior", 
    "DIY & Crafts", 
    "Pets & Animals", 
    "Music & Singing", 
    "Dance", 
    "Art & Illustration", 
    "Spirituality & Astrology", 
    "News & Politics", 
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.platforms.length === 0) {
      toast.error("Please select at least one social platform");
      return;
    }
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, "influencer");

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

      // Connect each selected platform with simulated stats
      const platformPromises = formData.platforms.map(async (p) => {
        const platformKey = p.toLowerCase() as keyof typeof formData;
        const handle = formData[platformKey] as string;
        
        if (handle) {
          const stats: any = {};
          if (p === "YouTube") {
            stats.subscribers = Math.floor(Math.random() * 50000) + 1000;
            stats.avgViews = Math.floor(Math.random() * 5000) + 100;
          } else {
            stats.followers = Math.floor(Math.random() * 20000) + 1000;
            if (p === "Instagram") {
              stats.engagementRate = parseFloat((Math.random() * 4 + 1).toFixed(2));
              stats.avgLikes = Math.floor(Math.random() * 1000) + 100;
            }
          }

          return influencerAPI.connectPlatform({ 
            platform: platformKey, 
            handle: handle, 
            ...stats 
          });
        }
      });

      await Promise.all(platformPromises.filter(p => p));

      toast.success("Profile created with all your platforms!");
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
          <GoogleLoginButton role="influencer" text="Sign up with Google" />
          
          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">OR CONTINUE WITH EMAIL</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <span className="text-[10px] font-bold uppercase tracking-wider text-primary/40">Profile Setup</span>
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

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="location">Location *</Label>
              <Input id="location" placeholder="Mumbai, India" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg space-y-4 border border-border/50">
            <div className="space-y-1">
              <Label className="text-primary font-bold">Social Platforms *</Label>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Select at least one platform and enter your handle</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <div key={platform} className="flex items-center space-x-2 bg-card p-2 rounded border border-border/50 hover:border-primary/30 transition-colors">
                  <Checkbox id={platform} checked={formData.platforms.includes(platform)}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, platforms: checked ? [...formData.platforms, platform] : formData.platforms.filter(p => p !== platform) });
                    }} />
                  <label htmlFor={platform} className="text-xs font-medium cursor-pointer">{platform}</label>
                </div>
              ))}
            </div>

            {formData.platforms.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {formData.platforms.map((p) => {
                  const key = p.toLowerCase() as keyof typeof formData;
                  return (
                    <div key={p} className="space-y-1.5 animate-slide-up">
                      <Label htmlFor={key} className="text-[10px] font-bold uppercase tracking-wider text-primary/80">{p} Handle</Label>
                      <Input 
                        id={key} 
                        placeholder={p === 'YouTube' ? "Channel URL or Name" : `@username`} 
                        value={formData[key] as string} 
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="h-9 text-sm"
                        required
                      />
                    </div>
                  );
                })}
              </div>
            )}
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
