import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Youtube, Twitter, Facebook, MapPin, MessageCircle, Check, X, ShieldCheck, DollarSign, ExternalLink, Clock, User, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { applicationAPI, campaignAPI, messageAPI, escrowAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const Applications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const campaignIdFromUrl = searchParams.get('campaignId');

  const startConvMutation = useMutation({
    mutationFn: (data: { participantId: string, campaignId?: string }) => 
      messageAPI.startConversation(data),
    onSuccess: (res) => {
      navigate(`/chat?id=${res.data.data._id}`);
    },
    onError: () => {
      toast.error("Can't message directly. Please shortlist the application first.");
    }
  });
  
  const { data: campaignsRes, isLoading: campsLoading } = useQuery({
    queryKey: ['my-campaigns'],
    queryFn: () => campaignAPI.getMyCampaigns(),
  });

  const campaigns = campaignsRes?.data?.data || [];
  
  // If no campaignId in URL, we default to "all"
  const selectedCampaignId = campaignIdFromUrl || 'all';
  const selectedCampaign = campaigns.find((c: any) => c._id === selectedCampaignId);

  const { data: appsRes, isLoading: appsLoading } = useQuery({
    queryKey: ['applications', selectedCampaignId],
    queryFn: () => {
        if (selectedCampaignId === 'all') {
            return applicationAPI.getAllBrandApplications();
        }
        return applicationAPI.getCampaignApplications(selectedCampaignId);
    },
  });

  const applications = appsRes?.data?.data || [];

  const { data: escrowRes } = useQuery({
    queryKey: ['escrows', selectedCampaignId],
    enabled: selectedCampaignId !== 'all',
    queryFn: () => escrowAPI.getStatus(selectedCampaignId),
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


  const PlatformIcon = ({ platform }: { platform: string }) => {
    const p = platform?.toLowerCase();
    if (p === "instagram") return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
    if (p === "youtube") return <Youtube className="w-3.5 h-3.5 text-red-500" />;
    if (p === "facebook") return <Facebook className="w-3.5 h-3.5 text-blue-500" />;
    if (p === "twitter" || p === "x") return <Twitter className="w-3.5 h-3.5 text-sky-500" />;
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
             <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:block">Listing:</span>
                <Select value={selectedCampaignId} onValueChange={(v) => navigate(v === 'all' ? '/applications' : `/applications?campaignId=${v}`)}>
                    <SelectTrigger className="w-[180px] md:w-[240px] h-9 bg-muted/50 border-none shadow-glow-sm">
                        <SelectValue placeholder="Select Campaign" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Campaigns</SelectItem>
                        {campaigns.map((c: any) => (
                            <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
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
              const platforms = app.influencerProfile?.platforms || {};
              return (
                <Card key={app._id} className="bg-card border border-border p-6 hover-lift overflow-hidden relative">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary/20 shrink-0 relative overflow-hidden">
                        {app.influencer?.avatar ? (
                          <img 
                            src={app.influencer.avatar} 
                            alt={app.influencer.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{app.influencer?.name?.charAt(0) || "I"}</span>
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

                        {selectedCampaignId === 'all' && app.campaign && (
                            <div className="flex items-center gap-1.5 mb-3 text-primary/80">
                                <Filter className="w-3 h-3" />
                                <span className="text-xs font-semibold">Campaign: {app.campaign.title}</span>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 mb-3 text-[10px] uppercase tracking-wider font-bold">
                           <div className="flex flex-col">
                              <span className="text-muted-foreground text-[8px]">Total Reach</span>
                              <span className="text-primary">{app.influencerProfile?.totalFollowers?.toLocaleString() || "0"}</span>
                           </div>
                           {platforms.instagram?.connected && (
                             <div className="flex flex-col border-l border-border pl-4">
                                <span className="text-pink-500 text-[8px]">Instagram</span>
                                <span>{platforms.instagram.followers?.toLocaleString() || "0"}</span>
                             </div>
                           )}
                           {platforms.youtube?.connected && (
                             <div className="flex flex-col border-l border-border pl-4">
                                <span className="text-red-500 text-[8px]">YouTube</span>
                                <span>{platforms.youtube.subscribers?.toLocaleString() || "0"}</span>
                             </div>
                           )}
                           {platforms.facebook?.connected && (
                             <div className="flex flex-col border-l border-border pl-4">
                                <span className="text-blue-500 text-[8px]">Facebook</span>
                                <span>{platforms.facebook.followers?.toLocaleString() || "0"}</span>
                             </div>
                           )}
                           {platforms.twitter?.connected && (
                             <div className="flex flex-col border-l border-border pl-4">
                                <span className="text-sky-500 text-[8px]">X / Twitter</span>
                                <span>{platforms.twitter.followers?.toLocaleString() || "0"}</span>
                             </div>
                           )}
                           <div className="flex flex-col border-l border-border pl-4">
                              <span className="text-muted-foreground text-[8px]">Location</span>
                              <span className="text-foreground">{app.influencerProfile?.location?.city || "India"}</span>
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
                            neonVariant="secondary" 
                            onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'shortlisted' })}
                            disabled={updateStatusMutation.isPending}
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
                                   <div className="flex items-center gap-2 text-[10px] text-primary/60 font-bold uppercase tracking-widest px-3 py-2 bg-primary/5 rounded-lg border border-primary/10">
                                      <Check className="w-3 h-3" /> Accepted
                                   </div>
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
                                onClick={() =>
                                  startConvMutation.mutate({
                                    participantId: app.influencer._id,
                                    // In "All Campaigns" view, selectedCampaignId is "all".
                                    // Always send a real campaign ID for this application.
                                    campaignId:
                                      selectedCampaignId === "all"
                                        ? (typeof app.campaign === "string" ? app.campaign : app.campaign?._id)
                                        : selectedCampaignId,
                                  })
                                }
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
        
      </div>
    </DashboardLayout>
  );
};

export default Applications;


