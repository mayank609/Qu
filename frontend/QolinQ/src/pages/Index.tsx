import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'brand' ? "/brand/dashboard" : "/influencer/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="text-center space-y-6 animate-fade-in max-w-2xl">
          <p className="text-sm font-medium tracking-widest uppercase text-primary">Creator Marketplace</p>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-gradient">Qolinq</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Where brands discover creators. Connect, collaborate, and build campaigns that resonate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={() => navigate("/brand/signup")}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base font-semibold"
            >
              Enter as Brand
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              onClick={() => navigate("/influencer/signup")}
              size="lg"
              variant="outline"
              className="border-primary/30 text-foreground hover:bg-primary/5 px-8 h-12 text-base font-semibold"
            >
              Enter as Influencer
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="pt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => navigate("/brand/login")} className="text-primary hover:underline">
              Brand Login
            </button>
            {" · "}
            <button onClick={() => navigate("/influencer/login")} className="text-primary hover:underline">
              Influencer Login
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 max-w-4xl mx-auto w-full animate-slide-up">
          <div className="bg-card border border-border rounded-xl p-6 hover-lift transition-all duration-200">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold mb-1">For Brands</h3>
            <p className="text-sm text-muted-foreground">
              Find perfect creators for your campaigns. Connect and grow.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover-lift transition-all duration-200">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold mb-1">For Influencers</h3>
            <p className="text-sm text-muted-foreground">
              Discover brand deals. Showcase your reach. Monetize your influence.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover-lift transition-all duration-200">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <ArrowRight className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold mb-1">Seamless Connect</h3>
            <p className="text-sm text-muted-foreground">
              Chat, negotiate, and close deals all in one platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
