import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";

const BrandSettings = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      toast.success("Logo updated!");
    }
  };

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Brand Settings</h1>
          <p className="text-muted-foreground">Manage your brand account</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="profile">Business Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold mb-5">Brand Logo</h2>
              <div className="flex items-center gap-5">
                <label className="relative cursor-pointer group">
                  <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-border group-hover:border-primary transition-colors">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
                <div className="text-sm text-muted-foreground">
                  <p>Upload your brand logo</p>
                  <p className="text-xs">JPG, PNG. Max 2MB.</p>
                </div>
              </div>
            </Card>

            <Card className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold mb-5">Business Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Person Name</Label>
                    <Input defaultValue="Rajesh Kumar" />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input defaultValue="StyleCo Fashion Pvt Ltd" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" defaultValue="rajesh@styleco.in" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input defaultValue="+91 98765 43210" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Business Category</Label>
                  <Select defaultValue="fashion">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Fashion", "Fitness", "Beauty", "Gaming", "Food", "Tech", "Travel", "Lifestyle"].map(c => (
                        <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input defaultValue="Mumbai, India" />
                </div>
                <div className="space-y-2">
                  <Label>About the Brand</Label>
                  <Textarea defaultValue="Leading fashion brand specializing in contemporary streetwear and urban fashion." className="min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input defaultValue="https://styleco.in" />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold mb-5">Notifications</h2>
              <div className="space-y-4">
                {[
                  { title: "Email Notifications", desc: "Receive campaign updates via email", on: true },
                  { title: "New Applications", desc: "Get notified when influencers apply", on: true },
                  { title: "Chat Messages", desc: "Get notified for new messages", on: true },
                  { title: "Weekly Report", desc: "Receive weekly campaign performance summary", on: false },
                  { title: "Influencer Recommendations", desc: "Get suggestions for matching influencers", on: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.on} />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <NeonButton neonVariant="primary" onClick={() => toast.success("Settings saved!")} className="px-8">Save Changes</NeonButton>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrandSettings;
