import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Users, Building2, ArrowRight } from "lucide-react";
import NeonButton from "@/components/NeonButton";

const Register = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: "influencer",
      title: "I'm an Influencer",
      description: "Connect with premium brands and monetize your influence.",
      icon: Users,
      color: "primary",
      path: "/influencer/signup"
    },
    {
      id: "brand",
      title: "I'm a Brand",
      description: "Find the perfect creators for your digital transformation.",
      icon: Building2,
      color: "secondary",
      path: "/brand/signup"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-primary rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-secondary rounded-full blur-[120px] animate-pulse-slow延迟-[2s]"></div>
      </div>

      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">Choose Your Path</h1>
          <p className="text-muted-foreground text-lg">Join the most premium creator marketplace in India</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 animate-slide-up">
          {roles.map((role) => (
            <Card 
              key={role.id}
              className="bg-card/50 backdrop-blur-sm border-border p-8 hover-lift group cursor-pointer relative overflow-hidden h-full flex flex-col"
              onClick={() => navigate(role.path)}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${role.color}/10 rounded-bl-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150`}></div>
              
              <div className={`w-14 h-14 rounded-xl bg-${role.color}/10 flex items-center justify-center mb-6 text-${role.color} group-hover:scale-110 transition-transform`}>
                <role.icon className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{role.title}</h2>
              <p className="text-muted-foreground mb-8 flex-1">{role.description}</p>

              <NeonButton 
                neonVariant={role.color as any} 
                className="w-full justify-between group-hover:shadow-glow-sm"
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </NeonButton>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 text-muted-foreground">
          Already have an account? <button onClick={() => navigate("/influencer/login")} className="text-primary hover:underline transition-all">Sign in here</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
