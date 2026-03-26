import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign } from "lucide-react";
import NeonButton from "./NeonButton";

interface CampaignCardProps {
  title: string;
  category: string;
  budget: string;
  description: string;
  location: string;
  deadline: string;
  requirements: string[];
  onApply?: () => void;
}

const CampaignCard = ({
  title,
  category,
  budget,
  description,
  location,
  deadline,
  requirements,
  onApply,
}: CampaignCardProps) => {
  return (
    <Card className="group bg-card border border-border hover:border-primary/30 transition-all duration-200 hover-lift p-5">
      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold">{title}</h3>
            <Badge variant="secondary" className="text-xs shrink-0 ml-2">
              {category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>

        <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="font-semibold text-primary text-sm">{budget}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Requirements</p>
          <div className="flex flex-wrap gap-1.5">
            {requirements.map((req, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-normal">
                {req}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{deadline}</span>
          </div>
        </div>

        <NeonButton neonVariant="primary" className="w-full" onClick={onApply}>
          Apply Now
        </NeonButton>
      </div>
    </Card>
  );
};

export default CampaignCard;
