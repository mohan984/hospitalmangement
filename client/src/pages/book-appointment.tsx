import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { TIME_SLOTS } from "@/lib/constants";
import { insertAppointmentSchema } from "@shared/schema";
import type { Doctor } from "@shared/schema";

const appointmentFormSchema = insertAppointmentSchema.extend({
  doctorId: z.coerce.number().min(1, "Please select a doctor"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  reason: z.string().min(10, "Please provide a detailed reason (at least 10 characters)"),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

export default function BookAppointment() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
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

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ["/api/doctors"],
    retry: false,
  });

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      doctorId: 0,
      date: "",
      time: "",
      reason: "",
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: Omit<AppointmentFormData, 'userId'>) => {
      await apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment booked successfully! We'll review your request and get back to you soon.",
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
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AppointmentFormData) => {
    createAppointmentMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="py-6 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
            <p className="mt-2 text-gray-600">Schedule a consultation with our medical professionals</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Appointment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Doctor</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctorsLoading ? (
                              <SelectItem value="loading" disabled>Loading doctors...</SelectItem>
                            ) : doctors && doctors.length > 0 ? (
                              doctors.map((doctor: Doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                  Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-doctors" disabled>No doctors available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              min={today}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Time</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIME_SLOTS.map((slot) => (
                                <SelectItem key={slot.value} value={slot.value}>
                                  {slot.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Visit</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your symptoms or reason for the appointment..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={createAppointmentMutation.isPending}
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAppointmentMutation.isPending}
                      className="bg-medical-blue-600 hover:bg-medical-blue-700"
                    >
                      {createAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
                    </Button>
                  </div>

                </form>
              </Form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
