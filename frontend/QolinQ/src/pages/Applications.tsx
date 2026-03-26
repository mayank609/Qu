import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Youtube, MapPin, MessageCircle, Check, X, ShieldCheck, DollarSign, ExternalLink, Clock, Star } from "lucide-react";
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

  const fundEscrowMutation = useMutation({
    mutationFn: ({ campaignId, applicationId }: { campaignId: string, applicationId: string }) => 
      escrowAPI.fund(campaignId, { applicationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      toast.success("Campaign funded! Money is now locked in escrow.");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Funding failed")
  });

  const releasePaymentMutation = useMutation({
    mutationFn: (escrowId: string) => escrowAPI.release(escrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success("Payment released to influencer!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Release failed")
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
                  {escrow?.status === 'locked' && (
                      <div className="absolute top-0 right-0 p-1 px-3 bg-primary/10 text-[10px] font-bold text-primary rounded-bl-lg flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> ESCROW PROTECTED
                      </div>
                  )}
                  {escrow?.status === 'released' && (
                      <div className="absolute top-0 right-0 p-1 px-3 bg-green-500/10 text-[10px] font-bold text-green-500 rounded-bl-lg flex items-center gap-1">
                          <Check className="w-3 h-3" /> COMPLETED
                      </div>
                  )}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border-2 border-primary/20 shrink-0">
                        {app.influencer?.name?.charAt(0) || "I"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-lg">{app.influencer?.name}</h3>
                          {app.influencer?.trustBadge && <ShieldCheck className="w-4 h-4 text-primary" />}
                          <Badge variant="secondary" className="text-[10px] capitalize">{app.influencerProfile?.niche || "Influencer"}</Badge>
                          <Badge variant={statusColor(app.status)} className="text-[10px] capitalize">{app.status}</Badge>
                          {escrow && (
                              <Badge variant="outline" className={cn(
                                  "text-[10px] capitalize",
                                  escrow.status === 'locked' ? "border-primary text-primary" : 
                                  escrow.status === 'released' ? "border-green-500 text-green-500" : "text-muted-foreground"
                              )}>
                                  Escrow: {escrow.status}
                              </Badge>
                          )}
                        </div>
                        
                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50 mb-3">
                            <p className="text-sm italic text-foreground/80">"{app.proposalMessage}"</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                               <DollarSign className="w-3.5 h-3.5 text-primary" /> ₹{app.customPrice?.toLocaleString() || "N/A"}
                          </span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Timeline: {app.deliveryTimeline || "2-3 days"}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> India</span>
                          {app.portfolioLink && (
                              <a href={app.portfolioLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline font-medium">
                                  Portfolio <ExternalLink className="w-3 h-3" />
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
                            onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'accepted' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-2" />Accept Deal
                          </NeonButton>
                          <NeonButton 
                            neonVariant="outline" 
                            onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'rejected' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-2" />Reject
                          </NeonButton>
                        </>
                      ) : app.status === "accepted" ? (
                          <>
                              {escrow?.status === 'pending' && (
                                  <NeonButton 
                                    neonVariant="primary" 
                                    className="bg-primary hover:bg-primary/90"
                                    onClick={() => fundEscrowMutation.mutate({ campaignId: campaigns[0]._id, applicationId: app._id })}
                                    disabled={fundEscrowMutation.isPending}
                                  >
                                    <DollarSign className="w-4 h-4 mr-2" />Fund Escrow
                                  </NeonButton>
                              )}
                              {escrow?.status === 'locked' && (
                                  <NeonButton 
                                    neonVariant="secondary" 
                                    onClick={() => releasePaymentMutation.mutate(escrow._id)}
                                    disabled={releasePaymentMutation.isPending}
                                  >
                                    <Check className="w-4 h-4 mr-2" />Release Payment
                                  </NeonButton>
                              )}
                              {escrow?.status === 'released' && (
                                  <NeonButton 
                                    neonVariant="primary" 
                                    onClick={() => setRatingTarget({ id: app.influencer._id, name: app.influencer.name })}
                                  >
                                    <Star className="w-4 h-4 mr-2" />Rate Influencer
                                  </NeonButton>
                              )}
                              <NeonButton 
                                neonVariant="outline" 
                                onClick={() => navigate(`/chat?id=${escrow?.conversationId || ''}`)}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />Message
                              </NeonButton>
                          </>
                      ) : null}
                      <NeonButton neonVariant="ghost" className="h-8 text-[10px]" onClick={() => startConvMutation.mutate({ participantId: app.influencer._id, campaignId: campaigns[0]?._id })}>
                        View Performance Stats
                      </NeonButton>
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


