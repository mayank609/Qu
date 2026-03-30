import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const InfluencerLogin = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'influencer') navigate("/influencer/dashboard");
      else if (user.role === 'brand') navigate("/brand/dashboard");
    }
  }, [user, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/influencer/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Influencer Login</h1>
          <p className="text-muted-foreground">Welcome back to Qolinq</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="button" onClick={() => toast.info("Password reset link sent to your email!")} className="text-xs text-primary hover:underline mt-1 block text-right">
              Forgot password?
            </button>
          </div>
          <div className="space-y-4 pt-4">
            <NeonButton neonVariant="primary" type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </NeonButton>

            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">OR</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <GoogleLoginButton role="influencer" />
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" onClick={() => navigate("/influencer/signup")} className="text-primary hover:underline">Sign up</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InfluencerLogin;
