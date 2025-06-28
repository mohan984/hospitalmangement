import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import DoctorsList from "@/components/doctors-list";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function AdminDoctors() {
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

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ["/api/doctors"],
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
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
                    <p className="mt-2 text-gray-600">View and manage all registered doctors</p>
                  </div>
                  <Link href="/admin/add-doctor">
                    <Button className="bg-medical-blue-600 hover:bg-medical-blue-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New Doctor
                    </Button>
                  </Link>
                </div>
              </div>

              <DoctorsList 
                doctors={doctors || []}
                isLoading={doctorsLoading}
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
