import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { campaignAPI } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const MyListings = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => campaignAPI.getMyCampaigns(),
  });

  const queryClient = useQueryClient();
  const listings = data?.data?.data || [];

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await campaignAPI.delete(id);
        toast.success("Campaign deleted successfully");
        queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete campaign");
      }
    }
  };

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-1">My Listings</h1>
            <p className="text-muted-foreground">Manage your campaigns and profile</p>
          </div>
          <NeonButton neonVariant="primary" onClick={() => navigate("/create-listing")}>+ New Listing</NeonButton>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>You haven't created any listings yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing: any) => (
              <Card key={listing._id} className="bg-card border border-border p-5 hover-lift">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{listing.title}</h3>
                      <Badge variant={listing.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                        {listing.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{listing.engagement?.views || 0} views</span>
                      <span>{listing.applications?.length || 0} applications</span>
                      <span>Created {new Date(listing.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <NeonButton neonVariant="outline" onClick={() => navigate(`/edit-listing/${listing._id}`)}><Edit className="w-4 h-4 mr-1" />Edit</NeonButton>
                    <NeonButton neonVariant="ghost" onClick={() => handleDelete(listing._id)}><Trash2 className="w-4 h-4" /></NeonButton>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyListings;
