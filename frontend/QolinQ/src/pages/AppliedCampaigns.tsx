import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { applicationAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const AppliedCampaigns = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationAPI.getMyApplications(),
  });

  const appliedCampaigns = data?.data?.data || [];

  const statusColor = (s: string) => {
    switch (s) {
      case "accepted": return "default";
      case "rejected": return "destructive";
      case "shortlisted": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <DashboardLayout userType="influencer">
      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Applied Campaigns</h1>
          <p className="text-muted-foreground">Track the status of your campaign applications</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
           <div className="text-center py-12 text-destructive font-semibold">
            <p>Error loading applications.</p>
          </div>
        ) : appliedCampaigns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>You haven't applied to any campaigns yet.</p>
            <NeonButton neonVariant="primary" onClick={() => navigate("/explore/campaigns")} className="mt-4">Explore Campaigns</NeonButton>
          </div>
        ) : (
          <div className="space-y-3">
            {appliedCampaigns.map((app: any) => (
              <Card key={app._id} className="bg-card border border-border p-5 hover-lift">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{app.campaign?.title}</h3>
                      <Badge variant="outline" className="text-[10px]">{app.campaign?.category}</Badge>
                      <Badge variant={statusColor(app.status)} className="text-[10px] capitalize">{app.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">by <span className="text-foreground">{app.campaign?.brand?.name || "Brand"}</span></p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />₹{app.campaign?.budgetRange?.min?.toLocaleString()} - ₹{app.campaign?.budgetRange?.max?.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.campaign?.location?.city || "Remote"}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <NeonButton neonVariant="outline" onClick={() => navigate("/chat")}>Message Brand</NeonButton>
                    {app.status === 'accepted' && (
                       <NeonButton neonVariant="primary" onClick={() => toast.info("Deliverable upload coming soon!")}>Upload Proof</NeonButton>
                    )}
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

export default AppliedCampaigns;
