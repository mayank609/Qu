import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import InfluencerCard from "@/components/InfluencerCard";
import { toast } from "sonner";

const SavedProfiles = () => {
  const navigate = useNavigate();

  const savedInfluencers = [
    { name: "Priya Sharma", bio: "Fashion & Beauty Content Creator | Mumbai", category: "Fashion", followers: [{ platform: "Instagram", count: "250K" }, { platform: "YouTube", count: "100K" }], price: "₹15,000", location: "Mumbai", contentTypes: ["Photos", "Reels", "Fashion"] },
    { name: "Vikram Mehta", bio: "Food Blogger | Restaurant Reviews & Recipes", category: "Food", followers: [{ platform: "Instagram", count: "320K" }, { platform: "YouTube", count: "200K" }], price: "₹18,000", location: "Mumbai", contentTypes: ["Videos", "Food", "Vlogs"] },
  ];

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Saved Profiles</h1>
          <p className="text-muted-foreground">Influencers you've bookmarked for later</p>
        </div>

        {savedInfluencers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No saved profiles yet. Browse influencers and bookmark them!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedInfluencers.map((inf, idx) => (
              <InfluencerCard key={idx} {...inf} onContact={() => toast.success(`Starting chat with ${inf.name}...`)} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedProfiles;
