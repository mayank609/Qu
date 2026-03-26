import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";

const Settings = () => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const platforms = ["Instagram", "YouTube", "Twitter", "TikTok", "Snapchat"];
  const contentTypes = ["Photos", "Videos", "Short-form", "Long-form", "Vlogs", "Tech", "Beauty", "Fashion"];
  const categories = ["Fashion", "Fitness", "Beauty", "Gaming", "Food", "Tech", "Travel", "Lifestyle"];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      toast.success("Profile photo updated!");
    }
  };

  return (
    <DashboardLayout userType="influencer">
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your influencer account</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="social">Social & Content</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold mb-5">Profile Photo</h2>
              <div className="flex items-center gap-5">
                <label className="relative cursor-pointer group">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-border group-hover:border-primary transition-colors">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <div className="text-sm text-muted-foreground">
                  <p>Upload your profile photo</p>
                  <p className="text-xs">JPG, PNG. Max 2MB.</p>
                </div>
              </div>
            </Card>

            <Card className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold mb-5">Profile Information</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="Alex Johnson" />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea defaultValue="Fashion & Lifestyle Influencer | Creating stunning content that inspires" className="min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label>Category / Niche</Label>
                  <Select defaultValue="Fashion">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" defaultValue="alex@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input defaultValue="+91 98765 43210" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input defaultValue="Mumbai, India" />
                </div>
                <div className="space-y-2">
                  <Label>Collaboration Price (₹)</Label>
                  <Input type="number" defaultValue="15000" />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Social & Content Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold mb-5">Social Platforms</h2>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Active Platforms</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {platforms.map((platform) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox id={`setting-${platform}`} defaultChecked={["Instagram", "YouTube"].includes(platform)} />
                        <label htmlFor={`setting-${platform}`} className="text-sm">{platform}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Instagram Followers</Label><Input defaultValue="250K" /></div>
                  <div className="space-y-2"><Label>YouTube Subscribers</Label><Input defaultValue="100K" /></div>
                  <div className="space-y-2"><Label>Twitter Followers</Label><Input placeholder="e.g., 50K" /></div>
                  <div className="space-y-2"><Label>TikTok Followers</Label><Input placeholder="e.g., 200K" /></div>
                </div>
              </div>
            </Card>

            <Card className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold mb-5">Content Types</h2>
              <div className="grid grid-cols-2 gap-3">
                {contentTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox id={`content-${type}`} defaultChecked={["Photos", "Videos", "Fashion"].includes(type)} />
                    <label htmlFor={`content-${type}`} className="text-sm">{type}</label>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold mb-5">Portfolio Links</h2>
              <div className="space-y-3">
                <div className="space-y-2"><Label>Portfolio Link 1</Label><Input defaultValue="https://instagram.com/alexjohnson" /></div>
                <div className="space-y-2"><Label>Portfolio Link 2</Label><Input defaultValue="https://youtube.com/@alexjohnson" /></div>
                <div className="space-y-2"><Label>Portfolio Link 3</Label><Input placeholder="Add another link..." /></div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border border-border p-6">
              <h2 className="text-lg font-bold mb-5">Notifications</h2>
              <div className="space-y-4">
                {[
                  { title: "Email Notifications", desc: "Receive campaign updates via email", on: true },
                  { title: "Chat Messages", desc: "Get notified for new messages", on: true },
                  { title: "Campaign Matches", desc: "Alert when campaigns match your profile", on: true },
                  { title: "Weekly Summary", desc: "Get weekly performance reports", on: false },
                  { title: "New Brand Contacts", desc: "Notify when a brand contacts you", on: true },
                  { title: "Profile View Alerts", desc: "Alert when someone views your profile", on: false },
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

export default Settings;
