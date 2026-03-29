import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Youtube, Twitter, TrendingUp, MapPin, Bookmark } from "lucide-react";
import NeonButton from "./NeonButton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
