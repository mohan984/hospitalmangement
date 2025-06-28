import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import type { Doctor } from "@shared/schema";

interface DoctorsListProps {
  doctors: Doctor[];
  isLoading: boolean;
}

export default function DoctorsList({ doctors, isLoading }: DoctorsListProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getRandomColor = (index: number) => {
    const colors = [
      'bg-medical-blue-100 text-medical-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registered Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Registered Doctors</CardTitle>
            <p className="text-sm text-gray-500 mt-1">All doctors in the system</p>
          </div>
          <div className="text-sm text-gray-500">
            {doctors.length} doctors
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {doctors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No doctors registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doctor, index) => (
              <div
                key={doctor.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getRandomColor(index)}`}>
                    <span className="text-sm font-medium">
                      {getInitials(doctor.firstName, doctor.lastName)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {doctor.specialty}
                    </p>
                    {doctor.experience && (
                      <p className="text-xs text-gray-400">
                        {doctor.experience} years experience
                      </p>
                    )}
                    {doctor.email && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {doctor.email}
                      </p>
                    )}
                    {doctor.phone && (
                      <p className="text-xs text-gray-500">
                        {doctor.phone}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <Badge className={doctor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
