import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin-dashboard";
import UserDashboard from "@/pages/user-dashboard";
import BookAppointment from "@/pages/book-appointment";
import SendMessage from "@/pages/send-message";
import AdminAppointments from "@/pages/admin/appointments";
import AdminDoctors from "@/pages/admin/doctors";
import AdminMessages from "@/pages/admin/messages";
import AddDoctor from "@/pages/admin/add-doctor";
import AddAdmin from "@/pages/admin/add-admin";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={AuthPage} />
      ) : (
        <>
          <Route path="/" component={(user as any)?.role === 'admin' ? AdminDashboard : UserDashboard} />
          <Route path="/book-appointment" component={BookAppointment} />
          <Route path="/send-message" component={SendMessage} />
          
          {/* Admin-only routes */}
          {(user as any)?.role === 'admin' && (
            <>
              <Route path="/admin/appointments" component={AdminAppointments} />
              <Route path="/admin/doctors" component={AdminDoctors} />
              <Route path="/admin/messages" component={AdminMessages} />
              <Route path="/admin/add-doctor" component={AddDoctor} />
              <Route path="/admin/add-admin" component={AddAdmin} />
            </>
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
