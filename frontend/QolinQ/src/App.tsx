import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InfluencerSignup from "./pages/InfluencerSignup";
import BrandSignup from "./pages/BrandSignup";
import InfluencerLogin from "./pages/InfluencerLogin";
import BrandLogin from "./pages/BrandLogin";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import BrandDashboard from "./pages/BrandDashboard";
import ExploreInfluencers from "./pages/ExploreInfluencers";
import ExploreCampaigns from "./pages/ExploreCampaigns";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import BrandSettings from "./pages/BrandSettings";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";
import MyProfile from "./pages/MyProfile";
import Applications from "./pages/Applications";
import SavedProfiles from "./pages/SavedProfiles";
import AppliedCampaigns from "./pages/AppliedCampaigns";
import AdminSecurity from "./pages/AdminSecurity";
import Register from "./pages/Register";
import InfluencerProfileView from "./pages/InfluencerProfileView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/influencer/signup" element={<InfluencerSignup />} />
            <Route path="/brand/signup" element={<BrandSignup />} />
            <Route path="/influencer/login" element={<InfluencerLogin />} />
            <Route path="/brand/login" element={<BrandLogin />} />
            <Route path="/influencer/dashboard" element={<InfluencerDashboard />} />
            <Route path="/brand/dashboard" element={<BrandDashboard />} />
            <Route path="/explore/influencers" element={<ExploreInfluencers />} />
            <Route path="/explore/campaigns" element={<ExploreCampaigns />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/brand/settings" element={<BrandSettings />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/saved-profiles" element={<SavedProfiles />} />
            <Route path="/applied-campaigns" element={<AppliedCampaigns />} />
            <Route path="/admin/security" element={<AdminSecurity />} />
            <Route path="/influencer/:id" element={<InfluencerProfileView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
