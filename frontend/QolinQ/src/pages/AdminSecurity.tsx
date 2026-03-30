import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, UserCheck, UserX, AlertTriangle, RefreshCw, ExternalLink, Activity } from "lucide-react";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";
import { fraudAPI, authAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const AdminSecurity = () => {
  const queryClient = useQueryClient();

  const { data: flaggedRes, isLoading: flaggedLoading } = useQuery({
    queryKey: ['flagged-profiles'],
    queryFn: () => fraudAPI.getFlaggedProfiles(),
  });

  const flaggedProfiles = flaggedRes?.data?.data || [];



  return (
    <DashboardLayout userType="brand"> {/* Using brand layout for now, ideally an admin one */}
      <div className="p-6 space-y-6">
        <div className="animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-1">Security & Trust</h1>
            <p className="text-muted-foreground">Monitor flagged profiles and maintain platform integrity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-border p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Flagged Profiles</p>
                    <p className="text-2xl font-bold">{flaggedProfiles.length}</p>
                </div>
            </Card>
            <Card className="bg-card/50 border-border p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">System Health</p>
                    <p className="text-2xl font-bold">Optimal</p>
                </div>
            </Card>

        </div>

        {flaggedLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : flaggedProfiles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
             <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No flagged profiles detected. Platform is secure.</p>
          </div>
        ) : (
          <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" /> 
                Recent Anomalies
              </h2>
            {flaggedProfiles.map((user: any) => (
              <Card key={user._id} className="bg-card border border-border p-6 hover:border-red-500/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground border-2 border-border overflow-hidden">
                            {user.avatar ? <img src={user.avatar} alt="" /> : user.name?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-card">
                            <ShieldAlert className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{user.name}</h3>

                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{user.email} • {user.role}</p>
                      
                      {user.profile && (
                          <div className="flex flex-wrap gap-4 text-xs font-medium">
                              <span className="text-red-400">Eng. Rate: {user.profile.engagementRate}%</span>
                              <span className="text-muted-foreground">Followers: {user.profile.totalFollowers?.toLocaleString()}</span>
                              <span className="text-yellow-500/80 italic">Anomaly: Suspiciously low engagement</span>
                          </div>
                      )}
                    </div>
                  </div>

                    <div className="flex gap-2 shrink-0">
                    <NeonButton neonVariant="ghost" className="h-9 px-3">
                        <ExternalLink className="w-4 h-4" />
                    </NeonButton>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSecurity;
