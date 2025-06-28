import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { SPECIALTIES } from "@/lib/constants";
import { insertDoctorSchema } from "@shared/schema";

const doctorFormSchema = insertDoctorSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  specialty: z.string().min(1, "Please select a specialty"),
  phone: z.string().optional(),
  experience: z.coerce.number().min(0, "Experience must be 0 or greater").optional(),
});

type DoctorFormData = z.infer<typeof doctorFormSchema>;

export default function AddDoctor() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      specialty: "",
      phone: "",
      experience: 0,
    },
  });

  const createDoctorMutation = useMutation({
    mutationFn: async (data: DoctorFormData) => {
      await apiRequest("POST", "/api/doctors", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Doctor added successfully!",
      });
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to add doctor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DoctorFormData) => {
    createDoctorMutation.mutate(data);
  };

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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
              
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Add New Doctor</h1>
                <p className="mt-2 text-gray-600">Register a new doctor in the system</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Doctor Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="doctor@hospital.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialty</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select specialty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SPECIALTIES.map((specialty) => (
                                  <SelectItem key={specialty.value} value={specialty.value}>
                                    {specialty.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel" 
                                  placeholder="+1 (555) 123-4567" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years of Experience (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  placeholder="5" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => form.reset()}
                          disabled={createDoctorMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createDoctorMutation.isPending}
                          className="bg-medical-blue-600 hover:bg-medical-blue-700"
                        >
                          {createDoctorMutation.isPending ? "Adding..." : "Add Doctor"}
                        </Button>
                      </div>

                    </form>
                  </Form>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
