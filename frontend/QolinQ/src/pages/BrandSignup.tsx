import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { brandAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const BrandSignup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    businessName: "", 
    email: "", 
    password: "", 
    phone: "", 
    categories: [] as string[], 
    location: "" 
  });
  const categoryOptions = ["Fashion", "Fitness", "Beauty", "Gaming", "Food", "Tech", "Travel", "Lifestyle"];

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, "brand", formData.phone);

      // Update brand profile with multiple categories
      await brandAPI.updateProfile({
        companyName: formData.businessName,
        categories: formData.categories,
        website: (formData as any).website,
        description: (formData as any).description,
        location: { 
          city: formData.location.split(",")[0]?.trim(), 
          country: formData.location.split(",")[1]?.trim() 
        },
      });

      toast.success("Welcome to Qolinq!");
      navigate("/explore/influencers");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-2">Join as Brand</h1>
          <p className="text-muted-foreground">Create your account and find perfect influencers</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input id="businessName" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Industry Categories (Select all that apply) *</Label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                    formData.categories.includes(cat)
                      ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location">Location (City, Country) *</Label>
              <Input id="location" placeholder="Mumbai, India" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website <span className="text-muted-foreground font-normal text-xs">(Optional)</span></Label>
              <Input id="website" placeholder="https://example.com" value={(formData as any).website || ""} onChange={(e) => setFormData({ ...formData, website: e.target.value } as any)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">About the Brand / Requirements <span className="text-muted-foreground font-normal text-xs">(Optional)</span></Label>
            <Textarea 
              id="description" 
              placeholder="Briefly describe your brand and what kind of influencers you're looking for..." 
              value={(formData as any).description || ""} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value } as any)} 
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number <span className="text-muted-foreground font-normal text-xs">(Optional)</span></Label>
            <Input id="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>

          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">OR SIGN UP WITH</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <GoogleLoginButton role="brand" text="Sign up with Google" />

          <div className="flex gap-4 pt-4">
            <NeonButton neonVariant="primary" type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </NeonButton>
            <NeonButton neonVariant="outline" type="button" onClick={() => navigate("/brand/login")} className="flex-1">Login Instead</NeonButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandSignup;
