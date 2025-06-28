import { Link, useLocation } from "wouter";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  UserPlus, 
  UserCheck,
  BarChart3,
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const managementItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      href: "/admin/appointments",
      label: "All Appointments",
      icon: Calendar,
    },
    {
      href: "/admin/doctors",
      label: "Manage Doctors",
      icon: Users,
    },
    {
      href: "/admin/messages",
      label: "Messages",
      icon: MessageSquare,
    },
  ];

  const quickActions = [
    {
      href: "/admin/add-doctor",
      label: "Add Doctor",
      icon: UserPlus,
    },
    {
      href: "/admin/add-admin",
      label: "Add Admin",
      icon: UserCheck,
    },
  ];

  const isActive = (href: string) => location === href;

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
        <div className="flex flex-col flex-grow px-4 pb-4">
          <nav className="mt-5 flex-1" aria-label="Sidebar">
            <div className="space-y-1">
              {/* Management Section */}
              <div className="mb-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Management
                </h3>
                <div className="mt-2 space-y-1">
                  {managementItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <a
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            isActive(item.href)
                              ? "bg-medical-blue-50 border-r-4 border-medical-blue-500 text-medical-blue-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <Icon
                            className={`mr-3 h-5 w-5 ${
                              isActive(item.href)
                                ? "text-medical-blue-500"
                                : "text-gray-400"
                            }`}
                          />
                          {item.label}
                        </a>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions Section */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quick Actions
                </h3>
                <div className="mt-2 space-y-1">
                  {quickActions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <a
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            isActive(item.href)
                              ? "bg-medical-blue-50 border-r-4 border-medical-blue-500 text-medical-blue-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <Icon
                            className={`mr-3 h-5 w-5 ${
                              isActive(item.href)
                                ? "text-medical-blue-500"
                                : "text-gray-400"
                            }`}
                          />
                          {item.label}
                        </a>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
