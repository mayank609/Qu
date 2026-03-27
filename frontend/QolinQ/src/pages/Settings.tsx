import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Loader2 } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { influencerAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
    const navigate = useNavigate();
    const { user, updateUser, switchRole } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        bio: "",
        niche: "",
        phone: "",
        location: "",
        price: 0,
        instagramFollowers: "",
        youtubeSubscribers: "",
        portfolioLink1: "",
        portfolioLink2: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await influencerAPI.getProfile();
                const profile = res.data.data;
                const u = profile.user || {};

                setFormData({
                    name: u.name || user?.name || "",
                    email: u.email || user?.email || "",
                    bio: profile.bio || "",
                    niche: profile.niche || profile.categories?.[0] || "Fashion",
                    phone: u.phoneNumber || "",
                    location: `${profile.location?.city || ""}${profile.location?.state ? ", " + profile.location.state : ""}${profile.location?.country ? ", " + profile.location.country : ""}`,
                    price: profile.priceExpectation?.min || 0,
                    instagramFollowers: profile.platforms?.instagram?.followers?.toString() || "",
                    youtubeSubscribers: profile.platforms?.youtube?.subscribers?.toString() || "",
                    portfolioLink1: profile.portfolioLinks?.[0]?.url || "",
                    portfolioLink2: profile.portfolioLinks?.[1]?.url || "",
                });
                if (u.avatar) setAvatarPreview(u.avatar);
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, niche: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updateData = {
                name: formData.name,
                bio: formData.bio,
                niche: formData.niche,
                location: { city: formData.location.split(',')[0]?.trim() || "" },
                priceExpectation: { min: Number(formData.price) },
                portfolioLinks: [
                    { title: "Portfolio 1", url: formData.portfolioLink1 },
                    { title: "Portfolio 2", url: formData.portfolioLink2 },
                ].filter(p => p.url),
                avatar: avatarPreview
            };

            await influencerAPI.updateProfile(updateData);
            
            // Update local user state
            updateUser({
                name: formData.name,
                avatar: avatarPreview || user?.avatar
            });

            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const platforms = ["Instagram", "YouTube", "Twitter", "TikTok", "Snapchat"];
    const contentTypes = ["Photos", "Videos", "Short-form", "Long-form", "Vlogs", "Tech", "Beauty", "Fashion"];
    const categories = ["Fashion", "Fitness", "Beauty", "Gaming", "Food", "Tech", "Travel", "Lifestyle"];

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real app, we'd upload to Cloudinary/S3 here
            // For now, we'll use a placeholder or local preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                toast.success("Profile photo updated localy! Click save to persist.");
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout userType="influencer">
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="influencer">
            <div className="p-6 space-y-6 max-w-3xl mx-auto">
                <div className="animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-1">Settings</h1>
                    <p className="text-muted-foreground">Manage your influencer account</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="social">Social & Content</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="account">Account</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card className="bg-card border border-border p-6 shadow-glow">
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

                        <Card className="bg-card border border-border p-6 shadow-glow">
                            <h2 className="text-lg font-bold mb-5">Profile Information</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea id="bio" value={formData.bio} onChange={handleInputChange} className="min-h-[100px]" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="niche">Category / Niche</Label>
                                    <Select value={formData.niche} onValueChange={handleSelectChange}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={formData.email} disabled className="opacity-70" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" value={formData.phone} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" value={formData.location} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Collaboration Price (₹)</Label>
                                    <Input id="price" type="number" value={formData.price} onChange={handleInputChange} />
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="social" className="space-y-6">
                        <Card className="bg-card border border-border p-6 shadow-glow">
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
                                    <div className="space-y-2"><Label>Instagram Followers</Label><Input id="instagramFollowers" value={formData.instagramFollowers} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>YouTube Subscribers</Label><Input id="youtubeSubscribers" value={formData.youtubeSubscribers} onChange={handleInputChange} /></div>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-card border border-border p-6 shadow-glow">
                            <h2 className="text-lg font-bold mb-5">Portfolio Links</h2>
                            <div className="space-y-3">
                                <div className="space-y-2"><Label>Portfolio Link 1</Label><Input id="portfolioLink1" value={formData.portfolioLink1} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label>Portfolio Link 2</Label><Input id="portfolioLink2" value={formData.portfolioLink2} onChange={handleInputChange} /></div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <Card className="bg-card border border-border p-6 shadow-glow">
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

                    <TabsContent value="account" className="animate-fade-in">
                        <Card className="bg-card border-border p-6">
                            <h2 className="text-lg font-bold mb-5">Account Management</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold mb-2">Switch Account Type</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Currently acting as an <strong>Influencer</strong>. Switch to a Brand account to post campaigns and hire other creators.
                                    </p>
                                    <NeonButton 
                                        neonVariant="secondary" 
                                        type="button"
                                        onClick={async () => {
                                            if (window.confirm("Switch to Brand account? You can switch back anytime and your influencer data will be safe.")) {
                                                const newRole = await switchRole();
                                                navigate(newRole === 'brand' ? "/brand/dashboard" : "/influencer/dashboard");
                                                toast.success("Switched to Brand account!");
                                            }
                                        }}
                                    >
                                        Be a Brand
                                    </NeonButton>
                                </div>
                                
                                <div className="pt-6 border-t border-border">
                                    <h3 className="text-sm font-semibold mb-2 text-destructive">Danger Zone</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Deleting your account is permanent and cannot be undone.
                                    </p>
                                    <NeonButton neonVariant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/5">
                                        Delete My Account
                                    </NeonButton>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                    <NeonButton 
                        neonVariant="primary" 
                        onClick={handleSave} 
                        className="px-8" 
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                        ) : (
                            "Save Changes"
                        )}
                    </NeonButton>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
