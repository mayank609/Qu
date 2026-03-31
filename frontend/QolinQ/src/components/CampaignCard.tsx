import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, Instagram, Youtube, Linkedin, Twitter, Globe, Zap, Building2, FileText } from "lucide-react";
import NeonButton from "./NeonButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CampaignCardProps {
  title: string;
  brandName: string;
  category: string;
  platform: string | string[];
  budget: string;
  description: string;
  location: string;
  deadline: string;
  requirements: string[];
  urgency?: "low" | "medium" | "high" | "urgent";
  imageUrl?: string;
  /** Brand profile "about" text from BrandProfile.description */
  brandAbout?: string;
  isApplied?: boolean;
  onApply?: () => void;
}

const CampaignCard = ({
  title,
  brandName,
  category,
  platform,
  budget,
  description,
  location,
  deadline,
  requirements,
  urgency = "medium",
  imageUrl,
  brandAbout,
  isApplied = false,
  onApply,
}: CampaignCardProps) => {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [campaignBriefOpen, setCampaignBriefOpen] = useState(false);
  const trimmedAbout = brandAbout?.trim() || "";
  const trimmedDescription = description?.trim() || "";
  const getPlatformLabel = (p: string) => {
    const key = p.toLowerCase();
    if (key === "facebook_post") return "Facebook Reel";
    if (key === "linkedin_post") return "Facebook Post";
    if (key === "snapchat_spotlight") return "Facebook Story";
    if (key === "twitter_post") return "Twitter (X) post";
    return p.replace(/_/g, " ");
  };

  const getPlatformIcon = (p: string) => {
    const platform = p.toLowerCase();
    if (platform.includes('instagram')) return <Instagram className="w-3.5 h-3.5" />;
    if (platform.includes('youtube')) return <Youtube className="w-3.5 h-3.5" />;
    if (platform.includes('linkedin')) return <Linkedin className="w-3.5 h-3.5" />;
    if (platform.includes('twitter')) return <Twitter className="w-3.5 h-3.5" />;
    return <Globe className="w-3.5 h-3.5" />;
  };

  const urgencyLevels = {
    low: { label: "Flexible", color: "bg-blue-500/10 text-blue-500" },
    medium: { label: "Upcoming", color: "bg-green-500/10 text-green-500" },
    high: { label: "Apply Soon", color: "bg-yellow-500/10 text-yellow-500" },
    urgent: { label: "Urgent", color: "bg-destructive/10 text-destructive" },
  };

  return (
    <Card className="group bg-card border border-border hover:border-primary/30 transition-all duration-300 hover-lift relative overflow-hidden flex flex-col h-full">
      {/* Featured Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img 
          src={imageUrl || `https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800`} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        
        <div className="absolute top-3 left-3">
           <Badge className="bg-primary/90 text-white border-none backdrop-blur-sm px-2 py-0.5 text-[10px]">
              {category}
           </Badge>
        </div>

        {urgency === 'urgent' && (
          <div className="absolute top-0 right-0 p-1 px-3 bg-destructive text-[10px] font-bold text-white rounded-bl-lg shadow-lg flex items-center gap-1">
            <Zap className="w-3 h-3 fill-white" /> URGENT
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{brandName || "Premium Brand"}</span>
               <div className="w-1 h-1 rounded-full bg-border"></div>
               <span className="text-[10px] text-muted-foreground uppercase">{category}</span>
            </div>
            <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{title}</h3>
          </div>
        </div>

        {trimmedAbout && (
          <>
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="w-full text-left rounded-lg border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/35 hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">About brand</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{trimmedAbout}</p>
              <span className="text-[10px] font-semibold text-primary mt-2 inline-block">Click to read full profile</span>
            </button>
            <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
              <DialogContent className="sm:max-w-lg bg-card border-border max-h-[85vh] flex flex-col gap-0">
                <DialogHeader className="pr-8">
                  <DialogTitle className="text-lg">About {brandName || "Brand"}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[min(60vh,480px)] pr-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pb-1">{trimmedAbout}</p>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </>
        )}

        {trimmedDescription ? (
          <>
            <div className="rounded-lg border border-border/60 bg-muted/15 p-3 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">About this campaign</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed whitespace-pre-wrap break-words">
                {trimmedDescription}
              </p>
              <NeonButton
                type="button"
                neonVariant="outline"
                className="w-full py-3 text-xs font-semibold"
                onClick={() => setCampaignBriefOpen(true)}
              >
                Read full campaign brief
              </NeonButton>
            </div>
            <Dialog open={campaignBriefOpen} onOpenChange={setCampaignBriefOpen}>
              <DialogContent className="sm:max-w-lg bg-card border-border max-h-[85vh] flex flex-col gap-0">
                <DialogHeader className="pr-8 text-left">
                  <DialogTitle className="text-lg leading-snug">{title}</DialogTitle>
                  <p className="text-xs text-muted-foreground font-normal pt-1">Full campaign description</p>
                </DialogHeader>
                <ScrollArea className="max-h-[min(60vh,480px)] pr-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pb-1">{trimmedDescription}</p>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </>
        ) : null}

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 transition-colors hover:bg-primary/10">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-sm">{budget}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(platform) ? platform : [platform]).map((p, idx) => (
              <Badge key={idx} variant="outline" className="flex items-center gap-1.5 bg-muted/30 border-none px-3 py-1">
                {getPlatformIcon(p)}
                <span className="capitalize">{getPlatformLabel(p)}</span>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
             <span>Deliverables</span>
             <span>Status: {urgencyLevels[urgency].label}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {requirements.slice(0, 3).map((req, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] font-medium px-2 py-0">
                {req}
              </Badge>
            ))}
            {requirements.length > 3 && (
              <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0">+{requirements.length - 3} more</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Deadline: {deadline}</span>
          </div>
        </div>

        <NeonButton 
          neonVariant={isApplied ? "secondary" : "primary"} 
          className={`w-full py-5 text-sm font-bold transition-all ${isApplied ? 'opacity-70 border-green-500/50' : ''}`} 
          onClick={isApplied ? undefined : onApply}
          disabled={isApplied}
        >
          {isApplied ? (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 fill-green-500 text-green-500" /> 
              Applied
            </span>
          ) : "Apply for Collaboration"}
        </NeonButton>
      </div>
    </Card>
  );
};

export default CampaignCard;
