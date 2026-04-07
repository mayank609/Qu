import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, MessageCircle, Settings, PlusCircle, List, User, Bookmark, ClipboardList, RefreshCw, LogOut, ShieldAlert, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  userType: "influencer" | "brand";
}
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import NotificationDropdown from "./NotificationDropdown";

const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, switchRole } = useAuth();

  const handleSwitchRole = async () => {
    try {
      const newRole = await switchRole();
      toast.success(`Switched to ${newRole} mode`);
      navigate(newRole === 'brand' ? '/explore/influencers' : '/influencer/dashboard');
    } catch (err) {
      toast.error("Failed to switch role");
    }
  };

  const navItems = userType === "brand"
    ? [
        { icon: Home, label: "Dashboard", path: "/brand/dashboard" },
        { icon: Search, label: "Explore", path: "/explore/influencers" },
        { icon: ClipboardList, label: "Applications", path: "/applications" },
        { icon: MessageCircle, label: "Chats", path: "/chat" },
        { icon: List, label: "My Campaigns", path: "/my-listings" },
        { icon: Bookmark, label: "Saved", path: "/saved-profiles" },
        { icon: PlusCircle, label: "Post Campaign", path: "/create-listing" },
        { icon: Settings, label: "Settings", path: "/brand/settings" },
      ]
    : [
        { icon: Home, label: "Dashboard", path: "/influencer/dashboard" },
        { icon: Search, label: "Explore", path: "/explore/campaigns" },
        { icon: ClipboardList, label: "Applied", path: "/applied-campaigns" },
        { icon: MessageCircle, label: "Chats", path: "/chat" },
        { icon: User, label: "My Profile", path: "/my-profile" },
        { icon: Settings, label: "Settings", path: "/settings" },
      ];

  // Add Admin items if user is admin
  if (user?.role === 'admin') {
    navItems.push({ icon: LayoutDashboard, label: "Admin Panel", path: "/admin" });
    navItems.push({ icon: ShieldAlert, label: "Security", path: "/admin/security" });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:h-screen md:sticky md:top-0 bg-card border-r border-border p-5 shrink-0">
        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate(userType === 'brand' ? '/brand/dashboard' : '/influencer/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-glow-sm">Q</div>
          <h1 className="text-2xl font-bold text-gradient">Qolinq</h1>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 pt-4 border-t border-border">
{/* <button
            onClick={handleSwitchRole}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="font-medium">Switch to {userType === 'brand' ? 'Influencer' : 'Brand'}</span>
          </button> */}
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2 cursor-pointer" onClick={() => navigate(userType === 'brand' ? '/brand/dashboard' : '/influencer/dashboard')}>
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-glow-sm">Q</div>
            <h1 className="text-lg font-bold text-gradient">Qolinq</h1>
          </div>
          <div className="hidden md:block">
            <h3 className="text-sm font-medium text-muted-foreground capitalize">{userType} Panel</h3>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/chat')} className="p-2 rounded-full hover:bg-muted transition-colors md:hidden">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
             </button>
             <button 
                onClick={() => { logout(); navigate('/'); }} 
                className="p-2 rounded-full hover:bg-destructive/10 transition-colors md:hidden text-destructive"
                title="Logout"
             >
                <LogOut className="w-5 h-5" />
             </button>
             <NotificationDropdown />
             <div className="h-8 w-px bg-border mx-1 hidden sm:block"></div>
             <div 
                className="flex items-center gap-2 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(userType === 'influencer' ? '/my-profile' : '/brand/settings')}
             >
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-bold leading-none">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || "U"
                  )}
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-50 safe-area-bottom">
        <div className="flex items-center justify-around">
          {[
            navItems[0], // Dashboard
            navItems[1], // Explore
            navItems[3], // Chats (index 3 in both brand & influencer arrays)
            navItems[2], // Applications/Applied
            navItems[navItems.length - 1], // Settings (always last regular item)
          ].filter(Boolean).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all duration-200 min-w-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] truncate max-w-[56px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
