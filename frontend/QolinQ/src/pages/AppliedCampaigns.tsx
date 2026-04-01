import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, ShieldCheck, Clock, CheckCircle2, MessageCircle, Upload, ExternalLink } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { applicationAPI, messageAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const AppliedCampaigns = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [briefCampaign, setBriefCampaign] = useState<any>(null);

  const startConvMutation = useMutation({
    mutationFn: (data: { participantId: string, campaignId?: string }) => 
      messageAPI.startConversation(data),
    onSuccess: (res: any) => {
      navigate(`/chat?id=${res.data.data._id}`);
    },
    onError: () => {
      toast.error("Failed to start conversation");
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationAPI.getMyApplications(),
  });

  const appliedCampaigns = data?.data?.data || [];

  const uploadDeliverableMutation = useMutation({
    mutationFn: ({ id, type, url }: { id: string, type: 'draft' | 'final', url: string }) => 
      applicationAPI.uploadDeliverable(id, { type, url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      toast.success("Deliverable submitted for review!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Upload failed")
  });

  const handleUpload = (appId: string, type: 'draft' | 'final') => {
    const url = prompt(`Enter ${type} URL (e.g. YouTube/Instagram link or Google Drive file):`);
    if (url) {
      uploadDeliverableMutation.mutate({ id: appId, type, url });
    }
  };

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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-1">Applied Campaigns</h1>
            <p className="text-muted-foreground">Track the status of your campaign applications</p>
          </div>
          <Badge variant="outline" className="h-8 px-4 bg-muted/50 border-none">
              {appliedCampaigns.length} Applications
          </Badge>
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
          <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>You haven't applied to any campaigns yet.</p>
            <NeonButton neonVariant="primary" onClick={() => navigate("/explore/campaigns")} className="mt-4">Explore Campaigns</NeonButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {appliedCampaigns.map((app: any) => (
              <Card key={app._id} className="bg-card border border-border p-4 sm:p-6 hover-lift relative overflow-hidden">
                {app.status === 'accepted' && (
                    <>
                    <div className="sm:hidden mb-3 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-[10px] font-bold text-primary">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> ESCROW SECURED
                    </div>
                    <div className="hidden sm:flex absolute top-0 right-0 items-center gap-1 rounded-bl-lg bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary">
                        <ShieldCheck className="w-3 h-3 shrink-0" /> ESCROW SECURED
                    </div>
                    </>
                )}
                
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                  <div className={`flex-1 min-w-0 sm:min-h-0 ${app.status === 'accepted' ? 'sm:pr-[9.5rem] lg:pr-0' : ''}`}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="min-w-0 flex-1 basis-full break-words text-base font-bold sm:basis-auto sm:flex-initial sm:text-lg">{app.campaign?.title}</h3>
                      <Badge variant="outline" className="text-[10px] capitalize">{app.campaign?.platform}</Badge>
                      <Badge variant={statusColor(app.status)} className="text-[10px] capitalize">{app.status}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                        by <span className="text-foreground font-semibold">{app.campaign?.brand?.name || "Premium Brand"}</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="space-y-1 min-w-0">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Budget Range</p>
                            <div className="flex items-start gap-1.5 font-semibold text-sm min-w-0">
                                <DollarSign className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                <span className="break-words leading-snug">₹{app.campaign?.budgetRange?.min?.toLocaleString()} – ₹{app.campaign?.budgetRange?.max?.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="space-y-1 min-w-0">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Your Offer</p>
                            <div className="flex items-center gap-1.5 font-semibold text-sm min-w-0">
                                <span className="text-primary break-words">₹{app.customPrice?.toLocaleString() || "Market Value"}</span>
                            </div>
                        </div>
                        <div className="space-y-1 min-w-0">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Platform</p>
                            <div className="flex flex-wrap gap-1.5 text-sm">
                                {(Array.isArray(app.campaign?.platform) ? app.campaign?.platform : [app.campaign?.platform]).filter(Boolean).map((p: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="h-5 text-[9px] max-w-full truncate">{p}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1 min-w-0">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Deadline</p>
                            <div className="flex items-center gap-1.5 text-sm min-w-0">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="break-words">{app.campaign?.timeline?.endDate ? new Date(app.campaign.timeline.endDate).toLocaleDateString() : 'Flexible'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                         {app.contentDraft?.url ? (
                             <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] py-1 px-3">
                                 <CheckCircle2 className="w-3 h-3 mr-1.5" /> Draft Submitted
                             </Badge>
                         ) : app.status === 'accepted' && (
                             <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] py-1 px-3">
                                 <Clock className="w-3 h-3 mr-1.5" /> Pending Draft
                             </Badge>
                         )}
                         
                         {app.finalProof?.url ? (
                             <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] py-1 px-3">
                                 <CheckCircle2 className="w-3 h-3 mr-1.5" /> Final Content Live
                             </Badge>
                         ) : app.status === 'accepted' && app.contentDraft?.status === 'approved' && (
                             <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[10px] py-1 px-3">
                                 <Upload className="w-3 h-3 mr-1.5" /> Ready for Final Post
                             </Badge>
                         )}
                    </div>
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-3 border-t border-border pt-4 lg:w-44 lg:border-t-0 lg:pt-0 justify-stretch lg:justify-end">
                    {(app.status === 'shortlisted' || app.status === 'accepted') && (
                        <NeonButton 
                            neonVariant="outline" 
                            onClick={() => startConvMutation.mutate({ participantId: app.campaign?.brand?._id || app.campaign?.brand, campaignId: app.campaign?._id })} 
                            className="w-full"
                            disabled={startConvMutation.isPending}
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />Message Brand
                        </NeonButton>
                    )}
                    
                    {app.status === 'accepted' && (
                        <>
                            {!app.contentDraft?.url && (
                                <NeonButton 
                                    neonVariant="primary" 
                                    onClick={() => handleUpload(app._id, 'draft')}
                                    disabled={uploadDeliverableMutation.isPending}
                                >
                                    <Upload className="w-4 h-4 mr-2" />Upload Draft
                                </NeonButton>
                            )}
                            {app.contentDraft?.status === 'approved' && !app.finalProof?.url && (
                                <NeonButton 
                                    neonVariant="secondary" 
                                    onClick={() => handleUpload(app._id, 'final')}
                                    disabled={uploadDeliverableMutation.isPending}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />Submit Final
                                </NeonButton>
                            )}
                        </>
                    )}
                    
                    <NeonButton neonVariant="ghost" className="h-auto min-h-8 w-full justify-center whitespace-normal px-2 py-2 text-center text-[10px] leading-snug hover:bg-transparent sm:px-3" onClick={() => setBriefCampaign(app.campaign)}>
                        <span className="inline-flex flex-wrap items-center justify-center gap-1">
                          View campaign brief
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" aria-hidden />
                        </span>
                    </NeonButton>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!briefCampaign} onOpenChange={(open) => !open && setBriefCampaign(null)}>
          <DialogContent className="left-1/2 top-[50%] w-[calc(100vw-1.25rem)] max-w-[550px] max-h-[min(88dvh,88vh)] translate-x-[-50%] translate-y-[-50%] gap-0 overflow-y-auto overflow-x-hidden rounded-xl border-border bg-card p-4 pt-12 sm:p-6 sm:pt-6">
            <DialogHeader className="space-y-2 pr-6 text-left">
              <DialogTitle className="break-words text-lg font-bold leading-snug sm:text-xl">{briefCampaign?.title}</DialogTitle>
              <DialogDescription className="break-words text-left">
                by {briefCampaign?.brand?.name || 'Brand'}
                {briefCampaign?.platform != null && briefCampaign.platform !== '' && (
                  <>
                    {' · '}
                    <span className="capitalize">
                      {Array.isArray(briefCampaign.platform)
                        ? briefCampaign.platform.filter(Boolean).join(', ')
                        : String(briefCampaign.platform)}
                    </span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 sm:space-y-5 sm:py-5">
              <p className="break-words text-sm leading-relaxed text-muted-foreground">{briefCampaign?.description || 'No description provided.'}</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Budget Range</p>
                  <p className="break-words text-sm font-semibold">₹{briefCampaign?.budgetRange?.min?.toLocaleString()} – ₹{briefCampaign?.budgetRange?.max?.toLocaleString()}</p>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform</p>
                  <p className="break-words text-sm font-semibold capitalize">
                    {Array.isArray(briefCampaign?.platform)
                      ? briefCampaign.platform.filter(Boolean).join(', ')
                      : briefCampaign?.platform ?? '—'}
                  </p>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</p>
                  <p className="break-words text-sm font-semibold capitalize">{briefCampaign?.category ?? '—'}</p>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deadline</p>
                  <p className="break-words text-sm font-semibold">{briefCampaign?.timeline?.endDate ? new Date(briefCampaign.timeline.endDate).toLocaleDateString() : 'Flexible'}</p>
                </div>
              </div>

              {briefCampaign?.deliverables?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Deliverables</p>
                  <ul className="space-y-2">
                    {briefCampaign.deliverables.map((d: any, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2 bg-muted/30 p-2.5 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                        <span>{d.quantity}x {d.type}{d.description ? `: ${d.description}` : ''}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {briefCampaign?.requirements && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Requirements</p>
                  <p className="text-sm text-muted-foreground">{briefCampaign.requirements}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AppliedCampaigns;

