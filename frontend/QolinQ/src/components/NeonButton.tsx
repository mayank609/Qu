import { Button } from "@/components/ui/button";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  neonVariant?: "primary" | "secondary" | "outline" | "ghost";
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ neonVariant = "primary", className, children, ...props }, ref) => {
    const variantStyles = {
      primary: "bg-primary text-primary-foreground hover:bg-teal-bright shadow-glow transition-all duration-300 transform active:scale-95",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border transition-all duration-300",
      outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-glow-sm transition-all duration-300",
      ghost: "text-primary/90 hover:text-primary hover:bg-primary/10 font-bold transition-all duration-300",
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "font-semibold transition-all duration-200",
          variantStyles[neonVariant],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

NeonButton.displayName = "NeonButton";

export default NeonButton;
