import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import AppointmentsTable from "@/components/appointments-table";
import { useQuery } from "@tanstack/react-query";

export default function AdminAppointments() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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

  // Redirect non-admins
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, isAuthenticated, isLoading, toast]);

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex h-screen bg-gray-50 pt-16">
        <Sidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">All Appointments</h1>
                <p className="mt-2 text-gray-600">Manage and review all patient appointments</p>
              </div>

              <AppointmentsTable 
                appointments={appointments || []}
                isLoading={appointmentsLoading}
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
