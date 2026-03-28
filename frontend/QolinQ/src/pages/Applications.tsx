import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Youtube, MapPin, MessageCircle, Check, X, ShieldCheck, DollarSign, ExternalLink, Clock, Star, User } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import RatingModal from "@/components/RatingModal";
import { toast } from "sonner";
import { applicationAPI, campaignAPI, messageAPI, escrowAPI, ratingAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const Applications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [ratingTarget, setRatingTarget] = useState<any>(null);

  const startConvMutation = useMutation({
    mutationFn: (data: { participantId: string, campaignId?: string }) => 
      messageAPI.startConversation(data),
    onSuccess: (res) => {
      navigate(`/chat?id=${res.data.data._id}`);
    },
    onError: () => {
      toast.error("Failed to start conversation");
    }
  });
  
  const { data: campaignsRes, isLoading: campsLoading } = useQuery({
    queryKey: ['my-campaigns'],
    queryFn: () => campaignAPI.getMyCampaigns(),
  });

  const campaigns = campaignsRes?.data?.data || [];
  
  const { data: appsRes, isLoading: appsLoading } = useQuery({
    queryKey: ['applications', campaigns?.[0]?._id],
    enabled: campaigns.length > 0,
    queryFn: () => applicationAPI.getCampaignApplications(campaigns[0]._id),
  });

  const applications = appsRes?.data?.data || [];

  const { data: escrowRes } = useQuery({
    queryKey: ['escrows', campaigns?.[0]?._id],
    enabled: campaigns.length > 0,
    queryFn: () => escrowAPI.getStatus(campaigns[0]._id),
  });

  const escrows = escrowRes?.data?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      applicationAPI.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      toast.success("Application status updated!");
    },
    onError: () => toast.error("Failed to update status")
  });

  const rateMutation = useMutation({
    mutationFn: (data: any) => ratingAPI.rate(campaigns[0]._id, data),
    onSuccess: () => {
      toast.success("Rating submitted successfully!");
      setRatingTarget(null);
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to submit rating")
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
      case "shortlisted": return "secondary";
      default: return "secondary";
    }
  };

  const isLoading = campsLoading || (campaigns.length > 0 && appsLoading);

  return (
    <DashboardLayout userType="brand">
      <div className="p-6 space-y-6">
        <div className="animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-1">Applications</h1>
            <p className="text-muted-foreground">Review influencer applications for your campaigns</p>
          </div>
          {campaigns.length > 0 && (
              <Badge variant="outline" className="h-8 px-4 bg-muted/50 border-none">
                  Campaign: {campaigns[0].title}
              </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
             <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No applications received yet for this campaign.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => {
              const escrow = escrows.find((e: any) => e.application === app._id);
              return (
                <Card key={app._id} className="bg-card border border-border p-6 hover-lift overflow-hidden relative">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary/20 shrink-0 relative">
                        {app.influencer?.name?.charAt(0) || "I"}
                        {app.influencer?.trustBadge && (
                          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                             <ShieldCheck className="w-5 h-5 text-primary fill-primary/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-xl">{app.influencer?.name}</h3>
                          <Badge variant="secondary" className="text-[10px] capitalize font-semibold tracking-wide">
                            {app.influencerProfile?.niche || "Creator"}
                          </Badge>
                          <Badge variant={statusColor(app.status)} className="text-[10px] uppercase font-bold px-2 py-0.5">
                            {app.status}
                          </Badge>
                        </div>

                        <div className="flex gap-4 mb-3 text-xs">
                           <div className="flex flex-col">
                              <span className="text-muted-foreground">Followers</span>
                              <span className="font-bold">{app.influencerProfile?.totalFollowers?.toLocaleString() || "12.4k"}</span>
                           </div>
                           <div className="flex flex-col border-l border-border pl-4">
                              <span className="text-muted-foreground">Location</span>
                              <span className="font-bold">{app.influencerProfile?.location?.city || "Mumbai"}</span>
                           </div>
                        </div>
                        
                        <div className="bg-muted/30 p-4 rounded-xl border border-primary/10 mb-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                               <MessageCircle className="w-12 h-12" />
                            </div>
                            <p className="text-sm leading-relaxed text-foreground/90 italic">"{app.proposalMessage}"</p>
                        </div>

                        <div className="flex flex-wrap gap-5 text-sm">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                               <DollarSign className="w-4 h-4 text-primary" /> 
                               <span className="font-bold">₹{app.customPrice?.toLocaleString() || "N/A"}</span>
                               <span className="text-[10px] text-muted-foreground ml-1">(Offered Price)</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                             <Clock className="w-4 h-4" /> 
                             <span>Timeline: <span className="text-foreground font-medium">{app.deliveryTimeline || "2-3 days"}</span></span>
                          </div>
                          {app.portfolioLink && (
                              <a href={app.portfolioLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors font-semibold group">
                                  Profile Link <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-48 shrink-0">
                      {app.status === "applied" ? (
                        <>
                          <NeonButton 
                            neonVariant="primary" 
                            onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'shortlisted' })}
                            disabled={updateStatusMutation.isPending}
                            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          >
                            <Check className="w-4 h-4 mr-2" />Shortlist
                          </NeonButton>
                          <NeonButton 
                            neonVariant="outline" 
                            onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'rejected' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-2" />Reject
                          </NeonButton>
                          <NeonButton 
                            neonVariant="ghost" 
                            onClick={() => navigate(`/influencer/${app.influencer._id}`)}
                            className="h-9 px-3"
                          >
                            <User className="w-4 h-4 mr-2" />View Profile
                          </NeonButton>
                        </>
                      ) : (app.status === "shortlisted" || app.status === "accepted") ? (
                          <>
                              {app.status === "accepted" ? (
                                   <NeonButton 
                                       neonVariant="primary" 
                                       onClick={() => setRatingTarget({ id: app.influencer._id, name: app.influencer.name })}
                                   >
                                       <Star className="w-4 h-4 mr-2" />Rate Influencer
                                   </NeonButton>
                              ) : (
                                   <NeonButton 
                                       neonVariant="primary" 
                                       onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'accepted' })}
                                       disabled={updateStatusMutation.isPending}
                                   >
                                       <Check className="w-4 h-4 mr-2" />Accept Deal
                                   </NeonButton>
                              )}
                              <NeonButton 
                                neonVariant="outline" 
                                onClick={() => startConvMutation.mutate({ participantId: app.influencer._id, campaignId: campaigns[0]?._id })}
                                disabled={startConvMutation.isPending}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />Message
                              </NeonButton>
                              <NeonButton 
                                neonVariant="ghost" 
                                onClick={() => navigate(`/influencer/${app.influencer._id}`)}
                                className="h-9 px-3"
                              >
                                <User className="w-4 h-4 mr-2" />View Profile
                              </NeonButton>
                          </>
                      ) : null}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        
        {ratingTarget && (
            <RatingModal
                isOpen={!!ratingTarget}
                onClose={() => setRatingTarget(null)}
                title={`Rate ${ratingTarget.name}`}
                description="Your feedback helps influencers improve and builds trust in the community."
                isSubmitting={rateMutation.isPending}
                onSubmit={(data) => rateMutation.mutate({ ...data, rateeId: ratingTarget.id })}
            />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Applications;


