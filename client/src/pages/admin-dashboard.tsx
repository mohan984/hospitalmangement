import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import StatsCard from "@/components/stats-card";
import AppointmentsTable from "@/components/appointments-table";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: recentAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
    retry: false,
  });

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex h-screen bg-gray-50 pt-16">
        <Sidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              
              {/* Header */}
              <div className="mb-8">
                <div className="md:flex md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                      Admin Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Today is {currentDate}
                    </p>
                  </div>
                  <div className="mt-4 flex md:mt-0 md:ml-4">
                    <Button variant="outline" className="mr-3">
                      Export Report
                    </Button>
                    <Button className="bg-medical-blue-600 hover:bg-medical-blue-700">
                      Add Appointment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatsCard
                  title="Total Appointments"
                  value={stats?.totalAppointments || 0}
                  change="+12%"
                  changeLabel="from last month"
                  icon={Calendar}
                  iconColor="text-medical-blue-600"
                  changeColor="text-green-600"
                />
                
                <StatsCard
                  title="Active Doctors"
                  value={stats?.activeDoctors || 0}
                  change="+2"
                  changeLabel="new this week"
                  icon={Users}
                  iconColor="text-green-600"
                  changeColor="text-green-600"
                />
                
                <StatsCard
                  title="Pending Appointments"
                  value={stats?.pendingAppointments || 0}
                  changeLabel="Needs attention"
                  icon={Clock}
                  iconColor="text-yellow-600"
                  changeColor="text-yellow-600"
                />
                
                <StatsCard
                  title="Unread Messages"
                  value={stats?.unreadMessages || 0}
                  changeLabel="Urgent"
                  icon={MessageSquare}
                  iconColor="text-red-600"
                  changeColor="text-red-600"
                />
              </div>

              {/* Recent Appointments Table */}
              <AppointmentsTable 
                appointments={recentAppointments?.slice(0, 10) || []}
                isLoading={appointmentsLoading}
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
