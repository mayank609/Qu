import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Public Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-glow-sm text-lg">Q</div>
          <h1 className="text-2xl font-bold text-gradient">Qolinq</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/brand/login")} className="text-sm font-medium hover:text-primary transition-colors">
            Brand Login
          </Button>
          <Button variant="default" onClick={() => navigate("/register")} className="text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-sm">
            Join Now
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Basic Public Footer */}
      <footer className="border-t border-border py-12 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-[10px]">Q</div>
            <span className="font-bold text-lg text-gradient">Qolinq</span>
          </div>
          <p className="text-sm text-muted-foreground italic">Connect with premium creators in India. #Qolinq</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
             <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">Home</button>
             <button onClick={() => navigate("/register")} className="hover:text-primary transition-colors">Join</button>
             <button onClick={() => navigate("/brand/login")} className="hover:text-primary transition-colors">Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
