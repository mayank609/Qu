import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Youtube, Twitter, Facebook, TrendingUp, MapPin, Bookmark } from "lucide-react";
import NeonButton from "./NeonButton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// TikTok icon (not available in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.71a8.19 8.19 0 004.76 1.52V6.79a4.82 4.82 0 01-1-.1z"/>
  </svg>
);

// LinkedIn icon
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

interface InfluencerCardProps {
  id?: string;
  name: string;
  bio: string;
  category: string;
  followers: { platform: string; count: string }[];
  price: string;
  location: string;
  image?: string;
  contentTypes?: string[];
  isSaved?: boolean;
  onToggleSave?: () => void;
  onContact?: () => void;
}

const platformIcons: Record<string, any> = {
  Instagram,
  YouTube: Youtube,
  Twitter,
  Facebook,
  TikTok: TikTokIcon,
  LinkedIn: LinkedInIcon,
};

const InfluencerCard = ({ id, name, bio, category, followers, price, location, image, contentTypes, onContact, isSaved, onToggleSave }: InfluencerCardProps) => {
  const navigate = useNavigate();
  return (
    <Card className="group bg-card border border-border hover:border-primary/30 transition-all duration-200 hover-lift p-5">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary overflow-hidden shrink-0">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold truncate">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{bio}</p>
          </div>
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className={cn(
                "transition-colors p-1",
                isSaved ? "text-primary fill-primary" : "text-muted-foreground hover:text-primary"
              )}
              title={isSaved ? "Unsave Profile" : "Save Profile"}
            >
              <Bookmark className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">{category}</Badge>
          {contentTypes?.map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-[10px]">{tag}</Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {followers.map((social, idx) => {
            const Icon = platformIcons[social.platform] || TrendingUp;
            return (
              <div key={idx} className="flex items-center gap-1.5 bg-muted rounded-md px-2.5 py-1 text-xs">
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">{social.count}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location}</span>
          </div>
          <span className="font-semibold text-primary">{price}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {onContact && (
            <NeonButton neonVariant="primary" className="w-full text-xs" onClick={onContact}>
              Contact
            </NeonButton>
          )}
          {id && (
            <NeonButton neonVariant="outline" className="w-full text-xs" onClick={() => navigate(`/influencer/${id}`)}>
              View Profile
            </NeonButton>
          )}
        </div>
      </div>
    </Card>
  );
};

export default InfluencerCard;
