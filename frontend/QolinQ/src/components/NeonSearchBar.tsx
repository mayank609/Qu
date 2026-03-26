import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NeonSearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const NeonSearchBar = ({ placeholder = "Search...", value, onChange }: NeonSearchBarProps) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative flex items-center bg-card border border-border rounded-full px-5 py-3 focus-within:border-primary/50 transition-colors duration-200">
        <Search className="w-5 h-5 text-muted-foreground mr-3" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
};

export default NeonSearchBar;
