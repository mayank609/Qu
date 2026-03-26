import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Youtube, MapPin, MessageCircle, Check, X } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { applicationAPI, campaignAPI, messageAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Applications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const startConvMutation = useMutation({
    mutationFn: (data: { participantId: string, campaignId?: string }) => 
      messageAPI.startConversation(data.participantId, data.campaignId),
    onSuccess: (res) => {
      navigate(`/chat?id=${res.data.data._id}`);
    },
    onError: () => {
      toast.error("Failed to start conversation");
    }
  });
  
  // First get brand's campaigns to fetch applications for each
  const { data: campaignsRes, isLoading: campsLoading } = useQuery({
    queryKey: ['my-campaigns'],
    queryFn: () => campaignAPI.getMyCampaigns(),
  });

  const campaigns = campaignsRes?.data?.data || [];
  
  // Simplified: Fetch all recent applications (this might need a dedicated brand endpoint in a real app, 
  // but for now we'll simulate by getting applications for the first campaign if any)
  const { data: appsRes, isLoading: appsLoading } = useQuery({
    queryKey: ['applications', campaigns?.[0]?._id],
    enabled: campaigns.length > 0,
    queryFn: () => applicationAPI.getCampaignApplications(campaigns[0]._id),
  });

  const applications = appsRes?.data?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      applicationAPI.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success("Application status updated!");
    },
    onError: () => toast.error("Failed to update status")
  });

  const PlatformIcon = ({ platform }: { platform: string }) => {
    if (platform?.toLowerCase() === "instagram") return <Instagram className="w-3.5 h-3.5 text-primary" />;
    if (platform?.toLowerCase() === "youtube") return <Youtube className="w-3.5 h-3.5 text-primary" />;
    return null;
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "accepted": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const isLoading = campsLoading || (campaigns.length > 0 && appsLoading);

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-1">Applications</h1>
          <p className="text-muted-foreground">Review influencer applications for your campaigns</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No applications received yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app: any) => (
              <Card key={app._id} className="bg-card border border-border p-5 hover-lift">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                      {app.influencer?.name?.charAt(0) || "I"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{app.influencer?.name}</h3>
                        <Badge variant="outline" className="text-[10px] capitalize">{app.influencer?.category || "Influencer"}</Badge>
                        <Badge variant={statusColor(app.status)} className="text-[10px] capitalize">{app.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">Applied to: <span className="text-foreground">{campaigns[0]?.title}</span></p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                             <PlatformIcon platform="instagram" /> {app.proposalMessage} 
                        </span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> India</span>
                        <span className="text-primary font-medium">₹{app.customPrice?.toLocaleString() || "N/A"}</span>
                        <span>· {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {app.status === "applied" && (
                    <div className="flex gap-2">
                      <NeonButton 
                        neonVariant="primary" 
                        onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'accepted' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-1" />Accept
                      </NeonButton>
                      <NeonButton 
                        neonVariant="outline" 
                        onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'rejected' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-1" />Reject
                      </NeonButton>
                      <NeonButton neonVariant="ghost" onClick={() => startConvMutation.mutate({ participantId: app.influencer._id, campaignId: campaigns[0]?._id })}>
                        <MessageCircle className="w-4 h-4" />
                      </NeonButton>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Applications;
