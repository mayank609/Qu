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
import { Camera, Loader2, X, Video } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { influencerAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES } from "@/constants/categories";

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
        tiktokFollowers: "",
        twitterFollowers: "",
        facebookFollowers: "",
        instagramHandle: "",
        youtubeHandle: "",
        tiktokHandle: "",
        twitterHandle: "",
        facebookHandle: "",
        portfolioLink1: "",
        portfolioLink2: "",
        otherNiche: "",
        bestContent: [] as { url: string; type: string }[],
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
                    tiktokFollowers: profile.platforms?.tiktok?.followers?.toString() || "",
                    twitterFollowers: profile.platforms?.twitter?.followers?.toString() || "",
                    facebookFollowers: profile.platforms?.facebook?.followers?.toString() || "",
                    instagramHandle: profile.platforms?.instagram?.handle || "",
                    youtubeHandle: profile.platforms?.youtube?.handle || "",
                    tiktokHandle: profile.platforms?.tiktok?.handle || "",
                    twitterHandle: profile.platforms?.twitter?.handle || "",
                    facebookHandle: profile.platforms?.facebook?.handle || "",
                    portfolioLink1: profile.portfolioLinks?.[0]?.url || "",
                    portfolioLink2: profile.portfolioLinks?.[1]?.url || "",
                    otherNiche: "",
                    bestContent: profile.bestContent || [],
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
        if (!formData.name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        setIsSaving(true);
        const nicheToSave = formData.niche === "Other" ? formData.otherNiche : formData.niche;
        try {
            const updateData = {
                name: formData.name.trim(),
                bio: formData.bio,
                niche: nicheToSave,
                location: { city: formData.location.split(',')[0]?.trim() || "" },
                priceExpectation: { min: Number(formData.price) },
                portfolioLinks: [
                    { title: "Link 1", url: formData.portfolioLink1 },
                    { title: "Link 2", url: formData.portfolioLink2 },
                ].filter(p => p.url),
                bestContent: formData.bestContent,
                avatar: avatarPreview
            };

            await influencerAPI.updateProfile(updateData);
            
            // Update platform stats
            const platformsToSync = [
                { key: 'instagram', followers: formData.instagramFollowers, handle: formData.instagramHandle },
                { key: 'youtube', followers: formData.youtubeSubscribers, handle: formData.youtubeHandle },
                { key: 'tiktok', followers: formData.tiktokFollowers, handle: formData.tiktokHandle },
                { key: 'twitter', followers: formData.twitterFollowers, handle: formData.twitterHandle },
                { key: 'facebook', followers: formData.facebookFollowers, handle: formData.facebookHandle }
            ];

            const platformPromises = platformsToSync.filter(p => p.followers && p.handle).map(p => {
                const stats: any = {};
                if (p.key === 'youtube') stats.subscribers = parseInt(p.followers);
                else stats.followers = parseInt(p.followers);

                return influencerAPI.connectPlatform({
                    platform: p.key,
                    handle: p.handle,
                    ...stats
                });
            });

            await Promise.all(platformPromises);

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

    const platforms = ["Instagram", "YouTube", "Twitter", "TikTok", "Facebook", "Snapchat"];
    const categories = CATEGORIES;

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
            <div className="p-3 md:p-6 space-y-6 max-w-3xl mx-auto">
                <div className="animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-1">Settings</h1>
                    <p className="text-muted-foreground">Manage your influencer account</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="flex w-full overflow-x-auto bg-transparent border-b border-border rounded-none h-auto p-0 gap-4 no-scrollbar mb-4">
                        <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-xs md:text-sm font-medium transition-all">Profile</TabsTrigger>
                        <TabsTrigger value="social" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-xs md:text-sm font-medium transition-all">Social</TabsTrigger>
                        <TabsTrigger value="notifications" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-xs md:text-sm font-medium transition-all">Alerts</TabsTrigger>
                        <TabsTrigger value="account" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-xs md:text-sm font-medium transition-all">Account</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card className="bg-card border border-border p-4 md:p-6 shadow-glow">
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
                                    {formData.niche === "Other" && (
                                        <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <Input 
                                                placeholder="Specify niche..." 
                                                value={formData.otherNiche} 
                                                onChange={(e) => setFormData({ ...formData, otherNiche: e.target.value })}
                                                className="bg-muted/30 border-primary/20"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {platforms.map((platform) => (
                                            <div key={platform} className="flex items-center space-x-2">
                                                <Checkbox id={`setting-${platform}`} defaultChecked={["Instagram", "YouTube"].includes(platform)} />
                                                <label htmlFor={`setting-${platform}`} className="text-sm">{platform}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Instagram Followers</Label><Input id="instagramFollowers" value={formData.instagramFollowers} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>YouTube Subscribers</Label><Input id="youtubeSubscribers" value={formData.youtubeSubscribers} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>TikTok Followers</Label><Input id="tiktokFollowers" value={formData.tiktokFollowers} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>Twitter Followers</Label><Input id="twitterFollowers" value={formData.twitterFollowers} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>Facebook Followers</Label><Input id="facebookFollowers" value={formData.facebookFollowers} onChange={handleInputChange} /></div>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-card border border-border p-6 shadow-glow">
                            <h2 className="text-lg font-bold mb-5">Profile Links</h2>
                            <div className="space-y-3">
                                <div className="space-y-2"><Label>Profile Link 1</Label><Input id="portfolioLink1" value={formData.portfolioLink1} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label>Profile Link 2</Label><Input id="portfolioLink2" value={formData.portfolioLink2} onChange={handleInputChange} /></div>
                            </div>
                        </Card>

                        <Card className="bg-card border border-border p-6 shadow-glow">
                             <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold">Best Content (Max 6)</h2>
                                <p className="text-xs text-muted-foreground">Share your actual work files</p>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, idx) => (
                                    <div key={idx} className="aspect-video relative group border-2 border-dashed border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                                        {formData.bestContent[idx] ? (
                                            <>
                                                {formData.bestContent[idx].type === 'video' ? (
                                                    <video src={formData.bestContent[idx].url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={formData.bestContent[idx].url} className="w-full h-full object-cover" />
                                                )}
                                                <button 
                                                    onClick={() => {
                                                        const newContent = [...formData.bestContent];
                                                        newContent.splice(idx, 1);
                                                        setFormData({ ...formData, bestContent: newContent });
                                                    }}
                                                    className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                                                <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Upload</span>
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*,video/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                const newContent = [...formData.bestContent];
                                                                newContent[idx] = { 
                                                                    url: reader.result as string, 
                                                                    type: file.type.startsWith('video') ? 'video' : 'image' 
                                                                };
                                                                setFormData({ ...formData, bestContent: newContent });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                ))}
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
                                {/* <div>
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
                                </div> */}
                                
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
