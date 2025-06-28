import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, MessageSquare, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <Activity className="h-12 w-12 text-medical-blue-600 mr-2" />
              <h1 className="text-4xl font-bold text-gray-900">MediCare HMS</h1>
            </div>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive Hospital Management System for efficient healthcare administration
            </p>
            <div className="mt-8">
              <Button onClick={handleLogin} size="lg" className="bg-medical-blue-600 hover:bg-medical-blue-700">
                Login to Continue
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">System Features</h2>
            <p className="mt-4 text-lg text-gray-600">
              Streamline your healthcare operations with our comprehensive management system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-medical-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Appointment Management
                </h3>
                <p className="text-gray-600">
                  Book, manage, and track appointments with ease
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-medical-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Doctor Management
                </h3>
                <p className="text-gray-600">
                  Manage doctor profiles, specialties, and availability
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Patient Communication
                </h3>
                <p className="text-gray-600">
                  Secure messaging between patients and staff
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Admin Dashboard
                </h3>
                <p className="text-gray-600">
                  Comprehensive overview and management tools
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 MediCare Hospital Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
