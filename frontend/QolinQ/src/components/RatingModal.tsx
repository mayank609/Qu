import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { cn } from "@/lib/utils";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  description: string;
  isSubmitting?: boolean;
}

const RatingModal = ({ isOpen, onClose, onSubmit, title, description, isSubmitting }: RatingModalProps) => {
  const [ratings, setRatings] = useState({
    communication: 0,
    timeliness: 0,
    professionalism: 0,
    review: ""
  });

  const [hovered, setHovered] = useState({
    communication: 0,
    timeliness: 0,
    professionalism: 0,
  });

  const handleRating = (category: string, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleHover = (category: string, value: number) => {
    setHovered(prev => ({ ...prev, [category]: value }));
  };

  const isFormValid = ratings.communication > 0 && ratings.timeliness > 0 && ratings.professionalism > 0;

  const StarRating = ({ category, label }: { category: 'communication' | 'timeliness' | 'professionalism', label: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
        <span className="text-xs font-bold text-primary">{ratings[category] > 0 ? `${ratings[category]}/5` : "Required"}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => handleHover(category, star)}
            onMouseLeave={() => handleHover(category, 0)}
            onClick={() => handleRating(category, star)}
            className="focus:outline-none transition-transform active:scale-90"
          >
            <Star
              className={cn(
                "w-8 h-8 transition-colors",
                (hovered[category] || ratings[category]) >= star
                  ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                  : "text-muted border-none fill-muted/20"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <StarRating category="communication" label="Communication" />
          <StarRating category="timeliness" label="Timeliness" />
          <StarRating category="professionalism" label="Professionalism" />
          
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Review (Optional)</Label>
            <Textarea
              placeholder="How was your experience working on this campaign?"
              className="resize-none bg-muted/30 border-border focus-visible:ring-primary/30"
              rows={4}
              value={ratings.review}
              onChange={(e) => setRatings(prev => ({ ...prev, review: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <NeonButton neonVariant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</NeonButton>
          <NeonButton 
            neonVariant="primary" 
            onClick={() => onSubmit(ratings)} 
            disabled={!isFormValid || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </NeonButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
