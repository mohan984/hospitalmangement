import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Activity, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const navItems = user?.role === 'admin' 
    ? [
        { href: "/", label: "Dashboard" },
        { href: "/admin/appointments", label: "Appointments" },
        { href: "/admin/doctors", label: "Doctors" },
        { href: "/admin/messages", label: "Messages" },
      ]
    : [
        { href: "/", label: "Dashboard" },
        { href: "/book-appointment", label: "Book Appointment" },
        { href: "/send-message", label: "Send Message" },
      ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Activity className="h-8 w-8 text-medical-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">MediCare HMS</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location === item.href
                        ? "border-medical-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-medical-blue-50 text-medical-blue-700 rounded-full">
                {user?.role === 'admin' ? 'Admin' : 'Patient'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
