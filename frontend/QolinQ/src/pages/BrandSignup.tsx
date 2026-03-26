import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { brandAPI } from "@/lib/api";

const BrandSignup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", businessName: "", email: "", password: "", phone: "", category: "", location: "" });
  const categories = ["Fashion", "Fitness", "Beauty", "Gaming", "Food", "Tech", "Travel", "Lifestyle"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, "brand");

      // Update brand profile
      await brandAPI.updateProfile({
        companyName: formData.businessName,
        category: formData.category,
        location: { city: formData.location.split(",")[0]?.trim(), country: formData.location.split(",")[1]?.trim() },
      });

      toast.success("Welcome to Qolinq!");
      navigate("/brand/dashboard");
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
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input id="businessName" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} required />
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
            <Label>Industry Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger><SelectValue placeholder="Select your industry" /></SelectTrigger>
              <SelectContent>{categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input id="location" placeholder="Mumbai, India" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
          </div>
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
