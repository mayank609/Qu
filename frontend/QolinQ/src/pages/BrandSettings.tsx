import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Loader2 } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { brandAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES } from "@/constants/categories";

const BrandSettings = () => {
    const navigate = useNavigate();
    const { user, updateUser, switchRole } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        contactPerson: "",
        companyName: "",
        email: "",
        phone: "",
        category: "fashion",
        location: "",
        description: "",
        website: "",
        otherCategory: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await brandAPI.getProfile();
                const profile = res.data.data;
                const u = profile.user || {};

                setFormData({
                    contactPerson: u.name || user?.name || "",
                    companyName: profile.companyName || u.name || "",
                    email: u.email || user?.email || "",
                    phone: u.phoneNumber || "",
                    category: profile.categories?.[0] || "fashion",
                    location: `${profile.location?.city || ""}${profile.location?.country ? ", " + profile.location.country : ""}`,
                    description: profile.description || "",
                    website: profile.website || "",
                    otherCategory: "",
                });
                if (u.avatar) setLogoPreview(u.avatar);
                else if (profile.logo) setLogoPreview(profile.logo);
            } catch (error) {
                console.error("Error fetching brand profile:", error);
                toast.error("Failed to load business profile");
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
        setFormData(prev => ({ ...prev, category: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const categoryToSave = formData.category === "Other" ? formData.otherCategory : formData.category;
        try {
            const updateData = {
                companyName: formData.companyName,
                website: formData.website,
                categories: [categoryToSave.toLowerCase()],
                description: formData.description,
                location: { city: formData.location.split(',')[0]?.trim() || "" },
                logo: logoPreview,
                name: formData.contactPerson // Update User name as well
            };

            await brandAPI.updateProfile(updateData);
            
            // Update local user state
            updateUser({
                name: formData.contactPerson,
                avatar: logoPreview || user?.avatar
            });

            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Error updating brand profile:", error);
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
                toast.success("Logo updated localy! Click save to persist.");
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout userType="brand">
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="brand">
            <div className="p-3 md:p-6 space-y-6 max-w-3xl mx-auto">
                <div className="animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-1">Brand Settings</h1>
                    <p className="text-muted-foreground">Manage your brand account</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="flex w-full overflow-x-auto bg-transparent border-b border-border rounded-none h-auto p-0 gap-4 no-scrollbar mb-4">
                        <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-xs md:text-sm font-medium transition-all">Profile</TabsTrigger>
                        <TabsTrigger value="notifications" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-xs md:text-sm font-medium transition-all">Alerts</TabsTrigger>
                        <TabsTrigger value="account" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-xs md:text-sm font-medium transition-all">Account</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card className="bg-card border border-border p-4 md:p-6 shadow-glow">
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

                        <Card className="bg-card border border-border p-6 shadow-glow">
                            <h2 className="text-lg font-bold mb-5">Business Information</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactPerson">Contact Person Name</Label>
                                        <Input id="contactPerson" value={formData.contactPerson} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Business Name</Label>
                                        <Input id="companyName" value={formData.companyName} onChange={handleInputChange} />
                                    </div>
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
                                    <Label htmlFor="category">Business Category</Label>
                                    <Select value={formData.category} onValueChange={handleSelectChange}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(c => (
                                                <SelectItem key={c} value={c === "Other" ? "Other" : c.toLowerCase()}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formData.category === "Other" && (
                                        <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <Input 
                                                placeholder="Specify category..." 
                                                value={formData.otherCategory} 
                                                onChange={(e) => setFormData({ ...formData, otherCategory: e.target.value })}
                                                className="bg-muted/30 border-primary/20"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" value={formData.location} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">About the Brand</Label>
                                    <Textarea id="description" value={formData.description} onChange={handleInputChange} className="min-h-[100px]" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input id="website" value={formData.website} onChange={handleInputChange} />
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <Card className="bg-card border border-border p-6 shadow-glow">
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

                    <TabsContent value="account" className="animate-fade-in">
                        <Card className="bg-card border-border p-6">
                            <h2 className="text-lg font-bold mb-5">Account Management</h2>
                            <div className="space-y-6">
                                {/* <div>
                                    <h3 className="text-sm font-semibold mb-2">Switch Account Type</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Currently acting as a <strong>Brand</strong>. Switch to an Influencer account to browse campaigns and apply to jobs.
                                    </p>
                                    <NeonButton 
                                        neonVariant="primary" 
                                        type="button"
                                        onClick={async () => {
                                            if (window.confirm("Switch to Influencer account? You can switch back anytime and your brand data will be safe.")) {
                                                const newRole = await switchRole();
                                                navigate(newRole === 'brand' ? "/brand/dashboard" : "/influencer/dashboard");
                                                toast.success("Switched to Influencer account!");
                                            }
                                        }}
                                    >
                                        Be an Influencer
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

export default BrandSettings;
