import { Button } from "@/components/ui/button";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  neonVariant?: "primary" | "secondary" | "outline" | "ghost";
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ neonVariant = "primary", className, children, ...props }, ref) => {
    const variantStyles = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-primary/40 text-primary hover:bg-primary/10",
      ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
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
